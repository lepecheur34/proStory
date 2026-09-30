<?php
/**
 * Intégration du plugin ProStory Connector.
 *
 * Le plugin publie les réalisations envoyées depuis l'application dans le type
 * de contenu « prostory_realisation » et fournit ses propres gabarits, pensés
 * pour s'adapter à n'importe quel thème. Sur ce site, le thème prend le relais
 * pour les afficher avec la même identité que le reste des pages.
 * Sans le plugin, rien de ce fichier ne s'active.
 *
 * @package ProStory
 */

defined( 'ABSPATH' ) || exit;

/**
 * Identifiant du type de contenu des réalisations.
 *
 * @return string
 */
function prostory_realisation_type() {
	return defined( 'PROSTORY_POST_TYPE' ) ? PROSTORY_POST_TYPE : 'prostory_realisation';
}

/**
 * Le plugin est-il actif ?
 *
 * @return bool
 */
function prostory_realisations_enabled() {
	return post_type_exists( prostory_realisation_type() );
}

/**
 * Page qui liste les réalisations (archive du type de contenu ou catégorie « Réalisations »).
 *
 * @return bool
 */
function prostory_is_realisations_page() {
	if ( ! prostory_realisations_enabled() ) {
		return false;
	}
	$category = defined( 'PROSTORY_CATEGORY_SLUG' ) ? PROSTORY_CATEGORY_SLUG : 'realisations';
	return is_post_type_archive( prostory_realisation_type() ) || is_category( $category );
}

/**
 * Adresse de la page des réalisations.
 *
 * @return string
 */
function prostory_realisations_url() {
	$link = get_post_type_archive_link( prostory_realisation_type() );
	return $link ? $link : home_url( '/realisations/' );
}

/**
 * Le thème remplace les gabarits du plugin par les siens.
 * Priorité 50 : s'exécute après le filtre du plugin (priorité 10).
 *
 * @param string $template Gabarit choisi.
 * @return string
 */
function prostory_realisation_templates( $template ) {
	if ( ! prostory_realisations_enabled() ) {
		return $template;
	}
	if ( is_singular( prostory_realisation_type() ) ) {
		$theme_template = locate_template( 'realisations/single.php' );
	} elseif ( prostory_is_realisations_page() ) {
		$theme_template = locate_template( 'realisations/archive.php' );
	}
	return ! empty( $theme_template ) ? $theme_template : $template;
}
add_filter( 'template_include', 'prostory_realisation_templates', 50 );

/**
 * Les styles et le script du plugin ne servent plus sur ces pages.
 * (Les styles des avis Google restent chargés par le shortcode quand il est utilisé.)
 */
function prostory_realisation_dequeue_plugin_assets() {
	if ( is_singular( prostory_realisation_type() ) || prostory_is_realisations_page() ) {
		wp_dequeue_style( 'prostory-connector' );
		wp_dequeue_script( 'prostory-connector-carousel' );
	}
}
add_action( 'wp_enqueue_scripts', 'prostory_realisation_dequeue_plugin_assets', 50 );

/**
 * 12 réalisations par page : la grille de 3 colonnes reste complète.
 *
 * @param WP_Query $query Requête.
 */
function prostory_realisations_per_page( $query ) {
	if ( is_admin() || ! $query->is_main_query() || ! prostory_realisations_enabled() ) {
		return;
	}
	$category = defined( 'PROSTORY_CATEGORY_SLUG' ) ? PROSTORY_CATEGORY_SLUG : 'realisations';
	if ( $query->is_post_type_archive( prostory_realisation_type() ) || $query->is_category( $category ) ) {
		$query->set( 'posts_per_page', 12 );
	}
}
add_action( 'pre_get_posts', 'prostory_realisations_per_page' );

/**
 * Toutes les photos d'une réalisation : image à la une puis galerie, sans doublon.
 *
 * @param int $post_id Réalisation.
 * @return int[]
 */
function prostory_realisation_photos( $post_id ) {
	$ids = array();

	$thumb = get_post_thumbnail_id( $post_id );
	if ( $thumb ) {
		$ids[] = (int) $thumb;
	}

	$gallery = get_post_meta( $post_id, '_prostory_gallery_ids', true );
	if ( is_array( $gallery ) ) {
		foreach ( $gallery as $id ) {
			$id = (int) $id;
			if ( $id && ! in_array( $id, $ids, true ) && wp_attachment_is_image( $id ) ) {
				$ids[] = $id;
			}
		}
	}

	return $ids;
}

/**
 * Segments de story sur une vignette : un segment par photo (8 au maximum).
 *
 * @param int $count Nombre de photos.
 * @return string
 */
function prostory_photo_segments( $count ) {
	$count = min( 8, max( 1, (int) $count ) );
	return '<span class="work-card__segments" aria-hidden="true">' . str_repeat( '<i></i>', $count ) . '</span>';
}

/**
 * Transforme une ancre (#tarifs) en lien vers la page d'accueil hors de celle-ci.
 *
 * @param string $url Lien.
 * @return string
 */
function prostory_anchor_url( $url ) {
	if ( is_string( $url ) && 0 === strpos( $url, '#' ) && ! is_front_page() ) {
		return home_url( '/' ) . $url;
	}
	return $url;
}

/**
 * Classe de corps de page.
 *
 * @param array $classes Classes.
 * @return array
 */
function prostory_realisation_body_class( $classes ) {
	if ( prostory_realisations_enabled() && ( is_singular( prostory_realisation_type() ) || prostory_is_realisations_page() ) ) {
		$classes[] = 'is-realisations';
	}
	return $classes;
}
add_filter( 'body_class', 'prostory_realisation_body_class' );

/**
 * Marque l'entrée de menu « Réalisations » comme active sur une fiche réalisation
 * (WordPress ne le fait que sur la page qui les liste).
 *
 * @param array   $classes Classes de l'élément.
 * @param WP_Post $item    Élément de menu.
 * @return array
 */
function prostory_realisation_menu_class( $classes, $item ) {
	if ( prostory_realisations_enabled() && is_singular( prostory_realisation_type() ) && 'post_type_archive' === $item->type && prostory_realisation_type() === $item->object ) {
		$classes[] = 'current-menu-item';
	}
	return $classes;
}
add_filter( 'nav_menu_css_class', 'prostory_realisation_menu_class', 10, 2 );

/**
 * Mention « générée automatiquement avec l'application ProStory ».
 *
 * @param string $text Texte de la mention (vide : rien n'est affiché).
 */
function prostory_auto_note( $text ) {
	if ( '' === trim( (string) $text ) ) {
		return;
	}
	$label = prostory_mod( 'real_auto_link' );
	$url   = prostory_mod( 'real_auto_url' );
	?>
	<p class="auto-note">
		<span class="auto-note__mark" aria-hidden="true"><?php echo prostory_mark(); // phpcs:ignore WordPress.Security.EscapeOutput ?></span>
		<span class="auto-note__text">
			<?php echo esc_html( $text ); ?>
			<?php if ( $label && $url ) : ?>
				<a href="<?php echo esc_url( prostory_anchor_url( $url ) ); ?>"><?php echo esc_html( $label ); ?></a>
			<?php endif; ?>
		</span>
	</p>
	<?php
}
