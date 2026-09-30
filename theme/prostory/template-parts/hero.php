<?php
/**
 * En-tête d'accueil avec le lecteur de stories.
 *
 * @package ProStory
 */

$prostory_stories = array();
for ( $i = 1; $i <= 3; $i++ ) {
	if ( ! prostory_mod( "story_{$i}_title" ) ) {
		continue;
	}
	$prostory_stories[] = array(
		'brand'   => prostory_mod( "story_{$i}_brand" ),
		'meta'    => prostory_mod( "story_{$i}_meta" ),
		'title'   => prostory_mod( "story_{$i}_title" ),
		'text'    => prostory_mod( "story_{$i}_text" ),
		'sticker' => prostory_mod( "story_{$i}_sticker" ),
		'tone'    => prostory_mod( "story_{$i}_tone" ),
		'image'   => prostory_mod( "story_{$i}_image" ),
		'visual'  => prostory_mod( "story_{$i}_visual" ),
	);
}
?>
<section class="hero">
	<div class="wrap hero__grid">
		<div class="hero__copy">
			<h1 class="hero__title"><?php echo esc_html( prostory_mod( 'hero_title' ) ); ?></h1>
			<?php if ( prostory_mod( 'hero_text' ) ) : ?>
				<p class="hero__text"><?php echo esc_html( prostory_mod( 'hero_text' ) ); ?></p>
			<?php endif; ?>
			<div class="hero__actions">
				<a class="button button--ink button--large" href="#telecharger"><?php echo esc_html( prostory_mod( 'hero_cta' ) ); ?></a>
				<?php if ( prostory_mod( 'hero_secondary' ) ) : ?>
					<a class="button button--ghost button--large" href="<?php echo esc_url( prostory_mod( 'hero_secondary_url' ) ); ?>"><?php echo esc_html( prostory_mod( 'hero_secondary' ) ); ?></a>
				<?php endif; ?>
			</div>
			<?php if ( prostory_mod( 'hero_note' ) ) : ?>
				<p class="hero__note"><?php echo esc_html( prostory_mod( 'hero_note' ) ); ?></p>
			<?php endif; ?>
		</div>

		<?php if ( $prostory_stories ) : ?>
			<div class="hero__visual">
				<div class="story-player" data-story-player style="--story-count: <?php echo (int) count( $prostory_stories ); ?>">
					<div class="story-player__stack" aria-hidden="true"><span></span><span></span></div>

					<div class="story" role="group" aria-roledescription="<?php esc_attr_e( 'carrousel', 'prostory' ); ?>" aria-label="<?php esc_attr_e( 'Exemple : une réalisation diffusée sur le site, en avis Google et sur les réseaux sociaux', 'prostory' ); ?>">
						<div class="story__bars" aria-hidden="true">
							<?php foreach ( $prostory_stories as $prostory_i => $prostory_story ) : ?>
								<span class="story__bar<?php echo 0 === $prostory_i ? ' is-active' : ''; ?>"><i></i></span>
							<?php endforeach; ?>
						</div>

						<?php foreach ( $prostory_stories as $prostory_i => $prostory_story ) : ?>
							<figure class="story__slide tone-<?php echo esc_attr( $prostory_story['tone'] ); ?><?php echo $prostory_story['image'] ? ' has-image' : ''; ?><?php echo 0 === $prostory_i ? ' is-active' : ''; ?>"
								role="group"
								aria-roledescription="<?php esc_attr_e( 'story', 'prostory' ); ?>"
								aria-label="<?php echo esc_attr( sprintf( /* translators: 1: position, 2: total. */ __( '%1$d sur %2$d', 'prostory' ), $prostory_i + 1, count( $prostory_stories ) ) ); ?>"
								<?php echo 0 === $prostory_i ? '' : 'hidden'; ?>>
								<?php if ( $prostory_story['image'] ) : ?>
									<img class="story__image" src="<?php echo esc_url( $prostory_story['image'] ); ?>" alt="" loading="<?php echo 0 === $prostory_i ? 'eager' : 'lazy'; ?>">
								<?php endif; ?>
								<div class="story__head">
									<span class="story__avatar" aria-hidden="true"><?php echo esc_html( function_exists( 'mb_substr' ) ? mb_substr( $prostory_story['brand'], 0, 1 ) : substr( $prostory_story['brand'], 0, 1 ) ); ?></span>
									<span class="story__brand"><?php echo esc_html( $prostory_story['brand'] ); ?></span>
									<span class="story__time"><?php echo $prostory_story['meta'] ? esc_html( $prostory_story['meta'] ) : esc_html__( 'à l’instant', 'prostory' ); ?></span>
								</div>
								<?php if ( ! $prostory_story['image'] ) : ?>
									<?php if ( 'photos' === $prostory_story['visual'] ) : ?>
										<div class="story__visual story__photos" aria-hidden="true"><span></span><span></span><span></span></div>
									<?php elseif ( 'stars' === $prostory_story['visual'] ) : ?>
										<div class="story__visual story__stars" aria-hidden="true"><?php echo str_repeat( prostory_icon( 'star' ), 5 ); // phpcs:ignore WordPress.Security.EscapeOutput ?></div>
									<?php elseif ( 'social' === $prostory_story['visual'] ) : ?>
										<div class="story__visual story__posts" aria-hidden="true">
											<span class="story__post"><i></i><b></b><em></em></span>
											<span class="story__post"><i></i><b></b><em></em></span>
										</div>
									<?php endif; ?>
								<?php endif; ?>
								<figcaption class="story__body">
									<span class="story__title"><?php echo esc_html( $prostory_story['title'] ); ?></span>
									<?php if ( $prostory_story['text'] ) : ?>
										<span class="story__text"><?php echo esc_html( $prostory_story['text'] ); ?></span>
									<?php endif; ?>
									<?php if ( $prostory_story['sticker'] ) : ?>
										<span class="story__sticker"><?php echo esc_html( $prostory_story['sticker'] ); ?></span>
									<?php endif; ?>
								</figcaption>
							</figure>
						<?php endforeach; ?>

						<?php if ( count( $prostory_stories ) > 1 ) : ?>
							<button class="story__nav story__nav--prev" type="button" data-story-prev><span class="screen-reader-text"><?php esc_html_e( 'Story précédente', 'prostory' ); ?></span></button>
							<button class="story__nav story__nav--next" type="button" data-story-next><span class="screen-reader-text"><?php esc_html_e( 'Story suivante', 'prostory' ); ?></span></button>
							<button class="story__toggle" type="button" data-story-toggle aria-label="<?php esc_attr_e( 'Mettre en pause les stories', 'prostory' ); ?>">
								<span class="story__toggle-pause"><?php echo prostory_icon( 'pause' ); // phpcs:ignore WordPress.Security.EscapeOutput ?></span>
								<span class="story__toggle-play"><?php echo prostory_icon( 'play' ); // phpcs:ignore WordPress.Security.EscapeOutput ?></span>
							</button>
						<?php endif; ?>
					</div>
				</div>
			</div>
		<?php endif; ?>
	</div>
</section>
