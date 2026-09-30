<?php
/**
 * Fiche d'une réalisation : photo principale, texte, galerie, navigation.
 *
 * @package ProStory
 */

get_header();

while ( have_posts() ) :
	the_post();
	$prostory_photos = prostory_realisation_photos( get_the_ID() );
	$prostory_total  = count( $prostory_photos );
	$prostory_video  = get_post_meta( get_the_ID(), '_prostory_video_url', true );
	?>
	<article id="post-<?php the_ID(); ?>" <?php post_class( 'work' ); ?>>
		<header class="page-head work__head">
			<div class="wrap wrap--narrow">
				<a class="back-link" href="<?php echo esc_url( prostory_realisations_url() ); ?>">
					<?php echo prostory_icon( 'arrow-left' ); // phpcs:ignore WordPress.Security.EscapeOutput ?>
					<?php esc_html_e( 'Toutes les réalisations', 'prostory' ); ?>
				</a>
				<?php the_title( '<h1 class="page-title">', '</h1>' ); ?>
				<p class="work__meta">
					<?php prostory_posted_on(); ?>
					<?php if ( $prostory_total > 1 ) : ?>
						<a class="work__photos-link" href="#photos">
							<?php
							/* translators: %s: nombre de photos. */
							echo esc_html( sprintf( _n( '%s photo', '%s photos', $prostory_total, 'prostory' ), number_format_i18n( $prostory_total ) ) );
							?>
						</a>
					<?php endif; ?>
				</p>
				<?php prostory_auto_note( prostory_mod( 'real_auto_single' ) ); ?>
			</div>
		</header>

		<?php if ( $prostory_photos ) : ?>
			<figure class="wrap work__cover">
				<button class="work__cover-button" type="button" data-lightbox-open="0" aria-label="<?php esc_attr_e( 'Agrandir la photo', 'prostory' ); ?>">
					<?php echo wp_get_attachment_image( $prostory_photos[0], '1536x1536', false, array( 'alt' => the_title_attribute( array( 'echo' => false ) ), 'fetchpriority' => 'high', 'sizes' => '(max-width: 1200px) 100vw, 1200px' ) ); ?>
					<span class="work__expand" aria-hidden="true"><?php echo prostory_icon( 'expand' ); // phpcs:ignore WordPress.Security.EscapeOutput ?></span>
				</button>
			</figure>
		<?php endif; ?>

		<div class="wrap wrap--narrow entry-content work__content">
			<?php the_content(); ?>
		</div>

		<?php if ( $prostory_video ) : ?>
			<div class="wrap wrap--narrow work__video">
				<video controls playsinline preload="metadata"<?php echo $prostory_photos ? ' poster="' . esc_url( wp_get_attachment_image_url( $prostory_photos[0], 'large' ) ) . '"' : ''; ?>>
					<source src="<?php echo esc_url( $prostory_video ); ?>">
				</video>
			</div>
		<?php endif; ?>

		<?php if ( $prostory_total > 1 ) : ?>
			<section class="wrap work__gallery" id="photos" aria-labelledby="photos-title">
				<h2 class="work__gallery-title" id="photos-title"><?php echo esc_html( prostory_mod( 'real_photos_title' ) ); ?></h2>
				<?php
				if ( $prostory_total <= 3 ) {
					$prostory_grid = 'photo-grid--' . $prostory_total;
				} elseif ( 4 === $prostory_total ) {
					$prostory_grid = 'photo-grid--4';
				} else {
					$prostory_grid = 'photo-grid--many';
				}
				?>
				<ul class="photo-grid <?php echo esc_attr( $prostory_grid ); ?>">
					<?php foreach ( $prostory_photos as $prostory_i => $prostory_id ) : ?>
						<li>
							<button type="button" class="photo-grid__item" data-lightbox-open="<?php echo (int) $prostory_i; ?>">
								<?php echo wp_get_attachment_image( $prostory_id, 'prostory-work', false, array( 'alt' => '', 'loading' => 'lazy', 'sizes' => '(max-width: 640px) 50vw, 300px' ) ); ?>
								<span class="screen-reader-text">
									<?php
									/* translators: 1: position de la photo, 2: nombre total. */
									echo esc_html( sprintf( __( 'Agrandir la photo %1$s sur %2$s', 'prostory' ), $prostory_i + 1, $prostory_total ) );
									?>
								</span>
							</button>
						</li>
					<?php endforeach; ?>
				</ul>
			</section>
		<?php endif; ?>

		<?php if ( $prostory_photos ) : ?>
			<dialog class="lightbox" data-lightbox aria-label="<?php esc_attr_e( 'Photos de la réalisation', 'prostory' ); ?>">
				<div class="lightbox__stage">
					<?php foreach ( $prostory_photos as $prostory_i => $prostory_id ) : ?>
						<img class="lightbox__img" data-lightbox-item hidden
							data-src="<?php echo esc_url( wp_get_attachment_image_url( $prostory_id, '2048x2048' ) ); ?>"
							alt="<?php echo esc_attr( sprintf( /* translators: 1: titre, 2: position, 3: total. */ __( '%1$s, photo %2$s sur %3$s', 'prostory' ), get_the_title(), $prostory_i + 1, $prostory_total ) ); ?>">
					<?php endforeach; ?>
				</div>
				<?php if ( $prostory_total > 1 ) : ?>
					<p class="lightbox__count" aria-live="polite"><span data-lightbox-index>1</span> / <?php echo (int) $prostory_total; ?></p>
					<button class="lightbox__nav lightbox__nav--prev" type="button" data-lightbox-prev aria-label="<?php esc_attr_e( 'Photo précédente', 'prostory' ); ?>"><?php echo prostory_icon( 'chevron-left' ); // phpcs:ignore WordPress.Security.EscapeOutput ?></button>
					<button class="lightbox__nav lightbox__nav--next" type="button" data-lightbox-next aria-label="<?php esc_attr_e( 'Photo suivante', 'prostory' ); ?>"><?php echo prostory_icon( 'chevron-right' ); // phpcs:ignore WordPress.Security.EscapeOutput ?></button>
				<?php endif; ?>
				<button class="lightbox__close" type="button" data-lightbox-close aria-label="<?php esc_attr_e( 'Fermer', 'prostory' ); ?>"><?php echo prostory_icon( 'close' ); // phpcs:ignore WordPress.Security.EscapeOutput ?></button>
			</dialog>
		<?php endif; ?>

		<div class="wrap wrap--narrow">
			<?php
			the_post_navigation(
				array(
					'prev_text' => '<span class="post-nav__label">' . esc_html__( 'Réalisation précédente', 'prostory' ) . '</span><span class="post-nav__title">%title</span>',
					'next_text' => '<span class="post-nav__label">' . esc_html__( 'Réalisation suivante', 'prostory' ) . '</span><span class="post-nav__title">%title</span>',
				)
			);
			?>
		</div>

		<?php if ( prostory_mod( 'real_cta_title' ) ) : ?>
			<aside class="work-cta" aria-labelledby="work-cta-title">
				<div class="wrap work-cta__inner">
					<div>
						<h2 class="work-cta__title" id="work-cta-title"><?php echo esc_html( prostory_mod( 'real_cta_title' ) ); ?></h2>
						<?php if ( prostory_mod( 'real_cta_text' ) ) : ?>
							<p class="work-cta__text"><?php echo esc_html( prostory_mod( 'real_cta_text' ) ); ?></p>
						<?php endif; ?>
					</div>
					<?php if ( prostory_mod( 'real_cta_button' ) ) : ?>
						<a class="button button--ink button--large" href="<?php echo esc_url( prostory_anchor_url( prostory_mod( 'real_cta_url' ) ) ); ?>"><?php echo esc_html( prostory_mod( 'real_cta_button' ) ); ?></a>
					<?php endif; ?>
				</div>
			</aside>
		<?php endif; ?>
	</article>
	<?php
endwhile;

get_footer();
