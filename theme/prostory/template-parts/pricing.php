<?php
/**
 * Tarifs.
 *
 * @package ProStory
 */

$prostory_featured = (int) prostory_mod( 'pricing_featured' );
$prostory_plans    = array();
for ( $i = 1; $i <= 3; $i++ ) {
	if ( prostory_mod( "plan_{$i}_name" ) ) {
		$prostory_plans[] = $i;
	}
}
if ( ! $prostory_plans ) {
	return;
}
?>
<section class="section pricing" id="tarifs" aria-labelledby="pricing-title">
	<div class="wrap">
		<div class="section-head">
			<h2 class="section-title" id="pricing-title"><?php echo esc_html( prostory_mod( 'pricing_title' ) ); ?></h2>
			<?php if ( prostory_mod( 'pricing_text' ) ) : ?>
				<p class="section-lead"><?php echo esc_html( prostory_mod( 'pricing_text' ) ); ?></p>
			<?php endif; ?>
		</div>

		<div class="plans plans--<?php echo (int) count( $prostory_plans ); ?>" style="--plans: <?php echo (int) count( $prostory_plans ); ?>">
			<?php
			foreach ( $prostory_plans as $i ) :
				$prostory_is_featured = ( $i === $prostory_featured );
				?>
				<article class="plan<?php echo $prostory_is_featured ? ' plan--featured' : ''; ?>" aria-labelledby="plan-<?php echo (int) $i; ?>-name">
					<div class="plan__head">
						<h3 class="plan__name" id="plan-<?php echo (int) $i; ?>-name"><?php echo esc_html( prostory_mod( "plan_{$i}_name" ) ); ?></h3>
						<?php if ( $prostory_is_featured && prostory_mod( 'pricing_badge' ) ) : ?>
							<span class="plan__badge"><?php echo esc_html( prostory_mod( 'pricing_badge' ) ); ?></span>
						<?php endif; ?>
					</div>
					<p class="plan__price">
						<span class="plan__amount"><?php echo esc_html( prostory_mod( "plan_{$i}_price" ) ); ?></span>
						<span class="plan__period"><?php echo esc_html( prostory_mod( "plan_{$i}_period" ) ); ?></span>
					</p>
					<?php if ( prostory_mod( "plan_{$i}_desc" ) ) : ?>
						<p class="plan__desc"><?php echo esc_html( prostory_mod( "plan_{$i}_desc" ) ); ?></p>
					<?php endif; ?>
					<ul class="plan__features">
						<?php foreach ( prostory_lines( prostory_mod( "plan_{$i}_features" ) ) as $prostory_line ) : ?>
							<li><?php echo prostory_icon( 'check' ); // phpcs:ignore WordPress.Security.EscapeOutput ?><span><?php echo esc_html( $prostory_line ); ?></span></li>
						<?php endforeach; ?>
					</ul>
					<?php if ( prostory_mod( "plan_{$i}_cta" ) ) : ?>
						<a class="button <?php echo $prostory_is_featured ? 'button--signal' : 'button--outline'; ?>" href="<?php echo esc_url( prostory_mod( "plan_{$i}_url" ) ); ?>"><?php echo esc_html( prostory_mod( "plan_{$i}_cta" ) ); ?></a>
					<?php endif; ?>
				</article>
			<?php endforeach; ?>
		</div>
	</div>
</section>
