<?php
/**
 * Article.
 *
 * @package ProStory
 */

get_header();

while ( have_posts() ) :
	the_post();
	?>
	<article id="post-<?php the_ID(); ?>" <?php post_class(); ?>>
		<header class="page-head">
			<div class="wrap wrap--narrow">
				<p class="card__meta"><?php prostory_posted_on(); ?></p>
				<?php the_title( '<h1 class="page-title">', '</h1>' ); ?>
			</div>
		</header>
		<?php if ( has_post_thumbnail() ) : ?>
			<figure class="wrap wrap--narrow entry-cover">
				<?php the_post_thumbnail( 'large' ); ?>
			</figure>
		<?php endif; ?>
		<div class="wrap wrap--narrow entry-content">
			<?php
			the_content();
			wp_link_pages();
			?>
		</div>
		<div class="wrap wrap--narrow">
			<?php
			the_post_navigation(
				array(
					'prev_text' => '<span class="post-nav__label">' . esc_html__( 'Article précédent', 'prostory' ) . '</span><span class="post-nav__title">%title</span>',
					'next_text' => '<span class="post-nav__label">' . esc_html__( 'Article suivant', 'prostory' ) . '</span><span class="post-nav__title">%title</span>',
				)
			);
			if ( comments_open() || get_comments_number() ) {
				comments_template();
			}
			?>
		</div>
	</article>
	<?php
endwhile;

get_footer();
