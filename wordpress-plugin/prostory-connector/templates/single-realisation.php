<?php
/**
 * Gabarit premium de la fiche réalisation, fourni par le plugin ProStory
 * Connector (chargé via le filtre template_include) — indépendant du thème
 * du site. Garde get_header()/get_footer() pour rester intégré au reste du
 * site (menu, pied de page).
 *
 * @package ProStoryConnector
 */

if (!defined('ABSPATH')) {
    exit;
}

get_header();

while (have_posts()) :
    the_post();
    $has_thumbnail = has_post_thumbnail();
    $gallery_ids = get_post_meta(get_the_ID(), '_prostory_gallery_ids', true);
    $gallery_ids = is_array($gallery_ids) ? $gallery_ids : array();
    ?>
    <main class="prostory-single">
        <?php if ($has_thumbnail) : ?>
            <div
                class="prostory-hero"
                style="background-image:url('<?php echo esc_url(get_the_post_thumbnail_url(get_the_ID(), 'large')); ?>');"
            >
                <div class="prostory-hero-overlay">
                    <span class="prostory-badge">Réalisation</span>
                    <h1 class="prostory-hero-title"><?php the_title(); ?></h1>
                    <div class="prostory-hero-meta"><?php echo esc_html(get_the_date('j F Y')); ?></div>
                </div>
            </div>
        <?php else : ?>
            <div class="prostory-header-plain">
                <span class="prostory-badge">Réalisation</span>
                <h1><?php the_title(); ?></h1>
                <div class="prostory-hero-meta"><?php echo esc_html(get_the_date('j F Y')); ?></div>
            </div>
        <?php endif; ?>

        <div class="prostory-content">
            <?php the_content(); ?>
        </div>

        <?php if (!empty($gallery_ids)) : ?>
            <div class="prostory-carousel" data-prostory-carousel>
                <div class="prostory-carousel-track">
                    <?php foreach ($gallery_ids as $attachment_id) :
                        $src = wp_get_attachment_image_url($attachment_id, 'large');
                        if (!$src) {
                            continue;
                        }
                        ?>
                        <div class="prostory-carousel-slide">
                            <img src="<?php echo esc_url($src); ?>" alt="<?php the_title_attribute(); ?>" loading="lazy" />
                        </div>
                    <?php endforeach; ?>
                </div>
                <?php if (count($gallery_ids) > 1) : ?>
                    <button type="button" class="prostory-carousel-prev" aria-label="Photo précédente">‹</button>
                    <button type="button" class="prostory-carousel-next" aria-label="Photo suivante">›</button>
                <?php endif; ?>
            </div>
        <?php endif; ?>

        <div class="prostory-single-footer">
            <a class="prostory-back-link" href="<?php echo esc_url(get_post_type_archive_link(PROSTORY_POST_TYPE)); ?>">
                ← Toutes nos réalisations
            </a>
        </div>
    </main>
    <?php
endwhile;

get_footer();
