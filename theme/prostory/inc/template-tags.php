<?php
/**
 * Fonctions d'affichage.
 *
 * @package ProStory
 */

defined( 'ABSPATH' ) || exit;

/**
 * Icônes SVG du thème (dessinées pour ProStory, trait 1,75 px).
 *
 * @param string $name Nom de l'icône.
 * @return string
 */
function prostory_icon( $name ) {
	$paths = array(
		'templates' => '<rect x="3.5" y="3.5" width="7" height="11" rx="2"/><rect x="13.5" y="3.5" width="7" height="6" rx="2"/><rect x="13.5" y="12.5" width="7" height="8" rx="2"/><rect x="3.5" y="17.5" width="7" height="3" rx="1.5"/>',
		'brand'     => '<circle cx="12" cy="12" r="8.5"/><circle cx="12" cy="12" r="3.5"/><path d="M12 3.5v5M12 15.5v5"/>',
		'calendar'  => '<rect x="3.5" y="5" width="17" height="15.5" rx="3"/><path d="M3.5 10h17M8 3v4M16 3v4"/><path d="m9 15 2 2 4-4"/>',
		'text'      => '<path d="M4.5 5.5h15v10h-8l-4.5 3.5v-3.5h-2.5z"/><path d="M8 9.5h8M8 12.5h5"/>',
		'share'     => '<rect x="7" y="2.5" width="10" height="19" rx="2.5"/><path d="M10 5.5h4"/><path d="M12 10v6M9.5 12.5 12 10l2.5 2.5"/>',
		'chart'     => '<path d="M4 20.5h16"/><rect x="5.5" y="12" width="3" height="6" rx="1"/><rect x="10.5" y="7" width="3" height="11" rx="1"/><rect x="15.5" y="3.5" width="3" height="14.5" rx="1"/>',
		'camera'    => '<path d="M4 8.5a2 2 0 0 1 2-2h2l1.5-2h5L16 6.5h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2z"/><circle cx="12" cy="12.5" r="3.5"/>',
		'globe'     => '<circle cx="12" cy="12" r="8.5"/><path d="M3.5 12h17M12 3.5c2.5 2.6 3.5 5.4 3.5 8.5s-1 5.9-3.5 8.5c-2.5-2.6-3.5-5.4-3.5-8.5s1-5.9 3.5-8.5z"/>',
		'star'      => '<path d="m12 3.5 2.6 5.3 5.9.9-4.3 4.1 1 5.8-5.2-2.7-5.2 2.7 1-5.8-4.3-4.1 5.9-.9z"/>',
		'pin'       => '<path d="M12 21s-6.5-5.6-6.5-11a6.5 6.5 0 0 1 13 0c0 5.4-6.5 11-6.5 11z"/><circle cx="12" cy="10" r="2.5"/>',
		'arrow-left' => '<path d="M19 12H5M11 6l-6 6 6 6"/>',
		'chevron-left' => '<path d="m14.5 6-6 6 6 6"/>',
		'chevron-right' => '<path d="m9.5 6 6 6-6 6"/>',
		'expand'    => '<path d="M14.5 4.5h5v5M9.5 19.5h-5v-5M19.5 4.5 14 10M4.5 19.5 10 14"/>',
		'check'     => '<path d="m5 12.5 4.5 4.5L19 7.5"/>',
		'apple'     => '<rect x="6.5" y="2.5" width="11" height="19" rx="3"/><path d="M10.5 18.5h3"/>',
		'android'   => '<path d="M5 9.5h14v8a3 3 0 0 1-3 3H8a3 3 0 0 1-3-3z"/><path d="M8 9.5a4 4 0 0 1 8 0"/><path d="M9.5 6 8 3.5M14.5 6 16 3.5"/>',
		'download'  => '<path d="M12 3.5v11M7.5 10.5 12 15l4.5-4.5"/><path d="M4.5 16.5v2a2 2 0 0 0 2 2h11a2 2 0 0 0 2-2v-2"/>',
		'pause'     => '<rect x="7" y="5.5" width="3" height="13" rx="1" fill="currentColor" stroke="none"/><rect x="14" y="5.5" width="3" height="13" rx="1" fill="currentColor" stroke="none"/>',
		'play'      => '<path d="M8 5.5v13l10.5-6.5z" fill="currentColor" stroke="none"/>',
		'menu'      => '<path d="M4 7.5h16M4 12h16M4 16.5h16"/>',
		'close'     => '<path d="m6 6 12 12M18 6 6 18"/>',
		'mail'      => '<rect x="3.5" y="5.5" width="17" height="13" rx="2.5"/><path d="m4.5 7 7.5 6 7.5-6"/>',
		'phone'     => '<path d="M6.5 3.5h3l1.5 4-2 1.5a11 11 0 0 0 6 6l1.5-2 4 1.5v3a2 2 0 0 1-2 2A15.5 15.5 0 0 1 4.5 5.5a2 2 0 0 1 2-2z"/>',
	);

	if ( ! isset( $paths[ $name ] ) ) {
		return '';
	}

	return '<svg class="icon icon-' . esc_attr( $name ) . '" viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">' . $paths[ $name ] . '</svg>';
}

/**
 * Liste des icônes proposées dans le Personnaliseur.
 *
 * @return array
 */
function prostory_icon_choices() {
	return array(
		'camera'    => __( 'Appareil photo', 'prostory' ),
		'globe'     => __( 'Site internet', 'prostory' ),
		'star'      => __( 'Avis', 'prostory' ),
		'pin'       => __( 'Localisation', 'prostory' ),
		'templates' => __( 'Portfolio', 'prostory' ),
		'brand'     => __( 'Identité', 'prostory' ),
		'calendar'  => __( 'Calendrier', 'prostory' ),
		'text'      => __( 'Texte', 'prostory' ),
		'share'     => __( 'Partage', 'prostory' ),
		'chart'     => __( 'Statistiques', 'prostory' ),
		'download'  => __( 'Téléchargement', 'prostory' ),
		'mail'      => __( 'Message', 'prostory' ),
	);
}

/**
 * Logo : logo personnalisé s'il existe, sinon logotype ProStory.
 */
function prostory_logo() {
	if ( has_custom_logo() ) {
		the_custom_logo();
		return;
	}
	?>
	<a class="wordmark" href="<?php echo esc_url( home_url( '/' ) ); ?>" rel="home">
		<?php echo prostory_mark(); // phpcs:ignore WordPress.Security.EscapeOutput ?>
		<span class="wordmark__text"><?php bloginfo( 'name' ); ?></span>
	</a>
	<?php
}

/**
 * Symbole : les trois segments de progression d'une story.
 *
 * @return string
 */
function prostory_mark() {
	return '<svg class="wordmark__mark" viewBox="0 0 40 40" width="36" height="36" aria-hidden="true" focusable="false"><rect class="mark-bg" width="40" height="40" rx="11"/><rect class="mark-seg" x="8" y="10" width="7" height="3" rx="1.5"/><rect class="mark-seg" x="16.5" y="10" width="7" height="3" rx="1.5"/><rect class="mark-seg mark-seg--off" x="25" y="10" width="7" height="3" rx="1.5"/><path class="mark-p" d="M13 30V18.5h6.2a4.4 4.4 0 0 1 0 8.8H13"/></svg>';
}

/**
 * Découpe un texte multiligne en tableau (une ligne = un élément).
 *
 * @param string $text Texte.
 * @return array
 */
function prostory_lines( $text ) {
	return array_values( array_filter( array_map( 'trim', preg_split( '/\r\n|\r|\n/', (string) $text ) ) ) );
}

/**
 * Liens de téléchargement configurés.
 *
 * @return array
 */
function prostory_download_links() {
	$links = array();

	if ( prostory_mod( 'dl_appstore' ) ) {
		$links[] = array(
			'url'   => prostory_mod( 'dl_appstore' ),
			'small' => __( 'Télécharger sur', 'prostory' ),
			'label' => 'App Store',
			'icon'  => 'apple',
		);
	}
	if ( prostory_mod( 'dl_playstore' ) ) {
		$links[] = array(
			'url'   => prostory_mod( 'dl_playstore' ),
			'small' => __( 'Disponible sur', 'prostory' ),
			'label' => 'Google Play',
			'icon'  => 'android',
		);
	}
	if ( prostory_mod( 'dl_file' ) ) {
		$url  = prostory_mod( 'dl_file' );
		$path = (string) wp_parse_url( $url, PHP_URL_PATH );
		$links[] = array(
			'url'      => $url,
			'small'    => __( 'Téléchargement direct', 'prostory' ),
			'label'    => prostory_mod( 'dl_file_label' ),
			'icon'     => 'download',
			// Fichier (APK, EXE…) : téléchargement direct. Page (Expo, TestFlight…) : ouverture dans un nouvel onglet.
			'download' => (bool) preg_match( '/\.(apk|aab|ipa|exe|msi|dmg|pkg|zip)$/i', $path ),
			'android'  => ( 'android' === prostory_mod( 'dl_file_platform' ) ),
		);
	}

	return $links;
}

/**
 * Boutons de téléchargement.
 *
 * @param string $variant Variante visuelle : 'light' ou 'dark'.
 */
function prostory_download_buttons( $variant = 'dark' ) {
	$links = prostory_download_links();

	if ( empty( $links ) ) {
		if ( current_user_can( 'customize' ) ) {
			printf(
				'<p class="admin-hint">%s <a href="%s">%s</a></p>',
				esc_html__( 'Aucun lien de téléchargement pour l’instant.', 'prostory' ),
				esc_url( admin_url( 'customize.php?autofocus[section]=prostory_download' ) ),
				esc_html__( 'Ajouter les liens App Store, Google Play ou fichier', 'prostory' )
			);
		}
		return;
	}

	echo '<div class="store-buttons store-buttons--' . esc_attr( $variant ) . '">';
	foreach ( $links as $link ) {
		printf(
			'<a class="store-button" href="%1$s"%2$s>%3$s<span class="store-button__text"><small>%4$s</small><span>%5$s</span></span></a>',
			esc_url( $link['url'] ),
			( ! empty( $link['download'] ) ? ' download' : ' target="_blank" rel="noopener"' ) . ( ! empty( $link['android'] ) ? ' data-app-download' : '' ),
			prostory_icon( $link['icon'] ), // phpcs:ignore WordPress.Security.EscapeOutput
			esc_html( $link['small'] ),
			esc_html( $link['label'] )
		);
	}
	echo '</div>';
}

/**
 * Menu principal par défaut (ancres de la page d'accueil) si aucun menu n'est assigné.
 */
function prostory_menu_fallback() {
	$base  = is_front_page() ? '' : home_url( '/' );
	$items = array();

	if ( prostory_mod( 'show_features' ) ) {
		$items['#fonctionnalites'] = __( 'Fonctionnalités', 'prostory' );
	}
	if ( prostory_mod( 'show_steps' ) ) {
		$items['#fonctionnement'] = __( 'Comment ça marche', 'prostory' );
	}
	if ( prostory_realisations_enabled() ) {
		$items['realisations'] = __( 'Réalisations', 'prostory' );
	}
	if ( prostory_mod( 'show_pricing' ) ) {
		$items['#tarifs'] = __( 'Tarifs', 'prostory' );
	}
	if ( prostory_mod( 'show_faq' ) ) {
		$items['#faq'] = __( 'Questions', 'prostory' );
	}

	echo '<ul class="menu">';
	foreach ( $items as $anchor => $label ) {
		if ( 'realisations' === $anchor ) {
			$current = is_singular( prostory_realisation_type() ) || prostory_is_realisations_page();
			printf(
				'<li class="%s"><a href="%s"%s>%s</a></li>',
				$current ? 'current-menu-item' : '',
				esc_url( prostory_realisations_url() ),
				prostory_is_realisations_page() ? ' aria-current="page"' : '',
				esc_html( $label )
			);
			continue;
		}
		printf( '<li><a href="%s">%s</a></li>', esc_url( $base . $anchor ), esc_html( $label ) );
	}
	echo '</ul>';
}

/**
 * Liens vers les réseaux sociaux renseignés.
 */
function prostory_social_links() {
	$networks = array(
		'social_instagram' => 'Instagram',
		'social_facebook'  => 'Facebook',
		'social_tiktok'    => 'TikTok',
		'social_linkedin'  => 'LinkedIn',
	);

	$out = '';
	foreach ( $networks as $key => $label ) {
		$url = prostory_mod( $key );
		if ( $url ) {
			$out .= sprintf( '<li><a href="%s" target="_blank" rel="noopener">%s</a></li>', esc_url( $url ), esc_html( $label ) );
		}
	}

	if ( $out ) {
		echo '<ul class="footer-links">' . $out . '</ul>'; // phpcs:ignore WordPress.Security.EscapeOutput
	}
}

/**
 * Date de publication.
 */
function prostory_posted_on() {
	printf(
		'<time class="entry-date" datetime="%1$s">%2$s</time>',
		esc_attr( get_the_date( DATE_W3C ) ),
		esc_html( get_the_date() )
	);
}

/**
 * Fenêtre affichée par le bouton de téléchargement Android quand le visiteur n'est pas sur Android :
 * QR code à scanner sur ordinateur, message d'explication sur iPhone.
 */
function prostory_app_dialog() {
	$url = prostory_mod( 'dl_file' );
	if ( ! $url || 'android' !== prostory_mod( 'dl_file_platform' ) ) {
		return;
	}
	$email = prostory_mod( 'contact_email' );
	?>
	<dialog class="app-dialog" data-app-dialog aria-labelledby="app-dialog-title">
		<button class="app-dialog__close" type="button" data-app-dialog-close aria-label="<?php esc_attr_e( 'Fermer', 'prostory' ); ?>"><?php echo prostory_icon( 'close' ); // phpcs:ignore WordPress.Security.EscapeOutput ?></button>

		<div class="app-dialog__panel" data-app-panel="desktop">
			<h2 class="app-dialog__title" id="app-dialog-title"><?php echo esc_html( prostory_mod( 'dl_qr_title' ) ); ?></h2>
			<p class="app-dialog__text"><?php echo esc_html( prostory_mod( 'dl_qr_text' ) ); ?></p>
			<div class="app-dialog__qr" data-qr="<?php echo esc_url( $url ); ?>" role="img" aria-label="<?php esc_attr_e( 'QR code du lien de téléchargement', 'prostory' ); ?>"></div>
			<ol class="app-dialog__steps">
				<li><?php esc_html_e( 'Scannez le QR code avec l’appareil photo de votre téléphone Android.', 'prostory' ); ?></li>
				<li><?php esc_html_e( 'Ouvrez le fichier téléchargé, puis autorisez l’installation si Android vous le demande.', 'prostory' ); ?></li>
			</ol>
		</div>

		<div class="app-dialog__panel" data-app-panel="ios" hidden>
			<h2 class="app-dialog__title"><?php echo esc_html( prostory_mod( 'dl_ios_title' ) ); ?></h2>
			<p class="app-dialog__text"><?php echo esc_html( prostory_mod( 'dl_ios_note' ) ); ?></p>
			<?php if ( $email ) : ?>
				<p><a class="button button--ink" href="<?php echo esc_url( 'mailto:' . antispambot( $email ) . '?subject=' . rawurlencode( 'Version iPhone de ProStory' ) ); ?>"><?php esc_html_e( 'Être prévenu par e-mail', 'prostory' ); ?></a></p>
			<?php endif; ?>
		</div>
	</dialog>
	<?php
}
