/* ==========================================================================
   Team carousel (Slick Carousel 1.8.1 + jQuery, loaded from jsDelivr)
   --------------------------------------------------------------------------
   Modeled on the team slider at alhlaw.com: 3 tall portraits visible, a slow
   smooth glide, custom round arrow buttons below, and curved SVG masks at
   the top and bottom (those are pure CSS/SVG; see section 12 of styles.css).

   Only pages with a team carousel load this file (index.html, about.html).
   If the CDN fails, the cards fall back to a scrollable row (see CSS).
   ========================================================================== */

(function ($) {
  "use strict";
  if (!$ || !$.fn || !$.fn.slick) return; // Slick didn't load: keep fallback layout

  // ---- Adjustable settings -------------------------------------------------
  // ALH uses a slow 2000ms glide. 1200ms feels a bit snappier; change freely.
  var SLIDE_SPEED_MS = 1200;

  var reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  $(function () {
    $(".team-carousel").each(function () {
      var $carousel = $(this);
      var $track = $carousel.find(".team-track");

      $track.slick({
        slidesToShow: 3,
        slidesToScroll: 1,
        infinite: true,         // Slick clones slides, so 4 people / 3 visible loops seamlessly
        autoplay: false,
        dots: false,
        speed: reducedMotion ? 0 : SLIDE_SPEED_MS,
        cssEase: "ease",
        draggable: true,
        swipe: true,
        touchMove: true,
        accessibility: true,    // left/right arrow keys when the carousel has focus
        // Use our own buttons (below the carousel) instead of Slick's defaults
        prevArrow: $carousel.parent().find(".carousel-btn--prev"),
        nextArrow: $carousel.parent().find(".carousel-btn--next"),
        responsive: [
          { breakpoint: 992, settings: { slidesToShow: 2 } }, // <= 991px
          { breakpoint: 480, settings: { slidesToShow: 1 } }  // <= 479px
        ]
      });
    });
  });
})(window.jQuery);
