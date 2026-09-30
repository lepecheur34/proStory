<?php
/**
 * Commentaires.
 *
 * @package ProStory
 */

if ( post_password_required() ) {
	return;
}
?>
<section id="comments" class="comments">
	<?php if ( have_comments() ) : ?>
		<h2 class="comments__title">
			<?php
			/* translators: %s: nombre de commentaires. */
			printf( esc_html( _n( '%s commentaire', '%s commentaires', get_comments_number(), 'prostory' ) ), esc_html( number_format_i18n( get_comments_number() ) ) );
			?>
		</h2>
		<ol class="comment-list">
			<?php
			wp_list_comments(
				array(
					'style'       => 'ol',
					'short_ping'  => true,
					'avatar_size' => 40,
				)
			);
			?>
		</ol>
		<?php the_comments_navigation(); ?>
	<?php endif; ?>

	<?php
	comment_form(
		array(
			'title_reply'  => __( 'Laisser un commentaire', 'prostory' ),
			'label_submit' => __( 'Publier le commentaire', 'prostory' ),
			'class_submit' => 'button button--ink',
		)
	);
	?>
</section>
