/* ProStory Connector — défilement des flèches du carousel de la fiche
   réalisation. Le carousel lui-même (scroll-snap) fonctionne sans JS ; ce
   script n'est qu'une amélioration progressive pour les flèches. */
document.addEventListener("DOMContentLoaded", function () {
  document.querySelectorAll("[data-prostory-carousel]").forEach(function (carousel) {
    var track = carousel.querySelector(".prostory-carousel-track");
    var prev = carousel.querySelector(".prostory-carousel-prev");
    var next = carousel.querySelector(".prostory-carousel-next");
    if (!track) {
      return;
    }

    function scrollByOneSlide(direction) {
      var slide = track.querySelector(".prostory-carousel-slide");
      var amount = slide ? slide.getBoundingClientRect().width + 12 : track.clientWidth;
      track.scrollBy({ left: direction * amount, behavior: "smooth" });
    }

    if (prev) {
      prev.addEventListener("click", function () {
        scrollByOneSlide(-1);
      });
    }
    if (next) {
      next.addEventListener("click", function () {
        scrollByOneSlide(1);
      });
    }
  });
});
