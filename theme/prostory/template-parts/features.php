<?php
/**
 * Fonctionnalités.
 *
 * @package ProStory
 */

$prostory_features = array();
for ( $i = 1; $i <= 6; $i++ ) {
	if ( prostory_mod( "feature_{$i}_title" ) ) {
		$prostory_features[] = $i;
	}
}
if ( ! $prostory_features ) {
	return;
}
?>
<section class="section features" id="fonctionnalites" aria-labelledby="features-title">
	<div class="wrap features__grid">
		<div class="features__intro">
			<h2 class="section-title" id="features-title"><?php echo esc_html( prostory_mod( 'features_title' ) ); ?></h2>
			<?php if ( prostory_mod( 'features_text' ) ) : ?>
				<p class="section-lead"><?php echo esc_html( prostory_mod( 'features_text' ) ); ?></p>
			<?php endif; ?>
		</div>
		<ul class="feature-list">
			<?php foreach ( $prostory_features as $i ) : ?>
				<li class="feature">
					<span class="feature__icon"><?php echo prostory_icon( prostory_mod( "feature_{$i}_icon" ) ); // phpcs:ignore WordPress.Security.EscapeOutput ?></span>
					<h3 class="feature__title"><?php echo esc_html( prostory_mod( "feature_{$i}_title" ) ); ?></h3>
					<p class="feature__text"><?php echo esc_html( prostory_mod( "feature_{$i}_text" ) ); ?></p>
				</li>
			<?php endforeach; ?>
		</ul>
	</div>
</section>
