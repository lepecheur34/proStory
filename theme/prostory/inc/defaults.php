<?php
/**
 * Contenus par défaut. Chaque valeur est modifiable dans Apparence > Personnaliser > ProStory.
 *
 * @package ProStory
 */

defined( 'ABSPATH' ) || exit;

/**
 * Tableau des valeurs par défaut.
 *
 * @return array
 */
function prostory_defaults() {
	static $defaults = null;
	if ( null !== $defaults ) {
		return $defaults;
	}

	$defaults = array(
		// Sections affichées.
		'show_features'        => true,
		'show_steps'           => true,
		'show_pricing'         => true,
		'show_faq'             => true,
		'show_download'        => true,

		// En-tête d'accueil.
		'hero_title'           => 'Faites votre travail, ProStory s’occupe de le montrer.',
		'hero_text'            => 'Chaque réalisation saisie dans l’application alimente votre site internet, vos réseaux sociaux et vos avis Google. Une seule saisie depuis votre téléphone, et votre savoir-faire est vu.',
		'hero_cta'             => "Télécharger l'application",
		'hero_secondary'       => 'Voir les tarifs',
		'hero_secondary_url'   => '#tarifs',
		'hero_note'            => 'Pensé pour les artisans, commerçants et entreprises de services.',

		// Stories d'exemple : une même réalisation, diffusée partout.
		'story_1_brand'        => 'Menuiserie Roux',
		'story_1_meta'         => 'sur votre site',
		'story_1_title'        => 'Cuisine en chêne massif à Castelnau-le-Lez',
		'story_1_text'         => 'Nouvelle réalisation publiée avec sa page dédiée',
		'story_1_sticker'      => 'Voir la réalisation',
		'story_1_tone'         => 'signal',
		'story_1_image'        => '',
		'story_1_visual'       => 'photos',
		'story_2_brand'        => 'Menuiserie Roux',
		'story_2_meta'         => 'avis Google',
		'story_2_title'        => '« Travail soigné, délais tenus. Je recommande. »',
		'story_2_text'         => 'Demande d’avis envoyée à la fin du chantier',
		'story_2_sticker'      => 'Laisser un avis',
		'story_2_tone'         => 'ink',
		'story_2_image'        => '',
		'story_2_visual'       => 'stars',
		'story_3_brand'        => 'Menuiserie Roux',
		'story_3_meta'         => 'Facebook et LinkedIn',
		'story_3_title'        => 'Partagée sur vos réseaux, sans rien réécrire',
		'story_3_text'         => 'Vos pages restent actives, chantier après chantier',
		'story_3_sticker'      => 'Publié',
		'story_3_tone'         => 'rose',
		'story_3_image'        => '',
		'story_3_visual'       => 'social',

		// Fonctionnalités.
		'features_title'       => 'Une réalisation créée une fois, utilisée partout.',
		'features_text'        => 'Votre site, vos réseaux sociaux et vos avis clients se nourrissent du même contenu : votre vrai travail. Sans y passer vos soirées.',
		'feature_1_icon'       => 'camera',
		'feature_1_title'      => 'Une réalisation en quelques minutes',
		'feature_1_text'       => 'Photos, description, type de prestation, localisation : tout se saisit depuis l’application, directement sur place.',
		'feature_2_icon'       => 'globe',
		'feature_2_title'      => 'Publiée sur votre site',
		'feature_2_text'       => 'Chaque réalisation obtient sa page dédiée, et votre site s’enrichit au fil de vos prestations.',
		'feature_3_icon'       => 'star',
		'feature_3_title'      => 'Des avis Google au bon moment',
		'feature_3_text'       => 'Prestation terminée, ProStory demande un avis à votre client quand il est le plus satisfait.',
		'feature_4_icon'       => 'share',
		'feature_4_title'      => 'Facebook et LinkedIn alimentés',
		'feature_4_text'       => 'Partagez la réalisation sur vos réseaux sociaux sans rien réécrire.',
		'feature_5_icon'       => 'templates',
		'feature_5_title'      => 'Un portfolio qui rassure',
		'feature_5_text'       => 'Vos réalisations se rassemblent automatiquement en portfolio pour convaincre vos futurs clients.',
		'feature_6_icon'       => 'pin',
		'feature_6_title'      => 'Plus visible près de chez vous',
		'feature_6_text'       => 'Du contenu réel, localisé et renouvelé régulièrement : exactement ce qui aide votre référencement local.',

		// Étapes.
		'steps_title'          => 'De la prestation terminée à la réalisation publiée',
		'step_1_title'         => 'Créez la réalisation',
		'step_1_text'          => 'Quelques photos, une description, le type de prestation et le lieu. Quelques minutes depuis votre téléphone.',
		'step_2_title'         => 'ProStory la publie',
		'step_2_text'          => 'Une page dédiée apparaît sur votre site et votre portfolio s’enrichit automatiquement.',
		'step_3_title'         => 'Avis et réseaux suivent',
		'step_3_text'          => 'Votre client reçoit une demande d’avis Google, et la réalisation part sur Facebook et LinkedIn.',

		// Tarifs.
		'pricing_title'        => 'Deux formules, selon votre site actuel',
		'pricing_text'         => 'Gardez votre site et branchez-y ProStory, ou laissez-nous le refaire entièrement, intégré à l’application.',
		'pricing_featured'     => '2',
		'pricing_badge'        => 'Clé en main',
		'plan_1_name'          => 'ProStory',
		'plan_1_price'         => '100 €',
		'plan_1_period'        => 'HT par mois',
		'plan_1_desc'          => 'Vous gardez votre site internet actuel et ProStory gère et diffuse vos réalisations.',
		'plan_1_features'      => "L’application ProStory\nPublication des réalisations sur votre site\nDemandes d’avis Google\nPartage sur Facebook et LinkedIn\nPortfolio de réalisations",
		'plan_1_cta'           => 'Démarrer avec ProStory',
		'plan_1_url'           => '#telecharger',
		'plan_2_name'          => 'ProStory + nouveau site',
		'plan_2_price'         => '250 €',
		'plan_2_period'        => 'HT par mois',
		'plan_2_desc'          => 'Nous refaisons entièrement votre site, à votre image et totalement intégré à ProStory.',
		'plan_2_features'      => "Tout ProStory inclus\nRefonte complète de votre site internet\nDesign adapté à l’image de votre entreprise\nUn site moderne qui s’enrichit à chaque réalisation",
		'plan_2_cta'           => 'Demander mon nouveau site',
		'plan_2_url'           => 'mailto:contact@prostory.fr',
		'plan_3_name'          => '',
		'plan_3_price'         => '',
		'plan_3_period'        => '',
		'plan_3_desc'          => '',
		'plan_3_features'      => '',
		'plan_3_cta'           => '',
		'plan_3_url'           => '',

		// FAQ.
		'faq_title'            => 'Questions fréquentes',
		'faq_text'             => 'Vous ne trouvez pas votre réponse ? Écrivez-nous, nous vous répondons rapidement.',
		'faq_1_q'              => 'Dois-je changer de site internet ?',
		'faq_1_a'              => 'Non. Avec la formule ProStory, vous gardez votre site actuel et vos réalisations y sont publiées. Si votre site a besoin d’un coup de neuf, la formule ProStory + nouveau site inclut une refonte complète.',
		'faq_2_q'              => 'Combien de temps faut-il pour publier une réalisation ?',
		'faq_2_a'              => 'Quelques minutes : vous ajoutez les photos, une description, le type de prestation et le lieu. ProStory s’occupe du reste.',
		'faq_3_q'              => 'Comment fonctionne la demande d’avis Google ?',
		'faq_3_a'              => 'Une fois la prestation terminée, ProStory envoie à votre client un lien direct vers votre fiche Google pour qu’il laisse son avis en quelques secondes.',
		'faq_4_q'              => 'Sur quels réseaux sociaux puis-je partager ?',
		'faq_4_a'              => 'Sur Facebook et LinkedIn, directement depuis l’application, à partir de la réalisation déjà créée.',
		'faq_5_q'              => 'En quoi ProStory aide-t-il mon référencement ?',
		'faq_5_a'              => 'Chaque réalisation ajoute à votre site une page avec du contenu réel, des photos et une localisation. Ce contenu régulier et local aide Google à vous proposer aux personnes qui cherchent vos services près de chez elles.',
		'faq_6_q'              => 'Que comprend la formule avec nouveau site ?',
		'faq_6_a'              => 'Une refonte complète de votre site internet, adaptée à l’image de votre entreprise et totalement intégrée à ProStory, en plus de toutes les fonctions de l’application.',

		// Téléchargement.
		'dl_title'             => 'Votre prochaine réalisation mérite d’être vue.',
		'dl_text'              => 'Installez ProStory et publiez votre première réalisation dès aujourd’hui.',
		'dl_appstore'          => '',
		'dl_playstore'         => '',
		'dl_file'              => 'https://expo.dev/accounts/thibaut_fronto/projects/prostory/builds/7112d9ed-637a-4de9-b74c-6f507cf1f1a6',
		'dl_file_label'        => 'Application ProStory',
		'dl_version'           => 'Version 1.0',
		'dl_file_platform'     => 'android',
		'dl_qr_title'          => 'Installez ProStory sur votre téléphone Android',
		'dl_qr_text'           => 'Scannez ce QR code avec l’appareil photo de votre téléphone : le téléchargement démarre directement.',
		'dl_ios_title'         => 'ProStory est disponible sur Android',
		'dl_ios_note'          => 'La version iPhone arrive bientôt. Écrivez-nous pour être prévenu de sa sortie.',

		// Réalisations (plugin ProStory Connector).
		'show_realisations'    => true,
		'home_real_title'      => 'Des réalisations publiées depuis l’application ProStory',
		'home_real_text'       => 'Chaque fiche ci-dessous a été générée automatiquement par l’application ProStory, puis publiée sur ce site en quelques minutes.',
		'home_real_count'      => '3',
		'home_real_link'       => 'Voir toutes les réalisations',
		'real_title'           => 'Nos réalisations',
		'real_text'            => 'Des chantiers et des projets réels, présentés avec leurs photos.',
		'real_auto_list'       => 'Réalisations générées automatiquement avec l’application ProStory.',
		'real_auto_single'     => 'Réalisation générée automatiquement avec l’application ProStory.',
		'real_auto_link'       => 'Voir comment ça marche',
		'real_auto_url'        => '#fonctionnement',
		'real_empty'           => 'Aucune réalisation publiée pour l’instant. Les réalisations envoyées depuis l’application ProStory apparaîtront ici automatiquement.',
		'real_photos_title'    => 'Photos de la réalisation',
		'real_cta_title'       => 'Vous aussi, montrez votre travail.',
		'real_cta_text'        => 'Avec ProStory, chaque prestation terminée devient une page sur votre site, une publication sur vos réseaux et une demande d’avis Google.',
		'real_cta_button'      => 'Découvrir les tarifs',
		'real_cta_url'         => '#tarifs',

		// Contact et réseaux.
		'contact_email'        => 'contact@prostory.fr',
		'contact_phone'        => '',
		'social_instagram'     => '',
		'social_facebook'      => '',
		'social_tiktok'        => '',
		'social_linkedin'      => '',
		'footer_text'          => 'ProStory aide les artisans, commerçants et entreprises à valoriser leur travail sur leur site, leurs réseaux sociaux et Google.',
	);

	return $defaults;
}

/**
 * Lit une valeur personnalisée, avec repli sur la valeur par défaut.
 *
 * @param string $key Clé du réglage.
 * @return mixed
 */
function prostory_mod( $key ) {
	$defaults = prostory_defaults();
	$default  = isset( $defaults[ $key ] ) ? $defaults[ $key ] : '';

	// La valeur par défaut n'est pas transmise à get_theme_mod() : WordPress la
	// passe dans sprintf(), ce qui plante dès qu'elle contient un « % » (ex. %20).
	$mods = get_theme_mods();
	if ( is_array( $mods ) && array_key_exists( $key, $mods ) ) {
		return apply_filters( "theme_mod_{$key}", $mods[ $key ] );
	}
	return $default;
}
