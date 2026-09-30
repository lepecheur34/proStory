<?php
/**
 * Questions fréquentes.
 *
 * @package ProStory
 */

$prostory_faq = array();
for ( $i = 1; $i <= 6; $i++ ) {
	if ( prostory_mod( "faq_{$i}_q" ) ) {
		$prostory_faq[] = array( prostory_mod( "faq_{$i}_q" ), prostory_mod( "faq_{$i}_a" ) );
	}
}
if ( ! $prostory_faq ) {
	return;
}
$prostory_email = prostory_mod( 'contact_email' );
?>
<section class="section faq" id="faq" aria-labelledby="faq-title">
	<div class="wrap faq__grid">
		<div class="faq__intro">
			<h2 class="section-title" id="faq-title"><?php echo esc_html( prostory_mod( 'faq_title' ) ); ?></h2>
			<?php if ( prostory_mod( 'faq_text' ) ) : ?>
				<p class="section-lead"><?php echo esc_html( prostory_mod( 'faq_text' ) ); ?></p>
			<?php endif; ?>
			<?php if ( $prostory_email ) : ?>
				<a class="faq__contact" href="<?php echo esc_url( 'mailto:' . antispambot( $prostory_email ) ); ?>"><?php echo prostory_icon( 'mail' ); // phpcs:ignore WordPress.Security.EscapeOutput ?><?php echo esc_html( antispambot( $prostory_email ) ); ?></a>
			<?php endif; ?>
		</div>
		<div class="faq__list">
			<?php foreach ( $prostory_faq as $prostory_item ) : ?>
				<details class="faq__item">
					<summary><?php echo esc_html( $prostory_item[0] ); ?></summary>
					<div class="faq__answer"><?php echo wp_kses_post( wpautop( $prostory_item[1] ) ); ?></div>
				</details>
			<?php endforeach; ?>
		</div>
	</div>
</section>
