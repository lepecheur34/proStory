<?php
/**
 * En-tête du site.
 *
 * @package ProStory
 */

?><!doctype html>
<html <?php language_attributes(); ?>>
<head>
	<meta charset="<?php bloginfo( 'charset' ); ?>">
	<meta name="viewport" content="width=device-width, initial-scale=1">
	<meta name="theme-color" content="#1A1B4B">
	<?php wp_head(); ?>
</head>
<body <?php body_class(); ?>>
<?php wp_body_open(); ?>
<a class="skip-link" href="#contenu"><?php esc_html_e( 'Aller au contenu', 'prostory' ); ?></a>

<header class="site-header" data-site-header>
	<div class="wrap site-header__inner">
		<div class="site-brand">
			<?php prostory_logo(); ?>
		</div>

		<button class="nav-toggle" type="button" aria-expanded="false" aria-controls="site-nav" data-nav-toggle>
			<span class="nav-toggle__open"><?php echo prostory_icon( 'menu' ); // phpcs:ignore WordPress.Security.EscapeOutput ?></span>
			<span class="nav-toggle__close"><?php echo prostory_icon( 'close' ); // phpcs:ignore WordPress.Security.EscapeOutput ?></span>
			<span class="screen-reader-text"><?php esc_html_e( 'Menu', 'prostory' ); ?></span>
		</button>

		<nav class="site-nav" id="site-nav" aria-label="<?php esc_attr_e( 'Menu principal', 'prostory' ); ?>" data-site-nav>
			<?php
			wp_nav_menu(
				array(
					'theme_location' => 'primary',
					'container'      => false,
					'menu_class'     => 'menu',
					'depth'          => 1,
					'fallback_cb'    => 'prostory_menu_fallback',
				)
			);
			?>
			<a class="button button--small button--ink" href="<?php echo esc_url( ( is_front_page() ? '' : home_url( '/' ) ) . '#telecharger' ); ?>"><?php esc_html_e( 'Télécharger', 'prostory' ); ?></a>
		</nav>
	</div>
</header>

<main id="contenu" class="site-main">
