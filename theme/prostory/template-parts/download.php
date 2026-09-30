<?php
/**
 * Bandeau de téléchargement.
 *
 * @package ProStory
 */

?>
<section class="download" id="telecharger" aria-labelledby="download-title">
	<div class="wrap download__grid">
		<div class="download__copy">
			<h2 class="download__title" id="download-title"><?php echo esc_html( prostory_mod( 'dl_title' ) ); ?></h2>
			<?php if ( prostory_mod( 'dl_text' ) ) : ?>
				<p class="download__text"><?php echo esc_html( prostory_mod( 'dl_text' ) ); ?></p>
			<?php endif; ?>
		</div>
		<div class="download__actions">
			<?php prostory_download_buttons( 'dark' ); ?>
			<?php prostory_app_dialog(); ?>
			<?php if ( prostory_mod( 'dl_version' ) && prostory_download_links() ) : ?>
				<p class="download__version"><?php echo esc_html( prostory_mod( 'dl_version' ) ); ?></p>
			<?php endif; ?>
		</div>
	</div>
</section>
