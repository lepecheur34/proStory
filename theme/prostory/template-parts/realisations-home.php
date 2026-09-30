<?php
/**
 * Accueil : dernières réalisations publiées depuis l'application.
 *
 * @package ProStory
 */

if ( ! prostory_realisations_enabled() ) {
	return;
}

$prostory_works = new WP_Query(
	array(
		'post_type'           => prostory_realisation_type(),
		'posts_per_page'      => (int) prostory_mod( 'home_real_count' ),
		'post_status'         => 'publish',
		'ignore_sticky_posts' => true,
		'no_found_rows'       => true,
	)
);

if ( ! $prostory_works->have_posts() ) {
	if ( is_customize_preview() ) {
		echo '<section class="section works-home"><div class="wrap"><p class="admin-hint">' . esc_html__( 'La section des dernières réalisations apparaîtra ici dès la première publication depuis l’application.', 'prostory' ) . '</p></div></section>';
	}
	return;
}
?>
<section class="section works-home" id="realisations" aria-labelledby="works-home-title">
	<div class="wrap">
		<div class="section-head">
			<h2 class="section-title" id="works-home-title"><?php echo esc_html( prostory_mod( 'home_real_title' ) ); ?></h2>
			<?php if ( prostory_mod( 'home_real_text' ) ) : ?>
				<p class="section-lead"><?php echo esc_html( prostory_mod( 'home_real_text' ) ); ?></p>
			<?php endif; ?>
		</div>
		<div class="work-grid">
			<?php
			while ( $prostory_works->have_posts() ) :
				$prostory_works->the_post();
				get_template_part( 'template-parts/realisation-card', null, array( 'heading' => 'h3' ) );
			endwhile;
			wp_reset_postdata();
			?>
		</div>
		<?php if ( prostory_mod( 'home_real_link' ) ) : ?>
			<p class="works-home__more">
				<a class="button button--outline" href="<?php echo esc_url( prostory_realisations_url() ); ?>"><?php echo esc_html( prostory_mod( 'home_real_link' ) ); ?></a>
			</p>
		<?php endif; ?>
	</div>
</section>
