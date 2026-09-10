/* ============================================================
   GESTIÓN NATURA — Contenido dinámico (Supabase)
   ------------------------------------------------------------
   Lee banners, servicios, fotos y blog desde la base de datos.
   Si GN_DB no está configurado (ver supabase.config.js) o algo
   falla, esta capa NO hace nada: el sitio se queda tal cual con
   el contenido escrito a mano en cada página.
   ============================================================ */
(function () {
  "use strict";

  document.addEventListener("DOMContentLoaded", function () {
    if (!window.GN_DB) return; // Supabase aún no configurado: no tocar nada

    var db = window.GN_DB;
    var slug = (document.body.getAttribute("data-page") || "").replace(/\.html$/, "") || "index";

    loadBanner(slug);
    loadServices();
    loadGallery();
    loadBlogList();
  });

  /* ---------- Banner de la página (hero / pagehero) ---------- */
  function loadBanner(slug) {
    window.GN_DB.from("pages").select("*").eq("slug", slug).maybeSingle()
      .then(function (res) {
        if (res.error || !res.data) return;
        var p = res.data;
        var heroImg = document.querySelector(".hero-media img, .pagehero-media img");
        if (p.hero_image_url && heroImg) heroImg.src = p.hero_image_url;

        var marker = document.querySelector(".hero .marker, .pagehero .marker");
        if (p.eyebrow && marker) marker.textContent = p.eyebrow;

        var sub = document.querySelector(".hero-sub, .pagehero p.sub");
        if (p.subtitle && sub) sub.textContent = p.subtitle;

        // El título (h1) del hero oscuro de Inicio lleva un <span> de acento;
        // solo se sobrescribe en páginas internas donde el h1 es texto simple.
        var isPageHero = document.querySelector(".pagehero");
        var h1 = document.querySelector(".pagehero h1");
        if (isPageHero && p.title && h1) h1.textContent = p.title;

        // Rotación suave si hay más de una foto para este banner
        var gallery = [p.hero_image_url].concat(p.images || []).filter(Boolean);
        if (heroImg && gallery.length > 1 && !prefersReducedMotion()) {
          var i = 0;
          setInterval(function () {
            i = (i + 1) % gallery.length;
            heroImg.style.opacity = "0";
            setTimeout(function () { heroImg.src = gallery[i]; heroImg.style.opacity = "1"; }, 450);
          }, 6000);
        }
      })
      .catch(function () {});
  }

  function prefersReducedMotion() {
    return window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }

  /* ---------- Catálogo de servicios (servicios.html) ---------- */
  function loadServices() {
    var containers = document.querySelectorAll("[data-services]");
    if (!containers.length) return;
    window.GN_DB.from("services").select("*").order("sort_order", { ascending: true })
      .then(function (res) {
        if (res.error || !res.data || !res.data.length) return;
        var byCat = {};
        res.data.forEach(function (s) {
          (byCat[s.category] = byCat[s.category] || []).push(s);
        });
        containers.forEach(function (el) {
          var cat = el.getAttribute("data-services");
          var rows = byCat[cat];
          if (!rows || !rows.length) return; // sin datos para esta categoría: deja el contenido escrito a mano
          el.innerHTML = rows.map(function (s) {
            var photos = (s.images && s.images.length)
              ? '<div class="svc-photos">' + s.images.slice(0, 4).map(function (u) {
                  return '<img src="' + u + '" alt="" loading="lazy">';
                }).join("") + (s.images.length > 4 ? '<span class="svc-photos-more">+' + (s.images.length - 4) + "</span>" : "") + "</div>"
              : "";
            return '<article class="svc-row"><div>' +
              "<h3>" + escapeHtml(s.title) + "</h3>" +
              (s.description ? "<p>" + escapeHtml(s.description) + "</p>" : "") +
              (s.price ? '<span class="svc-price">' + escapeHtml(s.price) + "</span>" : "") +
              photos +
              "</div></article>";
          }).join("");
        });
      })
      .catch(function () {});
  }

  /* ---------- Galería de fotos (proyectos.html) ---------- */
  function loadGallery() {
    var el = document.querySelector("[data-gallery]");
    if (!el) return;
    window.GN_DB.from("gallery_photos").select("*").order("sort_order", { ascending: true })
      .then(function (res) {
        if (res.error || !res.data || !res.data.length) return;
        el.innerHTML = res.data.map(function (p) {
          return '<figure class="tile"><div class="media"><img src="' + p.image_url + '" alt="' + escapeHtml(p.title || "") + '" loading="lazy"></div>' +
            '<figcaption class="tile-body">' +
            (p.tag ? '<span class="tile-tag">' + escapeHtml(p.tag) + "</span>" : "") +
            (p.title ? "<h4>" + escapeHtml(p.title) + "</h4>" : "") +
            (p.description ? "<p>" + escapeHtml(p.description) + "</p>" : "") +
            "</figcaption></figure>";
        }).join("");
      })
      .catch(function () {});
  }

  /* ---------- Listado de blog (blog.html) ---------- */
  function loadBlogList() {
    var el = document.querySelector("[data-blog-list]");
    if (!el) return;
    window.GN_DB.from("blog_posts").select("*").eq("published", true).order("created_at", { ascending: false })
      .then(function (res) {
        if (res.error || !res.data || !res.data.length) return; // sin posts publicados: deja los de ejemplo
        el.innerHTML = res.data.map(function (post) {
          var isLink = !!post.external_url;
          var href = isLink ? post.external_url : ("blog-post.html?slug=" + encodeURIComponent(post.slug));
          var target = isLink ? ' target="_blank" rel="noopener"' : "";
          return '<article class="svc">' +
            (post.cover_image_url ? '<a class="blog-thumb" href="' + href + '"' + target + '><img src="' + post.cover_image_url + '" alt="" loading="lazy"></a>' : "") +
            (post.category ? '<span class="tile-tag">' + escapeHtml(post.category) + "</span>" : "") +
            (isLink ? ' <span class="tile-tag" style="color:var(--gold-600)">Enlace externo</span>' : "") +
            '<h3 style="margin-top:14px"><a href="' + href + '"' + target + ">" + escapeHtml(post.title) + "</a></h3>" +
            (post.excerpt ? "<p>" + escapeHtml(post.excerpt) + "</p>" : "") +
            '<a class="svc-link" href="' + href + '"' + target + ">" + (isLink ? "Ver noticia" : "Leer más") + ' <span data-ic="' + (isLink ? "arrowUR" : "arrow") + '"></span></a>' +
            "</article>";
        }).join("");
        window.GN_fillIcons(el);
      })
      .catch(function () {});
  }

  function escapeHtml(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }
})();
