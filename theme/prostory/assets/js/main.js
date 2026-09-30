/**
 * ProStory — interactions du site.
 * Aucune dépendance.
 */
(function () {
	'use strict';

	var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
	var l10n = window.prostoryL10n || { pause: 'Mettre en pause les stories', play: 'Relancer les stories' };

	/* En-tête : filet au défilement ------------------------------------ */
	var header = document.querySelector('[data-site-header]');
	if (header) {
		var onScroll = function () {
			header.classList.toggle('is-scrolled', window.scrollY > 8);
		};
		onScroll();
		window.addEventListener('scroll', onScroll, { passive: true });
	}

	/* Menu mobile ------------------------------------------------------- */
	var toggle = document.querySelector('[data-nav-toggle]');
	var nav = document.querySelector('[data-site-nav]');
	if (toggle && nav) {
		var setOpen = function (open) {
			toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
			nav.classList.toggle('is-open', open);
		};
		toggle.addEventListener('click', function () {
			setOpen(toggle.getAttribute('aria-expanded') !== 'true');
		});
		nav.addEventListener('click', function (e) {
			if (e.target.closest('a')) {
				setOpen(false);
			}
		});
		document.addEventListener('keydown', function (e) {
			if (e.key === 'Escape' && nav.classList.contains('is-open')) {
				setOpen(false);
				toggle.focus();
			}
		});
	}

	/* Lecteur de stories ------------------------------------------------ */
	var player = document.querySelector('[data-story-player]');
	if (!player) {
		return;
	}

	var story = player.querySelector('.story');
	var slides = Array.prototype.slice.call(player.querySelectorAll('.story__slide'));
	var bars = Array.prototype.slice.call(player.querySelectorAll('.story__bar'));
	var toggleBtn = player.querySelector('[data-story-toggle]');
	var current = 0;
	var userPaused = reduceMotion;
	var holdPaused = false;
	var downAt = 0;

	if (slides.length < 2) {
		return;
	}

	function isLight(slide) {
		return !slide.classList.contains('has-image') &&
			(slide.classList.contains('tone-signal') || slide.classList.contains('tone-paper'));
	}

	function restartBar(bar) {
		var fill = bar.querySelector('i');
		bar.classList.remove('is-active');
		void fill.offsetWidth; // relance l'animation CSS
		bar.classList.add('is-active');
	}

	function show(index) {
		current = (index + slides.length) % slides.length;

		slides.forEach(function (slide, i) {
			var active = i === current;
			slide.hidden = !active;
			slide.classList.toggle('is-active', active);
			if (active && !reduceMotion) {
				slide.classList.remove('is-entering');
				void slide.offsetWidth;
				slide.classList.add('is-entering');
			}
		});

		bars.forEach(function (bar, i) {
			bar.classList.toggle('is-done', i < current);
			if (i === current) {
				restartBar(bar);
			} else {
				bar.classList.remove('is-active');
			}
		});

		story.classList.toggle('is-light', isLight(slides[current]));
	}

	function syncPause() {
		var paused = userPaused || holdPaused;
		story.classList.toggle('is-paused', paused);
		if (toggleBtn) {
			toggleBtn.setAttribute('aria-label', userPaused ? l10n.play : l10n.pause);
		}
	}

	bars.forEach(function (bar) {
		bar.querySelector('i').addEventListener('animationend', function () {
			if (bar.classList.contains('is-active')) {
				show(current + 1);
			}
		});
	});

	// Un appui long sert à mettre en pause : il ne doit pas changer de story.
	function wasTap() {
		return Date.now() - downAt < 300;
	}
	player.querySelector('[data-story-next]').addEventListener('click', function (e) {
		if (e.detail === 0 || wasTap()) {
			show(current + 1);
		}
	});
	player.querySelector('[data-story-prev]').addEventListener('click', function (e) {
		if (e.detail === 0 || wasTap()) {
			show(current - 1);
		}
	});

	if (toggleBtn) {
		toggleBtn.addEventListener('click', function () {
			userPaused = !userPaused;
			syncPause();
		});
	}

	// Maintenir le doigt appuyé met en pause, comme dans une vraie app.
	story.addEventListener('pointerdown', function (e) {
		if (e.target.closest('[data-story-toggle]')) {
			return;
		}
		downAt = Date.now();
		holdPaused = true;
		syncPause();
	});
	['pointerup', 'pointercancel', 'pointerleave'].forEach(function (type) {
		story.addEventListener(type, function () {
			if (holdPaused) {
				holdPaused = false;
				syncPause();
			}
		});
	});

	// Flèches du clavier quand le lecteur a le focus.
	story.addEventListener('keydown', function (e) {
		if (e.key === 'ArrowRight') {
			show(current + 1);
		} else if (e.key === 'ArrowLeft') {
			show(current - 1);
		}
	});

	// Pause quand le lecteur n'est pas visible (économie de batterie).
	if ('IntersectionObserver' in window) {
		new IntersectionObserver(function (entries) {
			holdPaused = !entries[0].isIntersecting;
			syncPause();
		}).observe(player);
	}

	show(0);
	syncPause();
})();

/**
 * Visionneuse des photos d'une réalisation.
 */
(function () {
	'use strict';

	var dialog = document.querySelector('[data-lightbox]');
	if (!dialog || typeof dialog.showModal !== 'function') {
		return;
	}

	var items = Array.prototype.slice.call(dialog.querySelectorAll('[data-lightbox-item]'));
	var counter = dialog.querySelector('[data-lightbox-index]');
	var current = 0;
	var opener = null;

	function load(img) {
		if (img && !img.getAttribute('src')) {
			img.setAttribute('src', img.getAttribute('data-src'));
		}
	}

	function show(index) {
		current = (index + items.length) % items.length;
		items.forEach(function (img, i) {
			img.hidden = i !== current;
		});
		load(items[current]);
		// Précharge les voisines pour un défilement fluide.
		if (items.length > 1) {
			load(items[(current + 1) % items.length]);
			load(items[(current - 1 + items.length) % items.length]);
		}
		if (counter) {
			counter.textContent = String(current + 1);
		}
	}

	document.addEventListener('click', function (e) {
		var trigger = e.target.closest('[data-lightbox-open]');
		if (!trigger) {
			return;
		}
		opener = trigger;
		show(parseInt(trigger.getAttribute('data-lightbox-open'), 10) || 0);
		dialog.showModal();
		document.documentElement.style.overflow = 'hidden';
	});

	dialog.addEventListener('close', function () {
		document.documentElement.style.overflow = '';
		if (opener) {
			opener.focus();
		}
	});

	var prev = dialog.querySelector('[data-lightbox-prev]');
	var next = dialog.querySelector('[data-lightbox-next]');
	if (prev) {
		prev.addEventListener('click', function () { show(current - 1); });
	}
	if (next) {
		next.addEventListener('click', function () { show(current + 1); });
	}
	dialog.querySelector('[data-lightbox-close]').addEventListener('click', function () {
		dialog.close();
	});

	// Un clic à côté de la photo ferme la visionneuse.
	dialog.addEventListener('click', function (e) {
		if (e.target === dialog || e.target.classList.contains('lightbox__stage')) {
			dialog.close();
		}
	});

	dialog.addEventListener('keydown', function (e) {
		if (e.key === 'ArrowRight') {
			show(current + 1);
		} else if (e.key === 'ArrowLeft') {
			show(current - 1);
		}
	});

	// Balayage au doigt sur mobile.
	var startX = null;
	dialog.addEventListener('touchstart', function (e) {
		startX = e.touches[0].clientX;
	}, { passive: true });
	dialog.addEventListener('touchend', function (e) {
		if (startX === null || items.length < 2) {
			return;
		}
		var dx = e.changedTouches[0].clientX - startX;
		if (Math.abs(dx) > 50) {
			show(dx < 0 ? current + 1 : current - 1);
		}
		startX = null;
	});
})();

/**
 * Bouton de téléchargement Android : téléchargement direct sur Android,
 * QR code sur ordinateur, message d'explication sur iPhone.
 */
(function () {
	'use strict';

	var dialog = document.querySelector('[data-app-dialog]');
	var buttons = document.querySelectorAll('[data-app-download]');
	if (!dialog || !buttons.length || typeof dialog.showModal !== 'function') {
		return;
	}

	var ua = navigator.userAgent || '';
	var isAndroid = /Android/i.test(ua);
	var isIOS = /iPhone|iPad|iPod/i.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
	if (isAndroid) {
		return; // Le lien fonctionne tel quel.
	}

	var qrDone = false;
	var opener = null;

	function drawQr() {
		var box = dialog.querySelector('[data-qr]');
		if (qrDone || !box || typeof window.qrcode !== 'function') {
			return;
		}
		var qr = window.qrcode(0, 'M');
		qr.addData(box.getAttribute('data-qr'));
		qr.make();
		box.innerHTML = qr.createSvgTag({ cellSize: 5, margin: 0, scalable: true });
		qrDone = true;
	}

	function show(panel) {
		Array.prototype.forEach.call(dialog.querySelectorAll('[data-app-panel]'), function (el) {
			el.hidden = el.getAttribute('data-app-panel') !== panel;
		});
		var title = dialog.querySelector('[data-app-panel="' + panel + '"] .app-dialog__title');
		if (title) {
			if (!title.id) {
				title.id = 'app-dialog-title-' + panel;
			}
			dialog.setAttribute('aria-labelledby', title.id);
		}
	}

	Array.prototype.forEach.call(buttons, function (button) {
		button.addEventListener('click', function (e) {
			e.preventDefault();
			opener = button;
			show(isIOS ? 'ios' : 'desktop');
			if (!isIOS) {
				drawQr();
			}
			dialog.showModal();
		});
	});

	dialog.querySelector('[data-app-dialog-close]').addEventListener('click', function () {
		dialog.close();
	});
	dialog.addEventListener('click', function (e) {
		if (e.target === dialog) {
			dialog.close();
		}
	});
	dialog.addEventListener('close', function () {
		if (opener) {
			opener.focus();
		}
	});
})();
