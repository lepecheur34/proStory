<?php
/**
 * Pied de page.
 *
 * @package ProStory
 */

$prostory_email = prostory_mod( 'contact_email' );
$prostory_phone = prostory_mod( 'contact_phone' );
?>
</main>

<footer class="site-footer">
	<div class="wrap site-footer__grid">
		<div class="site-footer__about">
			<?php prostory_logo(); ?>
			<?php if ( prostory_mod( 'footer_text' ) ) : ?>
				<p><?php echo esc_html( prostory_mod( 'footer_text' ) ); ?></p>
			<?php endif; ?>
		</div>

		<?php if ( has_nav_menu( 'footer' ) ) : ?>
			<nav class="site-footer__col" aria-label="<?php esc_attr_e( 'Liens du pied de page', 'prostory' ); ?>">
				<h2 class="footer-title"><?php esc_html_e( 'Le site', 'prostory' ); ?></h2>
				<?php
				wp_nav_menu(
					array(
						'theme_location' => 'footer',
						'container'      => false,
						'menu_class'     => 'footer-links',
						'depth'          => 1,
					)
				);
				?>
			</nav>
		<?php endif; ?>

		<div class="site-footer__col">
			<h2 class="footer-title"><?php esc_html_e( 'Nous contacter', 'prostory' ); ?></h2>
			<ul class="footer-links">
				<?php if ( $prostory_email ) : ?>
					<li><a href="<?php echo esc_url( 'mailto:' . antispambot( $prostory_email ) ); ?>"><?php echo esc_html( antispambot( $prostory_email ) ); ?></a></li>
				<?php endif; ?>
				<?php if ( $prostory_phone ) : ?>
					<li><a href="<?php echo esc_url( 'tel:' . preg_replace( '/[^0-9+]/', '', $prostory_phone ) ); ?>"><?php echo esc_html( $prostory_phone ); ?></a></li>
				<?php endif; ?>
			</ul>
			<?php prostory_social_links(); ?>
		</div>

		<?php if ( is_active_sidebar( 'footer-1' ) ) : ?>
			<div class="site-footer__col">
				<?php dynamic_sidebar( 'footer-1' ); ?>
			</div>
		<?php endif; ?>
	</div>

	<div class="wrap site-footer__bottom">
		<p>&copy; <?php echo esc_html( wp_date( 'Y' ) ); ?> <?php bloginfo( 'name' ); ?></p>
		<?php
		if ( has_nav_menu( 'legal' ) ) {
			wp_nav_menu(
				array(
					'theme_location' => 'legal',
					'container'      => 'nav',
					'container_aria_label' => __( 'Liens légaux', 'prostory' ),
					'menu_class'     => 'legal-links',
					'depth'          => 1,
				)
			);
		} elseif ( function_exists( 'get_privacy_policy_url' ) && get_privacy_policy_url() ) {
			echo '<ul class="legal-links"><li>' . get_the_privacy_policy_link() . '</li></ul>'; // phpcs:ignore WordPress.Security.EscapeOutput
		}
		?>
	</div>
</footer>

<?php wp_footer(); ?>
</body>
</html>
