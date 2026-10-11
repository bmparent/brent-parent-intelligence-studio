<?php
/** Native block theme assets. No tracking, endpoints, or proprietary services. */
if ( ! defined( 'ABSPATH' ) ) { exit; }
add_action( 'after_setup_theme', function () {
    add_theme_support( 'wp-block-styles' );
    add_editor_style( 'style.css' );
} );
add_action( 'wp_enqueue_scripts', function () {
    wp_enqueue_style( 'eidos-tideglass', get_stylesheet_uri(), array(), '1.0.0' );
} );
add_filter( 'body_class', function ( $classes ) { $classes[] = 'tideglass'; return $classes; } );
