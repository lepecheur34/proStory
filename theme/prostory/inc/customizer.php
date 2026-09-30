<?php
/**
 * Personnaliseur : tous les textes et liens du site sont modifiables sans toucher au code.
 *
 * @package ProStory
 */

defined( 'ABSPATH' ) || exit;

/**
 * Structure des sections et champs.
 *
 * @return array
 */
function prostory_customizer_schema() {
	$tones = array(
		'signal' => __( 'Jaune', 'prostory' ),
		'rose'   => __( 'Rose', 'prostory' ),
		'ink'    => __( 'Bleu nuit', 'prostory' ),
		'paper'  => __( 'Blanc', 'prostory' ),
	);

	$schema = array();

	$schema['prostory_sections'] = array(
		'title'  => __( 'Sections affichées', 'prostory' ),
		'fields' => array(
			'show_features' => array( 'label' => __( 'Fonctionnalités', 'prostory' ), 'type' => 'checkbox' ),
			'show_steps'    => array( 'label' => __( 'Comment ça marche', 'prostory' ), 'type' => 'checkbox' ),
			'show_pricing'  => array( 'label' => __( 'Tarifs', 'prostory' ), 'type' => 'checkbox' ),
			'show_faq'      => array( 'label' => __( 'Questions fréquentes', 'prostory' ), 'type' => 'checkbox' ),
			'show_download' => array( 'label' => __( 'Bandeau de téléchargement', 'prostory' ), 'type' => 'checkbox' ),
		),
	);

	$schema['prostory_hero'] = array(
		'title'  => __( 'Accueil : en-tête', 'prostory' ),
		'fields' => array(
			'hero_title'         => array( 'label' => __( 'Titre', 'prostory' ), 'type' => 'textarea' ),
			'hero_text'          => array( 'label' => __( 'Texte', 'prostory' ), 'type' => 'textarea' ),
			'hero_cta'           => array( 'label' => __( 'Bouton principal', 'prostory' ), 'type' => 'text', 'description' => __( 'Mène au bandeau de téléchargement.', 'prostory' ) ),
			'hero_secondary'     => array( 'label' => __( 'Bouton secondaire', 'prostory' ), 'type' => 'text' ),
			'hero_secondary_url' => array( 'label' => __( 'Lien du bouton secondaire', 'prostory' ), 'type' => 'text' ),
			'hero_note'          => array( 'label' => __( 'Petite mention sous les boutons', 'prostory' ), 'type' => 'text' ),
		),
	);

	$stories = array();
	for ( $i = 1; $i <= 3; $i++ ) {
		/* translators: %d: numéro de la story. */
		$n = sprintf( __( 'Story %d', 'prostory' ), $i );

		$stories[ "story_{$i}_brand" ]   = array( 'label' => $n . ' : ' . __( 'nom du commerce', 'prostory' ), 'type' => 'text' );
		$stories[ "story_{$i}_meta" ]    = array( 'label' => $n . ' : ' . __( 'canal (ex. « sur votre site »)', 'prostory' ), 'type' => 'text' );
		$stories[ "story_{$i}_title" ]   = array( 'label' => $n . ' : ' . __( 'titre', 'prostory' ), 'type' => 'text' );
		$stories[ "story_{$i}_text" ]    = array( 'label' => $n . ' : ' . __( 'texte', 'prostory' ), 'type' => 'text' );
		$stories[ "story_{$i}_sticker" ] = array( 'label' => $n . ' : ' . __( 'bouton', 'prostory' ), 'type' => 'text' );
		$stories[ "story_{$i}_tone" ]    = array( 'label' => $n . ' : ' . __( 'couleur', 'prostory' ), 'type' => 'select', 'choices' => $tones );
		$stories[ "story_{$i}_visual" ]  = array(
			'label'   => $n . ' : ' . __( 'illustration (si pas de photo)', 'prostory' ),
			'type'    => 'select',
			'choices' => array(
				'photos' => __( 'Mosaïque de photos', 'prostory' ),
				'stars'  => __( 'Étoiles d’avis', 'prostory' ),
				'social' => __( 'Publications sur les réseaux', 'prostory' ),
				'none'   => __( 'Aucune', 'prostory' ),
			),
		);
		$stories[ "story_{$i}_image" ]   = array( 'label' => $n . ' : ' . __( 'photo de fond (optionnelle, format vertical)', 'prostory' ), 'type' => 'image' );
	}
	$schema['prostory_stories'] = array(
		'title'       => __( 'Accueil : stories animées', 'prostory' ),
		'description' => __( 'Les trois écrans qui défilent dans le téléphone de l’en-tête : une même réalisation diffusée sur le site, en avis Google et sur les réseaux.', 'prostory' ),
		'fields'      => $stories,
	);

	$features = array(
		'features_title' => array( 'label' => __( 'Titre de la section', 'prostory' ), 'type' => 'text' ),
		'features_text'  => array( 'label' => __( 'Texte de la section', 'prostory' ), 'type' => 'textarea' ),
	);
	for ( $i = 1; $i <= 6; $i++ ) {
		/* translators: %d: numéro de la fonctionnalité. */
		$n = sprintf( __( 'Fonctionnalité %d', 'prostory' ), $i );

		$features[ "feature_{$i}_icon" ]  = array( 'label' => $n . ' : ' . __( 'icône', 'prostory' ), 'type' => 'select', 'choices' => prostory_icon_choices() );
		$features[ "feature_{$i}_title" ] = array( 'label' => $n . ' : ' . __( 'titre', 'prostory' ), 'type' => 'text', 'description' => __( 'Laissez vide pour masquer.', 'prostory' ) );
		$features[ "feature_{$i}_text" ]  = array( 'label' => $n . ' : ' . __( 'texte', 'prostory' ), 'type' => 'textarea' );
	}
	$schema['prostory_features'] = array(
		'title'  => __( 'Fonctionnalités', 'prostory' ),
		'fields' => $features,
	);

	$steps = array( 'steps_title' => array( 'label' => __( 'Titre de la section', 'prostory' ), 'type' => 'text' ) );
	for ( $i = 1; $i <= 3; $i++ ) {
		/* translators: %d: numéro de l'étape. */
		$n = sprintf( __( 'Étape %d', 'prostory' ), $i );

		$steps[ "step_{$i}_title" ] = array( 'label' => $n . ' : ' . __( 'titre', 'prostory' ), 'type' => 'text' );
		$steps[ "step_{$i}_text" ]  = array( 'label' => $n . ' : ' . __( 'texte', 'prostory' ), 'type' => 'textarea' );
	}
	$schema['prostory_steps'] = array(
		'title'  => __( 'Comment ça marche', 'prostory' ),
		'fields' => $steps,
	);

	$pricing = array(
		'pricing_title'    => array( 'label' => __( 'Titre de la section', 'prostory' ), 'type' => 'text' ),
		'pricing_text'     => array( 'label' => __( 'Texte de la section', 'prostory' ), 'type' => 'textarea' ),
		'pricing_featured' => array(
			'label'   => __( 'Formule mise en avant', 'prostory' ),
			'type'    => 'select',
			'choices' => array(
				'0' => __( 'Aucune', 'prostory' ),
				'1' => '1',
				'2' => '2',
				'3' => '3',
			),
		),
		'pricing_badge'    => array( 'label' => __( 'Étiquette de la formule mise en avant', 'prostory' ), 'type' => 'text' ),
	);
	for ( $i = 1; $i <= 3; $i++ ) {
		/* translators: %d: numéro de la formule. */
		$n = sprintf( __( 'Formule %d', 'prostory' ), $i );

		$pricing[ "plan_{$i}_name" ]     = array( 'label' => $n . ' : ' . __( 'nom', 'prostory' ), 'type' => 'text', 'description' => __( 'Laissez vide pour masquer.', 'prostory' ) );
		$pricing[ "plan_{$i}_price" ]    = array( 'label' => $n . ' : ' . __( 'prix', 'prostory' ), 'type' => 'text' );
		$pricing[ "plan_{$i}_period" ]   = array( 'label' => $n . ' : ' . __( 'période', 'prostory' ), 'type' => 'text' );
		$pricing[ "plan_{$i}_desc" ]     = array( 'label' => $n . ' : ' . __( 'description', 'prostory' ), 'type' => 'text' );
		$pricing[ "plan_{$i}_features" ] = array( 'label' => $n . ' : ' . __( 'avantages (un par ligne)', 'prostory' ), 'type' => 'textarea' );
		$pricing[ "plan_{$i}_cta" ]      = array( 'label' => $n . ' : ' . __( 'texte du bouton', 'prostory' ), 'type' => 'text' );
		$pricing[ "plan_{$i}_url" ]      = array( 'label' => $n . ' : ' . __( 'lien du bouton', 'prostory' ), 'type' => 'text' );
	}
	$schema['prostory_pricing'] = array(
		'title'  => __( 'Tarifs', 'prostory' ),
		'fields' => $pricing,
	);

	$faq = array(
		'faq_title' => array( 'label' => __( 'Titre de la section', 'prostory' ), 'type' => 'text' ),
		'faq_text'  => array( 'label' => __( 'Texte de la section', 'prostory' ), 'type' => 'textarea' ),
	);
	for ( $i = 1; $i <= 6; $i++ ) {
		/* translators: %d: numéro de la question. */
		$n = sprintf( __( 'Question %d', 'prostory' ), $i );

		$faq[ "faq_{$i}_q" ] = array( 'label' => $n, 'type' => 'text', 'description' => __( 'Laissez vide pour masquer.', 'prostory' ) );
		$faq[ "faq_{$i}_a" ] = array( 'label' => $n . ' : ' . __( 'réponse', 'prostory' ), 'type' => 'textarea' );
	}
	$schema['prostory_faq'] = array(
		'title'  => __( 'Questions fréquentes', 'prostory' ),
		'fields' => $faq,
	);

	$schema['prostory_realisations'] = array(
		'title'       => __( 'Réalisations', 'prostory' ),
		'description' => __( 'Les réalisations sont publiées par le plugin ProStory Connector depuis l’application. Ces réglages concernent leur affichage sur le site.', 'prostory' ),
		'fields'      => array(
			'show_realisations' => array( 'label' => __( 'Afficher les dernières réalisations sur l’accueil', 'prostory' ), 'type' => 'checkbox' ),
			'home_real_title'   => array( 'label' => __( 'Accueil : titre', 'prostory' ), 'type' => 'text' ),
			'home_real_text'    => array( 'label' => __( 'Accueil : texte', 'prostory' ), 'type' => 'textarea' ),
			'home_real_count'   => array(
				'label'   => __( 'Accueil : nombre de réalisations', 'prostory' ),
				'type'    => 'select',
				'choices' => array(
					'3' => '3',
					'6' => '6',
				),
			),
			'home_real_link'    => array( 'label' => __( 'Accueil : texte du lien vers toutes les réalisations', 'prostory' ), 'type' => 'text' ),
			'real_title'        => array( 'label' => __( 'Page Réalisations : titre', 'prostory' ), 'type' => 'text' ),
			'real_text'         => array( 'label' => __( 'Page Réalisations : texte', 'prostory' ), 'type' => 'textarea' ),
			'real_auto_list'    => array( 'label' => __( 'Mention « générée par ProStory » sur la page Réalisations', 'prostory' ), 'type' => 'text', 'description' => __( 'Laissez vide pour masquer.', 'prostory' ) ),
			'real_auto_single'  => array( 'label' => __( 'Mention « générée par ProStory » sur chaque fiche', 'prostory' ), 'type' => 'text', 'description' => __( 'Laissez vide pour masquer.', 'prostory' ) ),
			'real_auto_link'    => array( 'label' => __( 'Lien de la mention : texte', 'prostory' ), 'type' => 'text', 'description' => __( 'Laissez vide pour ne pas mettre de lien.', 'prostory' ) ),
			'real_auto_url'     => array( 'label' => __( 'Lien de la mention : adresse', 'prostory' ), 'type' => 'text', 'description' => __( 'Une ancre comme #fonctionnement renvoie à la section de l’accueil.', 'prostory' ) ),
			'real_empty'        => array( 'label' => __( 'Page Réalisations : message quand il n’y en a aucune', 'prostory' ), 'type' => 'textarea' ),
			'real_photos_title' => array( 'label' => __( 'Fiche : titre de la galerie photo', 'prostory' ), 'type' => 'text' ),
			'real_cta_title'    => array( 'label' => __( 'Fiche : titre du bandeau final', 'prostory' ), 'type' => 'text', 'description' => __( 'Laissez vide pour masquer le bandeau.', 'prostory' ) ),
			'real_cta_text'     => array( 'label' => __( 'Fiche : texte du bandeau final', 'prostory' ), 'type' => 'textarea' ),
			'real_cta_button'   => array( 'label' => __( 'Fiche : bouton du bandeau final', 'prostory' ), 'type' => 'text' ),
			'real_cta_url'      => array( 'label' => __( 'Fiche : lien du bouton', 'prostory' ), 'type' => 'text', 'description' => __( 'Une ancre comme #tarifs renvoie à la section de l’accueil.', 'prostory' ) ),
		),
	);

	$schema['prostory_download'] = array(
		'title'       => __( 'Téléchargement', 'prostory' ),
		'description' => __( 'Seuls les liens renseignés s’affichent.', 'prostory' ),
		'fields'      => array(
			'dl_title'      => array( 'label' => __( 'Titre du bandeau', 'prostory' ), 'type' => 'text' ),
			'dl_text'       => array( 'label' => __( 'Texte du bandeau', 'prostory' ), 'type' => 'textarea' ),
			'dl_appstore'   => array( 'label' => __( 'Lien App Store (iPhone)', 'prostory' ), 'type' => 'url' ),
			'dl_playstore'  => array( 'label' => __( 'Lien Google Play (Android)', 'prostory' ), 'type' => 'url' ),
			'dl_file'       => array( 'label' => __( 'Lien de téléchargement direct (APK, page Expo, fichier…)', 'prostory' ), 'type' => 'url', 'description' => __( 'Adresse d’un fichier (dans Médias ou en ligne) ou d’une page d’installation, comme un lien de partage Expo. Vérifiez qu’il s’ouvre sans être connecté.', 'prostory' ) ),
			'dl_file_label' => array( 'label' => __( 'Texte du bouton de téléchargement direct', 'prostory' ), 'type' => 'text' ),
			'dl_version'    => array( 'label' => __( 'Version affichée', 'prostory' ), 'type' => 'text' ),
			'dl_file_platform' => array(
				'label'       => __( 'Le téléchargement direct concerne', 'prostory' ),
				'type'        => 'select',
				'choices'     => array(
					'android' => __( 'Android uniquement (fichier APK)', 'prostory' ),
					'all'     => __( 'Tous les appareils', 'prostory' ),
				),
				'description' => __( 'Android uniquement : sur ordinateur, le bouton affiche un QR code à scanner avec le téléphone ; sur iPhone, un message explique que l’application est sur Android.', 'prostory' ),
			),
			'dl_qr_title'   => array( 'label' => __( 'Fenêtre QR code (ordinateur) : titre', 'prostory' ), 'type' => 'text' ),
			'dl_qr_text'    => array( 'label' => __( 'Fenêtre QR code (ordinateur) : texte', 'prostory' ), 'type' => 'textarea' ),
			'dl_ios_title'  => array( 'label' => __( 'Message iPhone : titre', 'prostory' ), 'type' => 'text' ),
			'dl_ios_note'   => array( 'label' => __( 'Message iPhone : texte', 'prostory' ), 'type' => 'textarea' ),
		),
	);

	$schema['prostory_contact'] = array(
		'title'  => __( 'Contact, réseaux et pied de page', 'prostory' ),
		'fields' => array(
			'contact_email'    => array( 'label' => __( 'E-mail de contact', 'prostory' ), 'type' => 'email' ),
			'contact_phone'    => array( 'label' => __( 'Téléphone', 'prostory' ), 'type' => 'text' ),
			'social_instagram' => array( 'label' => 'Instagram', 'type' => 'url' ),
			'social_facebook'  => array( 'label' => 'Facebook', 'type' => 'url' ),
			'social_tiktok'    => array( 'label' => 'TikTok', 'type' => 'url' ),
			'social_linkedin'  => array( 'label' => 'LinkedIn', 'type' => 'url' ),
			'footer_text'      => array( 'label' => __( 'Présentation dans le pied de page', 'prostory' ), 'type' => 'textarea' ),
		),
	);

	return $schema;
}

/**
 * Nettoie une case à cocher.
 *
 * @param mixed $value Valeur.
 * @return bool
 */
function prostory_sanitize_checkbox( $value ) {
	return (bool) $value;
}

/**
 * Nettoie un lien : accepte les URL complètes et les ancres (#tarifs).
 *
 * @param string $value Valeur.
 * @return string
 */
function prostory_sanitize_link( $value ) {
	$value = trim( (string) $value );
	if ( '' === $value ) {
		return '';
	}
	if ( 0 === strpos( $value, '#' ) ) {
		return '#' . sanitize_title( substr( $value, 1 ) );
	}
	return esc_url_raw( $value );
}

/**
 * Enregistre panneau, sections, réglages et contrôles.
 *
 * @param WP_Customize_Manager $wp_customize Gestionnaire.
 */
function prostory_customize_register( $wp_customize ) {
	$defaults = prostory_defaults();

	$wp_customize->add_panel(
		'prostory',
		array(
			'title'       => __( 'ProStory', 'prostory' ),
			'description' => __( 'Textes, liens et sections du site.', 'prostory' ),
			'priority'    => 30,
		)
	);

	$priority = 10;
	foreach ( prostory_customizer_schema() as $section_id => $section ) {
		$wp_customize->add_section(
			$section_id,
			array(
				'title'       => $section['title'],
				'description' => isset( $section['description'] ) ? $section['description'] : '',
				'panel'       => 'prostory',
				'priority'    => $priority,
			)
		);
		$priority += 10;

		foreach ( $section['fields'] as $key => $field ) {
			switch ( $field['type'] ) {
				case 'checkbox':
					$sanitize = 'prostory_sanitize_checkbox';
					break;
				case 'textarea':
					$sanitize = 'sanitize_textarea_field';
					break;
				case 'email':
					$sanitize = 'sanitize_email';
					break;
				case 'url':
				case 'image':
					$sanitize = 'esc_url_raw';
					break;
				case 'select':
					$choices  = $field['choices'];
					$default  = isset( $defaults[ $key ] ) ? $defaults[ $key ] : '';
					$sanitize = function ( $value ) use ( $choices, $default ) {
						return array_key_exists( (string) $value, $choices ) ? (string) $value : $default;
					};
					break;
				default:
					$sanitize = ( substr( $key, -4 ) === '_url' ) ? 'prostory_sanitize_link' : 'sanitize_text_field';
			}

			$wp_customize->add_setting(
				$key,
				array(
					'default'           => isset( $defaults[ $key ] ) ? $defaults[ $key ] : '',
					'sanitize_callback' => $sanitize,
					'transport'         => 'refresh',
				)
			);

			$args = array(
				'label'       => $field['label'],
				'description' => isset( $field['description'] ) ? $field['description'] : '',
				'section'     => $section_id,
			);

			if ( 'image' === $field['type'] ) {
				$wp_customize->add_control( new WP_Customize_Image_Control( $wp_customize, $key, $args ) );
				continue;
			}

			$args['type'] = $field['type'];
			if ( 'select' === $field['type'] ) {
				$args['choices'] = $field['choices'];
			}
			$wp_customize->add_control( $key, $args );
		}
	}
}
add_action( 'customize_register', 'prostory_customize_register' );
