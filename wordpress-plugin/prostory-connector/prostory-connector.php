<?php
/**
 * Plugin Name: ProStory Connector
 * Description: Reçoit les réalisations créées depuis l'appli mobile ProStory (articles optimisés SEO générés par IA : titre, H1, méta-description, contenu) et les publie automatiquement dans un type de contenu dédié "Réalisations", avec une mise en page premium (fiche + galerie + carousel photo) fournie par le plugin lui-même, quel que soit le thème du site.
 * Version: 1.4.0
 * Author: ProStory
 * Text Domain: prostory-connector
 */

if (!defined('ABSPATH')) {
    exit; // Accès direct au fichier interdit.
}

define('PROSTORY_VERSION', '1.4.0');
define('PROSTORY_OPTION_API_KEY', 'prostory_api_key');
define('PROSTORY_POST_TYPE', 'prostory_realisation');
define('PROSTORY_CATEGORY_SLUG', 'realisations');
define('PROSTORY_PLUGIN_DIR', plugin_dir_path(__FILE__));
define('PROSTORY_PLUGIN_URL', plugin_dir_url(__FILE__));

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

// Les réalisations sont rattachées à la catégorie "Réalisations", qui reste
// une catégorie WordPress classique (taxonomie "category") : par défaut,
// WordPress ne montre que le type "post" sur une page de catégorie. On
// ajoute donc explicitement notre Custom Post Type à la requête principale
// de cette page-là pour que les réalisations y apparaissent bien.
function prostory_include_cpt_in_category_archive($query) {
    if (is_admin() || !$query->is_main_query() || !$query->is_category(PROSTORY_CATEGORY_SLUG)) {
        return;
    }
    $post_types = $query->get('post_type');
    if (empty($post_types)) {
        $post_types = array('post');
    } elseif (!is_array($post_types)) {
        $post_types = array($post_types);
    }
    if (!in_array(PROSTORY_POST_TYPE, $post_types, true)) {
        $post_types[] = PROSTORY_POST_TYPE;
        $query->set('post_type', $post_types);
    }
}
add_action('pre_get_posts', 'prostory_include_cpt_in_category_archive');

// ============================================================
// Mise en page premium (fiche + galerie) : le plugin fournit ses propres
// gabarits et sa propre feuille de style pour la fiche réalisation et la
// page qui les liste toutes, afin d'avoir un rendu soigné et cohérent quel
// que soit le thème installé sur le site — pas besoin d'y toucher.
// ============================================================
function prostory_is_realisations_listing() {
    return is_post_type_archive(PROSTORY_POST_TYPE) || is_category(PROSTORY_CATEGORY_SLUG);
}

function prostory_enqueue_assets() {
    if (!is_singular(PROSTORY_POST_TYPE) && !prostory_is_realisations_listing()) {
        return;
    }
    wp_enqueue_style(
        'prostory-connector',
        PROSTORY_PLUGIN_URL . 'assets/prostory-style.css',
        array(),
        PROSTORY_VERSION
    );
    if (is_singular(PROSTORY_POST_TYPE)) {
        wp_enqueue_script(
            'prostory-connector-carousel',
            PROSTORY_PLUGIN_URL . 'assets/prostory-carousel.js',
            array(),
            PROSTORY_VERSION,
            true
        );
    }
}
add_action('wp_enqueue_scripts', 'prostory_enqueue_assets');

// Le titre SEO (balise <title>) peut différer du H1 affiché sur la page :
// on le stocke à part et on le fait passer prioritairement, pour les thèmes
// modernes (support "title-tag") comme pour Yoast/RankMath si l'un des deux
// est actif sur le site.
function prostory_document_title_parts($parts) {
    if (is_singular(PROSTORY_POST_TYPE)) {
        $seo_title = get_post_meta(get_queried_object_id(), '_prostory_seo_title', true);
        if ($seo_title) {
            $parts['title'] = $seo_title;
        }
    }
    return $parts;
}
add_filter('document_title_parts', 'prostory_document_title_parts');

function prostory_template_include($template) {
    if (is_singular(PROSTORY_POST_TYPE)) {
        $custom = PROSTORY_PLUGIN_DIR . 'templates/single-realisation.php';
        if (file_exists($custom)) {
            return $custom;
        }
    }
    if (prostory_is_realisations_listing()) {
        $custom = PROSTORY_PLUGIN_DIR . 'templates/archive-realisations.php';
        if (file_exists($custom)) {
            return $custom;
        }
    }
    return $template;
}
add_filter('template_include', 'prostory_template_include');

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
    $h1 = sanitize_text_field($request->get_param('h1'));
    $content = wp_kses_post($request->get_param('content'));
    $meta_description = sanitize_text_field($request->get_param('meta_description'));
    $image_url = esc_url_raw($request->get_param('image_url'));
    $gallery_urls = $request->get_param('gallery_urls');
    $gallery_urls = is_array($gallery_urls) ? array_filter(array_map('esc_url_raw', $gallery_urls)) : array();

    if (empty($title) || empty($content)) {
        return new WP_Error('prostory_missing_fields', 'Les champs "title" et "content" sont requis.', array('status' => 400));
    }

    $post_id = wp_insert_post(array(
        // Le H1 affiché sur la page peut différer du titre SEO ; à défaut,
        // on retombe sur le titre SEO.
        'post_title' => $h1 ?: $title,
        'post_content' => $content,
        'post_status' => 'publish',
        'post_type' => PROSTORY_POST_TYPE,
        'post_category' => prostory_get_or_create_category(),
    ), true);

    if (is_wp_error($post_id)) {
        return new WP_Error('prostory_insert_failed', $post_id->get_error_message(), array('status' => 500));
    }

    // Titre SEO (balise <title>), distinct du H1 : lu par prostory_document_title_parts()
    // ci-dessus, et dupliqué dans les champs Yoast/RankMath pour compatibilité
    // si l'un de ces plugins est actif sur le site.
    update_post_meta($post_id, '_prostory_seo_title', $title);
    update_post_meta($post_id, '_yoast_wpseo_title', $title);
    update_post_meta($post_id, 'rank_math_title', $title);

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

    if (!empty($gallery_urls)) {
        prostory_set_gallery($post_id, $gallery_urls);
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

// Télécharge les photos restantes (en plus de l'image à la une) et les
// enregistre comme galerie de l'article : c'est ce que le gabarit
// single-realisation.php affiche sous forme de carousel.
function prostory_set_gallery($post_id, $gallery_urls) {
    require_once ABSPATH . 'wp-admin/includes/media.php';
    require_once ABSPATH . 'wp-admin/includes/file.php';
    require_once ABSPATH . 'wp-admin/includes/image.php';

    $attachment_ids = array();
    foreach ($gallery_urls as $url) {
        $attachment_id = media_sideload_image($url, $post_id, null, 'id');
        if (!is_wp_error($attachment_id)) {
            $attachment_ids[] = (int) $attachment_id;
        }
    }
    if (!empty($attachment_ids)) {
        update_post_meta($post_id, '_prostory_gallery_ids', $attachment_ids);
    }
}
