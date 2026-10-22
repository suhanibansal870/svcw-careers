/* Careers in Wastewater Management: site behavior (vanilla JS, no dependencies). */
(function () {
  "use strict";
  var GC = window.GC || { careers: [], quiz: [], videos: [] };
  var REDUCED = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var careerById = {};
  GC.careers.forEach(function (c) { careerById[c.id] = c; });
  var esc = function (s) { return String(s).replace(/[&<>"']/g, function (m) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[m]; }); };
  var applyImages = function (root) { if (window.GC_applyImages) window.GC_applyImages(root); };
  var STORE_KEY = "gc-quiz-result";
  var store = {
    get: function () { try { return JSON.parse(localStorage.getItem(STORE_KEY)); } catch (e) { return null; } },
    set: function (v) { try { localStorage.setItem(STORE_KEY, JSON.stringify(v)); } catch (e) {} },
    clear: function () { try { localStorage.removeItem(STORE_KEY); } catch (e) {} }
  };
  var ARROW = '<svg aria-hidden="true" class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg>';
  var PLAY = '<svg aria-hidden="true" class="ml-0.5 h-4 w-4" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>';
  var BTN = "inline-flex items-center justify-center gap-2 rounded-full px-7 py-3.5 text-[15px] font-medium transition-colors duration-300 ease-out bg-accent text-canvas hover:bg-accent-dark";
  var BTN_OUT = "inline-flex items-center justify-center gap-2 rounded-full px-7 py-3.5 text-[15px] font-medium transition-colors duration-300 ease-out border border-ink/20 text-ink hover:border-ink";
  var BTN_SOLID_LIGHT = "inline-flex items-center justify-center gap-2 rounded-full px-7 py-3.5 text-[15px] font-medium transition-colors duration-300 ease-out bg-canvas text-ink hover:bg-canvas/90";
  var BTN_LIGHT = "inline-flex items-center justify-center gap-2 rounded-full px-7 py-3.5 text-[15px] font-medium transition-colors duration-300 ease-out border border-canvas/50 text-canvas hover:border-canvas hover:bg-canvas/10";
  var photo = function (key, cls, sizes) {
    return '<div class="relative overflow-hidden bg-ink/[0.08] ' + cls + '"><img data-img="' + key + '" alt="" sizes="' + (sizes || "100vw") + '" loading="lazy" decoding="async" class="absolute inset-0 h-full w-full object-cover"></div>';
  };

  /* ---------- Page transitions ---------- */
  document.body.classList.add("is-ready");
  window.addEventListener("pageshow", function () { document.body.classList.add("is-ready"); });

  /* ---------- Header: hide on scroll down, show on scroll up, compact after hero ---------- */
  var header = $("[data-header]");
  if (header) {
    var lastY = window.scrollY, ticking = false;
    var heroEnd = function () { var h = $("main > section"); return h ? h.offsetHeight - 80 : 200; };
    var onScroll = function () {
      var y = window.scrollY;
      var t = Math.min(heroEnd(), 400), on = header.classList.contains("is-compact");
      /* a 48px dead zone stops the 16px height change from flickering at the threshold */
      if (!on && y > t + 24) header.classList.add("is-compact");
      else if (on && y < t - 24) header.classList.remove("is-compact");
      lastY = y; ticking = false;
    };
    window.addEventListener("scroll", function () { if (!ticking) { requestAnimationFrame(onScroll); ticking = true; } }, { passive: true });
  }

  /* ---------- Mobile menu ---------- */
  var menu = $("[data-menu]"), openBtn = $("[data-menu-open]"), closeBtn = $("[data-menu-close]");
  var setMenu = function (open) {
    if (!menu) return;
    menu.classList.toggle("is-open", open);
    menu.setAttribute("aria-hidden", String(!open));
    openBtn && openBtn.setAttribute("aria-expanded", String(open));
    document.body.classList.toggle("no-scroll", open);
    if (open) { var l = $("a", menu); l && l.focus(); } else { openBtn && openBtn.focus(); }
  };
  openBtn && openBtn.addEventListener("click", function () { setMenu(true); });
  closeBtn && closeBtn.addEventListener("click", function () { setMenu(false); });

  /* ---------- Reveal on scroll (staggered) ---------- */
  var revealAll = function (root) {
    var items = $$("[data-reveal]:not(.is-in)", root);
    if (!("IntersectionObserver" in window) || REDUCED) { items.forEach(function (el) { el.classList.add("is-in"); }); return; }
    var io = new IntersectionObserver(function (entries) {
      var batch = entries.filter(function (en) { return en.isIntersecting; });
      batch.forEach(function (en, i) {
        en.target.style.transitionDelay = Math.min(i * 90, 360) + "ms";
        en.target.classList.add("is-in");
        io.unobserve(en.target);
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });
    items.forEach(function (el) { io.observe(el); });
  };
  revealAll();

  /* ---------- Gentle parallax ---------- */
  var parallax = $$("[data-parallax]");
  if (parallax.length && !REDUCED && window.innerWidth >= 768) {
    var ptick = false;
    var runParallax = function () {
      var vh = window.innerHeight;
      parallax.forEach(function (el) {
        var r = el.parentElement.getBoundingClientRect();
        if (r.bottom < 0 || r.top > vh) return;
        var p = (r.top + r.height / 2 - vh / 2) / vh; // -1..1
        el.style.transform = "translate3d(0," + (p * -40).toFixed(1) + "px,0) scale(1.12)";
      });
      ptick = false;
    };
    window.addEventListener("scroll", function () { if (!ptick) { requestAnimationFrame(runParallax); ptick = true; } }, { passive: true });
    runParallax();
  }

  /* ---------- Hero rotating word ---------- */
  var rot = $("[data-rotate]");
  if (rot && !REDUCED) {
    var words = JSON.parse(rot.getAttribute("data-rotate")), wi = 0, wordEl = $("[data-rotate-word]", rot);
    setInterval(function () {
      wordEl.classList.add("is-out");
      setTimeout(function () { wi = (wi + 1) % words.length; wordEl.textContent = words[wi]; wordEl.classList.remove("is-out"); }, 350);
    }, 2600);
  }

  /* ---------- Horizontal scroll rows ---------- */
  $$("[data-hscroll]").forEach(function (wrap) {
    var track = $("[data-hscroll-track]", wrap);
    var step = function () { var c = track.firstElementChild; return c ? c.getBoundingClientRect().width + 24 : 320; };
    var prev = $("[data-hscroll-prev]", wrap), next = $("[data-hscroll-next]", wrap);
    prev && prev.addEventListener("click", function () { track.scrollBy({ left: -step(), behavior: REDUCED ? "auto" : "smooth" }); });
    next && next.addEventListener("click", function () { track.scrollBy({ left: step(), behavior: REDUCED ? "auto" : "smooth" }); });
  });

  /* ---------- Paths timeline (tabs) ---------- */
  var paths = $("[data-paths]");
  if (paths) {
    var ptabs = $$("[data-path-tab]", paths);
    var showPath = function (i, focus) {
      ptabs.forEach(function (t, j) { t.setAttribute("aria-selected", String(i === j)); t.tabIndex = i === j ? 0 : -1; });
      $$("[data-path-panel]", paths).forEach(function (p, j) { p.classList.toggle("hidden", i !== j); });
      if (focus) ptabs[i].focus();
    };
    ptabs.forEach(function (t, i) {
      t.addEventListener("click", function () { showPath(i); });
      t.addEventListener("keydown", function (e) {
        if (e.key === "ArrowRight") { e.preventDefault(); showPath((i + 1) % ptabs.length, true); }
        if (e.key === "ArrowLeft") { e.preventDefault(); showPath((i - 1 + ptabs.length) % ptabs.length, true); }
      });
    });
    showPath(0);
  }

  /* ---------- Home quiz teaser remembers your result ---------- */
  var teaser = $("[data-quiz-teaser]"), saved = store.get();
  if (teaser && saved && careerById[saved.top]) {
    var c = careerById[saved.top];
    $("[data-teaser-kicker]", teaser).textContent = "Your last quiz result";
    $("[data-teaser-title]", teaser).textContent = c.name;
    $("[data-teaser-text]", teaser).textContent = c.short;
    $("[data-teaser-actions]", teaser).innerHTML = '<a class="' + BTN_SOLID_LIGHT + '" href="careers.html#' + c.id + '">See your path</a><a class="' + BTN_LIGHT + '" href="quiz.html">Retake the quiz</a>';
  }

  /* ---------- Accordion ---------- */
  $$("[data-accordion] button[aria-controls]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var open = btn.getAttribute("aria-expanded") === "true";
      btn.setAttribute("aria-expanded", String(!open));
      document.getElementById(btn.getAttribute("aria-controls")).classList.toggle("is-open", !open);
    });
  });

  /* ---------- Newsletter (placeholder) ---------- */
  $$("[data-newsletter]").forEach(function (f) {
    f.addEventListener("submit", function (e) {
      e.preventDefault();
      var input = $("input", f), msg = $("[data-newsletter-msg]", f);
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.value.trim())) { msg.textContent = "Please enter a valid email address."; input.focus(); return; }
      msg.textContent = "Thanks! You're on the list. [Placeholder: signup isn't connected yet.]";
      input.value = "";
    });
  });

  /* ---------- Focus trap helper for dialogs ---------- */
  var trap = function (el, e) {
    if (e.key !== "Tab") return;
    var f = $$('a[href], button:not([disabled]), input, select, textarea, iframe, [tabindex]:not([tabindex="-1"])', el).filter(function (x) { return x.offsetParent !== null; });
    if (!f.length) return;
    var first = f[0], last = f[f.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  };

  /* ---------- Video library + lightbox (Explore) ---------- */
  var lightbox = $("[data-lightbox]"), lastFocus = null;
  var videoCard = function (v, i) {
    var areas = (v.cats || []).map(function (k) { return (careerById[k] || {}).name || ""; }).join(" ");
    return '<button type="button" class="video-card group block w-full text-left" data-video="' + i + '" data-cat="' + (v.cats || []).join(" ") + '" data-search-text="' + esc(v.name + " " + v.role + " " + areas) + '" aria-label="Play interview: ' + esc(v.name + ", " + v.role) + '">' +
      '<div class="relative aspect-video overflow-hidden rounded-2xl bg-ink"><img src="https://i.ytimg.com/vi/' + esc(v.youtube) + '/hqdefault.jpg" alt="" loading="lazy" decoding="async" onerror="this.style.opacity=0" class="absolute inset-0 h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03]">' +
      '<span class="absolute inset-0 bg-ink/15 transition-colors duration-300 group-hover:bg-ink/30"></span>' +
      '<span class="absolute left-1/2 top-1/2 flex h-14 w-14 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-canvas text-ink transition-transform duration-300 ease-out group-hover:scale-110">' + PLAY + '</span></div>' +
      '<p class="mt-5 text-[15px] text-ink/70">' + esc(v.role) + '</p><h3 class="mt-1 font-display text-xl font-medium tracking-[-0.015em] text-ink">' + esc(v.name) + '</h3></button>';
  };
  var openVideo = function (i) {
    if (!lightbox) return;
    var v = GC.videos[i]; if (!v || !v.youtube) return;
    lastFocus = document.activeElement;
    $("[data-lb-title]", lightbox).textContent = v.name + ", " + v.role;
    var player = $("[data-lb-player]", lightbox);
    if (!v.youtube) return;
    player.innerHTML = '<iframe class="absolute inset-0 h-full w-full" src="https://www.youtube-nocookie.com/embed/' + esc(v.youtube) + '?autoplay=1&rel=0' + (location.protocol === "file:" ? "" : '&origin=' + encodeURIComponent(location.origin)) + '" title="' + esc(v.name + ", " + v.role) + '" referrerpolicy="strict-origin-when-cross-origin" allow="autoplay; encrypted-media; picture-in-picture" allowfullscreen></iframe>';
    applyImages(lightbox);
    lightbox.classList.add("is-open");
    lightbox.setAttribute("aria-hidden", "false");
    document.body.classList.add("no-scroll");
    $("[data-lb-close]", lightbox).focus();
  };
  var closeVideo = function () {
    if (!lightbox || !lightbox.classList.contains("is-open")) return;
    lightbox.classList.remove("is-open");
    lightbox.setAttribute("aria-hidden", "true");
    $("[data-lb-player]", lightbox).innerHTML = "";
    if (!panelOpen()) document.body.classList.remove("no-scroll");
    lastFocus && lastFocus.focus();
  };
  if (lightbox) {
    lightbox.addEventListener("click", function (e) {
      if (e.target === lightbox || e.target.closest("[data-lb-close]")) closeVideo();
    });
    lightbox.addEventListener("keydown", function (e) { trap(lightbox, e); });
  }
  document.addEventListener("click", function (e) {
    var b = e.target.closest("[data-video]");
    if (!b) return;
    if (panelOpen()) closePanel();
    openVideo(+b.getAttribute("data-video"));
  });

  var vgrid = $("[data-video-grid]"), activeTab = "all";
  if (vgrid) {
    vgrid.innerHTML = GC.videos.map(videoCard).join("");
    applyImages(vgrid);
  }
  var tabs = $$(".vtab"), ind = $(".vtab-ind");
  var moveInd = function () {
    var a = $(".vtab.is-active"); if (!a || !ind) return;
    ind.style.width = a.offsetWidth + "px"; ind.style.transform = "translateX(" + a.offsetLeft + "px)";
  };
  tabs.forEach(function (t) {
    t.setAttribute("role", "tab");
    t.addEventListener("click", function () {
      tabs.forEach(function (x) { x.classList.remove("is-active"); x.setAttribute("aria-selected", "false"); });
      t.classList.add("is-active"); t.setAttribute("aria-selected", "true");
      activeTab = t.getAttribute("data-vtab"); moveInd(); filter();
    });
  });
  window.addEventListener("resize", moveInd);
  setTimeout(moveInd, 50);

  /* ---------- Search (careers + videos) ---------- */
  var search = $("[data-search]"), status = $("[data-search-status]");
  var filter = function () {
    var q = search ? search.value.trim().toLowerCase() : "";
    var cn = 0, vn = 0;
    $$(".career-card").forEach(function (el) {
      var show = !q || el.getAttribute("data-search-text").toLowerCase().indexOf(q) > -1;
      el.classList.toggle("hidden", !show); if (show) cn++;
    });
    $$(".video-card").forEach(function (el) {
      var show = (activeTab === "all" || (" " + el.getAttribute("data-cat") + " ").indexOf(" " + activeTab + " ") > -1) && (!q || el.getAttribute("data-search-text").toLowerCase().indexOf(q) > -1);
      el.classList.toggle("hidden", !show); if (show) vn++;
    });
    var ce = $("[data-career-empty]"), ve = $("[data-video-empty]");
    ce && ce.classList.toggle("hidden", cn > 0);
    ve && ve.classList.toggle("hidden", vn > 0);
    if (status) status.textContent = q ? vn + " interview" + (vn === 1 ? "" : "s") + " found" : "";
  };
  search && search.addEventListener("input", filter);
  // interviews.html#lab (etc.) opens with that career area's interviews selected
  var tabFromHash = function () { var t = $('.vtab[data-vtab="' + location.hash.slice(1) + '"]'); if (t && vgrid) t.click(); };
  if (vgrid) { tabFromHash(); window.addEventListener("hashchange", tabFromHash); }

  /* ---------- Career explorer panel (deep-linkable via #id) ---------- */
  var panel = $("[data-panel]"), backdrop = $("[data-panel-backdrop]"), panelBody = $("[data-panel-body]");
  var panelOpen = function () { return panel && panel.classList.contains("is-open"); };
  var renderPanel = function (c) {
    return photo(c.img, "aspect-[16/9]", "600px") +
      '<div class="px-6 py-10 md:px-10">' +
      '<h2 id="panel-title" class="font-display text-4xl font-medium tracking-[-0.03em] leading-[1.08] text-ink">' + esc(c.name) + '</h2>' +
      '<p class="mt-3 text-lg text-ink/70">' + esc(c.short) + '</p>' +
      '<p class="mt-8 text-[17px] leading-[1.75] text-ink/75">' + esc(c.overview) + '</p>' +
      '<h3 class="mt-12 font-display text-xl font-medium text-ink">A day in the life</h3>' +
      '<ol class="mt-5 border-l border-ink/15">' + c.day.map(function (d) { return '<li class="relative pb-6 pl-6 last:pb-0"><span class="absolute -left-[5px] top-2 h-2.5 w-2.5 rounded-full bg-accent"></span><p class="text-sm text-ink/70">' + esc(d.time) + '</p><p class="mt-1 text-[16px] leading-relaxed text-ink/80">' + esc(d.text) + '</p></li>'; }).join("") + '</ol>' +
      '<h3 class="mt-12 font-display text-xl font-medium text-ink">Skills you will use</h3>' +
      '<ul class="mt-5 flex flex-wrap gap-2">' + c.skills.map(function (s) { return '<li class="rounded-full border border-ink/15 px-4 py-2 text-[15px] text-ink/80">' + esc(s) + '</li>'; }).join("") + '</ul>' +
      '</div>';
  };
  var openPanel = function (id, fromHash) {
    var c = careerById[id]; if (!c || !panel) return;
    lastFocus = fromHash ? null : document.activeElement;
    panelBody.innerHTML = renderPanel(c);
    panelBody.scrollTop = 0;
    applyImages(panel);
    panel.classList.add("is-open"); backdrop.classList.add("is-open");
    panel.setAttribute("aria-hidden", "false");
    document.body.classList.add("no-scroll");
    setTimeout(function () { $("[data-panel-close]", panel).focus(); }, 60);
  };
  var hidePanel = function () {
    if (!panelOpen()) return;
    panel.classList.remove("is-open"); backdrop.classList.remove("is-open");
    panel.setAttribute("aria-hidden", "true");
    document.body.classList.remove("no-scroll");
    if (lastFocus) lastFocus.focus();
  };
  var closePanel = function () {
    if (!panelOpen()) return;
    if (history.state && history.state.panel) { history.back(); return; } // popstate hides it
    hidePanel();
    history.replaceState(null, "", location.pathname + location.search);
  };
  if (panel) {
    $$("[data-career]").forEach(function (a) {
      a.addEventListener("click", function (e) {
        e.preventDefault();
        var id = a.getAttribute("data-career");
        history.pushState({ panel: id }, "", "#" + id);
        openPanel(id);
      });
    });
    $("[data-panel-close]", panel).addEventListener("click", closePanel);
    backdrop.addEventListener("click", closePanel);
    panel.addEventListener("keydown", function (e) { trap(panel, e); });
    var fromHash = function () {
      var id = location.hash.slice(1);
      if (careerById[id]) openPanel(id, true); else hidePanel();
    };
    window.addEventListener("popstate", fromHash);
    fromHash();
  }
  document.addEventListener("keydown", function (e) {
    if (e.key !== "Escape") return;
    if (lightbox && lightbox.classList.contains("is-open")) closeVideo();
    else if (panelOpen()) closePanel();
    else if (menu && menu.classList.contains("is-open")) setMenu(false);
  });

  /* ---------- Careers page tabs: switch careers without scrolling ---------- */
  (function () {
    var tabs = $$("[data-career-tab]"), panels = $$("[data-career-panel]");
    if (!tabs.length) return;
    function show(id, push) {
      if (!panels.some(function (p) { return p.id === id; })) id = tabs[0].getAttribute("data-career-tab");
      panels.forEach(function (p) { p.classList.toggle("is-active", p.id === id); });
      tabs.forEach(function (t) {
        var on = t.getAttribute("data-career-tab") === id;
        t.setAttribute("aria-selected", on ? "true" : "false");
        t.classList.toggle("is-active", on);
        var row = t.parentNode;
        if (on && row.scrollWidth > row.clientWidth) row.scrollLeft = t.offsetLeft - row.offsetLeft - 24;
      });
      if (push && history.replaceState) history.replaceState(null, "", "#" + id);
    }
    tabs.forEach(function (t) {
      t.addEventListener("click", function (e) {
        e.preventDefault();
        show(t.getAttribute("data-career-tab"), true);
      });
    });
    function fromHash() { show(location.hash.slice(1), false); }
    fromHash();
    if (location.hash) {
      if ("scrollRestoration" in history) history.scrollRestoration = "manual";
      var top = function () { window.scrollTo(0, 0); };
      top(); setTimeout(top, 0); window.addEventListener("load", function () { setTimeout(top, 0); });
    }
    window.addEventListener("hashchange", function () { fromHash(); window.scrollTo(0, 0); });
  })();

  /* ---------- Career quiz ---------- */
  var stage = $("[data-quiz]");
  if (stage) {
    var Q = GC.quiz, step = -1, answers = [], busy = false;
    var STAGES = ["In high school", "Training", "First job", "Growing"];
    var swap = function (html, after) {
      var cur = $(".quiz-screen", stage);
      var put = function () { stage.innerHTML = '<div class="quiz-screen">' + html + "</div>"; applyImages(stage); after && after(); busy = false; };
      if (cur && !REDUCED) { busy = true; cur.classList.add("is-leaving"); setTimeout(put, 200); } else put();
    };
    var start = function () {
      step = -1;
      var last = store.get(), lc = last && careerById[last.top];
      swap('<div class="grid items-center gap-14 lg:grid-cols-12">' +
        '<div class="lg:col-span-7">' +
        '<h1 class="font-display text-[2.75rem] font-medium tracking-[-0.035em] leading-[1.03] md:text-7xl">Which wastewater career fits you?</h1>' +
        '<p class="mt-8 max-w-lg text-lg leading-[1.7] text-ink/70">Six quick questions about what you enjoy. You\'ll get a career match, the path to get there, and interviews with people who do that job.</p>' +
        '<div class="mt-10 flex flex-wrap items-center gap-3"><button class="' + BTN + '" data-q-start>Start the quiz</button>' +
        (lc ? '<button class="' + BTN_OUT + '" data-q-last>See my last result</button>' : "") + '</div>' +
        '<ul class="mt-12 flex flex-wrap gap-x-8 gap-y-2 text-[15px] text-ink/70"><li>6 questions</li><li>About 2 minutes</li><li>Answers stay on your device</li></ul></div>' +
        '<div class="hidden lg:col-span-5 lg:block">' + photo("aerial", "aspect-[4/5] rounded-2xl", "40vw") + '</div></div>', function () {
          $("[data-q-start]", stage).addEventListener("click", function () { answers = []; step = 0; question(); });
          var l = $("[data-q-last]", stage); l && l.addEventListener("click", function () { results(last.scores); });
          $("[data-q-start]", stage).focus();
        });
    };
    var question = function () {
      var q = Q[step], sel = answers[step];
      swap('<div class="mx-auto w-full max-w-3xl">' +
        '<div class="flex items-center gap-5"><button class="text-[15px] text-ink/70 hover:text-ink" data-q-back>← Back</button>' +
        '<div class="flex flex-1 gap-1.5">' + Q.map(function (_, i) { return '<span class="h-1.5 flex-1 rounded-full ' + (i < step ? "bg-accent" : i === step ? "bg-accent/50" : "bg-ink/10") + '"></span>'; }).join("") + '</div>' +
        '<span class="text-[15px] text-ink/70">' + (step + 1) + " of " + Q.length + '</span></div>' +
        '<h1 class="mt-14 font-display text-3xl font-medium tracking-[-0.03em] leading-[1.12] md:text-5xl" id="q-title">' + esc(q.q) + '</h1>' +
        '<div class="mt-10 grid gap-3 sm:grid-cols-2" role="radiogroup" aria-labelledby="q-title">' + q.options.map(function (o, i) {
          return '<button type="button" role="radio" aria-checked="' + (sel === i) + '" data-q-opt="' + i + '" class="q-option flex min-h-[5.5rem] items-center gap-4 rounded-2xl border border-ink/15 px-5 py-5 text-left text-[17px] text-ink transition-all duration-300 hover:-translate-y-0.5 hover:border-ink/50"><span class="q-key flex h-8 w-8 flex-none items-center justify-center rounded-full border border-ink/20 text-sm transition-colors duration-300">' + (i + 1) + '</span>' + esc(o.text) + '</button>';
        }).join("") + '</div>' +
        '</div>', function () {
          $$("[data-q-opt]", stage).forEach(function (b) { b.addEventListener("click", function () { choose(+b.getAttribute("data-q-opt")); }); });
          $("[data-q-back]", stage).addEventListener("click", back);
          var first = $('[aria-checked="true"]', stage) || $("[data-q-opt]", stage); first && first.focus();
        });
    };
    // Picking an answer moves straight on to the next question
    var choose = function (i) {
      if (busy) return;
      answers[step] = i;
      $$("[data-q-opt]", stage).forEach(function (b, j) { b.setAttribute("aria-checked", String(i === j)); });
      busy = true;
      setTimeout(function () { busy = false; if (step < Q.length - 1) { step++; question(); } else { finish(); } }, REDUCED ? 0 : 280);
    };
    var back = function () { if (busy) return; if (step <= 0) start(); else { step--; question(); } };
    var finish = function () {
      var scores = {};
      GC.careers.forEach(function (c) { scores[c.id] = 0; });
      answers.forEach(function (a, i) { var s = Q[i].options[a].scores; Object.keys(s).forEach(function (k) { scores[k] += s[k]; }); });
      var ranked = Object.keys(scores).sort(function (a, b) { return scores[b] - scores[a]; });
      store.set({ top: ranked[0], scores: scores, date: new Date().toISOString() });
      results(scores);
    };
    var results = function (scores) {
      step = Q.length;
      var ranked = Object.keys(scores).sort(function (a, b) { return scores[b] - scores[a]; });
      var top = careerById[ranked[0]];
      var people = GC.videos.map(function (v, i) { return { v: v, i: i }; }).filter(function (o) { return (o.v.cats || []).indexOf(top.id) > -1; });
      swap('<div class="grid gap-14 lg:grid-cols-12">' +
        '<div class="lg:col-span-7"><p class="mb-4 text-[15px] text-ink/70">Your best match</p>' +
        '<h1 class="font-display text-5xl font-medium tracking-[-0.035em] leading-[1.03] md:text-7xl">' + esc(top.name) + '</h1>' +
        '<p class="mt-6 max-w-xl text-xl leading-[1.6] text-ink/80">' + esc(top.short) + '</p>' +
        '<p class="mt-5 max-w-xl text-[17px] leading-[1.75] text-ink/70">' + esc(top.overview) + '</p>' +
        '<h2 class="mt-12 font-display text-xl font-medium">How to get there</h2>' +
        '<ol class="mt-6 ml-[7px] max-w-xl border-l-2 border-accent/30">' + top.path.map(function (t, n) {
          return '<li class="relative pb-7 pl-8 last:pb-0"><span class="absolute left-[-9px] top-1.5 h-4 w-4 rounded-full ' + (n === 3 ? "bg-accent" : "border-2 border-accent bg-canvas") + '"></span><p class="text-sm text-ink/70">' + STAGES[n] + '</p><p class="mt-1 text-[17px] leading-relaxed">' + esc(t) + '</p></li>';
        }).join("") + '</ol>' +
        '<div class="mt-12 flex flex-wrap gap-3"><a class="' + BTN + '" href="careers.html#' + top.id + '">Read more about this career</a><button class="' + BTN_OUT + '" data-q-retake>Retake the quiz</button></div></div>' +
        '<aside class="lg:col-span-5">' +
        (people.length ? '<h2 class="font-display text-xl font-medium">Hear from people who do this</h2><div class="mt-5 space-y-4">' + people.map(function (o) {
          return '<button type="button" class="group grid w-full grid-cols-[minmax(0,9rem)_1fr] items-center gap-4 text-left" data-video="' + o.i + '" aria-label="Play interview: ' + esc(o.v.name + ", " + o.v.role) + '"><span class="relative block aspect-video overflow-hidden rounded-xl bg-ink"><img src="https://i.ytimg.com/vi/' + esc(o.v.youtube) + '/hqdefault.jpg" alt="" loading="lazy" onerror="this.style.opacity=0" class="absolute inset-0 h-full w-full object-cover"><span class="absolute inset-0 flex items-center justify-center bg-ink/20"><span class="flex h-9 w-9 items-center justify-center rounded-full bg-canvas text-ink transition-transform duration-300 group-hover:scale-110">' + PLAY + '</span></span></span><span><span class="block font-display text-lg font-medium">' + esc(o.v.name) + '</span><span class="block text-[15px] text-ink/70">' + esc(o.v.role) + '</span></span></button>';
        }).join("") + '</div>' : "") +
        '<h2 class="mt-12 font-display text-xl font-medium">Also a good fit</h2><ul class="mt-3 border-t border-ink/10">' + ranked.slice(1, 3).map(function (k) {
          var c = careerById[k];
          return '<li class="border-b border-ink/10"><a href="careers.html#' + k + '" class="group flex items-center justify-between gap-4 py-5"><span><span class="block font-display text-lg font-medium">' + esc(c.name) + '</span><span class="mt-1 block text-[15px] text-ink/70">' + esc(c.short) + '</span></span><span class="transition-transform duration-300 group-hover:translate-x-1">' + ARROW + '</span></a></li>';
        }).join("") + '</ul></aside></div>', function () {
          $("[data-q-retake]", stage).addEventListener("click", function () { answers = []; step = 0; question(); });
          $("h1", stage).setAttribute("tabindex", "-1"); $("h1", stage).focus();
          window.scrollTo(0, 0);
        });
    };
    document.addEventListener("keydown", function (e) {
      if (step < 0 || step >= Q.length || /INPUT|TEXTAREA|SELECT/.test(document.activeElement.tagName)) return;
      if (lightbox && lightbox.classList.contains("is-open")) return;
      if (/^[1-4]$/.test(e.key)) { e.preventDefault(); choose(+e.key - 1); }
      else if (e.key === "Backspace") { e.preventDefault(); back(); }
    });
    start();
  }

  /* ---------- Contact form validation ---------- */
  var form = $("[data-contact]");
  if (form) {
    var rules = {
      fn: function (v) { return v ? "" : "Please enter your first name."; },
      ln: function (v) { return v ? "" : "Please enter your last name."; },
      em: function (v) { return !v ? "Please enter your email address." : (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) ? "" : "That email address doesn't look right."); },
      tp: function (v) { return v ? "" : "Please choose a topic."; },
      ms: function (v) { return v.length >= 10 ? "" : "Please write a little more (at least 10 characters)."; }
    };
    var check = function (id) {
      var el = document.getElementById(id), msg = rules[id](el.value.trim()), wrap = el.closest("[data-field]");
      wrap.classList.toggle("has-error", !!msg);
      el.setAttribute("aria-invalid", String(!!msg));
      document.getElementById(id + "-err").textContent = msg;
      return !msg;
    };
    Object.keys(rules).forEach(function (id) {
      var el = document.getElementById(id);
      el.addEventListener("blur", function () { if (el.value.trim()) check(id); });
      el.addEventListener("input", function () { if (el.closest("[data-field]").classList.contains("has-error")) check(id); });
    });
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var bad = Object.keys(rules).filter(function (id) { return !check(id); });
      if (bad.length) { document.getElementById(bad[0]).focus(); return; }
      $("[data-success-name]", form).textContent = document.getElementById("fn").value.trim();
      $("[data-form-fields]", form).classList.add("hidden");
      var ok = $("[data-form-success]", form); ok.classList.remove("hidden"); ok.focus();
    });
    var tour = $("[data-tour]");
    tour && tour.addEventListener("click", function () {
      var sel = document.getElementById("tp"); sel.value = "Request a facility tour";
      form.scrollIntoView({ behavior: REDUCED ? "auto" : "smooth", block: "start" });
      setTimeout(function () { document.getElementById("fn").focus({ preventScroll: true }); }, 400);
    });
  }

  $$("[data-year]").forEach(function (el) { el.textContent = new Date().getFullYear(); });
})();
