<?php
/**
 * Plugin Name: ProStory Connector
 * Description: Reçoit les réalisations créées depuis l'appli mobile ProStory et les publie automatiquement dans un type de contenu dédié "Réalisations" (image à la une et méta-description SEO).
 * Version: 1.2.0
 * Author: ProStory
 * Text Domain: prostory-connector
 */

if (!defined('ABSPATH')) {
    exit; // Accès direct au fichier interdit.
}

define('PROSTORY_OPTION_API_KEY', 'prostory_api_key');
define('PROSTORY_POST_TYPE', 'prostory_realisation');

// ============================================================
// Custom Post Type "Réalisation" : les réalisations envoyées par l'appli
// ProStory sont publiées ici plutôt que dans les articles classiques du
// site, pour rester bien séparées du reste du contenu.
// ============================================================
function prostory_register_post_type() {
    register_post_type(PROSTORY_POST_TYPE, array(
        'label' => 'Réalisations',
        'labels' => array(
            'name' => 'Réalisations',
            'singular_name' => 'Réalisation',
            'add_new_item' => 'Ajouter une réalisation',
            'edit_item' => 'Modifier la réalisation',
            'all_items' => 'Toutes les réalisations',
            'view_item' => 'Voir la réalisation',
            'search_items' => 'Rechercher une réalisation',
            'not_found' => 'Aucune réalisation trouvée',
        ),
        'public' => true,
        'has_archive' => true,
        'show_in_menu' => true,
        'show_in_rest' => true,
        'menu_icon' => 'dashicons-hammer',
        'supports' => array('title', 'editor', 'thumbnail', 'excerpt'),
        'taxonomies' => array('category'),
        'rewrite' => array('slug' => 'realisations'),
    ));
}
add_action('init', 'prostory_register_post_type');

// ============================================================
// Activation : génère une clé API à l'installation si absente, et force
// la mise à jour des permaliens pour que le nouveau type de contenu
// devienne accessible immédiatement.
// ============================================================
function prostory_activate() {
    if (!get_option(PROSTORY_OPTION_API_KEY)) {
        update_option(PROSTORY_OPTION_API_KEY, wp_generate_password(32, false));
    }
    prostory_register_post_type();
    flush_rewrite_rules();
}
register_activation_hook(__FILE__, 'prostory_activate');

function prostory_deactivate() {
    flush_rewrite_rules();
}
register_deactivation_hook(__FILE__, 'prostory_deactivate');

// ============================================================
// Page de réglages (Réglages > ProStory) : affiche l'URL du site
// et la clé API à renseigner côté appli ProStory, avec bouton de
// régénération si la clé a fuité.
// ============================================================
function prostory_admin_menu() {
    add_options_page(
        'ProStory Connector',
        'ProStory',
        'manage_options',
        'prostory-connector',
        'prostory_render_settings_page'
    );
}
add_action('admin_menu', 'prostory_admin_menu');

function prostory_render_settings_page() {
    if (!current_user_can('manage_options')) {
        return;
    }

    if (isset($_POST['prostory_regenerate']) && check_admin_referer('prostory_regenerate_action')) {
        update_option(PROSTORY_OPTION_API_KEY, wp_generate_password(32, false));
        echo '<div class="notice notice-success"><p>Nouvelle clé générée — pense à la remettre à jour dans l\'appli ProStory.</p></div>';
    }

    $api_key = get_option(PROSTORY_OPTION_API_KEY);
    ?>
    <div class="wrap">
        <h1>ProStory Connector</h1>
        <p>Renseigne ces deux informations dans l'appli ProStory (Compte &gt; Site WordPress) pour publier
            automatiquement tes réalisations sur ce site, dans le type de contenu dédié
            <a href="<?php echo esc_url(admin_url('edit.php?post_type=' . PROSTORY_POST_TYPE)); ?>">Réalisations</a>
            (menu de gauche).</p>
        <table class="form-table">
            <tr>
                <th scope="row">URL du site</th>
                <td><code><?php echo esc_html(home_url()); ?></code></td>
            </tr>
            <tr>
                <th scope="row">Clé API</th>
                <td><code><?php echo esc_html($api_key); ?></code></td>
            </tr>
        </table>
        <form method="post">
            <?php wp_nonce_field('prostory_regenerate_action'); ?>
            <button
                type="submit"
                name="prostory_regenerate"
                class="button"
                onclick="return confirm('Régénérer la clé ? L\'ancienne cessera de fonctionner immédiatement, il faudra la remettre à jour dans l\'appli.');"
            >
                Régénérer la clé API
            </button>
        </form>
    </div>
    <?php
}

// ============================================================
// API REST : POST /wp-json/prostory/v1/realisations
// Authentification par clé API, envoyée en "Authorization: Bearer <clé>".
// ============================================================
function prostory_register_routes() {
    register_rest_route('prostory/v1', '/realisations', array(
        'methods' => 'POST',
        'callback' => 'prostory_create_realisation',
        'permission_callback' => 'prostory_check_api_key',
    ));
}
add_action('rest_api_init', 'prostory_register_routes');

function prostory_check_api_key(WP_REST_Request $request) {
    $auth = $request->get_header('authorization');
    if (!$auth || strpos($auth, 'Bearer ') !== 0) {
        return new WP_Error('prostory_unauthorized', 'En-tête Authorization manquant ou invalide.', array('status' => 401));
    }
    $provided = trim(substr($auth, 7));
    $expected = get_option(PROSTORY_OPTION_API_KEY);
    if (!$expected || !hash_equals($expected, $provided)) {
        return new WP_Error('prostory_unauthorized', 'Clé API invalide.', array('status' => 401));
    }
    return true;
}

function prostory_create_realisation(WP_REST_Request $request) {
    $title = sanitize_text_field($request->get_param('title'));
    $content = wp_kses_post($request->get_param('content'));
    $meta_description = sanitize_text_field($request->get_param('meta_description'));
    $image_url = esc_url_raw($request->get_param('image_url'));

    if (empty($title) || empty($content)) {
        return new WP_Error('prostory_missing_fields', 'Les champs "title" et "content" sont requis.', array('status' => 400));
    }

    $post_id = wp_insert_post(array(
        'post_title' => $title,
        'post_content' => $content,
        'post_status' => 'publish',
        'post_type' => PROSTORY_POST_TYPE,
        'post_category' => prostory_get_or_create_category(),
    ), true);

    if (is_wp_error($post_id)) {
        return new WP_Error('prostory_insert_failed', $post_id->get_error_message(), array('status' => 500));
    }

    if ($meta_description) {
        // Compatible avec les champs de méta-description Yoast SEO et
        // RankMath si l'un de ces plugins est actif sur le site — sans
        // effet sinon.
        update_post_meta($post_id, '_yoast_wpseo_metadesc', $meta_description);
        update_post_meta($post_id, 'rank_math_description', $meta_description);
    }

    if ($image_url) {
        prostory_set_featured_image($post_id, $image_url);
    }

    return array(
        'id' => $post_id,
        'url' => get_permalink($post_id),
    );
}

// Toutes les réalisations vont dans une unique catégorie "Réalisations",
// quel que soit le métier de l'artisan, pour rester simples à retrouver.
function prostory_get_or_create_category() {
    $term = term_exists('Réalisations', 'category');
    if (!$term) {
        $term = wp_insert_term('Réalisations', 'category');
    }
    return is_wp_error($term) ? array() : array((int) $term['term_id']);
}

// Télécharge la photo (déjà hébergée publiquement par ProStory) et la
// définit comme image à la une de l'article.
function prostory_set_featured_image($post_id, $image_url) {
    require_once ABSPATH . 'wp-admin/includes/media.php';
    require_once ABSPATH . 'wp-admin/includes/file.php';
    require_once ABSPATH . 'wp-admin/includes/image.php';

    $attachment_id = media_sideload_image($image_url, $post_id, null, 'id');
    if (!is_wp_error($attachment_id)) {
        set_post_thumbnail($post_id, $attachment_id);
    }
}
