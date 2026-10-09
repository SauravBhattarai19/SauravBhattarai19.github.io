/* Shared behaviour for every page. Content is plain HTML; this script only enhances it. */
(function () {
  "use strict";
  var root = document.documentElement;
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function store(key, value) {
    try {
      if (value === undefined) return localStorage.getItem(key);
      localStorage.setItem(key, value);
    } catch (e) { return null; }
  }

  /* ---------- theme ---------- */
  function currentTheme() {
    var set = root.getAttribute("data-theme");
    if (set) return set;
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  }
  document.querySelectorAll(".theme-toggle").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var next = currentTheme() === "dark" ? "light" : "dark";
      root.setAttribute("data-theme", next);
      store("theme", next);
      btn.setAttribute("aria-label", next === "dark" ? "Switch to light theme" : "Switch to dark theme");
      window.dispatchEvent(new Event("themechange"));
    });
  });
  window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", function () {
    window.dispatchEvent(new Event("themechange"));
  });

  /* ---------- header + mobile nav ---------- */
  var header = document.querySelector(".site-header");
  var onScroll = function () {
    if (header) header.classList.toggle("is-scrolled", window.scrollY > 8);
  };
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  var menuBtn = document.querySelector(".menu-toggle");
  var nav = document.getElementById("site-nav");
  if (menuBtn && nav) {
    var setMenu = function (open) {
      nav.classList.toggle("is-open", open);
      menuBtn.setAttribute("aria-expanded", String(open));
    };
    menuBtn.addEventListener("click", function () {
      setMenu(!nav.classList.contains("is-open"));
    });
    nav.addEventListener("click", function (e) {
      if (e.target.closest("a")) setMenu(false);
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") setMenu(false);
    });
  }

  /* ---------- reveal on scroll ---------- */
  var revealEls = document.querySelectorAll(".reveal");
  if (!reduceMotion && "IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) {
          en.target.classList.add("is-in");
          io.unobserve(en.target);
        }
      });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.06 });
    revealEls.forEach(function (el) { io.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add("is-in"); });
  }

  /* ---------- copy buttons ---------- */
  function copyText(text, btn) {
    var done = function () {
      var label = btn.querySelector("[data-label]") || btn;
      var old = label.textContent;
      label.textContent = "Copied";
      btn.classList.add("is-copied");
      setTimeout(function () { label.textContent = old; btn.classList.remove("is-copied"); }, 1600);
    };
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(text).then(done, function () { fallback(text); done(); });
    } else { fallback(text); done(); }
  }
  function fallback(text) {
    var ta = document.createElement("textarea");
    ta.value = text;
    ta.setAttribute("readonly", "");
    ta.style.position = "absolute";
    ta.style.left = "-9999px";
    document.body.appendChild(ta);
    ta.select();
    try { document.execCommand("copy"); } catch (e) { /* ignore */ }
    document.body.removeChild(ta);
  }
  document.addEventListener("click", function (e) {
    var btn = e.target.closest("[data-copy]");
    if (!btn) return;
    var text = btn.getAttribute("data-copy");
    if (text === "cite") {
      var pub = btn.closest(".pub");
      if (pub) text = pub.getAttribute("data-cite") || "";
    }
    if (text) copyText(text, btn);
  });

  /* ---------- figure lightbox ---------- */
  var zoomables = document.querySelectorAll("button.plate[data-full], button.shot[data-full]");
  if (zoomables.length && typeof HTMLDialogElement === "function") {
    var dlg = document.createElement("dialog");
    dlg.className = "lightbox";
    dlg.innerHTML =
      '<button class="icon-btn" type="button" aria-label="Close figure">' +
      '<svg class="icon" viewBox="0 0 24 24"><path d="M6 6l12 12M18 6L6 18"/></svg></button>' +
      '<img alt=""><p></p>';
    document.body.appendChild(dlg);
    var dImg = dlg.querySelector("img");
    var dCap = dlg.querySelector("p");
    zoomables.forEach(function (b) {
      b.addEventListener("click", function () {
        var img = b.querySelector("img");
        dImg.src = b.getAttribute("data-full");
        dImg.alt = img ? img.alt : "";
        var fig = b.closest("figure, .walk-stage");
        var cap = fig ? fig.querySelector("figcaption, .walk-caption span") : null;
        dCap.textContent = cap ? cap.textContent : "";
        dlg.showModal();
      });
    });
    dlg.addEventListener("click", function (e) {
      if (e.target === dlg || e.target.closest(".icon-btn")) dlg.close();
    });
  }

  /* ---------- list filters (publications, talks) ---------- */
  document.querySelectorAll("[data-filter-list]").forEach(function (bar) {
    var list = document.getElementById(bar.getAttribute("data-filter-list"));
    if (!list) return;
    var items = Array.prototype.slice.call(list.querySelectorAll("[data-tags]"));
    var chips = bar.querySelectorAll(".fchip");
    var input = bar.querySelector("input[type=search]");
    var count = bar.querySelector(".result-count");
    var empty = list.querySelector(".empty-note");
    var active = "all";

    function apply() {
      var q = input ? input.value.trim().toLowerCase() : "";
      var shown = 0;
      items.forEach(function (it) {
        var tags = " " + it.getAttribute("data-tags") + " ";
        var okTag = active === "all" || tags.indexOf(" " + active + " ") !== -1;
        var okText = !q || it.textContent.toLowerCase().indexOf(q) !== -1;
        var show = okTag && okText;
        it.hidden = !show;
        if (show) shown++;
      });
      list.querySelectorAll(".year-group").forEach(function (g) {
        g.hidden = !g.querySelector("[data-tags]:not([hidden])");
      });
      if (count) count.textContent = shown + (shown === 1 ? " item" : " items");
      if (empty) empty.hidden = shown !== 0;
    }
    chips.forEach(function (c) {
      c.addEventListener("click", function () {
        active = c.getAttribute("data-filter");
        chips.forEach(function (o) { o.setAttribute("aria-pressed", String(o === c)); });
        apply();
      });
    });
    if (input) input.addEventListener("input", apply);
    apply();
  });

  /* ---------- table of contents: highlight the section in view ---------- */
  var tocLinks = document.querySelectorAll(".toc a[href^='#']");
  if (tocLinks.length && "IntersectionObserver" in window) {
    var map = {};
    tocLinks.forEach(function (a) { map[a.getAttribute("href").slice(1)] = a; });
    var targets = Object.keys(map).map(function (id) { return document.getElementById(id); }).filter(Boolean);
    var visible = {};
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { visible[en.target.id] = en.isIntersecting; });
      var first = targets.find(function (t) { return visible[t.id]; });
      if (first) {
        tocLinks.forEach(function (a) { a.classList.remove("is-active"); });
        map[first.id].classList.add("is-active");
      }
    }, { rootMargin: "-20% 0px -65% 0px" });
    targets.forEach(function (t) { spy.observe(t); });
  }

  /* ---------- talk map tooltips ---------- */
  var mapWrap = document.querySelector(".talk-map-wrap");
  if (mapWrap) {
    var tip = document.createElement("div");
    tip.className = "map-tip";
    tip.setAttribute("aria-hidden", "true");
    mapWrap.appendChild(tip);
    var show = function (g) {
      var dot = g.querySelector(".map-dot");
      var box = mapWrap.getBoundingClientRect();
      var r = dot.getBoundingClientRect();
      var n = Number(g.getAttribute("data-n"));
      tip.innerHTML = "<b>" + g.getAttribute("data-city") + "</b>" + g.getAttribute("data-label") +
        (n > 1 ? " · " + n + " presentations" : "");
      tip.style.left = (r.left + r.width / 2 - box.left) + "px";
      tip.style.top = (r.top - box.top) + "px";
      tip.classList.add("is-on");
    };
    var hide = function () { tip.classList.remove("is-on"); };
    mapWrap.querySelectorAll(".map-city").forEach(function (g) {
      g.addEventListener("mouseenter", function () { show(g); });
      g.addEventListener("focus", function () { show(g); });
      g.addEventListener("mouseleave", hide);
      g.addEventListener("blur", hide);
      g.addEventListener("click", function () { show(g); });
    });
  }

  /* ---------- walkthrough stepper (screenshots of a running app) ---------- */
  document.querySelectorAll("[data-walkthrough]").forEach(function (wt) {
    var tabs = Array.prototype.slice.call(wt.querySelectorAll(".walk-steps button"));
    var img = wt.querySelector(".walk-stage img");
    var zoom = wt.querySelector(".walk-stage button.shot");
    var cap = wt.querySelector(".walk-caption span");
    var bar = wt.querySelector(".walk-progress i");
    var ms = 5200, timer = null, idx = 0, userTook = false;
    // preload the other screenshots once the walkthrough is near the viewport
    var preload = function () { tabs.forEach(function (t) { var i = new Image(); i.src = t.getAttribute("data-src"); }); };
    function show(i, fromUser) {
      idx = (i + tabs.length) % tabs.length;
      tabs.forEach(function (t, k) {
        t.setAttribute("aria-selected", String(k === idx));
        t.tabIndex = k === idx ? 0 : -1;
      });
      var t = tabs[idx];
      img.src = t.getAttribute("data-src");
      img.alt = t.getAttribute("data-alt") || "";
      if (zoom) zoom.setAttribute("data-full", t.getAttribute("data-src"));
      if (cap) cap.textContent = "Step " + (idx + 1) + " of " + tabs.length + " · " + t.querySelector("b").textContent;
      if (bar) { bar.style.animation = "none"; void bar.offsetWidth; bar.style.animation = ""; }
      if (fromUser) stop();
    }
    function play() {
      if (reduceMotion || userTook) return;
      stop(); wt.classList.add("is-playing");
      timer = setInterval(function () { show(idx + 1); }, ms);
    }
    function stop() { if (timer) clearInterval(timer); timer = null; wt.classList.remove("is-playing"); }
    tabs.forEach(function (t, k) {
      t.addEventListener("click", function () { userTook = true; show(k, true); });
      t.addEventListener("keydown", function (e) {
        if (e.key === "ArrowDown" || e.key === "ArrowRight") { e.preventDefault(); userTook = true; show(idx + 1, true); tabs[idx].focus(); }
        if (e.key === "ArrowUp" || e.key === "ArrowLeft") { e.preventDefault(); userTook = true; show(idx - 1, true); tabs[idx].focus(); }
      });
    });
    var prev = wt.querySelector("[data-walk-prev]"), next = wt.querySelector("[data-walk-next]");
    if (prev) prev.addEventListener("click", function () { userTook = true; show(idx - 1, true); });
    if (next) next.addEventListener("click", function () { userTook = true; show(idx + 1, true); });
    wt.style.setProperty("--walk-ms", ms + "ms");
    show(0);
    if ("IntersectionObserver" in window) {
      var seen = false;
      new IntersectionObserver(function (en) {
        if (en[0].isIntersecting) { if (!seen) { seen = true; preload(); } play(); } else stop();
      }, { threshold: 0.35 }).observe(wt);
    }
  });

  /* ---------- analytics: count clicks on outgoing links (GoatCounter) ---------- */
  // Event name is "out: host/path" (query dropped), "email", or a link's own data-goatcounter-click.
  document.addEventListener("click", function (e) {
    var a = e.target.closest && e.target.closest("a[href]");
    if (!a || a.hasAttribute("data-goatcounter-click") || !window.goatcounter || !window.goatcounter.count) return;
    var name;
    if (a.protocol === "mailto:") name = "email";
    else if (/^https?:$/.test(a.protocol) && a.hostname !== location.hostname) {
      name = "out: " + a.hostname.replace(/^www\./, "") + a.pathname.replace(/\/+$/, "");
    }
    if (!name) return;
    window.goatcounter.count({ path: name, title: (a.textContent || "").trim().slice(0, 80), event: true });
  });

  /* ---------- footer year ---------- */
  document.querySelectorAll("[data-year]").forEach(function (el) {
    el.textContent = String(new Date().getFullYear());
  });
})();
