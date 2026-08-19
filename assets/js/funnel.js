/* ============================================================================
   BUILD. SHIP. GET PAID. — funnel behaviour
   Reads assets/js/config.js. You should not need to edit this file.
   ----------------------------------------------------------------------------
   What it does:
     1. Wires every purchase CTA to CONFIG.PAYMENT_URL (one source of truth)
     2. Wires the download button to CONFIG.DOWNLOAD_URL
     3. Renders the price / refund FAQ / support email from config
     4. Scroll reveals, sticky nav, sticky mobile CTA, bar charts, lightbox
     5. Fires the (commented-out) analytics hooks
   ========================================================================== */
(function () {
  "use strict";

  var CFG = window.CONFIG || {};
  var UNSET = /^YOUR_.*_HERE$/;
  var isSet = function (v) { return typeof v === "string" && v.trim() !== "" && !UNSET.test(v.trim()); };
  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var $  = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };

  /* ------------------------------------------------------------------ *
   * 1. PURCHASE CTAs  →  Razorpay Payment Button (or PAYMENT_URL)
   *
   *    The real Razorpay button is mounted once, in the offer section, so
   *    buyers see its own "Secured by Razorpay" branding at the moment of
   *    purchase. Every other CTA on the page opens that same checkout as an
   *    overlay by triggering it, and falls back to PAYMENT_URL if the
   *    Razorpay script never loaded (ad blockers, flaky network).
   * ------------------------------------------------------------------ */
  var buyLinks = $$("[data-buy]");
  var paymentReady = isSet(CFG.PAYMENT_URL);
  var rzpId = isSet(CFG.RAZORPAY_BUTTON_ID) ? CFG.RAZORPAY_BUTTON_ID.trim() : "";
  var mount = $("[data-razorpay-mount]");

  function rzpButton() {
    return document.querySelector(".razorpay-payment-button a, .razorpay-payment-button button");
  }

  /* build Razorpay's own snippet and drop it into the offer section */
  function mountRazorpay() {
    if (!rzpId || !mount) { return; }
    var form = document.createElement("form");
    form.className = "rzp__form";
    var s = document.createElement("script");
    s.src = "https://checkout.razorpay.com/v1/payment-button.js";
    s.async = true;
    s.setAttribute("data-payment_button_id", rzpId);
    form.appendChild(s);
    mount.appendChild(form);

    /* the widget renders asynchronously; only retire our own button once
       theirs is genuinely on the page, so there is never a gap with no
       way to buy */
    var tries = 0;
    var poll = setInterval(function () {
      if (rzpButton()) {
        clearInterval(poll);
        mount.setAttribute("data-rzp", "ready");
      } else if (++tries > 40) {           /* ~8 seconds */
        clearInterval(poll);
        mount.setAttribute("data-rzp", "failed");
        console.warn("[funnel] Razorpay button did not load — falling back to PAYMENT_URL.");
      }
    }, 200);
  }

  /* returns true if it managed to start a checkout */
  function openCheckout(where) {
    trackCheckoutStart(where);
    var btn = rzpButton();
    if (btn) { btn.click(); return true; }
    if (paymentReady) { window.location.href = CFG.PAYMENT_URL; return true; }
    return false;
  }

  buyLinks.forEach(function (a) {
    if (rzpId) {
      /* keep a real href so the link still works without JS and for
         middle-click / "open in new tab" */
      a.setAttribute("href", paymentReady ? CFG.PAYMENT_URL : "#offer");
      a.addEventListener("click", function (e) {
        if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) { return; }
        e.preventDefault();
        if (!openCheckout(a.getAttribute("data-buy") || "cta")) {
          var offer = $("#offer");
          if (offer) { offer.scrollIntoView({ behavior: reduced ? "auto" : "smooth", block: "center" }); }
        }
      });
      return;
    }

    if (paymentReady) {
      a.setAttribute("href", CFG.PAYMENT_URL);
      a.setAttribute("rel", "noopener");
    } else {
      a.setAttribute("href", "#offer");
      a.setAttribute("data-unconfigured", "");
    }
    a.addEventListener("click", function () {
      trackCheckoutStart(a.getAttribute("data-buy") || "cta");
    });
  });

  mountRazorpay();

  /* ------------------------------------------------------------------ *
   * 2. DOWNLOAD BUTTON  →  DOWNLOAD_URL   (thank-you page)
   *
   *    A file on your own site ("assets/files/book.pdf") is saved straight
   *    to the buyer's device: same origin, so `download` is honoured. A file
   *    anywhere else — Drive, Dropbox, S3, R2 — cannot be forced to save by
   *    us, so it opens in a new tab instead of appearing to do nothing.
   *
   *    And if DOWNLOAD_URL is still unset, the button turns into an email
   *    link rather than a dead one. Someone has already paid by the time
   *    they see this page; a click that silently does nothing is the worst
   *    thing this page could do.
   * ------------------------------------------------------------------ */
  var dlLinks = $$("[data-download]");
  var downloadReady = isSet(CFG.DOWNLOAD_URL);
  var isAbsolute = function (u) { return /^[a-z][a-z0-9+.-]*:/i.test(u) || u.indexOf("//") === 0; };

  dlLinks.forEach(function (a) {
    if (downloadReady) {
      var url = CFG.DOWNLOAD_URL.trim();
      a.setAttribute("href", url);
      if (isAbsolute(url)) {
        /* cross-origin: the browser ignores `download` anyway, and leaving it
           on makes the link look like it will save when it will navigate */
        a.removeAttribute("download");
        a.setAttribute("target", "_blank");
        a.setAttribute("rel", "noopener");
      } else {
        a.setAttribute("download", "");
      }
      return;
    }

    var mail = CFG.SUPPORT_EMAIL || "";
    a.setAttribute("data-unconfigured", "");
    a.removeAttribute("download");

    if (mail) {
      a.setAttribute("href", "mailto:" + mail +
        "?subject=" + encodeURIComponent("My download — Build. Ship. Get Paid."));
      var label = $("[data-download-label]", a);
      if (label) { label.textContent = "Email us for your copy"; }
    } else {
      a.setAttribute("href", "#");
      a.addEventListener("click", function (e) { e.preventDefault(); });
    }
  });

  /* the explanation that sits under the button, shown in the same case */
  $$("[data-download-missing]").forEach(function (el) { el.hidden = downloadReady; });
  if (!downloadReady) {
    $$("[data-download-meta]").forEach(function (el) { el.hidden = true; });
  }

  /* ------------------------------------------------------------------ *
   * 2b. PAYMENT REFERENCE
   *     Gateways append their own reference to the redirect — Razorpay
   *     sends razorpay_payment_id, others use order_id, payment_id and so
   *     on. Show whichever turned up so the buyer has something to quote
   *     in a support email, and show nothing at all if none did.
   *     The signature is deliberately never displayed.
   * ------------------------------------------------------------------ */
  var refKeys = ["razorpay_payment_id", "razorpay_payment_link_reference_id",
                 "payment_id", "order_id", "orderId", "transaction_id",
                 "sale_id", "reference", "ref", "order"];
  var params = new URLSearchParams(window.location.search);
  var payRef = "";
  for (var i = 0; i < refKeys.length && !payRef; i++) {
    var v = params.get(refKeys[i]);
    if (v && v.trim()) { payRef = v.trim().slice(0, 40); }
  }
  $$("[data-payref]").forEach(function (el) {
    if (!payRef) { return; }
    el.textContent = payRef;          /* text, never innerHTML — it came from a URL */
    el.hidden = false;
  });

  /* ------------------------------------------------------------------ *
   * 3. PRICE, REFUND POLICY, SUPPORT EMAIL
   * ------------------------------------------------------------------ */
  /* the big number in the offer section */
  $$("[data-price]").forEach(function (el) {
    if (isSet(CFG.BOOK_PRICE)) {
      el.textContent = CFG.BOOK_PRICE;
      el.classList.remove("price--tbd");
    } else {
      el.textContent = "Price shown at checkout";
      el.classList.add("price--tbd");
    }
  });

  /* small early mentions (hero, sticky bar). Each element owns its own
     separator, so when there is no price the line closes up cleanly. */
  $$("[data-price-inline]").forEach(function (el) {
    if (isSet(CFG.BOOK_PRICE)) {
      el.textContent = CFG.BOOK_PRICE + " · ";
    } else {
      el.remove();
    }
  });

  /* accepted payment methods — reassurance that matters in markets where
     "do they take UPI?" decides whether the button gets clicked */
  $$("[data-methods]").forEach(function (el) {
    if (isSet(CFG.PAYMENT_METHODS)) {
      el.textContent = CFG.PAYMENT_METHODS;
    } else {
      var row = el.closest("[data-methods-row]") || el;
      row.remove();
    }
  });
  var wasEl = $("[data-price-was]");
  if (wasEl) {
    if (isSet(CFG.BOOK_COMPARE_AT) && isSet(CFG.BOOK_PRICE)) {
      wasEl.textContent = CFG.BOOK_COMPARE_AT;
    } else {
      wasEl.remove();
    }
  }

  var refundItem = $("[data-refund]");
  if (refundItem) {
    if (isSet(CFG.REFUND_POLICY_PLACEHOLDER)) {
      $("[data-refund-text]", refundItem).textContent = CFG.REFUND_POLICY_PLACEHOLDER;
    } else {
      refundItem.remove();
    }
  }

  $$("[data-email]").forEach(function (el) {
    var mail = CFG.SUPPORT_EMAIL || "";
    if (!mail) { return; }
    el.textContent = mail;
    if (el.tagName === "A") { el.setAttribute("href", "mailto:" + mail); }
  });

  /* ------------------------------------------------------------------ *
   * 4. CONFIG REMINDER — only ever visible while something is unset.
   *    Once you fill in config.js this can never appear to a visitor.
   * ------------------------------------------------------------------ */
  var missing = [];
  if (buyLinks.length && !paymentReady && !rzpId) { missing.push("PAYMENT_URL or RAZORPAY_BUTTON_ID"); }
  if (dlLinks.length && !downloadReady) { missing.push("DOWNLOAD_URL"); }

  if (missing.length) {
    var box = document.createElement("div");
    box.className = "cfgnote";
    box.setAttribute("role", "status");
    box.innerHTML =
      "<b>Setup reminder</b>" +
      "Set <code>" + missing.join("</code> and <code>") + "</code> in " +
      "<code>assets/js/config.js</code> before you share this page." +
      '<button type="button" aria-label="Dismiss">&times;</button>';
    box.querySelector("button").addEventListener("click", function () { box.remove(); });
    document.addEventListener("DOMContentLoaded", function () { document.body.appendChild(box); });
    if (document.readyState !== "loading") { document.body.appendChild(box); }

    console.warn(
      "[Build. Ship. Get Paid.] Not configured yet → " + missing.join(", ") +
      "\nEdit assets/js/config.js."
    );
  }
  /* The gateway needs the live address of thank-you.html. Rather than making
     you keep that in sync by hand, work it out from wherever this page is
     actually being served and print it. Deploy, open the page, copy the line. */
  if ($("[data-buy]")) {
    var thankYou = isSet(CFG.THANK_YOU_PAGE_URL)
      ? CFG.THANK_YOU_PAGE_URL
      : new URL("thank-you.html", window.location.href).href;

    console.info(
      "[Build. Ship. Get Paid.]\n" +
      "Paste this into Razorpay → Payment Buttons → your button → Edit →\n" +
      "post-payment redirect:\n\n    " + thankYou + "\n"
    );
  }

  /* ------------------------------------------------------------------ *
   * 5. ANALYTICS HOOKS
   *    Uncomment the lines inside once your pixel / tag is installed.
   * ------------------------------------------------------------------ */
  function trackCheckoutStart(where) {
    /* --- META PIXEL --------------------------------------------------
       if (window.fbq) { fbq('track', 'InitiateCheckout', { content_name: 'Build. Ship. Get Paid.' }); }
    ------------------------------------------------------------------ */
    /* --- GOOGLE ANALYTICS 4 -----------------------------------------
       if (window.gtag) { gtag('event', 'begin_checkout', { items: [{ item_name: 'Build. Ship. Get Paid.' }] }); }
    ------------------------------------------------------------------ */
    /* --- GOOGLE TAG MANAGER -----------------------------------------
       if (window.dataLayer) { window.dataLayer.push({ event: 'begin_checkout', cta_location: where }); }
    ------------------------------------------------------------------ */
    if (window.console && window.console.debug) {
      console.debug("[funnel] checkout started from:", where);
    }
  }

  /* ------------------------------------------------------------------ *
   * 6. STICKY NAV STATE
   * ------------------------------------------------------------------ */
  var nav = $(".nav");
  if (nav) {
    var onScroll = function () {
      nav.classList.toggle("is-stuck", window.scrollY > 40);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
  }

  /* ------------------------------------------------------------------ *
   * 7. SCROLL REVEAL + ANIMATED BARS
   * ------------------------------------------------------------------ */
  var revealTargets = $$(".rv, .bars");
  if (!("IntersectionObserver" in window) || reduced) {
    revealTargets.forEach(function (el) { el.classList.add("is-in"); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          e.target.classList.add("is-in");
          io.unobserve(e.target);
        }
      });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.08 });
    revealTargets.forEach(function (el) { io.observe(el); });
  }

  /* ------------------------------------------------------------------ *
   * 8. STICKY MOBILE CTA
   *    Shown after the hero. Hidden again while the visitor is looking
   *    at the offer section or the final CTA — i.e. once they are already
   *    at the checkout step, so it never covers the real button.
   * ------------------------------------------------------------------ */
  var sticky = $(".sticky");
  if (sticky) {
    var hero = $(".hero");
    var stops = [$("#offer"), $("#final"), $(".footer")].filter(Boolean);
    var timer = null;

    var inView = function (el) {
      var r = el.getBoundingClientRect();
      return r.top < window.innerHeight && r.bottom > 0;
    };

    var syncSticky = function () {
      timer = null;
      var pastHero = hero ? hero.getBoundingClientRect().bottom <= 0 : window.scrollY > 400;
      var atCheckout = stops.some(inView);
      sticky.classList.toggle("is-on", pastHero && !atCheckout);
    };

    /* trailing-edge throttle: measures at most ~12 times a second, and always
       measures once more after the last scroll event, so the final resting
       position is never stale */
    var queueSync = function () {
      if (timer) { return; }
      timer = setTimeout(syncSticky, 80);
    };

    syncSticky();
    window.addEventListener("scroll", queueSync, { passive: true });
    window.addEventListener("resize", queueSync);
  }

  /* ------------------------------------------------------------------ *
   * 9. PAGE PREVIEW LIGHTBOX
   * ------------------------------------------------------------------ */
  var cards = $$(".pvcard");
  if (cards.length) {
    var lb = document.createElement("div");
    lb.className = "lb";
    lb.setAttribute("role", "dialog");
    lb.setAttribute("aria-modal", "true");
    lb.setAttribute("aria-label", "Page preview");
    lb.innerHTML =
      '<button class="lb__x" type="button" aria-label="Close preview">' +
      '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M18 6 6 18M6 6l12 12"/></svg>' +
      "</button><img alt=\"\"><p class=\"lb__cap\"></p>";
    document.addEventListener("DOMContentLoaded", function () { document.body.appendChild(lb); });
    if (document.readyState !== "loading") { document.body.appendChild(lb); }

    var lbImg = lb.querySelector("img");
    var lbCap = lb.querySelector(".lb__cap");
    var opener = null;

    var close = function () {
      lb.classList.remove("is-open");
      document.body.style.overflow = "";
      if (opener) { opener.focus(); }
    };
    var open = function (card) {
      var img = card.querySelector("img");
      opener = card;
      lbImg.src = img.getAttribute("src");
      lbImg.alt = img.getAttribute("alt") || "";
      lbCap.textContent = card.getAttribute("data-caption") || "";
      lb.classList.add("is-open");
      document.body.style.overflow = "hidden";
      lb.querySelector(".lb__x").focus();
    };

    cards.forEach(function (card) {
      card.addEventListener("click", function () { open(card); });
    });
    lb.addEventListener("click", function (e) {
      if (e.target === lb || e.target.closest(".lb__x")) { close(); }
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && lb.classList.contains("is-open")) { close(); }
    });
  }

  /* ------------------------------------------------------------------ *
   * 10. FOOTER YEAR
   * ------------------------------------------------------------------ */
  $$("[data-year]").forEach(function (el) { el.textContent = new Date().getFullYear(); });
})();
