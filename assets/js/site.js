/* ============================================================
   GESTIÓN NATURA — Lógica compartida del sitio
   Header/Footer/WhatsApp reutilizables + interacciones
   ============================================================ */
(function () {
  "use strict";

  /* ---------- Datos de contacto (fuente única) ---------- */
  var SITE = {
    name: "Gestión Natura",
    tagline: "Estudios y proyectos ambientales",
    phoneDisplay: "228 102 3848",
    phoneTel: "+522281023848",
    whatsapp: "https://wa.me/522281023848?text=" + encodeURIComponent("Hola, me gustaría platicar sobre un proyecto ambiental."),
    email: "gestionnaturaver@gmail.com",
    facebook: "https://www.facebook.com/GestionNatura",
    address: "Oriente 3 No. 28, Col. Ferrocarrilera, Xalapa, Veracruz, México, CP 91120",
    logo: "assets/img/logo.jpg"
  };

  /* Íconos: definidos en assets/js/icons.js (compartido con el panel) */
  var I = window.GN_ICONS || {};
  window.GN_SITE = SITE;

  /* ---------- Generador de curvas de nivel (topografía) ---------- */
  function topoSVG(seed) {
    seed = seed || 1;
    var rnd = function () { seed = (seed * 9301 + 49297) % 233280; return seed / 233280; };
    var paths = "";
    var cx = 60 + rnd() * 20, cy = 45 + rnd() * 20;
    for (var r = 6; r <= 60; r += 5.2) {
      var d = "M ";
      var pts = 26;
      for (var i = 0; i <= pts; i++) {
        var a = (i / pts) * Math.PI * 2;
        var wob = 1 + (rnd() - 0.5) * 0.28;
        var x = cx + Math.cos(a) * r * 1.5 * wob;
        var y = cy + Math.sin(a) * r * wob;
        d += (i === 0 ? "" : "L ") + x.toFixed(1) + " " + y.toFixed(1) + " ";
      }
      d += "Z";
      paths += '<path class="topo-line" d="' + d + '"/>';
    }
    return '<svg viewBox="0 0 180 120" preserveAspectRatio="xMidYMid slice" aria-hidden="true">' + paths + '</svg>';
  }

  /* ---------- HEADER ---------- */
  function buildHeader(active) {
    var links = [
      ["index", "Inicio", "/"],
      ["nosotros", "Nosotros", "nosotros"],
      ["servicios", "Servicios", "servicios"],
      ["como-trabajamos", "Proceso", "como-trabajamos"],
      ["proyectos", "Proyectos", "proyectos"],
      ["blog", "Blog", "blog"],
      ["contacto", "Contacto", "contacto"]
    ];
    var nav = links.map(function (l) {
      var cur = l[0] === active ? ' aria-current="page"' : "";
      return '<a href="' + l[2] + '"' + cur + ">" + l[1] + "</a>";
    }).join("");
    return '' +
      '<header class="site-header" id="siteHeader">' +
        '<div class="container">' +
          '<a class="brand" href="/" aria-label="Gestión Natura, inicio">' +
            '<img src="' + SITE.logo + '" alt="Logo de Gestión Natura" width="44" height="44">' +
            '<span class="brand-txt"><b>Gestión Natura</b><span>Estudios ambientales</span></span>' +
          '</a>' +
          '<nav class="nav" aria-label="Principal">' +
            '<div class="nav-links" id="navLinks">' + nav +
              '<a class="btn btn-primary nav-cta" href="contacto">Cotizar proyecto ' + wrapArrow() + '</a>' +
            '</div>' +
            '<a class="btn btn-primary" href="contacto">Cotizar proyecto ' + wrapArrow() + '</a>' +
            '<button class="nav-toggle" id="navToggle" aria-label="Abrir menú" aria-expanded="false" aria-controls="navLinks"><span></span></button>' +
          '</nav>' +
        '</div>' +
      '</header>';
  }
  function wrapArrow() { return '<span class="arrow">' + I.arrow + "</span>"; }

  /* ---------- FOOTER ---------- */
  function buildFooter() {
    return '' +
      '<footer class="site-footer">' +
        '<div class="container">' +
          '<div class="footer-top">' +
            '<div class="footer-col">' +
              '<div class="footer-brand">' +
                '<img src="' + SITE.logo + '" alt="Logo de Gestión Natura" width="46" height="46">' +
                '<span><b>Gestión Natura</b><br><span>Estudios y proyectos ambientales</span></span>' +
              '</div>' +
              '<p>Gestoría ambiental para iniciativa privada, ayuntamientos y organismos operadores. Más de 20 años de experiencia en saneamiento y rellenos sanitarios, con alcance nacional.</p>' +
              '<p style="margin-top:12px;color:rgba(255,255,255,.5);font-size:.82rem">Área ambiental de Grupo Novac (MMIC).</p>' +
              '<div class="footer-social">' +
                '<a href="' + SITE.facebook + '" target="_blank" rel="noopener" aria-label="Facebook de Gestión Natura">' + I.facebook + '</a>' +
                '<a href="' + SITE.whatsapp + '" target="_blank" rel="noopener" aria-label="WhatsApp de Gestión Natura">' + I.whatsapp + '</a>' +
                '<a href="mailto:' + SITE.email + '" aria-label="Enviar correo">' + I.mail + '</a>' +
              '</div>' +
            '</div>' +
            '<div class="footer-col">' +
              '<h5>Navegación</h5>' +
              '<a href="/">Inicio</a><a href="nosotros">Nosotros</a>' +
              '<a href="servicios">Servicios</a><a href="como-trabajamos">Proceso</a>' +
              '<a href="proyectos">Proyectos</a><a href="blog">Blog</a>' +
              '<a href="contacto">Contacto</a>' +
            '</div>' +
            '<div class="footer-col">' +
              '<h5>Servicios</h5>' +
              '<a href="servicios">Impacto y riesgo ambiental</a>' +
              '<a href="servicios">Topografía e hidrología</a>' +
              '<a href="servicios">Rellenos sanitarios</a>' +
              '<a href="servicios">Manejo de residuos</a>' +
            '</div>' +
            '<div class="footer-col">' +
              '<h5>Contacto</h5>' +
              '<p>' + SITE.address + '</p>' +
              '<a href="tel:' + SITE.phoneTel + '">Tel / WhatsApp: ' + SITE.phoneDisplay + '</a>' +
              '<a href="mailto:' + SITE.email + '">' + SITE.email + '</a>' +
            '</div>' +
          '</div>' +
          '<div class="footer-bottom">' +
            '<span>© ' + new Date().getFullYear() + ' Gestión Natura. Todos los derechos reservados.</span>' +
            '<span>Biól. Fabricio Capistrán Hernández, Gerente de Proyectos · Xalapa, Veracruz</span>' +
          '</div>' +
        '</div>' +
      '</footer>';
  }

  /* ---------- WhatsApp flotante ---------- */
  function buildWA() {
    return '<a class="wa-float" href="' + SITE.whatsapp + '" target="_blank" rel="noopener" aria-label="Escríbenos por WhatsApp">' + I.whatsapp + '</a>';
  }

  /* ---------- Init ---------- */
  document.addEventListener("DOMContentLoaded", function () {
    var active = document.body.getAttribute("data-page") || "";
    var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // Habilita la secuencia orquestada del hero (si el usuario no pidió menos movimiento)
    if (!reduce) document.body.classList.add("js-anim");

    // Zoom lento de la foto del hero (descenso tipo dron) — una sola vez
    var heroImg = document.querySelector(".hero-media img");
    if (heroImg && !reduce) requestAnimationFrame(function () { heroImg.classList.add("zoomed"); });

    // Corte de celda: construir estratos al entrar en pantalla (una sola vez)
    document.querySelectorAll(".cell-figure").forEach(function (fig) {
      if (reduce || !("IntersectionObserver" in window)) { fig.classList.add("cell-built"); return; }
      var o = new IntersectionObserver(function (en) {
        en.forEach(function (e) { if (e.isIntersecting) { fig.classList.add("cell-built"); o.disconnect(); } });
      }, { threshold: 0.35 });
      o.observe(fig);
    });

    // Inyectar header al inicio, footer + WA al final
    document.body.insertAdjacentHTML("afterbegin", buildHeader(active));
    document.body.insertAdjacentHTML("beforeend", buildFooter() + buildWA());

    // Rellenar íconos declarados con data-ic
    window.GN_fillIcons();

    // Rellenar curvas de nivel
    document.querySelectorAll("[data-topo]").forEach(function (el) {
      el.innerHTML = topoSVG(parseInt(el.getAttribute("data-topo"), 10) || 1);
    });

    // Enlaces de contacto dinámicos
    document.querySelectorAll("[data-wa]").forEach(function (el) { el.setAttribute("href", SITE.whatsapp); });
    document.querySelectorAll("[data-tel]").forEach(function (el) { el.setAttribute("href", "tel:" + SITE.phoneTel); });
    document.querySelectorAll("[data-mail]").forEach(function (el) { el.setAttribute("href", "mailto:" + SITE.email); });

    // Header scrolled
    var header = document.getElementById("siteHeader");
    var onScroll = function () {
      if (window.scrollY > 20) header.classList.add("scrolled");
      else header.classList.remove("scrolled");
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });

    // Menú móvil
    var toggle = document.getElementById("navToggle");
    var navLinks = document.getElementById("navLinks");
    if (toggle) {
      toggle.addEventListener("click", function () {
        var open = document.body.classList.toggle("nav-open");
        toggle.setAttribute("aria-expanded", open ? "true" : "false");
        toggle.setAttribute("aria-label", open ? "Cerrar menú" : "Abrir menú");
      });
      navLinks.addEventListener("click", function (e) {
        if (e.target.closest("a")) {
          document.body.classList.remove("nav-open");
          toggle.setAttribute("aria-expanded", "false");
        }
      });
    }

    // Cifras que suben desde 0 al entrar en pantalla (una sola vez)
    var counters = document.querySelectorAll("[data-count]");
    var runCounter = function (el) {
      var target = parseFloat(el.getAttribute("data-count"));
      var prefix = el.getAttribute("data-prefix") || "";
      var suffix = el.getAttribute("data-suffix") || "";
      if (reduce || isNaN(target)) { el.textContent = prefix + target + suffix; return; }
      var start = null, dur = 1100;
      var step = function (ts) {
        if (!start) start = ts;
        var p = Math.min(1, (ts - start) / dur);
        var eased = 1 - Math.pow(1 - p, 3);
        el.textContent = prefix + Math.round(eased * target) + suffix;
        if (p < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    };
    if ("IntersectionObserver" in window && counters.length) {
      var ioCount = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) {
          if (en.isIntersecting) { runCounter(en.target); ioCount.unobserve(en.target); }
        });
      }, { threshold: 0.4 });
      counters.forEach(function (c) { ioCount.observe(c); });
    } else {
      counters.forEach(function (c) { c.textContent = (c.getAttribute("data-prefix") || "") + c.getAttribute("data-count") + (c.getAttribute("data-suffix") || ""); });
    }

    // Reveal on scroll
    var reveals = document.querySelectorAll(".reveal");
    if ("IntersectionObserver" in window && reveals.length) {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) {
          if (en.isIntersecting) { en.target.classList.add("in"); io.unobserve(en.target); }
        });
      }, { threshold: 0.12, rootMargin: "0px 0px -8% 0px" });
      reveals.forEach(function (r) { io.observe(r); });
    } else {
      reveals.forEach(function (r) { r.classList.add("in"); });
    }

    // Proceso: corte animado controlado por scroll (sticky + IntersectionObserver)
    (function () {
      var fig = document.querySelector(".scrolly-fig .fig");
      var steps = document.querySelectorAll(".scrolly-steps .step");
      if (!fig || !steps.length) return;
      var desktop = window.matchMedia("(min-width: 821px)").matches;
      if (reduce || !desktop || !("IntersectionObserver" in window)) return; // fallback estático
      fig.classList.add("js-scrolly");
      var prog = fig.querySelector(".fig-progress b");
      function setStage(n) {
        fig.setAttribute("data-stage", n);
        fig.classList.toggle("dig", n >= 2);
        fig.querySelectorAll(".st").forEach(function (g) {
          g.classList.toggle("on", (+g.getAttribute("data-st")) <= n);
        });
        if (prog) prog.textContent = ("0" + n).slice(-2);
        steps.forEach(function (st) { st.classList.toggle("current", (+st.getAttribute("data-stage")) === n); });
      }
      setStage(1);
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) { if (e.isIntersecting) setStage(+e.target.getAttribute("data-stage")); });
      }, { rootMargin: "-45% 0px -45% 0px", threshold: 0 });
      steps.forEach(function (s) { io.observe(s); });
    })();

    // Slider Antes/Después
    document.querySelectorAll("[data-ba]").forEach(function (root) {
      var after = root.querySelector(".ba-after");
      var divider = root.querySelector(".ba-divider");
      var handle = root.querySelector(".ba-handle");
      var range = root.querySelector(".ba-range");
      var set = function (v) {
        v = Math.max(0, Math.min(100, v));
        after.style.clipPath = "inset(0 0 0 " + v + "%)";
        divider.style.left = v + "%";
        handle.style.left = v + "%";
        if (range) range.value = v;
      };
      if (range) range.addEventListener("input", function () { set(parseFloat(range.value)); });
      set(50);
    });

    // Formulario de contacto (demo — sin backend real)
    var form = document.getElementById("contactForm");
    if (form) {
      form.addEventListener("submit", function (e) {
        e.preventDefault();
        var status = document.getElementById("formStatus");
        var data = new FormData(form);
        // Construye mensaje para WhatsApp como respaldo inmediato
        var msg = "Hola, soy " + (data.get("nombre") || "") +
          ". Servicio de interés: " + (data.get("servicio") || "—") +
          ". " + (data.get("mensaje") || "");
        if (status) {
          status.className = "form-status ok";
          status.textContent = "¡Gracias! Recibimos tus datos. Te contactamos muy pronto. También puedes escribirnos directo por WhatsApp.";
        }
        // Ofrecer continuar por WhatsApp
        window.open("https://wa.me/522281023848?text=" + encodeURIComponent(msg), "_blank", "noopener");
        form.reset();
      });
    }
  });
})();
