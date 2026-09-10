# Gestión Natura — Sitio web (propuesta)

Sitio estático (HTML/CSS/JS, sin framework) para **Gestión Natura**, gestoría y consultoría
ambiental en Xalapa, Veracruz. Desplegado en **Cloudflare Pages** (subida directa de la carpeta
desde el navegador, sin Git ni línea de comandos; el archivo `_headers` ya trae la configuración
de caché y seguridad). También incluye `netlify.toml` por si en algún momento se vuelve a usar Netlify.

## Publicar el sitio (Cloudflare Pages)

**Primera vez:**
1. Crea una cuenta gratis en **[pages.cloudflare.com](https://pages.cloudflare.com)** (no pide tarjeta).
2. En el dashboard: **Workers & Pages** → **Create** → pestaña **Pages** → **Upload assets**.
3. Ponle un nombre al proyecto (ej. `gestion-natura`) y arrastra la carpeta del sitio (o el zip descomprimido).
4. Da clic en **Deploy site**. En unos segundos queda en `tunombre.pages.dev`.

**Para publicar cambios después:** entra al proyecto en el dashboard → pestaña **Deployments** →
**Create deployment** → arrastra la carpeta actualizada otra vez. No hace falta crear un proyecto nuevo.

## Estructura

```
index.html          Inicio
nosotros.html       Quiénes Somos (+ línea de tiempo)
servicios.html      Catálogo de servicios (4 categorías, editable desde /admin/)
como-trabajamos.html  "El proceso": corte de relleno animado por scroll (6 etapas)
proyectos.html      Galería (editable), Antes/Después, casos y sectores de cliente
blog.html           Listado de blog (editable desde /admin/)
blog-post.html      Plantilla de un artículo (?slug=...)
contacto.html       Formulario + datos + WhatsApp + mapa
admin/              Panel de administración (login + edición de banners, servicios, fotos y blog)
supabase/schema.sql Esquema de base de datos a ejecutar en Supabase
supabase/SETUP.md   Guía paso a paso para conectar el panel (una sola vez)
assets/css/style.css   Sistema de diseño (tokens, componentes, responsive)
assets/js/site.js      Header/Footer/WhatsApp compartidos + interacciones
assets/js/data.js      Lee contenido dinámico (Supabase) con respaldo al contenido escrito a mano
assets/js/supabase.config.js  Llaves de conexión (vacías hasta que sigas supabase/SETUP.md)
assets/img/logo.jpg    Logo
```

## Panel de administración (`/admin/`)

Desde `/admin/` (protegido con inicio de sesión) se pueden editar sin tocar código:
**el banner de cada página**, **el catálogo de servicios**, **las fotos de Proyectos**
y **los artículos del blog**. Los cambios aparecen en el sitio de inmediato, sin
volver a desplegar nada.

Para activarlo sigue **[`supabase/SETUP.md`](supabase/SETUP.md)** (10 minutos, cuenta
gratuita). Mientras no se configure, el sitio sigue funcionando normalmente con el
contenido que ya está escrito en cada página, no se rompe nada.

El **header, el footer y el botón de WhatsApp** se generan una sola vez desde `assets/js/site.js`
y se inyectan en todas las páginas. Para cambiar teléfono, correo, dirección o redes, edita el
objeto `SITE` al inicio de ese archivo (un solo lugar).

## Identidad visual

- Tipografías: **Zilla Slab** (títulos) + **Hanken Grotesk** (cuerpo) + **IBM Plex Mono** (datos/cotas), vía Google Fonts.
- Paleta cálida de marca (verde bosque/musgo, dorado/sol, café tierra, crema) + un bloque
  oscuro con acento **verde lima** usado SOLO en la franja de cifras y en la línea de tiempo.
- Elemento distintivo: **curvas de nivel topográficas** de fondo en los heroes (generadas por JS).

## Pendiente de reemplazar (placeholders marcados)

Todo lo temporal está señalado en el sitio con la etiqueta punteada "Imagen temporal" o el texto
`[Ejemplo — reemplazar con caso real]`:

1. **Fotos reales** de obra, geomembranas, topografía, personal en campo → sustituir los bloques
   `.ph` (ver `proyectos.html` e `index.html`) por `<img>` reales.
2. **Foto del Biól. Fabricio Capistrán** en `index.html` y `nosotros.html`.
3. **Trayectoria**: año de fundación e hitos reales en `nosotros.html` (hoy: 2020 y rol actual).
4. **Misión, visión y valores** en `nosotros.html` (borrador de ejemplo).
5. **Casos de proyecto** y **Antes/Después** en `proyectos.html` con datos e imágenes reales.
6. **Logos de clientes** (si hay autorización) en la franja de sectores de `proyectos.html`.

### Cómo reemplazar un placeholder de imagen

Cambia, por ejemplo:

```html
<div class="ph"><span class="ph-label">…</span></div>
```

por:

```html
<img src="assets/img/mi-foto.jpg" alt="Descripción de la foto" loading="lazy">
```

Usa imágenes optimizadas (WebP/JPG comprimido) para mantener el buen rendimiento.

## Formulario de contacto

Actualmente el formulario es una demo: valida y abre WhatsApp con el mensaje. Para recibir los
envíos por correo, conéctalo a un servicio como Formspree o a una función de Supabase (Cloudflare
Pages no tiene un equivalente propio a "Netlify Forms").

## Notas técnicas

- Mobile-first y responsive (375 / 768 / 1024 / 1440 px).
- Accesibilidad: foco visible, `prefers-reduced-motion` respetado, contraste AA, `aria-*` en nav y estado.
- SEO básico: `<title>` y `meta description` por página, estructura semántica, Open Graph.
- Sin librerías externas (solo Google Fonts y el iframe del mapa).
