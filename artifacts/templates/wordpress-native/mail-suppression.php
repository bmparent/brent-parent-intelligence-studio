<?php
// External task runtime hook; not an installed WordPress plugin.
// Prevent every WordPress notification from leaving these localhost test sites.
if (!function_exists('wp_mail')) {
    function wp_mail($to, $subject, $message, $headers = '', $attachments = array()) { return false; }
}
