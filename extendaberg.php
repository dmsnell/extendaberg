<?php
/**
 * Plugin Name: Extendaberg
 * Plugin URI: http://wordpress.com/
 * Description: Making Gutenberg different
 * Version: 1.0
 * Author: Dennis Snell <dennis.snell@automattic.com>
 * Author URI: dmsnell.com
 * License: GPL-2.0
 **/

namespace Dmsnell\Extendaberg;

defined( 'ABSPATH' ) or die( 'Cannot access script directly' );

add_action( 'init', function () {
	wp_register_script(
		'extendaberg-js',
		plugins_url( 'extendaberg.js', __FILE__ ),
		[ 'wp-blocks', 'wp-element' ]
	);

	register_block_type( 'extendaberg/block', [
		'editor_script' => 'extendaberg-js',
		'render_callback' => 'Dmsnell\Extendaberg\render_block'
	] );
} );

function render_block( $attributes ) {
	$label = $attributes['label'];
	$version = phpversion();

	return "Hello from PHP ${version}! - ${label}";
}
