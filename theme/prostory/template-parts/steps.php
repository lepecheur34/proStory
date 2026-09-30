<?php
/**
 * Comment ça marche : trois étapes, présentées comme les segments d'une story.
 *
 * @package ProStory
 */

$prostory_steps = array();
for ( $i = 1; $i <= 3; $i++ ) {
	if ( prostory_mod( "step_{$i}_title" ) ) {
		$prostory_steps[] = $i;
	}
}
if ( ! $prostory_steps ) {
	return;
}
?>
<section class="section steps" id="fonctionnement" aria-labelledby="steps-title">
	<div class="wrap">
		<h2 class="section-title" id="steps-title"><?php echo esc_html( prostory_mod( 'steps_title' ) ); ?></h2>
		<ol class="step-list" style="--steps: <?php echo (int) count( $prostory_steps ); ?>">
			<?php foreach ( $prostory_steps as $prostory_n => $i ) : ?>
				<li class="step">
					<span class="step__bar" aria-hidden="true"></span>
					<span class="step__num" aria-hidden="true"><?php echo (int) ( $prostory_n + 1 ); ?></span>
					<h3 class="step__title"><?php echo esc_html( prostory_mod( "step_{$i}_title" ) ); ?></h3>
					<p class="step__text"><?php echo esc_html( prostory_mod( "step_{$i}_text" ) ); ?></p>
				</li>
			<?php endforeach; ?>
		</ol>
	</div>
</section>
