<?php
// PHP development router: existing files/directories use the native server;
// pretty WordPress paths use its front controller. Each site owns its root port.
$root = realpath($_SERVER['DOCUMENT_ROOT']);
$path = rawurldecode(parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH) ?: '/');
$file = realpath($root . DIRECTORY_SEPARATOR . ltrim($path, '/'));
if ($file !== false && str_starts_with($file, $root . DIRECTORY_SEPARATOR) && (is_file($file) || is_dir($file))) { return false; }
if ($path === '/') { return false; }
require $root . '/index.php';
