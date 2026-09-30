<?php
/**
 * Page (mentions légales, CGU, contact…).
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
				<?php the_title( '<h1 class="page-title">', '</h1>' ); ?>
				<?php if ( has_excerpt() ) : ?>
					<div class="page-lead"><?php the_excerpt(); ?></div>
				<?php endif; ?>
			</div>
		</header>
		<div class="wrap wrap--narrow entry-content">
			<?php
			the_content();
			wp_link_pages();
			?>
		</div>
	</article>
	<?php
	if ( comments_open() || get_comments_number() ) {
		echo '<div class="wrap wrap--narrow">';
		comments_template();
		echo '</div>';
	}
endwhile;

get_footer();
