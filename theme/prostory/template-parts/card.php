<?php
/**
 * Article dans une liste.
 *
 * @package ProStory
 */

?>
<article id="post-<?php the_ID(); ?>" <?php post_class( 'card' ); ?>>
	<?php if ( has_post_thumbnail() ) : ?>
		<a class="card__media" href="<?php the_permalink(); ?>" tabindex="-1" aria-hidden="true">
			<?php the_post_thumbnail( 'prostory-card', array( 'alt' => '' ) ); ?>
		</a>
	<?php endif; ?>
	<div class="card__body">
		<p class="card__meta"><?php prostory_posted_on(); ?></p>
		<h2 class="card__title"><a href="<?php the_permalink(); ?>"><?php the_title(); ?></a></h2>
		<div class="card__excerpt"><?php the_excerpt(); ?></div>
	</div>
</article>
