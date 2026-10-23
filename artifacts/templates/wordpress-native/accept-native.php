<?php
// Native WordPress API acceptance; no browser UI is represented by this helper.
if (!function_exists('wp_mail')) { function wp_mail($to, $subject, $message, $headers = '', $attachments = array()) { return false; } }
function must($condition, $message) { if (!$condition) { throw new RuntimeException($message); } }
function save_template($name, $content, $type = 'wp_template') {
    $id = wp_insert_post(array('post_type'=>$type,'post_name'=>$name,'post_title'=>ucwords(str_replace('-', ' ', $name)),'post_content'=>$content,'post_status'=>'publish','tax_input'=>array('wp_theme'=>array(get_stylesheet()))), true);
    must(!is_wp_error($id), 'Native template save failed');
    if ($type === 'wp_template_part') { wp_set_object_terms($id, 'header', 'wp_template_part_area'); }
    return $id;
}
function edit_blocks($blocks, $headline, $image_id, $image_url, &$heading_done, &$image_done) {
    foreach ($blocks as &$block) {
        if (!$heading_done && $block['blockName'] === 'core/heading' && ($block['attrs']['level'] ?? 2) === 1) {
            $replace = fn($html) => preg_replace('/(<h1[^>]*>).*?(<\/h1>)/s', '$1' . esc_html($headline) . '$2', $html, 1);
            $block['innerHTML'] = $replace($block['innerHTML']);
            $block['innerContent'] = array_map(fn($part) => is_string($part) ? $replace($part) : $part, $block['innerContent']);
            $heading_done = true;
        }
        if (!$image_done && $block['blockName'] === 'core/image') {
            $block['attrs']['id'] = $image_id;
            $block['attrs']['sizeSlug'] = 'full';
            $block['attrs']['linkDestination'] = 'none';
            $html = '<figure class="wp-block-image size-full"><img src="' . esc_url($image_url) . '" alt="Native acceptance replacement artwork" class="wp-image-' . $image_id . '"/></figure>';
            $block['innerHTML'] = $html;
            $block['innerContent'] = array($html);
            $image_done = true;
        }
        if (!empty($block['innerBlocks'])) { $block['innerBlocks'] = edit_blocks($block['innerBlocks'], $headline, $image_id, $image_url, $heading_done, $image_done); }
    }
    return $blocks;
}
function nav_ref($blocks, $id, &$done) {
    foreach ($blocks as &$block) {
        if ($block['blockName'] === 'core/navigation') {
            $block['attrs']['ref'] = $id; $block['innerBlocks'] = array(); $block['innerHTML'] = ''; $block['innerContent'] = array(); $done = true;
        }
        if (!empty($block['innerBlocks'])) { $block['innerBlocks'] = nav_ref($block['innerBlocks'], $id, $done); }
    }
    return $blocks;
}
try {
    $private = json_decode(file_get_contents($argv[1]), true, 512, JSON_THROW_ON_ERROR);
    $slug = $argv[2]; $phase = $argv[3]; $site = $private['sites'][$slug];
    require $site['wordpress_root'] . '/wp-load.php';
    wp_set_current_user(get_user_by('login', $site['admin_user'])->ID);
    require_once ABSPATH . 'wp-admin/includes/file.php';
    require_once ABSPATH . 'wp-admin/includes/theme.php';
    global $wp_version, $wpdb;
    $receipt = array('product'=>$slug,'wordpress'=>$wp_version,'php'=>PHP_VERSION,'mariadb'=>$wpdb->db_version(),'url'=>$site['url'],'phase'=>$phase,'method'=>'Native PHP WordPress APIs; no fresh browser editor UI claim');
    if ($phase === 'install') {
        $archive = $argv[4]; $expected = $argv[5];
        must(hash_file('sha256', $archive) === $expected, 'Buyer archive checksum mismatch');
        must(!wp_get_theme($slug)->exists(), 'Theme was present before clean install');
        require_once ABSPATH . 'wp-admin/includes/class-wp-upgrader.php';
        $skin = new Automatic_Upgrader_Skin();
        $upgrader = new Theme_Upgrader($skin);
        ob_start(); $installed = $upgrader->install($archive); ob_end_clean();
        must($installed === true, 'Theme_Upgrader failed');
        switch_theme($slug);
        $theme = wp_get_theme();
        must($theme->exists() && !$theme->errors(), 'Installed theme metadata invalid');
        must($theme->get('Version') === '1.0.2', 'Wrong installed version');
        must($theme->get('UpdateURI') === 'https://eidos-works.com/shop/templates/' . $slug . '/', 'Wrong Update URI');
        $receipt += array('archive_sha256'=>$expected,'archive_bytes'=>filesize($archive),'version'=>$theme->get('Version'),'update_uri'=>$theme->get('UpdateURI'),'theme_upgrader_install'=>true,'activation'=>get_stylesheet()===$slug,'block_theme'=>wp_is_block_theme(),'active_plugins'=>get_option('active_plugins',array()));
    } elseif ($phase === 'configure') {
        must(get_stylesheet() === $slug, 'Expected theme not active');
        $page_map = array('switchboard'=>array('home','services','service-detail','process','contact'),'tideglass'=>array('home','stays','stay-detail','guide','contact'),'matter'=>array('home','collection','object','process','contact'),'nightjar'=>array('home','program','event','about','contact'));
        $pages = array();
        foreach ($page_map[$slug] as $name) {
            $id = wp_insert_post(array('post_type'=>'page','post_name'=>$name,'post_title'=>ucwords(str_replace('-',' ',$name)),'post_status'=>'publish'),true);
            must(!is_wp_error($id), 'Native page save failed');
            update_post_meta($id, '_wp_page_template', $name === 'home' ? 'default' : $name);
            $pages[$name] = array('id'=>$id,'template'=>get_post_meta($id,'_wp_page_template',true));
        }
        update_option('show_on_front','page'); update_option('page_on_front',$pages['home']['id']);
        update_option('blogname', ucfirst($slug) . ' Native Acceptance Studio'); update_option('blogdescription','Saved business copy on an independent native test site');
        global $wp_rewrite; $wp_rewrite->set_permalink_structure('/%postname%/'); flush_rewrite_rules(false);
        foreach ($pages as $name=>&$page) { $page['url'] = get_permalink($page['id']); } unset($page);
        require_once ABSPATH . 'wp-admin/includes/image.php';
        require_once ABSPATH . 'wp-admin/includes/media.php';
        $fixture = $argv[4]; $image = imagecreatetruecolor(480,300); $bg=imagecolorallocate($image,20,48,43); $lime=imagecolorallocate($image,216,243,95); imagefill($image,0,0,$bg); imagefilledrectangle($image,40,40,440,260,$lime); imagestring($image,5,70,135,'Native acceptance image', $bg); imagepng($image,$fixture); imagedestroy($image);
        $tmp = wp_tempnam('native-replacement.png'); copy($fixture,$tmp);
        $attachment = media_handle_sideload(array('name'=>'native-replacement-' . $slug . '.png','tmp_name'=>$tmp),$pages['home']['id'],'Native acceptance replacement artwork');
        must(!is_wp_error($attachment), 'Native media upload failed');
        update_post_meta($attachment, '_wp_attachment_image_alt', 'Native acceptance replacement artwork');
        $image_url = wp_get_attachment_url($attachment);
        $front = get_block_template($slug . '//front-page', 'wp_template'); must($front !== null, 'Front-page template unavailable');
        $blocks = resolve_pattern_blocks(parse_blocks($front->content)); $heading_done=false; $image_done=false;
        $headline = ucfirst($slug) . ' business copy saved on native WordPress';
        $blocks = edit_blocks($blocks,$headline,$attachment,$image_url,$heading_done,$image_done);
        must($heading_done && $image_done, 'Native heading/image block not found');
        $front_id = save_template('front-page',serialize_blocks($blocks));
        $contact = get_block_template($slug . '//contact','wp_template'); must($contact !== null, 'Contact template unavailable');
        $email = 'native-' . $slug . '@example.test';
        $contact_content = serialize_blocks(resolve_pattern_blocks(parse_blocks($contact->content)));
        must(str_contains($contact_content,'hello@example.com'), 'Expected demo contact address missing');
        $contact_id = save_template('contact', str_replace('hello@example.com',$email,$contact_content));
        $links = array(); foreach ($pages as $name=>$page) { $links[] = array('blockName'=>'core/navigation-link','attrs'=>array('label'=>ucwords(str_replace('-',' ',$name)),'url'=>$name==='home'?$site['url'].'/':$page['url'],'kind'=>'post-type','type'=>'page','id'=>$page['id']),'innerBlocks'=>array(),'innerHTML'=>'','innerContent'=>array()); }
        $navigation = wp_insert_post(array('post_type'=>'wp_navigation','post_title'=>'Native acceptance navigation','post_status'=>'publish','post_content'=>serialize_blocks($links)),true); must(!is_wp_error($navigation), 'Native navigation save failed');
        $header = get_block_template($slug . '//header','wp_template_part'); must($header !== null, 'Header part unavailable'); $nav_done=false;
        $header_id = save_template('header',serialize_blocks(nav_ref(parse_blocks($header->content),$navigation,$nav_done)),'wp_template_part'); must($nav_done,'Header navigation block missing');
        $export = wp_generate_block_templates_export_file(); must(!is_wp_error($export),'Core Site Editor export failed');
        $export_path = $argv[5]; must(copy($export,$export_path),'Export copy failed');
        $zip = new ZipArchive(); must($zip->open($export_path)===true,'Export ZIP invalid');
        $exported_front=$zip->getFromName('templates/front-page.html');
        must(str_contains($exported_front,$headline) && str_contains($exported_front,$image_url),'Export missing saved native edits'); $export_members=$zip->numFiles; $zip->close();
        $receipt += array('version'=>wp_get_theme()->get('Version'),'pages'=>$pages,'static_homepage'=>get_option('page_on_front')===$pages['home']['id'],'native_text_save'=>true,'headline'=>$headline,'native_image_save'=>true,'image_url'=>$image_url,'attachment_id'=>$attachment,'front_template_id'=>$front_id,'contact_template_id'=>$contact_id,'navigation_post_id'=>$navigation,'header_part_id'=>$header_id,'native_navigation_save'=>true,'contact_email'=>$email,'core_site_editor_export'=>array('path'=>$export_path,'sha256'=>hash_file('sha256',$export_path),'bytes'=>filesize($export_path),'members'=>$export_members,'contains_saved_text_and_image_url'=>true),'mail_suppressed'=>wp_mail('test@example.test','Native test suppression','No message')===false,'automatic_core_updates_disabled'=>defined('WP_AUTO_UPDATE_CORE') && WP_AUTO_UPDATE_CORE===false,'cron_disabled'=>defined('DISABLE_WP_CRON') && DISABLE_WP_CRON);
    } elseif ($phase === 'repair-navigation') {
        $receipt = json_decode(file_get_contents($argv[4]), true, 512, JSON_THROW_ON_ERROR);
        $links = array();
        foreach ($receipt['pages'] as $name=>&$page) {
            $actual = get_page_by_path($name,OBJECT,'page'); must($actual !== null,'Designed page missing during repair');
            $page = array('id'=>$actual->ID,'template'=>get_post_meta($actual->ID,'_wp_page_template',true),'url'=>get_permalink($actual->ID));
            $links[] = array('blockName'=>'core/navigation-link','attrs'=>array('label'=>ucwords(str_replace('-',' ',$name)),'url'=>$name==='home'?$site['url'].'/':$page['url'],'kind'=>'post-type','type'=>'page','id'=>$page['id']),'innerBlocks'=>array(),'innerHTML'=>'','innerContent'=>array());
        } unset($page);
        must(count(array_unique(array_column($receipt['pages'],'id')))===5,'Designed pages not independent');
        $updated=wp_update_post(array('ID'=>$receipt['navigation_post_id'],'post_content'=>serialize_blocks($links)),true); must(!is_wp_error($updated),'Native navigation repair failed');
        $receipt['static_homepage']=(int)get_option('page_on_front')===$receipt['pages']['home']['id'];
        $receipt['external_helper_navigation_reference_repair']=true;
        $export=wp_generate_block_templates_export_file(); must(!is_wp_error($export),'Export regeneration failed'); must(copy($export,$receipt['core_site_editor_export']['path']),'Export replacement failed');
        $receipt['core_site_editor_export']['sha256']=hash_file('sha256',$receipt['core_site_editor_export']['path']);
        $receipt['core_site_editor_export']['bytes']=filesize($receipt['core_site_editor_export']['path']);
    } elseif ($phase === 'inspect') {
        $receipt += array('version'=>wp_get_theme()->get('Version'),'active_theme'=>get_stylesheet(),'blogname'=>get_option('blogname'),'front_page_id'=>(int)get_option('page_on_front'),'native_templates'=>get_posts(array('post_type'=>'wp_template','post_status'=>'publish','numberposts'=>-1,'fields'=>'ids')),'media'=>(int)$wpdb->get_var("SELECT COUNT(*) FROM {$wpdb->posts} WHERE post_type='attachment'"),'five_designed_pages'=>(int)$wpdb->get_var("SELECT COUNT(*) FROM {$wpdb->posts} WHERE post_type='page' AND post_status='publish' AND post_name IN ('home','services','service-detail','process','contact','stays','stay-detail','guide','collection','object','program','event','about')"));
    } else { throw new RuntimeException('Unknown phase'); }
    echo json_encode($receipt,JSON_UNESCAPED_SLASHES);
} catch(Throwable $error) { fwrite(STDERR,get_class($error) . ': ' . $error->getMessage()); exit(1); }
