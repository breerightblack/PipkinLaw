/* ==========================================================================
   The Pipkin Law Firm: design preview scripts (vanilla JS, no dependencies)
   --------------------------------------------------------------------------
   Each feature is its own small function, called at the bottom of the file.
   To turn a feature off, comment out its line in init().
   The team carousel lives separately in js/carousel.js.
   ========================================================================== */

(function () {
  "use strict";

  // Turn the scroll-reveal animation on/off site-wide.
  var ENABLE_SCROLL_REVEAL = true;

  var prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;


  /* ------------------------------------------------------------------------
     Demo preview banner: dismiss button, remembered per browser.
     ------------------------------------------------------------------------ */
  function initDemoBanner() {
    var banner = document.querySelector(".demo-banner");
    if (!banner) return;
    try {
      if (localStorage.getItem("pipkinDemoBannerDismissed") === "1") banner.hidden = true;
    } catch (e) { /* storage blocked: banner simply shows */ }

    var close = banner.querySelector(".demo-banner__close");
    if (close) {
      close.addEventListener("click", function () {
        banner.hidden = true;
        try { localStorage.setItem("pipkinDemoBannerDismissed", "1"); } catch (e) {}
      });
    }
  }


  /* ------------------------------------------------------------------------
     Highlight the current page in the nav. The header HTML is identical on
     every page, so this sets aria-current from the URL instead.
     ------------------------------------------------------------------------ */
  function initActiveNav() {
    var path = window.location.pathname.replace(/index\.html$/, "");
    document.querySelectorAll(".site-nav a, .mobile-menu a, .dropdown a").forEach(function (link) {
      var href = link.getAttribute("href").replace(/index\.html$/, "");
      if (href === path && href !== "/") link.setAttribute("aria-current", "page");
    });
    // Mark the Practice Areas toggle when on any practice page
    if (path.indexOf("/practice/") === 0) {
      var toggle = document.querySelector(".has-dropdown > .site-nav__link");
      if (toggle) toggle.setAttribute("aria-current", "page");
    }
  }


  /* ------------------------------------------------------------------------
     Practice Areas dropdown (desktop). Opens on click, hover, or keyboard;
     closes on Escape or clicking elsewhere.
     ------------------------------------------------------------------------ */
  function initDropdown() {
    document.querySelectorAll(".has-dropdown").forEach(function (item) {
      var button = item.querySelector("button");
      var menu = item.querySelector(".dropdown");
      if (!button || !menu) return;

      function setOpen(open) {
        item.classList.toggle("is-open", open);
        button.setAttribute("aria-expanded", open ? "true" : "false");
      }

      button.addEventListener("click", function () {
        setOpen(!item.classList.contains("is-open"));
      });
      item.addEventListener("mouseenter", function () { setOpen(true); });
      item.addEventListener("mouseleave", function () { setOpen(false); });
      item.addEventListener("keydown", function (e) {
        if (e.key === "Escape") { setOpen(false); button.focus(); }
      });
      item.addEventListener("focusout", function (e) {
        if (!item.contains(e.relatedTarget)) setOpen(false);
      });
    });
  }


  /* ------------------------------------------------------------------------
     Mobile hamburger menu.
     ------------------------------------------------------------------------ */
  function initMobileMenu() {
    var toggle = document.querySelector(".menu-toggle");
    var menu = document.getElementById("mobile-menu");
    if (!toggle || !menu) return;

    function setOpen(open) {
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
      toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
      menu.hidden = !open;
      document.body.classList.toggle("menu-open", open);
    }

    toggle.addEventListener("click", function () {
      setOpen(toggle.getAttribute("aria-expanded") !== "true");
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && !menu.hidden) { setOpen(false); toggle.focus(); }
    });
    // Close if the window is resized up to the desktop layout
    window.matchMedia("(min-width: 992px)").addEventListener("change", function (mq) {
      if (mq.matches) setOpen(false);
    });
  }


  /* ------------------------------------------------------------------------
     Hero video.
     - prefers-reduced-motion: stop autoplay so only the poster shows.
     - Otherwise, make sure it actually plays on phones. iOS Low Power Mode
       and Android Data Saver can block autoplay; when that happens, start
       the video on the visitor's first tap or scroll instead.
     ------------------------------------------------------------------------ */
  function initHeroVideo() {
    var video = document.querySelector(".hero__media");
    if (!video) return;

    if (prefersReducedMotion) {
      video.removeAttribute("autoplay");
      video.pause();
      return;
    }

    // Set these as properties too: some mobile browsers only honor the
    // property, not the attribute, when deciding whether autoplay is allowed.
    video.muted = true;
    video.defaultMuted = true;
    video.playsInline = true;

    function tryPlay() {
      var attempt = video.play();
      return attempt && attempt.catch ? attempt : Promise.resolve();
    }

    tryPlay().catch(function () {
      // Autoplay was blocked: retry on the first user interaction.
      var events = ["touchstart", "click", "scroll", "keydown"];
      function resume() {
        tryPlay().then(function () {
          events.forEach(function (e) { window.removeEventListener(e, resume); });
        }).catch(function () { /* still blocked: poster stays */ });
      }
      events.forEach(function (e) { window.addEventListener(e, resume, { passive: true }); });
    });

    // Resume if the phone paused it while the tab was in the background
    document.addEventListener("visibilitychange", function () {
      if (!document.hidden && video.paused) tryPlay().catch(function () {});
    });
  }


  /* ------------------------------------------------------------------------
     Count-up animation for stat cards. Markup:
       <span class="stat-card__value" data-count="17.5" data-prefix="$" data-suffix="M">$17.5M</span>
     The final value is already in the HTML, so it reads correctly without JS.
     ------------------------------------------------------------------------ */
  function initCountUp() {
    var items = document.querySelectorAll("[data-count]");
    if (!items.length || prefersReducedMotion || !("IntersectionObserver" in window)) return;

    function run(el) {
      var target = parseFloat(el.getAttribute("data-count"));
      var decimals = (el.getAttribute("data-count").split(".")[1] || "").length;
      var prefix = el.getAttribute("data-prefix") || "";
      var suffix = el.getAttribute("data-suffix") || "";
      var duration = 1600;
      var start = null;

      function frame(ts) {
        if (!start) start = ts;
        var progress = Math.min((ts - start) / duration, 1);
        var eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
        el.textContent = prefix + (target * eased).toFixed(decimals) + suffix;
        if (progress < 1) requestAnimationFrame(frame);
      }
      requestAnimationFrame(frame);
    }

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          run(entry.target);
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.5 });

    items.forEach(function (el) { observer.observe(el); });
  }


  /* ------------------------------------------------------------------------
     Scroll reveal: fades/slides up anything with class "reveal".
     Set ENABLE_SCROLL_REVEAL = false (top of file) to turn it off.
     ------------------------------------------------------------------------ */
  function initScrollReveal() {
    if (!ENABLE_SCROLL_REVEAL || prefersReducedMotion || !("IntersectionObserver" in window)) return;
    var items = document.querySelectorAll(".reveal");
    if (!items.length) return;

    document.documentElement.classList.add("reveal-ready");
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });

    items.forEach(function (el) { observer.observe(el); });
  }


  /* ------------------------------------------------------------------------
     Case results filter. Buttons have data-filter="trucking" etc.; cards
     have data-category="trucking wrongful-death" (space-separated).
     ------------------------------------------------------------------------ */
  function initResultsFilter() {
    var bar = document.querySelector(".filter-bar");
    if (!bar) return;
    var buttons = bar.querySelectorAll(".filter-btn");
    var cards = document.querySelectorAll(".result-grid > li");
    var status = document.getElementById("filter-status");

    buttons.forEach(function (btn) {
      btn.addEventListener("click", function () {
        var filter = btn.getAttribute("data-filter");
        var shown = 0;
        buttons.forEach(function (b) { b.setAttribute("aria-pressed", b === btn ? "true" : "false"); });
        cards.forEach(function (card) {
          var cats = (card.getAttribute("data-category") || "").split(" ");
          var match = filter === "all" || cats.indexOf(filter) !== -1;
          card.hidden = !match;
          if (match) shown++;
        });
        if (status) status.textContent = "Showing " + shown + " result" + (shown === 1 ? "" : "s") + ".";
      });
    });
  }


  /* ------------------------------------------------------------------------
     Missing-image fallback: if an image fails to load, replace it with a
     navy block showing the filename.
     ------------------------------------------------------------------------ */
  function initImageFallback() {
    function swap(img) {
      var box = document.createElement("div");
      box.className = "img-missing " + img.className;
      box.style.width = "100%";
      box.style.aspectRatio = (img.getAttribute("width") || 4) + " / " + (img.getAttribute("height") || 3);
      box.setAttribute("role", "img");
      box.setAttribute("aria-label", img.alt);
      box.textContent = (img.getAttribute("src") || "").split("/").pop();
      img.replaceWith(box);
    }
    document.querySelectorAll("img").forEach(function (img) {
      if (img.complete && img.naturalWidth === 0 && img.getAttribute("src")) swap(img);
      else img.addEventListener("error", function () { swap(img); });
    });
  }


  /* ------------------------------------------------------------------------
     Copyright year.
     ------------------------------------------------------------------------ */
  function initYear() {
    document.querySelectorAll("[data-year]").forEach(function (el) {
      el.textContent = new Date().getFullYear();
    });
  }


  function init() {
    initDemoBanner();
    initActiveNav();
    initDropdown();
    initMobileMenu();
    initHeroVideo();
    initCountUp();
    initScrollReveal();
    initResultsFilter();
    initImageFallback();
    initYear();
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
