import certifi, datetime, hashlib, json, pathlib, secrets, shutil, socket, subprocess, time, urllib.request, zipfile

from runtime_args import arguments
ROOT, _ = arguments()
HELPERS = pathlib.Path(__file__).resolve().parent
PRIVATE = ROOT / 'private'
PRODUCTS = ['switchboard', 'tideglass', 'matter', 'nightjar']
PORTS = dict(zip(PRODUCTS, [8971, 8972, 8973, 8974]))
DB_PORT = 33071
PHP = ROOT / 'php81' / 'php.exe'
MARIA = ROOT / 'mariadb' / 'mariadb-10.11.19-winx64' / 'bin'
ENV = dict(__import__('os').environ, TEMP=str(ROOT / 'tmp'), TMP=str(ROOT / 'tmp'))
NOW = lambda: datetime.datetime.now(datetime.timezone.utc).isoformat()
HIDE = subprocess.CREATE_NO_WINDOW

def run(args, **kw):
    return subprocess.run([str(a) for a in args], creationflags=HIDE, env=ENV, capture_output=True, timeout=kw.pop('timeout', 120), **kw)

def check_free(port):
    with socket.socket() as sock:
        sock.bind(('127.0.0.1', port))

def wait_port(port, seconds=60):
    end = time.monotonic() + seconds
    while time.monotonic() < end:
        try:
            with socket.create_connection(('127.0.0.1', port), timeout=1): return
        except OSError: time.sleep(.5)
    raise RuntimeError('Owned localhost listener did not become ready')

def start_hidden(exe, args, name):
    # PowerShell receives no credential values; the server reads its private config.
    quote = lambda s: "'" + str(s).replace("'", "''") + "'"
    argline = ' '.join('"' + str(a).replace('"', '\\"') + '"' for a in args)
    pid_file = PRIVATE / (name + '-launcher.pid')
    command = '$p=Start-Process -FilePath ' + quote(exe) + ' -ArgumentList ' + quote(argline) + ' -WindowStyle Hidden -PassThru -RedirectStandardOutput ' + quote(PRIVATE / (name + '-stdout.log')) + ' -RedirectStandardError ' + quote(PRIVATE / (name + '-stderr.log')) + '; $p.Id | Set-Content -LiteralPath ' + quote(pid_file)
    # Detached descendants must not inherit a Python capture pipe.
    launcher = subprocess.Popen(['powershell.exe', '-NoProfile', '-Command', command], creationflags=HIDE, env=ENV, stdin=subprocess.DEVNULL, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    if launcher.wait(timeout=30): raise RuntimeError('Hidden process launch failed')
    return int(pid_file.read_text(encoding='utf-8-sig').strip())

assert not (ROOT / 'runtime-receipt.json').exists(), 'Existing runtime receipt: refusing duplicate bootstrap'
resume = '--resume' in __import__('sys').argv
for port in ([*PORTS.values()] if resume else [DB_PORT, *PORTS.values()]): check_free(port)
for folder in ['private', 'tmp', 'sites', 'receipts']:
    (ROOT / folder).mkdir(exist_ok=True)
for helper in ['install-core.php','accept-native.php','router.php','mail-suppression.php','stop-php-gracefully.py','runtime_args.py']:
    if (HELPERS / helper).resolve() != (ROOT / helper).resolve(): shutil.copyfile(HELPERS / helper, ROOT / helper)
identity = run(['whoami']).stdout.decode().strip()
acl = run(['icacls', str(PRIVATE), '/inheritance:r', '/grant:r', identity + ':(OI)(CI)F', '/grant:r', 'SYSTEM:(OI)(CI)F'])
assert acl.returncode == 0, 'Private directory ACL failed'
credential_file = PRIVATE / 'credentials.json'
if resume:
    creds = json.loads(credential_file.read_text(encoding='utf-8'))
else:
    assert not credential_file.exists(), 'Refusing to overwrite credentials'
    creds = {'schema_version': 1, 'scope': 'Task-owned localhost native WordPress acceptance only', 'created_at': NOW(), 'database': {'host': '127.0.0.1', 'port': DB_PORT, 'root_user': 'root', 'root_password': secrets.token_urlsafe(36)}, 'sites': {slug: {'url': f'http://127.0.0.1:{PORTS[slug]}', 'database': 'paid_templates_' + slug, 'database_user': 'wp_' + slug, 'database_password': secrets.token_urlsafe(36), 'admin_user': 'native_acceptance', 'admin_password': secrets.token_urlsafe(36), 'admin_email': 'acceptance@example.test', 'wordpress_root': str(ROOT / 'sites' / slug)} for slug in PRODUCTS}}
    credential_file.write_text(json.dumps(creds, indent=2), encoding='utf-8')
shutil.copyfile(certifi.where(), ROOT / 'cacert.pem')
php_ini = '\n'.join(['[PHP]', 'extension_dir="' + str(ROOT / 'php81' / 'ext').replace('\\', '/') + '"', *['extension=' + name for name in ['mysqli', 'pdo_mysql', 'curl', 'openssl', 'mbstring', 'gd', 'fileinfo']], 'memory_limit=128M', 'max_execution_time=120', 'upload_max_filesize=16M', 'post_max_size=20M', 'display_errors=Off', 'log_errors=On', 'error_log="' + str(PRIVATE / 'php-errors.log').replace('\\', '/') + '"', 'upload_tmp_dir="' + str(ROOT / 'tmp').replace('\\', '/') + '"', 'sys_temp_dir="' + str(ROOT / 'tmp').replace('\\', '/') + '"', 'session.save_path="' + str(ROOT / 'tmp').replace('\\', '/') + '"', 'curl.cainfo="' + str(ROOT / 'cacert.pem').replace('\\', '/') + '"', 'openssl.cafile="' + str(ROOT / 'cacert.pem').replace('\\', '/') + '"', 'date.timezone=UTC', 'expose_php=Off', 'allow_url_fopen=On', ''])
(ROOT / 'php.ini').write_text(php_ini, encoding='utf-8')
with (ROOT / 'php.ini').open('a', encoding='utf-8') as config_file:
    config_file.write('auto_prepend_file="' + str(ROOT / 'mail-suppression.php').replace('\\', '/') + '"\n')
version = run([PHP, '-c', ROOT / 'php.ini', '-r', 'echo json_encode(["php"=>PHP_VERSION,"extensions"=>get_loaded_extensions()]);'])
assert version.returncode == 0, 'PHP extension configuration failed'
php_info = json.loads(version.stdout)
assert php_info['php'] == '8.1.34'
assert all(ext in php_info['extensions'] for ext in ['mysqli','curl','openssl','mbstring','gd','fileinfo','zip'])
data = PRIVATE / 'mariadb-data'
assert resume or not data.exists(), 'Database data directory already exists'
maria_ini = '\n'.join(['[mysqld]', 'basedir="' + str(MARIA.parent).replace('\\','/') + '"', 'datadir="' + str(data).replace('\\','/') + '"', 'port=' + str(DB_PORT), 'bind-address=127.0.0.1', 'innodb-buffer-pool-size=64M', 'aria-pagecache-buffer-size=16M', 'key-buffer-size=8M', 'max-connections=8', 'table-open-cache=128', 'performance-schema=OFF', 'tmpdir="' + str(ROOT / 'tmp').replace('\\','/') + '"', 'log-error="' + str(PRIVATE / 'mariadb-errors.log').replace('\\','/') + '"', 'pid-file="' + str(PRIVATE / 'mariadb.pid').replace('\\','/') + '"', 'character-set-server=utf8mb4', 'collation-server=utf8mb4_unicode_ci', ''])
config = PRIVATE / 'mariadb.ini'
config.write_text(maria_ini, encoding='utf-8')
if not resume:
    init = run([MARIA / 'mariadb-install-db.exe', '--datadir=' + str(data), '--password=' + creds['database']['root_password'], '--port=' + str(DB_PORT), '--config=' + str(config), '--silent'], timeout=180)
    (PRIVATE / 'mariadb-init-output.log').write_bytes(init.stdout + init.stderr)
    assert init.returncode == 0, 'MariaDB initialization failed; private log retained'
    db_pid = start_hidden(MARIA / 'mariadbd.exe', ['--defaults-file=' + str(config), '--console'], 'mariadb')
else:
    db_pid = int((PRIVATE / 'mariadb.pid').read_text().strip())
wait_port(DB_PORT)
client = PRIVATE / 'root-client.ini'
client.write_text('[client]\nuser=root\npassword=' + creds['database']['root_password'] + '\nhost=127.0.0.1\nport=' + str(DB_PORT) + '\nprotocol=tcp\n', encoding='utf-8')
sql = []
for slug, site in creds['sites'].items():
    sql.extend([f"CREATE DATABASE `{site['database']}` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;", f"CREATE USER '{site['database_user']}'@'127.0.0.1' IDENTIFIED BY '{site['database_password']}';", f"GRANT ALL PRIVILEGES ON `{site['database']}`.* TO '{site['database_user']}'@'127.0.0.1';"])
sql.append('SELECT VERSION();')
db_setup = run([MARIA / 'mariadb.exe', '--defaults-extra-file=' + str(client), '--batch', '--skip-column-names'], input='\n'.join(sql).encode())
(PRIVATE / 'database-setup-output.log').write_bytes(db_setup.stdout + db_setup.stderr)
assert db_setup.returncode == 0, 'Database creation failed; private log retained'
db_version = db_setup.stdout.decode().strip()
archive = ROOT / 'wordpress-6.6.zip'
wp_sha1 = hashlib.file_digest(archive.open('rb'), 'sha1').hexdigest()
assert wp_sha1 == '4db7f3f95508fdb5b75c6985869efb0e53ed42a1', 'Official WordPress 6.6 ZIP differs'
php_quote = lambda v: "'" + str(v).replace('\\','\\\\').replace("'", "\\'") + "'"
sites = []
for slug, site in creds['sites'].items():
    docroot = pathlib.Path(site['wordpress_root'])
    assert not docroot.exists(), 'Site root already exists'
    docroot.mkdir()
    with zipfile.ZipFile(archive) as z:
        for member in z.infolist():
            path = pathlib.PurePosixPath(member.filename)
            assert path.parts[0] == 'wordpress' and '..' not in path.parts
            relative = pathlib.Path(*path.parts[1:])
            if not relative.parts: continue
            destination = docroot / relative
            if member.is_dir(): destination.mkdir(exist_ok=True, parents=True)
            else:
                destination.parent.mkdir(exist_ok=True, parents=True)
                with z.open(member) as src, destination.open('xb') as dst: shutil.copyfileobj(src, dst)
    values = {'DB_NAME': site['database'], 'DB_USER': site['database_user'], 'DB_PASSWORD': site['database_password'], 'DB_HOST': '127.0.0.1:' + str(DB_PORT), 'DB_CHARSET':'utf8mb4', 'DB_COLLATE':'', 'WP_HOME':site['url'], 'WP_SITEURL':site['url'], 'FS_METHOD':'direct', 'WP_ENVIRONMENT_TYPE':'local', 'WP_MEMORY_LIMIT':'128M','WP_MAX_MEMORY_LIMIT':'128M', **{key:secrets.token_urlsafe(48) for key in ['AUTH_KEY','SECURE_AUTH_KEY','LOGGED_IN_KEY','NONCE_KEY','AUTH_SALT','SECURE_AUTH_SALT','LOGGED_IN_SALT','NONCE_SALT']}}
    cfg = '<?php\n' + '\n'.join('define(' + php_quote(k) + ', ' + php_quote(v) + ');' for k,v in values.items()) + "\ndefine('WP_DEBUG', false);\ndefine('DISABLE_WP_CRON', true);\ndefine('AUTOMATIC_UPDATER_DISABLED', true);\ndefine('WP_AUTO_UPDATE_CORE', false);\n$table_prefix = 'wp_';\nif (!defined('ABSPATH')) define('ABSPATH', __DIR__ . '/');\nrequire_once ABSPATH . 'wp-settings.php';\n"
    (docroot / 'wp-config.php').write_text(cfg, encoding='utf-8')
    # Config holds credentials: inherit only the private current-user/SYSTEM ACL.
    config_acl = run(['icacls', str(docroot / 'wp-config.php'), '/inheritance:r', '/grant:r', identity + ':F', '/grant:r', 'SYSTEM:F'])
    assert config_acl.returncode == 0
    result = run([PHP, '-c', ROOT / 'php.ini', ROOT / 'install-core.php', credential_file, slug], timeout=120)
    (PRIVATE / (slug + '-install-output.log')).write_bytes(result.stdout + result.stderr)
    assert result.returncode == 0, 'WordPress core install failed; private log retained'
    baseline = json.loads(result.stdout)
    assert baseline['wordpress'] == '6.6' and baseline['pages'] == 2 and baseline['media'] == 0 and baseline['plugins_active'] == 0
    assert baseline['active_theme'] == 'twentytwentyfour' and not any(t['slug'] in PRODUCTS for t in baseline['themes'])
    (ROOT / 'receipts' / (slug + '-clean-baseline.json')).write_text(json.dumps(baseline, indent=2), encoding='utf-8')
    php_pid = start_hidden(PHP, ['-c', str(ROOT / 'php.ini'), '-S', '127.0.0.1:' + str(PORTS[slug]), '-t', str(docroot), str(ROOT / 'router.php')], 'php-' + slug)
    wait_port(PORTS[slug], 30)
    with urllib.request.urlopen(site['url'] + '/', timeout=20) as response:
        assert response.status == 200
        response.read()
    sites.append({'product': slug, 'url': site['url'], 'document_root': str(docroot), 'database': site['database'], 'php_pid': php_pid, 'baseline_receipt': str(ROOT / 'receipts' / (slug + '-clean-baseline.json')), 'http_status':200})
receipt = {'timestamp_utc':NOW(), 'status':'ready_for_buyer_archive_acceptance', 'scope':'Four independent, freshly initialized WordPress databases/document roots; one task-owned MariaDB server and one PHP built-in development server per site. All listeners bound only to 127.0.0.1. No Windows service or administrator installation.', 'wordpress':'6.6', 'php':php_info['php'], 'php_extensions':php_info['extensions'], 'mariadb':db_version, 'mariadb_pid':db_pid, 'mariadb_port':DB_PORT, 'http_server':'PHP built-in development server', 'private_credentials_file':str(credential_file), 'private_acl':'Inheritance removed; current user and SYSTEM full control only', 'wordpress_zip':{'source_url':'https://wordpress.org/wordpress-6.6.zip', 'sha1':wp_sha1,'sha256':hashlib.file_digest(archive.open('rb'),'sha256').hexdigest()}, 'php_zip':{'source_url':'https://downloads.php.net/~windows/releases/php-8.1.34-nts-Win32-vs16-x64.zip','sha256':hashlib.file_digest((ROOT / 'php-8.1.34-nts-Win32-vs16-x64.zip').open('rb'),'sha256').hexdigest()},'sites':sites,'limits':['Development HTTP server, not Apache/nginx or a production host','Theme install/content-edit/export/restart acceptance not yet run','No theme or importer plugin preinstalled; default WordPress content retained','Private credentials/config/logs must not be published']}
(ROOT / 'runtime-receipt.json').write_text(json.dumps(receipt, indent=2), encoding='utf-8')
print(json.dumps(receipt), flush=True)
