<?php
// External task helper. Passwords are read from the ACL-restricted file, never printed.
if (!function_exists('wp_mail')) {
    function wp_mail($to, $subject, $message, $headers = '', $attachments = array()) { return false; }
}
try {
    $credentials = json_decode(file_get_contents($argv[1]), true, 512, JSON_THROW_ON_ERROR);
    $slug = $argv[2];
    $site = $credentials['sites'][$slug];
    define('WP_INSTALLING', true);
    require $site['wordpress_root'] . '/wp-load.php';
    require ABSPATH . 'wp-admin/includes/upgrade.php';
    wp_install('Native acceptance ' . ucfirst($slug), $site['admin_user'], $site['admin_email'], 0, '', $site['admin_password'], 'en_US');
    require_once ABSPATH . 'wp-admin/includes/theme.php';
    global $wp_version, $wpdb;
    $themes = array();
    foreach (wp_get_themes() as $key => $theme) { $themes[] = array('slug' => $key, 'version' => $theme->get('Version')); }
    echo json_encode(array('product' => $slug, 'status' => 'clean_core_baseline', 'wordpress' => $wp_version, 'php' => PHP_VERSION, 'database_version' => $wpdb->db_version(), 'database' => $site['database'], 'url' => $site['url'], 'active_theme' => get_stylesheet(), 'themes' => $themes, 'posts' => (int)$wpdb->get_var("SELECT COUNT(*) FROM {$wpdb->posts} WHERE post_type='post'"), 'pages' => (int)$wpdb->get_var("SELECT COUNT(*) FROM {$wpdb->posts} WHERE post_type='page'"), 'media' => (int)$wpdb->get_var("SELECT COUNT(*) FROM {$wpdb->posts} WHERE post_type='attachment'"), 'plugins_active' => count(get_option('active_plugins', array())), 'multisite' => is_multisite(), 'mail_suppressed_by_external_install_helper' => true));
} catch (Throwable $error) { fwrite(STDERR, get_class($error)); exit(1); }
