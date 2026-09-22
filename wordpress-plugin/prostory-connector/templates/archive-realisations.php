<?php
/**
 * Gabarit premium de la galerie des réalisations (archive du Custom Post
 * Type et page de la catégorie "Réalisations"), fourni par le plugin
 * ProStory Connector — indépendant du thème du site.
 *
 * @package ProStoryConnector
 */

if (!defined('ABSPATH')) {
    exit;
}

get_header();
?>
<main class="prostory-archive">
    <div class="prostory-archive-header">
        <span class="prostory-badge">Portfolio</span>
        <h1>Nos réalisations</h1>
    </div>

    <div class="prostory-grid">
        <?php if (have_posts()) : ?>
            <?php
            while (have_posts()) :
                the_post();
                $thumb_url = has_post_thumbnail() ? get_the_post_thumbnail_url(get_the_ID(), 'medium_large') : '';
                ?>
                <a class="prostory-card" href="<?php the_permalink(); ?>">
                    <div
                        class="prostory-card-media"
                        <?php if ($thumb_url) : ?>style="background-image:url('<?php echo esc_url($thumb_url); ?>');"<?php endif; ?>
                    >
                        <?php if (!$thumb_url) : ?>
                            <span class="prostory-card-placeholder">🛠️</span>
                        <?php endif; ?>
                    </div>
                    <div class="prostory-card-body">
                        <div class="prostory-card-date"><?php echo esc_html(get_the_date('j M Y')); ?></div>
                        <h2 class="prostory-card-title"><?php the_title(); ?></h2>
                        <?php if (has_excerpt()) : ?>
                            <p class="prostory-card-excerpt"><?php echo esc_html(wp_trim_words(get_the_excerpt(), 18)); ?></p>
                        <?php endif; ?>
                    </div>
                </a>
                <?php
            endwhile;
            ?>
        <?php else : ?>
            <p class="prostory-empty">Aucune réalisation pour l'instant.</p>
        <?php endif; ?>
    </div>

    <div class="pagination">
        <?php
        echo paginate_links(array(
            'prev_text' => '←',
            'next_text' => '→',
        ));
        ?>
    </div>
</main>
<?php
get_footer();
