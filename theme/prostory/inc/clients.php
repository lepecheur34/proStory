<?php
/**
 * Espace de gestion des clients, réservé aux administrateurs.
 *
 * Fiches clients privées (jamais visibles sur le site), formules, statuts,
 * renouvellements, vue d'ensemble, widget du tableau de bord et export CSV.
 *
 * @package ProStory
 */

defined( 'ABSPATH' ) || exit;

const PROSTORY_CLIENT_CPT = 'prostory_client';

/* -------------------------------------------------------------------------
 * Données de référence
 * ---------------------------------------------------------------------- */

/**
 * Statuts possibles.
 *
 * @return array
 */
function prostory_client_statuses() {
	return array(
		'prospect' => __( 'Prospect', 'prostory' ),
		'essai'    => __( 'En essai', 'prostory' ),
		'actif'    => __( 'Actif', 'prostory' ),
		'suspendu' => __( 'Suspendu', 'prostory' ),
		'resilie'  => __( 'Résilié', 'prostory' ),
	);
}

/**
 * Formules : reprend automatiquement les noms saisis dans la section Tarifs.
 *
 * @return array
 */
function prostory_client_plans() {
	$plans = array();
	for ( $i = 1; $i <= 3; $i++ ) {
		$name = prostory_mod( "plan_{$i}_name" );
		if ( $name ) {
			$plans[ 'formule-' . $i ] = $name;
		}
	}
	return $plans;
}

/**
 * Champs d'une fiche client.
 *
 * @return array
 */
function prostory_client_fields() {
	return array(
		'contact_name' => array( 'label' => __( 'Nom du contact', 'prostory' ), 'type' => 'text' ),
		'email'        => array( 'label' => __( 'E-mail', 'prostory' ), 'type' => 'email' ),
		'phone'        => array( 'label' => __( 'Téléphone', 'prostory' ), 'type' => 'tel' ),
		'city'         => array( 'label' => __( 'Ville', 'prostory' ), 'type' => 'text' ),
		'siret'        => array( 'label' => __( 'SIRET', 'prostory' ), 'type' => 'text' ),
		'activity'     => array( 'label' => __( 'Métier / activité', 'prostory' ), 'type' => 'text' ),
		'website'      => array( 'label' => __( 'Site internet', 'prostory' ), 'type' => 'url' ),
		'google_url'   => array( 'label' => __( 'Fiche Google (lien avis)', 'prostory' ), 'type' => 'url' ),
		'app_user_id'  => array( 'label' => __( 'Identifiant dans l’application', 'prostory' ), 'type' => 'text' ),
		'plan'         => array( 'label' => __( 'Formule', 'prostory' ), 'type' => 'select', 'options' => prostory_client_plans() ),
		'status'       => array( 'label' => __( 'Statut', 'prostory' ), 'type' => 'select', 'options' => prostory_client_statuses() ),
		'amount'       => array( 'label' => __( 'Montant mensuel (€ HT)', 'prostory' ), 'type' => 'number' ),
		'start_date'   => array( 'label' => __( 'Client depuis le', 'prostory' ), 'type' => 'date' ),
		'renewal_date' => array( 'label' => __( 'Prochain renouvellement', 'prostory' ), 'type' => 'date' ),
		'notes'        => array( 'label' => __( 'Notes internes', 'prostory' ), 'type' => 'textarea', 'wide' => true ),
	);
}

/**
 * Lit un champ d'une fiche.
 *
 * @param int    $post_id Fiche.
 * @param string $key     Champ.
 * @return string
 */
function prostory_client_get( $post_id, $key ) {
	return (string) get_post_meta( $post_id, '_ps_' . $key, true );
}

/* -------------------------------------------------------------------------
 * Type de contenu et droits
 * ---------------------------------------------------------------------- */

/**
 * Déclare le type de contenu « Client ».
 */
function prostory_register_client_cpt() {
	register_post_type(
		PROSTORY_CLIENT_CPT,
		array(
			'labels'              => array(
				'name'               => __( 'Clients', 'prostory' ),
				'singular_name'      => __( 'Client', 'prostory' ),
				'menu_name'          => __( 'Clients', 'prostory' ),
				'all_items'          => __( 'Tous les clients', 'prostory' ),
				'add_new'            => __( 'Ajouter un client', 'prostory' ),
				'add_new_item'       => __( 'Ajouter un client', 'prostory' ),
				'edit_item'          => __( 'Modifier le client', 'prostory' ),
				'new_item'           => __( 'Nouveau client', 'prostory' ),
				'search_items'       => __( 'Rechercher un client', 'prostory' ),
				'not_found'          => __( 'Aucun client pour l’instant. Ajoutez votre premier client pour commencer le suivi.', 'prostory' ),
				'not_found_in_trash' => __( 'La corbeille est vide.', 'prostory' ),
				'item_published'     => __( 'Client enregistré.', 'prostory' ),
				'item_updated'       => __( 'Client mis à jour.', 'prostory' ),
			),
			'public'              => false,
			'publicly_queryable'  => false,
			'exclude_from_search' => true,
			'show_ui'             => true,
			'show_in_menu'        => true,
			'show_in_nav_menus'   => false,
			'show_in_admin_bar'   => true,
			'show_in_rest'        => false,
			'menu_position'       => 26,
			'menu_icon'           => 'dashicons-groups',
			'supports'            => array( 'title' ),
			'capability_type'     => array( 'prostory_client', 'prostory_clients' ),
			'map_meta_cap'        => true,
			'rewrite'             => false,
			'query_var'           => false,
			'has_archive'         => false,
		)
	);
}
add_action( 'init', 'prostory_register_client_cpt' );

/**
 * Donne aux administrateurs les droits sur les fiches clients.
 * Pour déléguer à un autre rôle (ex. éditeur), ajoutez-lui ces mêmes droits.
 */
function prostory_grant_client_caps() {
	if ( get_option( 'prostory_client_caps' ) === PROSTORY_THEME_VERSION ) {
		return;
	}
	$role = get_role( 'administrator' );
	if ( ! $role ) {
		return;
	}
	$caps = array(
		'edit_prostory_clients',
		'edit_others_prostory_clients',
		'edit_private_prostory_clients',
		'edit_published_prostory_clients',
		'publish_prostory_clients',
		'read_private_prostory_clients',
		'delete_prostory_clients',
		'delete_others_prostory_clients',
		'delete_private_prostory_clients',
		'delete_published_prostory_clients',
	);
	foreach ( $caps as $cap ) {
		$role->add_cap( $cap );
	}
	update_option( 'prostory_client_caps', PROSTORY_THEME_VERSION );
}
add_action( 'admin_init', 'prostory_grant_client_caps' );
add_action( 'after_switch_theme', 'prostory_grant_client_caps' );

/**
 * Libellé du champ titre.
 *
 * @param string  $text Texte.
 * @param WP_Post $post Fiche.
 * @return string
 */
function prostory_client_title_placeholder( $text, $post ) {
	return PROSTORY_CLIENT_CPT === $post->post_type ? __( 'Nom de l’entreprise ou du client', 'prostory' ) : $text;
}
add_filter( 'enter_title_here', 'prostory_client_title_placeholder', 10, 2 );

/* -------------------------------------------------------------------------
 * Fiche client
 * ---------------------------------------------------------------------- */

/**
 * Boîte de saisie des informations.
 */
function prostory_client_meta_boxes() {
	add_meta_box( 'prostory_client_details', __( 'Informations client', 'prostory' ), 'prostory_client_meta_box', PROSTORY_CLIENT_CPT, 'normal', 'high' );
}
add_action( 'add_meta_boxes', 'prostory_client_meta_boxes' );

/**
 * Affiche la boîte de saisie.
 *
 * @param WP_Post $post Fiche.
 */
function prostory_client_meta_box( $post ) {
	wp_nonce_field( 'prostory_save_client', 'prostory_client_nonce' );

	echo '<div class="ps-fields">';
	foreach ( prostory_client_fields() as $key => $field ) {
		$id    = 'ps_' . $key;
		$value = prostory_client_get( $post->ID, $key );
		$class = ! empty( $field['wide'] ) ? 'ps-field ps-field--wide' : 'ps-field';

		if ( 'status' === $key && '' === $value ) {
			$value = 'prospect';
		}

		echo '<p class="' . esc_attr( $class ) . '"><label for="' . esc_attr( $id ) . '">' . esc_html( $field['label'] ) . '</label>';

		switch ( $field['type'] ) {
			case 'select':
				echo '<select id="' . esc_attr( $id ) . '" name="' . esc_attr( $id ) . '">';
				echo '<option value="">' . esc_html__( '— Choisir —', 'prostory' ) . '</option>';
				foreach ( $field['options'] as $opt => $label ) {
					printf( '<option value="%s"%s>%s</option>', esc_attr( $opt ), selected( $value, $opt, false ), esc_html( $label ) );
				}
				echo '</select>';
				break;
			case 'textarea':
				echo '<textarea id="' . esc_attr( $id ) . '" name="' . esc_attr( $id ) . '" rows="5">' . esc_textarea( $value ) . '</textarea>';
				break;
			case 'number':
				echo '<input type="number" step="0.01" min="0" id="' . esc_attr( $id ) . '" name="' . esc_attr( $id ) . '" value="' . esc_attr( $value ) . '">';
				break;
			default:
				echo '<input type="' . esc_attr( $field['type'] ) . '" id="' . esc_attr( $id ) . '" name="' . esc_attr( $id ) . '" value="' . esc_attr( $value ) . '">';
		}

		if ( 'email' === $key && $value ) {
			echo ' <a class="ps-inline-link" href="' . esc_url( 'mailto:' . $value ) . '">' . esc_html__( 'Écrire', 'prostory' ) . '</a>';
		}
		if ( 'url' === $field['type'] && $value ) {
			echo ' <a class="ps-inline-link" href="' . esc_url( $value ) . '" target="_blank" rel="noopener">' . esc_html__( 'Ouvrir', 'prostory' ) . '</a>';
		}
		if ( 'phone' === $key && $value ) {
			echo ' <a class="ps-inline-link" href="' . esc_url( 'tel:' . preg_replace( '/[^0-9+]/', '', $value ) ) . '">' . esc_html__( 'Appeler', 'prostory' ) . '</a>';
		}

		echo '</p>';
	}
	echo '</div>';
}

/**
 * Enregistre la fiche.
 *
 * @param int $post_id Fiche.
 */
function prostory_save_client( $post_id ) {
	if ( ! isset( $_POST['prostory_client_nonce'] ) || ! wp_verify_nonce( sanitize_text_field( wp_unslash( $_POST['prostory_client_nonce'] ) ), 'prostory_save_client' ) ) {
		return;
	}
	if ( defined( 'DOING_AUTOSAVE' ) && DOING_AUTOSAVE ) {
		return;
	}
	if ( ! current_user_can( 'edit_post', $post_id ) ) {
		return;
	}

	foreach ( prostory_client_fields() as $key => $field ) {
		$name = 'ps_' . $key;
		$raw  = isset( $_POST[ $name ] ) ? wp_unslash( $_POST[ $name ] ) : ''; // phpcs:ignore WordPress.Security.ValidatedSanitizedInput

		switch ( $field['type'] ) {
			case 'email':
				$value = sanitize_email( $raw );
				break;
			case 'url':
				$value = esc_url_raw( trim( (string) $raw ) );
				break;
			case 'textarea':
				$value = sanitize_textarea_field( $raw );
				break;
			case 'number':
				$raw   = str_replace( array( ' ', ',' ), array( '', '.' ), (string) $raw );
				$value = '' === $raw ? '' : (string) round( max( 0, (float) $raw ), 2 );
				break;
			case 'date':
				$value = preg_match( '/^\d{4}-\d{2}-\d{2}$/', (string) $raw ) ? $raw : '';
				break;
			case 'select':
				$value = array_key_exists( (string) $raw, $field['options'] ) ? (string) $raw : '';
				break;
			default:
				$value = sanitize_text_field( $raw );
		}

		if ( '' === $value ) {
			delete_post_meta( $post_id, '_ps_' . $key );
		} else {
			update_post_meta( $post_id, '_ps_' . $key, $value );
		}
	}
}
add_action( 'save_post_' . PROSTORY_CLIENT_CPT, 'prostory_save_client' );

/* -------------------------------------------------------------------------
 * Liste des clients
 * ---------------------------------------------------------------------- */

/**
 * Colonnes de la liste.
 *
 * @return array
 */
function prostory_client_columns() {
	return array(
		'cb'           => '<input type="checkbox" />',
		'title'        => __( 'Client', 'prostory' ),
		'contact'      => __( 'Contact', 'prostory' ),
		'plan'         => __( 'Formule', 'prostory' ),
		'status'       => __( 'Statut', 'prostory' ),
		'amount'       => __( 'Mensuel', 'prostory' ),
		'renewal_date' => __( 'Renouvellement', 'prostory' ),
	);
}
add_filter( 'manage_' . PROSTORY_CLIENT_CPT . '_posts_columns', 'prostory_client_columns' );

/**
 * Contenu des colonnes.
 *
 * @param string $column  Colonne.
 * @param int    $post_id Fiche.
 */
function prostory_client_column_content( $column, $post_id ) {
	switch ( $column ) {
		case 'contact':
			$name  = prostory_client_get( $post_id, 'contact_name' );
			$email = prostory_client_get( $post_id, 'email' );
			$phone = prostory_client_get( $post_id, 'phone' );
			echo $name ? '<strong>' . esc_html( $name ) . '</strong><br>' : '';
			echo $email ? '<a href="' . esc_url( 'mailto:' . $email ) . '">' . esc_html( $email ) . '</a><br>' : '';
			echo $phone ? esc_html( $phone ) : '';
			if ( ! $name && ! $email && ! $phone ) {
				echo '<span aria-hidden="true">—</span>';
			}
			break;

		case 'plan':
			$plans = prostory_client_plans();
			$plan  = prostory_client_get( $post_id, 'plan' );
			echo isset( $plans[ $plan ] ) ? esc_html( $plans[ $plan ] ) : '<span aria-hidden="true">—</span>';
			break;

		case 'status':
			$statuses = prostory_client_statuses();
			$status   = prostory_client_get( $post_id, 'status' );
			if ( isset( $statuses[ $status ] ) ) {
				printf( '<span class="ps-status ps-status--%s">%s</span>', esc_attr( $status ), esc_html( $statuses[ $status ] ) );
			} else {
				echo '<span aria-hidden="true">—</span>';
			}
			break;

		case 'amount':
			$amount = prostory_client_get( $post_id, 'amount' );
			echo '' !== $amount ? esc_html( number_format_i18n( (float) $amount, 2 ) . ' €' ) : '<span aria-hidden="true">—</span>';
			break;

		case 'renewal_date':
			$date = prostory_client_get( $post_id, 'renewal_date' );
			if ( ! $date ) {
				echo '<span aria-hidden="true">—</span>';
				break;
			}
			$days  = (int) floor( ( strtotime( $date ) - strtotime( current_time( 'Y-m-d' ) ) ) / DAY_IN_SECONDS );
			$class = $days < 0 ? 'ps-due ps-due--late' : ( $days <= 30 ? 'ps-due ps-due--soon' : 'ps-due' );
			printf( '<span class="%s">%s</span>', esc_attr( $class ), esc_html( date_i18n( get_option( 'date_format' ), strtotime( $date ) ) ) );
			break;
	}
}
add_action( 'manage_' . PROSTORY_CLIENT_CPT . '_posts_custom_column', 'prostory_client_column_content', 10, 2 );

/**
 * Colonnes triables.
 *
 * @param array $columns Colonnes.
 * @return array
 */
function prostory_client_sortable( $columns ) {
	$columns['plan']         = 'ps_plan';
	$columns['status']       = 'ps_status';
	$columns['amount']       = 'ps_amount';
	$columns['renewal_date'] = 'ps_renewal_date';
	return $columns;
}
add_filter( 'manage_edit-' . PROSTORY_CLIENT_CPT . '_sortable_columns', 'prostory_client_sortable' );

/**
 * Filtres par statut et formule au-dessus de la liste.
 *
 * @param string $post_type Type affiché.
 */
function prostory_client_filters( $post_type ) {
	if ( PROSTORY_CLIENT_CPT !== $post_type ) {
		return;
	}
	$filters = array(
		'ps_status' => array( __( 'Tous les statuts', 'prostory' ), prostory_client_statuses() ),
		'ps_plan'   => array( __( 'Toutes les formules', 'prostory' ), prostory_client_plans() ),
	);
	foreach ( $filters as $name => $data ) {
		$current = isset( $_GET[ $name ] ) ? sanitize_key( wp_unslash( $_GET[ $name ] ) ) : ''; // phpcs:ignore WordPress.Security.NonceVerification
		echo '<select name="' . esc_attr( $name ) . '"><option value="">' . esc_html( $data[0] ) . '</option>';
		foreach ( $data[1] as $value => $label ) {
			printf( '<option value="%s"%s>%s</option>', esc_attr( $value ), selected( $current, $value, false ), esc_html( $label ) );
		}
		echo '</select>';
	}
}
add_action( 'restrict_manage_posts', 'prostory_client_filters' );

/**
 * Applique tri et filtres.
 *
 * @param WP_Query $query Requête.
 */
function prostory_client_query( $query ) {
	if ( ! is_admin() || ! $query->is_main_query() || PROSTORY_CLIENT_CPT !== $query->get( 'post_type' ) ) {
		return;
	}

	$meta_query = array();
	foreach ( array( 'ps_status' => '_ps_status', 'ps_plan' => '_ps_plan' ) as $param => $meta_key ) {
		if ( ! empty( $_GET[ $param ] ) ) { // phpcs:ignore WordPress.Security.NonceVerification
			$meta_query[] = array(
				'key'   => $meta_key,
				'value' => sanitize_key( wp_unslash( $_GET[ $param ] ) ), // phpcs:ignore WordPress.Security.NonceVerification
			);
		}
	}
	if ( $meta_query ) {
		$query->set( 'meta_query', $meta_query );
	}

	$orderby = $query->get( 'orderby' );
	$map     = array(
		'ps_plan'         => array( '_ps_plan', 'meta_value' ),
		'ps_status'       => array( '_ps_status', 'meta_value' ),
		'ps_amount'       => array( '_ps_amount', 'meta_value_num' ),
		'ps_renewal_date' => array( '_ps_renewal_date', 'meta_value' ),
	);
	if ( isset( $map[ $orderby ] ) ) {
		$query->set( 'meta_key', $map[ $orderby ][0] );
		$query->set( 'orderby', $map[ $orderby ][1] );
	}
}
add_action( 'pre_get_posts', 'prostory_client_query' );

/**
 * La recherche porte aussi sur le contact, l'e-mail, le téléphone, la ville et le SIRET.
 *
 * @param string   $search Clause SQL.
 * @param WP_Query $query  Requête.
 * @return string
 */
function prostory_client_search( $search, $query ) {
	global $wpdb;

	if ( ! is_admin() || ! $query->is_main_query() || ! $query->is_search() || PROSTORY_CLIENT_CPT !== $query->get( 'post_type' ) ) {
		return $search;
	}

	$term = $query->get( 's' );
	if ( '' === $term ) {
		return $search;
	}

	$like = '%' . $wpdb->esc_like( $term ) . '%';
	$keys = array( '_ps_contact_name', '_ps_email', '_ps_phone', '_ps_city', '_ps_siret', '_ps_app_user_id', '_ps_activity' );
	$in   = implode( ',', array_fill( 0, count( $keys ), '%s' ) );

	// phpcs:ignore WordPress.DB.PreparedSQLPlaceholders
	$ids = $wpdb->get_col( $wpdb->prepare( "SELECT DISTINCT post_id FROM {$wpdb->postmeta} WHERE meta_key IN ($in) AND meta_value LIKE %s", array_merge( $keys, array( $like ) ) ) );

	$clause = $wpdb->prepare( "{$wpdb->posts}.post_title LIKE %s", $like );
	if ( $ids ) {
		$clause .= ' OR ' . $wpdb->posts . '.ID IN (' . implode( ',', array_map( 'absint', $ids ) ) . ')';
	}

	return " AND ({$clause}) ";
}
add_filter( 'posts_search', 'prostory_client_search', 10, 2 );

/* -------------------------------------------------------------------------
 * Vue d'ensemble, widget et export
 * ---------------------------------------------------------------------- */

/**
 * Chiffres clés calculés sur toutes les fiches.
 *
 * @return array
 */
function prostory_client_stats() {
	$ids = get_posts(
		array(
			'post_type'      => PROSTORY_CLIENT_CPT,
			'post_status'    => array( 'publish', 'private', 'draft' ),
			'posts_per_page' => -1,
			'fields'         => 'ids',
			'no_found_rows'  => true,
		)
	);

	$stats = array(
		'total'     => count( $ids ),
		'by_status' => array_fill_keys( array_keys( prostory_client_statuses() ), 0 ),
		'by_plan'   => array_fill_keys( array_keys( prostory_client_plans() ), 0 ),
		'mrr'       => 0.0,
		'renewals'  => array(),
		'late'      => array(),
	);

	$today = strtotime( current_time( 'Y-m-d' ) );

	foreach ( $ids as $id ) {
		$status = prostory_client_get( $id, 'status' );
		$plan   = prostory_client_get( $id, 'plan' );

		if ( isset( $stats['by_status'][ $status ] ) ) {
			$stats['by_status'][ $status ]++;
		}
		if ( 'actif' === $status && isset( $stats['by_plan'][ $plan ] ) ) {
			$stats['by_plan'][ $plan ]++;
		}
		if ( 'actif' === $status ) {
			$stats['mrr'] += (float) prostory_client_get( $id, 'amount' );
		}

		$renewal = prostory_client_get( $id, 'renewal_date' );
		if ( $renewal && in_array( $status, array( 'actif', 'essai' ), true ) ) {
			$days = (int) floor( ( strtotime( $renewal ) - $today ) / DAY_IN_SECONDS );
			if ( $days < 0 ) {
				$stats['late'][ $id ] = $renewal;
			} elseif ( $days <= 30 ) {
				$stats['renewals'][ $id ] = $renewal;
			}
		}
	}

	asort( $stats['renewals'] );
	asort( $stats['late'] );

	return $stats;
}

/**
 * Page « Vue d'ensemble » dans le menu Clients.
 */
function prostory_client_admin_menu() {
	add_submenu_page(
		'edit.php?post_type=' . PROSTORY_CLIENT_CPT,
		__( 'Vue d’ensemble des clients', 'prostory' ),
		__( 'Vue d’ensemble', 'prostory' ),
		'edit_prostory_clients',
		'prostory-clients-overview',
		'prostory_client_overview_page',
		0
	);
}
add_action( 'admin_menu', 'prostory_client_admin_menu' );

/**
 * Liste de fiches avec date (renouvellements).
 *
 * @param array  $items Fiches => date.
 * @param string $empty Message si vide.
 */
function prostory_client_date_list( $items, $empty ) {
	if ( empty( $items ) ) {
		echo '<p class="ps-empty">' . esc_html( $empty ) . '</p>';
		return;
	}
	echo '<ul class="ps-list">';
	foreach ( $items as $id => $date ) {
		printf(
			'<li><a href="%s">%s</a><span>%s</span></li>',
			esc_url( get_edit_post_link( $id ) ),
			esc_html( get_the_title( $id ) ),
			esc_html( date_i18n( get_option( 'date_format' ), strtotime( $date ) ) )
		);
	}
	echo '</ul>';
}

/**
 * Contenu de la vue d'ensemble.
 */
function prostory_client_overview_page() {
	$stats    = prostory_client_stats();
	$statuses = prostory_client_statuses();
	$plans    = prostory_client_plans();
	$list_url = admin_url( 'edit.php?post_type=' . PROSTORY_CLIENT_CPT );
	$export   = wp_nonce_url( admin_url( 'admin-post.php?action=prostory_export_clients' ), 'prostory_export_clients' );
	?>
	<div class="wrap ps-overview">
		<h1 class="wp-heading-inline"><?php esc_html_e( 'Vue d’ensemble des clients', 'prostory' ); ?></h1>
		<a class="page-title-action" href="<?php echo esc_url( admin_url( 'post-new.php?post_type=' . PROSTORY_CLIENT_CPT ) ); ?>"><?php esc_html_e( 'Ajouter un client', 'prostory' ); ?></a>
		<a class="page-title-action" href="<?php echo esc_url( $export ); ?>"><?php esc_html_e( 'Exporter en CSV', 'prostory' ); ?></a>
		<hr class="wp-header-end">

		<div class="ps-kpis">
			<div class="ps-kpi ps-kpi--main">
				<span class="ps-kpi__label"><?php esc_html_e( 'Revenu mensuel récurrent (HT)', 'prostory' ); ?></span>
				<strong class="ps-kpi__value"><?php echo esc_html( number_format_i18n( $stats['mrr'], 2 ) ); ?> €</strong>
				<span class="ps-kpi__hint"><?php esc_html_e( 'Somme des montants des clients actifs', 'prostory' ); ?></span>
			</div>
			<?php foreach ( array( 'actif', 'essai', 'prospect' ) as $key ) : ?>
				<a class="ps-kpi" href="<?php echo esc_url( add_query_arg( 'ps_status', $key, $list_url ) ); ?>">
					<span class="ps-kpi__label"><?php echo esc_html( $statuses[ $key ] ); ?></span>
					<strong class="ps-kpi__value"><?php echo esc_html( number_format_i18n( $stats['by_status'][ $key ] ) ); ?></strong>
				</a>
			<?php endforeach; ?>
		</div>

		<div class="ps-panels">
			<section class="ps-panel">
				<h2><?php esc_html_e( 'Renouvellements dans les 30 jours', 'prostory' ); ?></h2>
				<?php prostory_client_date_list( $stats['renewals'], __( 'Aucun renouvellement prévu dans les 30 prochains jours.', 'prostory' ) ); ?>
			</section>

			<section class="ps-panel">
				<h2><?php esc_html_e( 'Renouvellements dépassés', 'prostory' ); ?></h2>
				<?php prostory_client_date_list( $stats['late'], __( 'Tout est à jour.', 'prostory' ) ); ?>
			</section>

			<section class="ps-panel">
				<h2><?php esc_html_e( 'Clients actifs par formule', 'prostory' ); ?></h2>
				<ul class="ps-list">
					<?php foreach ( $plans as $slug => $label ) : ?>
						<li><a href="<?php echo esc_url( add_query_arg( array( 'ps_plan' => $slug, 'ps_status' => 'actif' ), $list_url ) ); ?>"><?php echo esc_html( $label ); ?></a><span><?php echo esc_html( number_format_i18n( $stats['by_plan'][ $slug ] ) ); ?></span></li>
					<?php endforeach; ?>
				</ul>
			</section>

			<section class="ps-panel">
				<h2><?php esc_html_e( 'Tous les statuts', 'prostory' ); ?></h2>
				<ul class="ps-list">
					<?php foreach ( $statuses as $slug => $label ) : ?>
						<li><a href="<?php echo esc_url( add_query_arg( 'ps_status', $slug, $list_url ) ); ?>"><span class="ps-status ps-status--<?php echo esc_attr( $slug ); ?>"><?php echo esc_html( $label ); ?></span></a><span><?php echo esc_html( number_format_i18n( $stats['by_status'][ $slug ] ) ); ?></span></li>
					<?php endforeach; ?>
				</ul>
			</section>
		</div>
	</div>
	<?php
}

/**
 * Widget sur le tableau de bord WordPress.
 */
function prostory_client_dashboard_widget() {
	if ( ! current_user_can( 'edit_prostory_clients' ) ) {
		return;
	}
	wp_add_dashboard_widget(
		'prostory_clients_widget',
		__( 'ProStory : clients', 'prostory' ),
		function () {
			$stats = prostory_client_stats();
			?>
			<div class="ps-widget">
				<p><strong><?php echo esc_html( number_format_i18n( $stats['mrr'], 2 ) ); ?> €</strong> <?php esc_html_e( 'HT de revenu mensuel récurrent', 'prostory' ); ?></p>
				<p>
					<?php
					/* translators: 1: clients actifs, 2: clients en essai. */
					echo esc_html( sprintf( __( '%1$s clients actifs, %2$s en essai', 'prostory' ), number_format_i18n( $stats['by_status']['actif'] ), number_format_i18n( $stats['by_status']['essai'] ) ) );
					?>
				</p>
				<?php if ( $stats['late'] ) : ?>
					<p class="ps-widget__alert">
						<?php
						/* translators: %s: nombre de renouvellements dépassés. */
						echo esc_html( sprintf( _n( '%s renouvellement dépassé', '%s renouvellements dépassés', count( $stats['late'] ), 'prostory' ), number_format_i18n( count( $stats['late'] ) ) ) );
						?>
					</p>
				<?php endif; ?>
				<p><a class="button" href="<?php echo esc_url( admin_url( 'edit.php?post_type=' . PROSTORY_CLIENT_CPT . '&page=prostory-clients-overview' ) ); ?>"><?php esc_html_e( 'Ouvrir la vue d’ensemble', 'prostory' ); ?></a></p>
			</div>
			<?php
		}
	);
}
add_action( 'wp_dashboard_setup', 'prostory_client_dashboard_widget' );

/**
 * Export CSV (séparateur « ; » et BOM UTF-8 pour une ouverture correcte dans Excel).
 */
function prostory_export_clients() {
	if ( ! current_user_can( 'edit_prostory_clients' ) ) {
		wp_die( esc_html__( 'Vous n’avez pas les droits pour exporter les clients.', 'prostory' ), 403 );
	}
	check_admin_referer( 'prostory_export_clients' );

	$fields   = prostory_client_fields();
	$statuses = prostory_client_statuses();
	$plans    = prostory_client_plans();

	$ids = get_posts(
		array(
			'post_type'      => PROSTORY_CLIENT_CPT,
			'post_status'    => array( 'publish', 'private', 'draft' ),
			'posts_per_page' => -1,
			'fields'         => 'ids',
			'orderby'        => 'title',
			'order'          => 'ASC',
		)
	);

	nocache_headers();
	header( 'Content-Type: text/csv; charset=utf-8' );
	header( 'Content-Disposition: attachment; filename=clients-prostory-' . current_time( 'Y-m-d' ) . '.csv' );

	$out = fopen( 'php://output', 'w' );
	fwrite( $out, "\xEF\xBB\xBF" ); // phpcs:ignore WordPress.WP.AlternativeFunctions

	$header = array( __( 'Client', 'prostory' ) );
	foreach ( $fields as $field ) {
		$header[] = $field['label'];
	}
	fputcsv( $out, $header, ';' );

	foreach ( $ids as $id ) {
		$row = array( get_the_title( $id ) );
		foreach ( array_keys( $fields ) as $key ) {
			$value = prostory_client_get( $id, $key );
			if ( 'status' === $key && isset( $statuses[ $value ] ) ) {
				$value = $statuses[ $value ];
			} elseif ( 'plan' === $key && isset( $plans[ $value ] ) ) {
				$value = $plans[ $value ];
			} elseif ( 'amount' === $key && '' !== $value ) {
				$value = str_replace( '.', ',', $value );
			}
			// Neutralise les formules pour éviter l'injection dans les tableurs.
			if ( '' !== $value && in_array( $value[0], array( '=', '+', '-', '@' ), true ) ) {
				$value = "'" . $value;
			}
			$row[] = $value;
		}
		fputcsv( $out, $row, ';' );
	}

	fclose( $out ); // phpcs:ignore WordPress.WP.AlternativeFunctions
	exit;
}
add_action( 'admin_post_prostory_export_clients', 'prostory_export_clients' );

/**
 * Styles de l'espace clients.
 *
 * @param string $hook Écran courant.
 */
function prostory_client_admin_assets( $hook ) {
	$screen = get_current_screen();
	if ( ( $screen && PROSTORY_CLIENT_CPT === $screen->post_type ) || 'index.php' === $hook ) {
		wp_enqueue_style( 'prostory-admin', PROSTORY_THEME_URI . '/assets/css/admin.css', array(), PROSTORY_THEME_VERSION );
	}
}
add_action( 'admin_enqueue_scripts', 'prostory_client_admin_assets' );
