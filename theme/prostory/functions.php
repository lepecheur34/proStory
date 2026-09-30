<?php
/**
 * ProStory — fonctions du thème.
 *
 * @package ProStory
 */

defined( 'ABSPATH' ) || exit;

define( 'PROSTORY_THEME_VERSION', '1.2.1' );
define( 'PROSTORY_THEME_DIR', get_template_directory() );
define( 'PROSTORY_THEME_URI', get_template_directory_uri() );

require PROSTORY_THEME_DIR . '/inc/defaults.php';
require PROSTORY_THEME_DIR . '/inc/template-tags.php';
require PROSTORY_THEME_DIR . '/inc/customizer.php';
require PROSTORY_THEME_DIR . '/inc/clients.php';
require PROSTORY_THEME_DIR . '/inc/realisations.php';

/**
 * Réglages de base du thème.
 */
function prostory_setup() {
	load_theme_textdomain( 'prostory', PROSTORY_THEME_DIR . '/languages' );

	add_theme_support( 'title-tag' );
	add_theme_support( 'automatic-feed-links' );
	add_theme_support( 'post-thumbnails' );
	add_theme_support( 'responsive-embeds' );
	add_theme_support( 'align-wide' );
	add_theme_support( 'editor-styles' );
	add_theme_support(
		'html5',
		array( 'search-form', 'comment-form', 'comment-list', 'gallery', 'caption', 'style', 'script', 'navigation-widgets' )
	);
	add_theme_support(
		'custom-logo',
		array(
			'height'      => 64,
			'width'       => 240,
			'flex-height' => true,
			'flex-width'  => true,
		)
	);

	add_editor_style( 'assets/css/editor.css' );

	register_nav_menus(
		array(
			'primary' => __( 'Menu principal', 'prostory' ),
			'footer'  => __( 'Menu du pied de page', 'prostory' ),
			'legal'   => __( 'Liens légaux', 'prostory' ),
		)
	);

	add_image_size( 'prostory-story', 540, 960, true );
	add_image_size( 'prostory-card', 800, 500, true );
	add_image_size( 'prostory-work', 900, 675, true );
}
add_action( 'after_setup_theme', 'prostory_setup' );

/**
 * Largeur de contenu pour les médias intégrés.
 */
function prostory_content_width() {
	$GLOBALS['content_width'] = 720;
}
add_action( 'after_setup_theme', 'prostory_content_width', 0 );

/**
 * Styles et scripts.
 */
function prostory_assets() {
	wp_enqueue_style( 'prostory-main', PROSTORY_THEME_URI . '/assets/css/main.css', array(), PROSTORY_THEME_VERSION );

	wp_enqueue_script(
		'prostory-main',
		PROSTORY_THEME_URI . '/assets/js/main.js',
		array(),
		PROSTORY_THEME_VERSION,
		array(
			'in_footer' => true,
			'strategy'  => 'defer',
		)
	);

	wp_localize_script(
		'prostory-main',
		'prostoryL10n',
		array(
			'pause' => __( 'Mettre en pause les stories', 'prostory' ),
			'play'  => __( 'Relancer les stories', 'prostory' ),
		)
	);

	// Générateur de QR code (fenêtre de téléchargement sur ordinateur), chargé seulement sur l'accueil.
	if ( is_front_page() && prostory_mod( 'dl_file' ) && 'android' === prostory_mod( 'dl_file_platform' ) ) {
		wp_enqueue_script( 'prostory-qrcode', PROSTORY_THEME_URI . '/assets/js/qrcode.min.js', array(), '2.0.4', array( 'in_footer' => true, 'strategy' => 'defer' ) );
	}

	if ( is_singular() && comments_open() && get_option( 'thread_comments' ) ) {
		wp_enqueue_script( 'comment-reply' );
	}
}
add_action( 'wp_enqueue_scripts', 'prostory_assets' );

/**
 * Préchargement des polices auto-hébergées (aucun appel à un service tiers).
 */
function prostory_preload_fonts() {
	$fonts = array( 'bricolage-grotesque.woff2', 'instrument-sans.woff2' );
	foreach ( $fonts as $font ) {
		printf(
			'<link rel="preload" href="%s" as="font" type="font/woff2" crossorigin>' . "\n",
			esc_url( PROSTORY_THEME_URI . '/assets/fonts/' . $font )
		);
	}
}
add_action( 'wp_head', 'prostory_preload_fonts', 1 );

/**
 * Zone de widgets du pied de page.
 */
function prostory_widgets_init() {
	register_sidebar(
		array(
			'name'          => __( 'Pied de page', 'prostory' ),
			'id'            => 'footer-1',
			'description'   => __( 'Contenu affiché dans une colonne du pied de page.', 'prostory' ),
			'before_widget' => '<div id="%1$s" class="footer-widget %2$s">',
			'after_widget'  => '</div>',
			'before_title'  => '<h2 class="footer-title">',
			'after_title'   => '</h2>',
		)
	);
}
add_action( 'widgets_init', 'prostory_widgets_init' );

/**
 * Allègement du <head> : les emojis WordPress ne sont pas nécessaires.
 */
remove_action( 'wp_head', 'print_emoji_detection_script', 7 );
remove_action( 'wp_print_styles', 'print_emoji_styles' );
remove_action( 'admin_print_scripts', 'print_emoji_detection_script' );
remove_action( 'admin_print_styles', 'print_emoji_styles' );

/**
 * Extraits plus courts, sans « [...] ».
 */
add_filter(
	'excerpt_length',
	function () {
		return 26;
	}
);
add_filter(
	'excerpt_more',
	function () {
		return '…';
	}
);

/**
 * Classes du <body>.
 *
 * @param array $classes Classes existantes.
 * @return array
 */
function prostory_body_classes( $classes ) {
	if ( is_front_page() ) {
		$classes[] = 'is-landing';
	}
	return $classes;
}
add_filter( 'body_class', 'prostory_body_classes' );

/**
 * Autorise l'envoi du fichier d'installation Android (.apk) dans Médias, pour les administrateurs.
 * Il peut ainsi être hébergé sur le site, sans date d'expiration.
 *
 * @param array $mimes Types autorisés.
 * @return array
 */
function prostory_allow_apk( $mimes ) {
	if ( current_user_can( 'manage_options' ) ) {
		$mimes['apk'] = 'application/vnd.android.package-archive';
	}
	return $mimes;
}
add_filter( 'upload_mimes', 'prostory_allow_apk' );

/**
 * Un APK est une archive ZIP : sans ce filtre, WordPress refuse le fichier car son contenu
 * ne correspond pas à l'extension déclarée.
 *
 * @param array  $data     Type détecté.
 * @param string $file     Chemin du fichier.
 * @param string $filename Nom du fichier.
 * @return array
 */
function prostory_check_apk( $data, $file, $filename ) {
	if ( current_user_can( 'manage_options' ) && preg_match( '/\.apk$/i', (string) $filename ) ) {
		$data['ext']             = 'apk';
		$data['type']            = 'application/vnd.android.package-archive';
		$data['proper_filename'] = false;
	}
	return $data;
}
add_filter( 'wp_check_filetype_and_ext', 'prostory_check_apk', 10, 3 );
