<?php
/**
 * Modèle par défaut : blog, archives, recherche.
 *
 * @package ProStory
 */

get_header();
?>
<div class="page-head">
	<div class="wrap wrap--narrow">
		<?php if ( is_home() && ! is_front_page() ) : ?>
			<h1 class="page-title"><?php single_post_title(); ?></h1>
		<?php elseif ( is_search() ) : ?>
			<h1 class="page-title">
				<?php
				/* translators: %s: terme recherché. */
				printf( esc_html__( 'Résultats pour « %s »', 'prostory' ), esc_html( get_search_query() ) );
				?>
			</h1>
		<?php elseif ( is_archive() ) : ?>
			<?php the_archive_title( '<h1 class="page-title">', '</h1>' ); ?>
			<?php the_archive_description( '<div class="page-lead">', '</div>' ); ?>
		<?php else : ?>
			<h1 class="page-title"><?php esc_html_e( 'Actualités', 'prostory' ); ?></h1>
		<?php endif; ?>
	</div>
</div>

<div class="wrap wrap--narrow">
	<?php if ( have_posts() ) : ?>
		<div class="post-list">
			<?php
			while ( have_posts() ) :
				the_post();
				get_template_part( 'template-parts/card' );
			endwhile;
			?>
		</div>
		<?php
		the_posts_pagination(
			array(
				'mid_size'  => 1,
				'prev_text' => __( 'Précédent', 'prostory' ),
				'next_text' => __( 'Suivant', 'prostory' ),
			)
		);
		?>
	<?php else : ?>
		<div class="empty-state">
			<p><?php echo is_search() ? esc_html__( 'Aucun résultat. Essayez avec un autre mot.', 'prostory' ) : esc_html__( 'Aucun article publié pour l’instant.', 'prostory' ); ?></p>
			<?php get_search_form(); ?>
		</div>
	<?php endif; ?>
</div>
<?php
get_footer();
