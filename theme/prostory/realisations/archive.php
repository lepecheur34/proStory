<?php
/**
 * Portfolio : toutes les réalisations publiées depuis l'application.
 *
 * @package ProStory
 */

get_header();
?>
<header class="page-head">
	<div class="wrap">
		<h1 class="page-title"><?php echo esc_html( prostory_mod( 'real_title' ) ); ?></h1>
		<?php if ( prostory_mod( 'real_text' ) ) : ?>
			<p class="page-lead"><?php echo esc_html( prostory_mod( 'real_text' ) ); ?></p>
		<?php endif; ?>
		<?php prostory_auto_note( prostory_mod( 'real_auto_list' ) ); ?>
	</div>
</header>

<div class="wrap works">
	<?php if ( have_posts() ) : ?>
		<div class="work-grid">
			<?php
			while ( have_posts() ) :
				the_post();
				get_template_part( 'template-parts/realisation-card', null, array( 'heading' => 'h2' ) );
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
			<p><?php echo esc_html( prostory_mod( 'real_empty' ) ); ?></p>
			<?php if ( current_user_can( 'manage_options' ) ) : ?>
				<p class="admin-hint">
					<?php esc_html_e( 'Pour publier depuis l’application, renseignez l’adresse du site et la clé API indiquées dans', 'prostory' ); ?>
					<a href="<?php echo esc_url( admin_url( 'options-general.php?page=prostory-connector' ) ); ?>"><?php esc_html_e( 'Réglages > ProStory', 'prostory' ); ?></a>.
				</p>
			<?php endif; ?>
		</div>
	<?php endif; ?>
</div>
<?php
get_footer();
