/* ============================================================
   GESTIÓN NATURA — Panel de administración (lógica)
   ============================================================ */
(function () {
  "use strict";

  var PAGE_LABELS = {
    "index": "Inicio", "nosotros": "Nosotros", "servicios": "Servicios",
    "proyectos": "Proyectos", "contacto": "Contacto",
    "como-trabajamos": "Proceso", "blog": "Blog"
  };
  var CAT_LABELS = { impacto: "Impacto ambiental", topografia: "Topografía", rellenos: "Rellenos sanitarios", residuos: "Manejo de residuos" };

  var db = null;
  var currentCat = "impacto";

  document.addEventListener("DOMContentLoaded", function () {
    if (!window.GN_DB) {
      show("notConfigured");
      return;
    }
    db = window.GN_DB;

    db.auth.getSession().then(function (res) {
      if (res.data && res.data.session) enterDashboard(res.data.session);
      else show("loginScreen");
    });

    db.auth.onAuthStateChange(function (event, session) {
      if (event === "SIGNED_IN" && session) enterDashboard(session);
      if (event === "SIGNED_OUT") { show("loginScreen"); }
    });

    document.getElementById("loginForm").addEventListener("submit", function (e) {
      e.preventDefault();
      var email = document.getElementById("loginEmail").value.trim();
      var pass = document.getElementById("loginPass").value;
      var err = document.getElementById("loginError");
      err.hidden = true;
      db.auth.signInWithPassword({ email: email, password: pass }).then(function (res) {
        if (res.error) { err.textContent = "Correo o contraseña incorrectos."; err.hidden = false; }
      });
    });

    document.getElementById("logoutBtn").addEventListener("click", function () {
      db.auth.signOut();
    });

    // Pestañas principales
    document.querySelectorAll(".admin-tab").forEach(function (btn) {
      btn.addEventListener("click", function () {
        document.querySelectorAll(".admin-tab").forEach(function (b) { b.classList.remove("active"); });
        document.querySelectorAll(".admin-panel").forEach(function (p) { p.classList.remove("active"); });
        btn.classList.add("active");
        var tab = btn.getAttribute("data-tab");
        document.getElementById("panel-" + tab).classList.add("active");
        if (tab === "banners") loadBanners();
        if (tab === "servicios") loadServices();
        if (tab === "fotos") loadGallery();
        if (tab === "blog") loadBlog();
      });
    });

    // Subpestañas de servicios
    document.querySelectorAll(".admin-subtab").forEach(function (btn) {
      btn.addEventListener("click", function () {
        document.querySelectorAll(".admin-subtab").forEach(function (b) { b.classList.remove("active"); });
        btn.classList.add("active");
        currentCat = btn.getAttribute("data-cat");
        loadServices();
      });
    });

    document.getElementById("serviceForm").addEventListener("submit", onAddService);
    document.getElementById("photoForm").addEventListener("submit", onAddPhoto);
    document.getElementById("blogForm").addEventListener("submit", onAddPost);

    // Tipo de entrada de blog: artículo propio vs. enlace a noticia
    document.querySelectorAll('#panel-blog .admin-subtabs .admin-subtab').forEach(function (btn) {
      btn.addEventListener("click", function () {
        document.querySelectorAll('#panel-blog .admin-subtabs .admin-subtab').forEach(function (b) { b.classList.remove("active"); });
        btn.classList.add("active");
        var isLink = btn.getAttribute("data-posttype") === "enlace";
        document.getElementById("fieldLink").hidden = !isLink;
        document.getElementById("fieldContent").hidden = isLink;
        document.getElementById("postLink").required = isLink;
      });
    });
  });

  function show(id) {
    ["notConfigured", "loginScreen", "dashboard"].forEach(function (x) {
      document.getElementById(x).hidden = x !== id;
    });
  }

  function enterDashboard(session) {
    show("dashboard");
    document.getElementById("userEmail").textContent = session.user.email;
    var editSlug = new URLSearchParams(location.search).get("edit");
    if (editSlug) {
      document.querySelectorAll(".admin-tab").forEach(function (b) { b.classList.remove("active"); });
      document.querySelectorAll(".admin-panel").forEach(function (p) { p.classList.remove("active"); });
      var blogTabBtn = document.querySelector('.admin-tab[data-tab="blog"]');
      if (blogTabBtn) blogTabBtn.classList.add("active");
      document.getElementById("panel-blog").classList.add("active");
      loadBlog().then(function () { jumpToPost(editSlug); });
    } else {
      loadBanners();
    }
  }
  function jumpToPost(slug) {
    var row = document.querySelector('.admin-row[data-slug="' + slug.replace(/"/g, "") + '"]');
    if (!row) return;
    row.scrollIntoView({ block: "center", behavior: "smooth" });
    row.classList.add("highlight");
    setTimeout(function () { row.classList.remove("highlight"); }, 2200);
  }

  function escapeHtml(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }
  function slugify(s) {
    return String(s).toLowerCase()
      .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
  }
  function uploadImage(file, folder) {
    var ext = (file.name.split(".").pop() || "jpg").toLowerCase();
    var path = folder + "/" + Date.now() + "-" + Math.random().toString(36).slice(2, 7) + "." + ext;
    return db.storage.from("media").upload(path, file, { upsert: true }).then(function (res) {
      if (res.error) throw res.error;
      return db.storage.from("media").getPublicUrl(path).data.publicUrl;
    });
  }
  // Sube varios archivos EN ORDEN (uno tras otro, no en paralelo, para no saturar la subida)
  function uploadMultiple(files, folder) {
    var urls = [];
    return Array.prototype.slice.call(files).reduce(function (chain, file) {
      return chain.then(function () { return uploadImage(file, folder); }).then(function (url) { urls.push(url); });
    }, Promise.resolve()).then(function () { return urls; });
  }
  function baseName(filename) {
    return String(filename || "").replace(/\.[^.]+$/, "").replace(/[_-]+/g, " ").trim();
  }
  // Las URLs subidas al dashboard son absolutas (https://...supabase.co/...);
  // las fotos de ejemplo precargadas son rutas relativas al sitio, que desde
  // /admin/ necesitan un nivel arriba para mostrarse en la miniatura.
  function adminImgSrc(url) {
    if (!url) return "";
    return /^https?:\/\//.test(url) ? url : "../" + url;
  }

  /* ================= BANNERS ================= */
  function loadBanners() {
    var wrap = document.getElementById("bannersList");
    wrap.innerHTML = "Cargando…";
    db.from("pages").select("*").then(function (res) {
      if (res.error) { wrap.textContent = "No se pudo cargar."; return; }
      var order = ["index", "nosotros", "servicios", "proyectos", "contacto", "como-trabajamos", "blog"];
      var rows = res.data.slice().sort(function (a, b) { return order.indexOf(a.slug) - order.indexOf(b.slug); });
      wrap.innerHTML = rows.map(function (p) { return bannerRowHtml(p); }).join("");
      window.GN_fillIcons(wrap);
      rows.forEach(bindBannerRow);
    });
  }
  function bannerRowHtml(p) {
    var extra = (p.images && p.images.length) ? p.images.length + " foto(s) adicionales" : "Sin fotos adicionales";
    return '<div class="admin-row" data-slug="' + p.slug + '">' +
      '<img class="thumb" src="' + adminImgSrc(p.hero_image_url) + '" alt="">' +
      '<div class="row-fields">' +
      '<b>' + (PAGE_LABELS[p.slug] || p.slug) + "</b>" +
      '<input type="text" class="f-eyebrow" placeholder="Texto pequeño arriba del título" value="' + escapeHtml(p.eyebrow || "") + '">' +
      '<input type="text" class="f-title" placeholder="Título grande" value="' + escapeHtml(p.title || "") + '">' +
      '<textarea class="f-sub" rows="2" placeholder="Texto debajo del título">' + escapeHtml(p.subtitle || "") + "</textarea>" +
      '<label class="row-imgcount">Foto principal<input type="file" class="f-file" accept="image/*"></label>' +
      '<label class="row-imgcount">Fotos adicionales (' + extra + ')<input type="file" class="f-extra" accept="image/*" multiple></label>' +
      "</div>" +
      '<div class="row-actions"><button class="btn btn-forest btn-save">Guardar</button></div>' +
      "</div>";
  }
  function bindBannerRow(p) {
    var row = document.querySelector('.admin-row[data-slug="' + p.slug + '"]');
    if (!row) return;
    row.querySelector(".btn-save").addEventListener("click", function () {
      var btn = row.querySelector(".btn-save");
      var file = row.querySelector(".f-file").files[0];
      var extraFiles = row.querySelector(".f-extra").files;
      btn.disabled = true; btn.textContent = "Guardando…";
      Promise.resolve()
        .then(function () { return file ? uploadImage(file, "banners") : null; })
        .then(function (imageUrl) {
          return Promise.all([imageUrl, extraFiles.length ? uploadMultiple(extraFiles, "banners") : []]);
        })
        .then(function (r) {
          var imageUrl = r[0], newImgs = r[1];
          var patch = {
            eyebrow: row.querySelector(".f-eyebrow").value,
            title: row.querySelector(".f-title").value,
            subtitle: row.querySelector(".f-sub").value
          };
          if (imageUrl) patch.hero_image_url = imageUrl;
          if (newImgs.length) patch.images = (p.images || []).concat(newImgs);
          return db.from("pages").update(patch).eq("slug", p.slug).then(function (res) {
            if (res.error) throw res.error;
            if (imageUrl) row.querySelector(".thumb").src = imageUrl;
            if (newImgs.length) { p.images = patch.images; loadBanners(); }
          });
        })
        .catch(function (er) { alertSaved(er); })
        .finally(function () { btn.disabled = false; btn.textContent = "Guardar"; });
    });
  }

  /* ================= SERVICIOS ================= */
  function loadServices() {
    var wrap = document.getElementById("servicesList");
    wrap.innerHTML = "Cargando…";
    db.from("services").select("*").eq("category", currentCat).order("sort_order").then(function (res) {
      if (res.error) { wrap.textContent = "No se pudo cargar."; return; }
      if (!res.data.length) { wrap.innerHTML = '<p class="admin-hint">Aún no hay servicios en ' + CAT_LABELS[currentCat] + ".</p>"; return; }
      wrap.innerHTML = res.data.map(serviceRowHtml).join("");
      window.GN_fillIcons(wrap);
      res.data.forEach(bindServiceRow);
    });
  }
  function serviceRowHtml(s) {
    var extra = (s.images && s.images.length) ? s.images.length + " foto(s)" : "Sin fotos";
    return '<div class="admin-row" data-id="' + s.id + '">' +
      '<div class="svc-ic" data-ic="' + s.icon + '" style="flex:none"></div>' +
      '<div class="row-fields">' +
      '<input type="text" class="f-title" value="' + escapeHtml(s.title) + '">' +
      '<textarea class="f-desc" rows="2">' + escapeHtml(s.description || "") + "</textarea>" +
      '<div class="two">' +
      '<input type="text" class="f-price" placeholder="Precio (opcional)" value="' + escapeHtml(s.price || "") + '">' +
      '<input type="number" class="f-order" value="' + (s.sort_order || 0) + '" title="Orden">' +
      "</div>" +
      '<label class="row-imgcount">Agregar fotos (' + extra + ')<input type="file" class="f-images" accept="image/*" multiple></label>' +
      "</div>" +
      '<div class="row-actions"><button class="btn btn-forest btn-save">Guardar</button><button class="btn btn-outline btn-del">Eliminar</button></div>' +
      "</div>";
  }
  function bindServiceRow(s) {
    var row = document.querySelector('.admin-row[data-id="' + s.id + '"]');
    if (!row) return;
    row.querySelector(".btn-save").addEventListener("click", function () {
      var btn = row.querySelector(".btn-save");
      var newFiles = row.querySelector(".f-images").files;
      btn.disabled = true; btn.textContent = "Guardando…";
      (newFiles.length ? uploadMultiple(newFiles, "services") : Promise.resolve([]))
        .then(function (newImgs) {
          var patch = {
            title: row.querySelector(".f-title").value,
            description: row.querySelector(".f-desc").value,
            price: row.querySelector(".f-price").value.trim() || null,
            sort_order: parseInt(row.querySelector(".f-order").value, 10) || 0
          };
          if (newImgs.length) patch.images = (s.images || []).concat(newImgs);
          return db.from("services").update(patch).eq("id", s.id).then(function (res) {
            if (res.error) throw res.error;
            if (newImgs.length) { s.images = patch.images; loadServices(); }
          });
        })
        .catch(function (er) { alertSaved(er); })
        .finally(function () { btn.disabled = false; btn.textContent = "Guardar"; });
    });
    row.querySelector(".btn-del").addEventListener("click", function () {
      if (!confirm("¿Eliminar este servicio?")) return;
      db.from("services").delete().eq("id", s.id).then(function (res) { if (!res.error) row.remove(); });
    });
  }
  function onAddService(e) {
    e.preventDefault();
    var icon = document.getElementById("svcIcon").value;
    var title = document.getElementById("svcTitle").value.trim();
    var desc = document.getElementById("svcDesc").value.trim();
    var price = document.getElementById("svcPrice").value.trim();
    var order = parseInt(document.getElementById("svcOrder").value, 10) || 0;
    var files = document.getElementById("svcImages").files;
    if (!title) return;
    var submitBtn = e.target.querySelector("button[type=submit]");
    submitBtn.disabled = true; submitBtn.textContent = "Guardando…";
    (files.length ? uploadMultiple(files, "services") : Promise.resolve([]))
      .then(function (imgs) {
        var row = { category: currentCat, icon: icon, title: title, description: desc, price: price || null, sort_order: order };
        if (imgs.length) row.images = imgs;
        return db.from("services").insert(row);
      })
      .then(function (res) {
        if (res.error) throw res.error;
        e.target.reset(); document.getElementById("svcOrder").value = 1; loadServices();
      })
      .catch(function (er) { alertSaved(er); })
      .finally(function () { submitBtn.disabled = false; submitBtn.textContent = "Agregar a esta categoría"; });
  }

  /* ================= FOTOS ================= */
  function loadGallery() {
    var wrap = document.getElementById("galleryList");
    wrap.innerHTML = "Cargando…";
    db.from("gallery_photos").select("*").order("sort_order").then(function (res) {
      if (res.error) { wrap.textContent = "No se pudo cargar."; return; }
      wrap.innerHTML = res.data.map(photoCardHtml).join("");
      res.data.forEach(bindPhotoCard);
    });
  }
  function photoCardHtml(p) {
    return '<div class="admin-photo-card" data-id="' + p.id + '">' +
      '<img src="' + adminImgSrc(p.image_url) + '" alt="">' +
      '<div class="pc-body">' +
      '<input type="text" class="f-tag" placeholder="Etiqueta" value="' + escapeHtml(p.tag || "") + '">' +
      '<input type="text" class="f-title" placeholder="Título" value="' + escapeHtml(p.title || "") + '">' +
      '<textarea class="f-desc" rows="2" placeholder="Descripción">' + escapeHtml(p.description || "") + "</textarea>" +
      '<div class="pc-actions"><button class="btn btn-forest btn-save">Guardar</button><button class="btn btn-outline btn-del">Eliminar</button></div>' +
      "</div></div>";
  }
  function bindPhotoCard(p) {
    var card = document.querySelector('.admin-photo-card[data-id="' + p.id + '"]');
    if (!card) return;
    card.querySelector(".btn-save").addEventListener("click", function () {
      db.from("gallery_photos").update({
        tag: card.querySelector(".f-tag").value,
        title: card.querySelector(".f-title").value,
        description: card.querySelector(".f-desc").value
      }).eq("id", p.id).then(function (res) { alertSaved(res.error); });
    });
    card.querySelector(".btn-del").addEventListener("click", function () {
      if (!confirm("¿Eliminar esta foto?")) return;
      db.from("gallery_photos").delete().eq("id", p.id).then(function (res) { if (!res.error) card.remove(); });
    });
  }
  function onAddPhoto(e) {
    e.preventDefault();
    var files = document.getElementById("photoFile").files;
    var err = document.getElementById("photoError");
    err.hidden = true;
    if (!files.length) return;
    var tag = document.getElementById("photoTag").value.trim();
    var titleGiven = document.getElementById("photoTitle").value.trim();
    var desc = document.getElementById("photoDesc").value.trim();
    var submitBtn = e.target.querySelector("button[type=submit]");
    submitBtn.disabled = true;
    submitBtn.textContent = "Subiendo " + files.length + " foto(s)…";
    uploadMultiple(files, "gallery").then(function (urls) {
      var rows = urls.map(function (url, i) {
        return {
          image_url: url,
          tag: tag,
          title: titleGiven || baseName(files[i].name),
          description: desc,
          sort_order: 0
        };
      });
      return db.from("gallery_photos").insert(rows);
    }).then(function (res) {
      if (res && res.error) throw res.error;
      e.target.reset(); loadGallery();
    }).catch(function (er) { err.textContent = "No se pudieron subir las fotos: " + (er.message || er); err.hidden = false; })
      .finally(function () { submitBtn.disabled = false; submitBtn.textContent = "Subir fotos"; });
  }

  /* ================= BLOG ================= */
  function loadBlog() {
    var wrap = document.getElementById("blogList");
    wrap.innerHTML = "Cargando…";
    return db.from("blog_posts").select("*").order("created_at", { ascending: false }).then(function (res) {
      if (res.error) { wrap.textContent = "No se pudo cargar."; return; }
      if (!res.data.length) { wrap.innerHTML = '<p class="admin-hint">Aún no hay artículos.</p>'; return; }
      wrap.innerHTML = res.data.map(postRowHtml).join("");
      res.data.forEach(bindPostRow);
    });
  }
  function postRowHtml(p) {
    var imgCount = (p.images && p.images.length) ? p.images.length + " foto(s) adicionales" : "Sin fotos adicionales";
    return '<div class="admin-row" data-id="' + p.id + '" data-slug="' + escapeHtml(p.slug || "") + '">' +
      (p.cover_image_url ? '<img class="thumb" src="' + adminImgSrc(p.cover_image_url) + '" alt="">' : '<div class="thumb" style="background:var(--paper-2)"></div>') +
      '<div class="row-fields">' +
      '<span class="admin-badge' + (p.published ? " on" : "") + '">' + (p.published ? "Publicado" : "Borrador") + "</span> " +
      (p.external_url ? '<span class="admin-badge link">Enlace externo</span>' : "") +
      '<input type="text" class="f-title" value="' + escapeHtml(p.title) + '">' +
      '<div class="two">' +
      '<input type="text" class="f-category" placeholder="Categoría" value="' + escapeHtml(p.category || "") + '">' +
      '<input type="url" class="f-link" placeholder="Enlace externo (opcional)" value="' + escapeHtml(p.external_url || "") + '">' +
      "</div>" +
      '<textarea class="f-excerpt" rows="2" placeholder="Resumen">' + escapeHtml(p.excerpt || "") + "</textarea>" +
      (p.external_url ? "" : '<textarea class="f-content" rows="4" placeholder="Contenido">' + escapeHtml(p.content || "") + "</textarea>") +
      '<span class="row-imgcount">' + imgCount + "</span>" +
      '<label style="display:flex;align-items:center;gap:8px;font-size:.88rem"><input type="checkbox" class="f-pub" style="width:auto"' + (p.published ? " checked" : "") + '> Publicado</label>' +
      "</div>" +
      '<div class="row-actions"><button class="btn btn-forest btn-save">Guardar</button><button class="btn btn-outline btn-del">Eliminar</button></div>' +
      "</div>";
  }
  function bindPostRow(p) {
    var row = document.querySelector('.admin-row[data-id="' + p.id + '"]');
    if (!row) return;
    row.querySelector(".btn-save").addEventListener("click", function () {
      var patch = {
        title: row.querySelector(".f-title").value,
        category: row.querySelector(".f-category").value,
        external_url: row.querySelector(".f-link").value.trim() || null,
        excerpt: row.querySelector(".f-excerpt").value,
        published: row.querySelector(".f-pub").checked
      };
      var contentEl = row.querySelector(".f-content");
      if (contentEl) patch.content = contentEl.value;
      db.from("blog_posts").update(patch).eq("id", p.id).then(function (res) { alertSaved(res.error); if (!res.error) loadBlog(); });
    });
    row.querySelector(".btn-del").addEventListener("click", function () {
      if (!confirm("¿Eliminar este artículo?")) return;
      db.from("blog_posts").delete().eq("id", p.id).then(function (res) { if (!res.error) row.remove(); });
    });
  }
  function onAddPost(e) {
    e.preventDefault();
    var title = document.getElementById("postTitle").value.trim();
    var err = document.getElementById("blogError");
    err.hidden = true;
    if (!title) return;
    var isLink = document.querySelector('#panel-blog .admin-subtab[data-posttype="enlace"]').classList.contains("active");
    var base = {
      slug: slugify(title) + "-" + Date.now().toString(36),
      title: title,
      category: document.getElementById("postCategory").value.trim(),
      excerpt: document.getElementById("postExcerpt").value.trim(),
      content: isLink ? "" : document.getElementById("postContent").value.trim(),
      external_url: isLink ? (document.getElementById("postLink").value.trim() || null) : null,
      published: document.getElementById("postPublished").checked
    };
    var coverFile = document.getElementById("postCover").files[0];
    var extraFiles = document.getElementById("postImages").files;
    var submitBtn = e.target.querySelector("button[type=submit]");
    submitBtn.disabled = true; submitBtn.textContent = "Guardando…";
    Promise.resolve()
      .then(function () { return coverFile ? uploadImage(coverFile, "blog") : null; })
      .then(function (coverUrl) { if (coverUrl) base.cover_image_url = coverUrl; return extraFiles.length ? uploadMultiple(extraFiles, "blog") : []; })
      .then(function (imgUrls) { if (imgUrls.length) base.images = imgUrls; return db.from("blog_posts").insert(base); })
      .then(function (res) {
        if (res.error) throw res.error;
        e.target.reset();
        document.querySelectorAll('#panel-blog .admin-subtabs .admin-subtab')[0].click();
        loadBlog();
      })
      .catch(function (er) { err.textContent = "No se pudo guardar: " + (er.message || er); err.hidden = false; })
      .finally(function () { submitBtn.disabled = false; submitBtn.textContent = "Guardar"; });
  }

  function alertSaved(error) {
    if (error) alert("No se pudo guardar: " + (error.message || error));
  }
})();
