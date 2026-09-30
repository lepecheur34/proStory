<?php
/**
 * Page introuvable.
 *
 * @package ProStory
 */

get_header();
?>
<section class="not-found">
	<div class="wrap wrap--narrow">
		<div class="not-found__bars" aria-hidden="true"><span></span><span></span><span></span></div>
		<h1 class="page-title"><?php esc_html_e( 'Cette page n’existe pas ou a été déplacée.', 'prostory' ); ?></h1>
		<p class="page-lead"><?php esc_html_e( 'Vérifiez l’adresse, ou repartez de la page d’accueil.', 'prostory' ); ?></p>
		<p><a class="button button--ink" href="<?php echo esc_url( home_url( '/' ) ); ?>"><?php esc_html_e( 'Revenir à l’accueil', 'prostory' ); ?></a></p>
	</div>
</section>
<?php
get_footer();
