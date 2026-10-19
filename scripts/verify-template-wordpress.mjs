import { createHash } from 'node:crypto';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { resolve, join } from 'node:path';
import { pathToFileURL } from 'node:url';
import { tmpdir } from 'node:os';
import assert from 'node:assert/strict';

// Run from repo root. Tooling stays outside repo dependencies:
// npm install --prefix <temporary-tools-dir> --no-audit --no-fund @wp-playground/cli@3.1.57
// node --experimental-wasm-jspi scripts/verify-template-wordpress.mjs --tools=<temporary-tools-dir>
// Clean PHP WASM/SQLite installation for each exact buyer ZIP. This does not prove
// native PHP/MySQL hosting, WordPress.com upload, or visual Site Editor usability.
const args = Object.fromEntries(process.argv.slice(2).map(value => {
  const [key, ...rest] = value.replace(/^--/, '').split('=');
  return [key, rest.join('=')];
}));
const root = process.cwd();
const out = resolve(root, args.out || 'artifacts/templates/wordpress-install');
const toolsDir = resolve(args.tools || process.env.EIDOS_WP_TOOLS_DIR || join(tmpdir(), 'eidos-template-wp-tools'));
const wp = args.wp || '7.1';
const php = args.php || '8.3';
const startupTimeoutMs = Number(args['startup-timeout-ms'] || 180000);
const catalog = JSON.parse(await readFile(join(root, 'products/templates/catalog.json'), 'utf8'));
const selected = args.slugs ? args.slugs.split(',') : catalog.products.map(product => product.slug);
await mkdir(out, { recursive: true });
const receipt = {
  schema_version: 1,
  timestamp_utc: new Date().toISOString(),
  command: 'node --experimental-wasm-jspi scripts/verify-template-wordpress.mjs --tools=<temporary-tools-dir>',
  runtime: { node: process.version, playground_cli: '3.1.57', requested_wordpress: wp, requested_php: php, database: 'SQLite', execution: 'PHP WebAssembly / WordPress Playground', wasm_jspi: typeof WebAssembly.Suspending === 'function', workers: 6, startup_timeout_ms: startupTimeoutMs },
  limitations: [
    'Native PHP/MySQL hosting and WordPress.com are not tested.',
    'Content/image edits use WordPress APIs and native block markup. Visual Site Editor editing is a separate manual acceptance gate.',
    'No email, booking, checkout, or ticket service is connected by a theme.',
    'Pinned Playground dependencies declare Node >=24.18.0/npm >=11.16.0; this host may be below that engine requirement.'
  ],
  themes: []
};
let runCLI;
try {
  const metadata = JSON.parse(await readFile(join(toolsDir, 'node_modules/@wp-playground/cli/package.json'), 'utf8'));
  assert.equal(metadata.version, '3.1.57', 'Use the documented pinned Playground version');
  ({ runCLI } = await import(pathToFileURL(join(toolsDir, 'node_modules/@wp-playground/cli/index.js')).href));
} catch (error) {
  receipt.status = 'blocked';
  receipt.reason = `Temporary Playground tooling unavailable: ${error.message}`;
  await writeFile(join(out, 'installation-receipt.json'), JSON.stringify(receipt, null, 2));
  throw error;
}
const phpValue = value => `base64_decode('${Buffer.from(value).toString('base64')}')`;
const textOf = response => new TextDecoder().decode(response.bytes);
let startupTimedOut = false;
for (const slug of selected) {
  const product = catalog.products.find(entry => entry.slug === slug);
  assert(product, `Unknown product ${slug}`);
  const edition = product.editions.find(entry => entry.platform === 'wordpress');
  const record = { product: slug, edition: edition.id, archive: edition.packagePath, status: 'running', checks: {} };
  receipt.themes.push(record);
  let server;
  try {
    const archive = await readFile(join(root, edition.packagePath));
    record.archive_sha256 = createHash('sha256').update(archive).digest('hex');
    record.archive_bytes = archive.length;
    // Each server call starts a new default temporary WordPress/SQLite site.
    console.log(`${slug}: booting clean WordPress ${wp}/PHP ${php}`);
    let startupTimer;
    const startupStart = Date.now();
    try {
      server = await Promise.race([
        runCLI({ command: 'server', wp, php, port: Number(args.port || 9442), workers: 6, login: true, verbosity: args.debug ? 'debug' : 'normal', redis: false, memcached: false }),
        new Promise((_, reject) => { startupTimer = setTimeout(() => { startupTimedOut = true; reject(new Error(`Playground failed to become ready within ${startupTimeoutMs}ms; no theme installation occurred. Stop retries and inspect startup logs.`)); }, startupTimeoutMs); })
      ]);
    } finally {
      clearTimeout(startupTimer);
      record.startup_elapsed_ms = Date.now() - startupStart;
    }
    const playground = server.playground;
    await playground.writeFile(`/tmp/${slug}.zip`, archive);
    const install = await playground.run({ code: `<?php
      require '/wordpress/wp-load.php';
      require_once ABSPATH . 'wp-admin/includes/file.php';
      require_once ABSPATH . 'wp-admin/includes/class-wp-upgrader.php';
      wp_set_current_user(1);
      $skin = new Automatic_Upgrader_Skin(); $upgrader = new Theme_Upgrader($skin);
      ob_start(); $installed = $upgrader->install('/tmp/${slug}.zip'); $install_output = ob_get_clean();
      if (is_wp_error($installed)) { echo json_encode(['error'=>$installed->get_error_message()]); exit; }
      if (!$installed) { echo json_encode(['error'=>'Theme_Upgrader failed','output'=>$install_output]); exit; }
      $theme_slug = $upgrader->result['destination_name']; switch_theme($theme_slug);
      $theme = wp_get_theme(); global $wp_version, $wpdb;
      $patterns=array_values(array_filter(array_column(WP_Block_Patterns_Registry::get_instance()->get_all_registered(),'name'),fn($name)=>str_starts_with($name,'eidos-${slug}/')));
      echo json_encode(['installed'=>true,'active_stylesheet'=>get_stylesheet(),'theme_name'=>$theme->get('Name'),'theme_version'=>$theme->get('Version'),'block_theme'=>wp_is_block_theme(),'theme_errors'=>$theme->errors() ? $theme->errors()->get_error_messages() : [],'wordpress'=>$wp_version,'php'=>PHP_VERSION,'database_class'=>get_class($wpdb),'database_version'=>$wpdb->db_version(),'patterns'=>$patterns]);
    ` });
    await writeFile(join(out, `${slug}-install-php.log`), textOf(install) + '\n' + install.errors);
    assert.equal(install.exitCode, 0, install.errors);
    record.install = JSON.parse(textOf(install));
    assert.equal(record.install.installed, true, record.install.error);
    assert.equal(record.install.block_theme, true, 'Theme must be recognized as native block theme');
    assert.deepEqual(record.install.theme_errors, []);
    record.checks.zip_install_and_activation = 'passed';
    const business = `${product.name} clean-install test studio`;
    const finalBusiness = `${product.name} revised test business`;
    const edit = await playground.run({ code: `<?php
      require '/wordpress/wp-load.php'; wp_set_current_user(1);
      $pattern=WP_Block_Patterns_Registry::get_instance()->get_registered('eidos-${slug}/index');
      if(!$pattern){echo json_encode(['error'=>'Packaged native Home pattern not registered']);exit;}
      $id=wp_insert_post(['post_type'=>'page','post_status'=>'draft','post_title'=>${phpValue(business)},'post_content'=>$pattern['content']],true);
      if(is_wp_error($id)){echo json_encode(['error'=>$id->get_error_message()]);exit;}
      $png=base64_decode('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+a0X8AAAAASUVORK5CYII=');
      $upload=wp_upload_bits('${slug}-edited-test-image.png',null,$png);
      if($upload['error']){echo json_encode(['error'=>$upload['error']]);exit;}
      $attachment=wp_insert_attachment(['post_mime_type'=>'image/png','post_title'=>'Original generated test pixel','post_status'=>'inherit'],$upload['file'],$id,true);
      if(is_wp_error($attachment)){echo json_encode(['error'=>$attachment->get_error_message()]);exit;}
      update_post_meta($attachment,'_wp_attachment_image_alt','Generated local test pixel; replace with business photography');
      $contact=wp_insert_post(['post_type'=>'page','post_status'=>'publish','post_title'=>'Contact test destination','post_name'=>'${slug}-contact-test','post_content'=>'<!-- wp:paragraph --><p>Local contact destination reached. No message was sent.</p><!-- /wp:paragraph -->']);
      $content=preg_replace('/<h1[^>]*>.*?<\\/h1>/s','<h1 class="wp-block-heading">'.esc_html(${phpValue(finalBusiness)}).'</h1>',$pattern['content'],1,$heading_changes);
      $content=preg_replace('/(<img[^>]*src=")[^"]*(")/','$1'.esc_url($upload['url']).'$2',$content,1,$image_changes);
      $content=str_replace('href="/contact/"','href="'.esc_url(get_permalink($contact)).'"',$content,$action_changes);
      update_post_meta($id,'_wp_page_template','default');
      $saved=wp_update_post(['ID'=>$id,'post_status'=>'publish','post_title'=>${phpValue(finalBusiness)},'post_content'=>$content],true);
      $post=get_post($id); $blocks=parse_blocks($post->post_content);
      echo json_encode(['post_id'=>$id,'status'=>$post->post_status,'title'=>$post->post_title,'url'=>get_permalink($id),'image_url'=>$upload['url'],'attachment_id'=>$attachment,'contact_url'=>get_permalink($contact),'block_names'=>array_column($blocks,'blockName'),'heading_changes'=>$heading_changes,'image_changes'=>$image_changes,'action_changes'=>$action_changes,'saved'=>!is_wp_error($saved),'method'=>'Packaged native Home pattern inserted into a default Page, then edited/published using WordPress post/media APIs; visual editor UI not exercised']);
    ` });
    await writeFile(join(out, `${slug}-edit-php.log`), textOf(edit) + '\n' + edit.errors);
    assert.equal(edit.exitCode, 0, edit.errors);
    record.edit = JSON.parse(textOf(edit));
    assert.equal(record.edit.saved, true, record.edit.error);
    assert.equal(record.edit.status, 'publish');
    assert.equal(record.edit.title, finalBusiness);
    assert.equal(record.edit.heading_changes, 1);
    assert.equal(record.edit.image_changes, 1);
    assert(record.edit.action_changes >= 1);
    record.checks.native_block_text_image_api_edit_and_publish = 'passed';
    const response = await fetch(record.edit.url);
    const html = await response.text();
    await writeFile(join(out, `${slug}-published.html`), html);
    assert.equal(response.status, 200);
    assert(html.includes(finalBusiness), 'Edited business name must render');
    assert(html.includes(record.edit.image_url), 'Changed image must render');
    assert(html.includes(record.edit.contact_url.replaceAll('&', '&amp;')), 'Ordinary main action must render');
    const image = await fetch(record.edit.image_url);
    assert.equal(image.status, 200);
    const contact = await fetch(record.edit.contact_url);
    assert.equal(contact.status, 200);
    assert((await contact.text()).includes('Local contact destination reached'));
    record.checks.published_text_image_and_main_action = 'passed';
    record.checks.visual_site_editor_edit = 'not_run';
    record.checks.native_host_mysql = 'not_run';
    record.status = 'partial';
    console.log(`${slug}: ZIP activated; block text/image saved and published; rendered main action passed. Visual editor/native host acceptance pending.`);
  } catch (error) {
    record.status = 'blocked';
    record.reason = error.stack || String(error);
    console.error(`${slug}: ${error.message}`);
  } finally {
    if (server) await server[Symbol.asyncDispose]();
    await writeFile(join(out, 'installation-receipt.json'), JSON.stringify(receipt, null, 2));
  }
  if (startupTimedOut) break;
}
if (startupTimedOut) {
  for (const slug of selected.filter(value => !receipt.themes.some(theme => theme.product === value))) {
    const product = catalog.products.find(entry => entry.slug === slug);
    const edition = product.editions.find(entry => entry.platform === 'wordpress');
    const archive = await readFile(join(root, edition.packagePath));
    receipt.themes.push({ product: slug, edition: edition.id, archive: edition.packagePath, archive_sha256: createHash('sha256').update(archive).digest('hex'), archive_bytes: archive.length, status: 'not_run', reason: 'Shared Playground runtime startup failed; no additional identical retries.', checks: {} });
  }
}
receipt.status = receipt.themes.every(theme => theme.status === 'partial') ? 'partial' : 'blocked';
await writeFile(join(out, 'installation-receipt.json'), JSON.stringify(receipt, null, 2));
if (receipt.status === 'blocked') process.exitCode = 1;
// A timed-out runCLI still owns its worker threads. This exits this test process
// after saving evidence; it does not terminate any unrelated process.
if (startupTimedOut) process.exit(1);
