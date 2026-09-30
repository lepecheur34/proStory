<?php
/**
 * Page d'accueil : vitrine de l'application.
 * Chaque section se règle dans Apparence > Personnaliser > ProStory.
 *
 * @package ProStory
 */

get_header();

get_template_part( 'template-parts/hero' );

if ( prostory_mod( 'show_features' ) ) {
	get_template_part( 'template-parts/features' );
}
if ( prostory_mod( 'show_steps' ) ) {
	get_template_part( 'template-parts/steps' );
}
if ( prostory_mod( 'show_realisations' ) ) {
	get_template_part( 'template-parts/realisations-home' );
}

// Contenu libre de la page d'accueil (si une page statique est définie et remplie).
if ( 'page' === get_option( 'show_on_front' ) ) {
	while ( have_posts() ) {
		the_post();
		if ( '' !== trim( get_the_content() ) ) {
			echo '<section class="section section--free"><div class="wrap entry-content">';
			the_content();
			echo '</div></section>';
		}
	}
}

if ( prostory_mod( 'show_pricing' ) ) {
	get_template_part( 'template-parts/pricing' );
}
if ( prostory_mod( 'show_faq' ) ) {
	get_template_part( 'template-parts/faq' );
}
if ( prostory_mod( 'show_download' ) ) {
	get_template_part( 'template-parts/download' );
}

get_footer();
