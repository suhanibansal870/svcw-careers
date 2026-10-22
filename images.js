/* All site photos live here. TEMPORARY: free Unsplash photos (unsplash.com/license) used as stand-ins.
   To swap a photo, change its "src" to any image URL or local path (e.g. "assets/photos/hero.jpg").
   Unsplash IDs get responsive sizes automatically. */
window.GC_IMAGES = {
  "hero": {
    "src": "photo-1533163238111-4a7ced54f2e4",
    "alt": "Aerial view of round and rectangular water treatment tanks",
    "credit": "Ivan Bandura",
    "temporary": true
  },
  "aerial": {
    "src": "photo-1533077162801-86490c593afb",
    "alt": "Top-down view of concrete treatment structures",
    "credit": "Ivan Bandura",
    "temporary": true
  },
  "water": {
    "src": "photo-1568487007364-175e0d26233b",
    "alt": "Close-up of clear flowing water",
    "credit": "Aris Rovas",
    "temporary": true
  },
  "operations": {
    "src": "photo-1620203853151-496c7228306c",
    "alt": "Network of industrial pipes and valves",
    "credit": "Ricardo Gomez Angel",
    "temporary": true
  },
  "environment": {
    "src": "photo-1676768310067-e9431ad7e52b",
    "alt": "Grassy wetland with water in the distance",
    "credit": "Blair Morris",
    "temporary": true
  },
  "river": {
    "src": "photo-1633890354162-7be5cc2929fe",
    "alt": "River running through a green field",
    "credit": "Simon Hurry",
    "temporary": true
  }
};

(function () {
  var W = [480, 800, 1200, 1600, 2000];
  function url(src, w) {
    if (/^photo-/.test(src)) return "https://images.unsplash.com/" + src + "?auto=format&fit=crop&q=70&w=" + w;
    return src;
  }
  window.GC_applyImages = function (root) {
    (root || document).querySelectorAll("img[data-img]:not([data-img-done])").forEach(function (el) {
      var item = window.GC_IMAGES[el.getAttribute("data-img")];
      if (!item) return;
      el.setAttribute("data-img-done", "");
      el.addEventListener("error", function () { el.style.opacity = "0"; });
      el.addEventListener("load", function () { el.classList.add("is-loaded"); });
      if (/^photo-/.test(item.src)) {
        el.srcset = W.map(function (w) { return url(item.src, w) + " " + w + "w"; }).join(", ");
      }
      el.src = url(item.src, 1200);
      if (!el.alt) el.alt = item.alt;
    });
  };
  if (document.readyState !== "loading") window.GC_applyImages();
  else document.addEventListener("DOMContentLoaded", function () { window.GC_applyImages(); });
})();
