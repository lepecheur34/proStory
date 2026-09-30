<?php
/**
 * Vignette d'une réalisation (portfolio et accueil).
 *
 * @package ProStory
 *
 * @var array $args { heading: niveau du titre (h2 ou h3) }
 */

$prostory_heading = ( isset( $args['heading'] ) && 'h3' === $args['heading'] ) ? 'h3' : 'h2';
$prostory_photos  = prostory_realisation_photos( get_the_ID() );
$prostory_excerpt = wp_trim_words( wp_strip_all_tags( get_the_excerpt() ), 20, '…' );
$prostory_video   = get_post_meta( get_the_ID(), '_prostory_video_url', true );
?>
<article <?php post_class( 'work-card' ); ?>>
	<div class="work-card__media">
		<?php if ( $prostory_photos ) : ?>
			<?php echo wp_get_attachment_image( $prostory_photos[0], 'prostory-work', false, array( 'alt' => '', 'sizes' => '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 400px' ) ); ?>
			<?php if ( count( $prostory_photos ) > 1 ) : ?>
				<?php echo prostory_photo_segments( count( $prostory_photos ) ); // phpcs:ignore WordPress.Security.EscapeOutput ?>
			<?php endif; ?>
		<?php else : ?>
			<span class="work-card__placeholder" aria-hidden="true"><?php echo prostory_mark(); // phpcs:ignore WordPress.Security.EscapeOutput ?></span>
		<?php endif; ?>
		<?php if ( $prostory_video ) : ?>
			<span class="work-card__video-badge" aria-hidden="true"><?php echo prostory_icon( 'play' ); // phpcs:ignore WordPress.Security.EscapeOutput ?></span>
		<?php endif; ?>
	</div>
	<div class="work-card__body">
		<<?php echo esc_html( $prostory_heading ); ?> class="work-card__title">
			<a href="<?php the_permalink(); ?>"><?php the_title(); ?></a>
		</<?php echo esc_html( $prostory_heading ); ?>>
		<p class="work-card__meta">
			<?php prostory_posted_on(); ?>
			<?php if ( count( $prostory_photos ) > 1 ) : ?>
				<span class="work-card__count">
					<?php
					/* translators: %s: nombre de photos. */
					echo esc_html( sprintf( _n( '%s photo', '%s photos', count( $prostory_photos ), 'prostory' ), number_format_i18n( count( $prostory_photos ) ) ) );
					?>
				</span>
			<?php endif; ?>
		</p>
		<?php if ( $prostory_excerpt ) : ?>
			<p class="work-card__excerpt"><?php echo esc_html( $prostory_excerpt ); ?></p>
		<?php endif; ?>
	</div>
</article>
