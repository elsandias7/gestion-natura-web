# Gestión Natura — Contexto para rediseño visual

Este documento es para que retomes el trabajo de diseño del sitio sin tener que descubrir todo desde cero. El sitio funciona y está desplegado; lo que se busca ahora es un cambio visual más fuerte que el que se ha logrado hasta ahora.

## Qué es el proyecto

Sitio web + panel de administración para **Gestión Natura**, consultoría ambiental e ingeniería de rellenos sanitarios en Xalapa, Veracruz, México. Más de 20 años de experiencia, 30+ proyectos, alcance nacional. Clientes: iniciativa privada, ayuntamientos, organismos operadores de agua/residuos. Diferenciador del cliente: *"No ofrecemos solo estudios, le damos soluciones."*

## Stack técnico (importante, no asumir un framework)

- **HTML/CSS/JS puro, sin build step, sin framework.** No hay npm, no hay React/Vue, no hay bundler.
- Todo el sistema de diseño vive en **`assets/css/style.css`**. Las variables CSS (`:root { --algo: valor }`) al inicio del archivo controlan colores, tipografía, espaciado y radios de todo el sitio — cambiar esos tokens cambia todo de una vez.
- JS vanilla en `assets/js/` (`site.js` = header/footer/animaciones, `data.js` = carga contenido dinámico desde Supabase, `icons.js` = íconos SVG inline).
- Backend: **Supabase** (Postgres + Auth + Storage) para el panel de administración en `/admin/`. El sitio público sigue funcionando con contenido escrito a mano si Supabase falla o no está configurado (no romper ese comportamiento).
- Hosting: **Cloudflare Pages** (subida manual de la carpeta, sin Git). El archivo `_headers` controla el caché — cualquier archivo CSS/JS/imagen que cambie de contenido necesita un `?v=N` nuevo en su URL o el navegador de un visitante anterior se queda con la versión vieja.
- Páginas: `index.html`, `nosotros.html`, `servicios.html`, `proyectos.html`, `como-trabajamos.html` (el corte 3D con three.js), `blog.html`, `blog-post.html`, `contacto.html`, `admin/index.html`.

## Lo que ya se intentó (y no fue suficiente para el cliente)

En orden cronológico, dentro de la misma sesión de trabajo:
1. Quitar patrones de "IA genérica": tarjeta de vidrio flotante con blur, manchas orgánicas decorativas, franjas de color (`border-left`) en listas, iconos grandes en cajas redondeadas sobre cada título.
2. Simplificar contenido: menos texto por sección, menos tarjetas repetidas, contadores animados en vez de descripciones largas.
3. Reformatear Servicios de tarjetas con borde a una lista numerada tipo "ficha técnica" (sin cajas).
4. Aplanar todo: quitar `border-radius`, sombras y marcos de fotos y tarjetas (headers, tiles, cases) para que las fotos queden a raíz, sin marco — inspirado en `three.com.mx/projects`.
5. Cambiar botones de píldora rellena a texto + flecha, sin fondo, en el hero.
6. **Cambio de paleta completo**: de verde bosque + dorado + papel crema (con líneas topográficas de fondo) a **blanco puro + negro neutro + un solo acento verde lima** (`#B4E63A` / `#C6F24E`), quitando la textura de "papel de plano" de fondo.

**Resultado**: cada paso individual fue verificado como un cambio real (no fue un bug de caché), pero el cliente sigue sintiendo que "es la misma línea" — el veredicto más reciente fue que se necesita un salto más grande, no otro ajuste incremental.

## Las 3 referencias que dio el cliente (analízalas de nuevo, no asumas mi lectura)

1. **https://true-environmental.com** — la más débil de las 3; referencia de qué NO hacer (usa Inter, franjas con triángulos, iconos de hojita genéricos). Lo único rescatable: tarjetas oscuras con imágenes abstractas de datos.
2. **https://www.three.com.mx** y **https://www.three.com.mx/projects** — la más editorial/premium: hero con frases citando a figuras públicas sobre foto de naturaleza a pantalla completa, navegación mínima (solo iconos, sin texto visible), tipografía Gilroy/Century-Gothic-like en negrita con palabras resaltadas en verde lima dentro del texto, fotos de proyecto SIN marco/sombra/radio (a raíz, pegadas al borde), tabs de filtro tipo texto subrayado.
3. **https://www.grupo-trs.com** — el más parecido al giro del cliente (rellenos sanitarios en México): hero con VIDEO aéreo real de dron a pantalla completa, paleta lima sobre negro, contadores animados, línea de tiempo real, portafolio de proyectos con tarjetas de estatus real ("Operando"/"Completado") + capacidad técnica ("MRF 400 ton/día").

## Qué evitar explícitamente

- Fuentes genéricas: Inter, Roboto, la lista larga de "fuentes reflejo" que cualquier skill de diseño de IA ya conoce (Fraunces, Space Grotesk, DM Sans, etc.).
- Gradientes decorativos, glassmorphism, tarjetas anidadas, iconos grandes en cajas redondeadas sobre encabezados, franjas de acento (`border-left`), sparklines decorativos, plantilla de "métrica hero".
- Que se vea "hecho por IA" a primera vista — es la prueba que el cliente sigue aplicando y en la que sentimos que fallamos.

## Fotografía real disponible

Hay fotos reales de campo (no usar más placeholders genéricos) en `assets/img/photos/`: geomembrana HDPE, vistas aéreas de rellenos, cuadrillas trabajando, evolución de una celda en 3 meses, sitios antes/después. Aprovéchalas a pantalla completa sin recortarlas en tarjetas pequeñas.

## Contenido pendiente de datos reales (no inventar)

- Foto real del Biól. Fabricio Capistrán Hernández (Gerente de Proyectos) — no existe todavía, hay un placeholder marcado.
- Misión/Visión/Valores — se quitaron de Nosotros por ser contenido de ejemplo; falta la redacción oficial.
- Año de fundación e hitos reales de la trayectoria.
- Fotos reales de topografía (con estación total) y de capacitación de personal — no hay ninguna en el archivo todavía.

## Cuando termines el rediseño

Avísame para retomar: conectar cualquier componente nuevo con `data.js`/`admin.js` si aplica (para que el panel de administración lo pueda seguir editando), subir cache-busting (`?v=N`) en todo lo que haya cambiado, y volver a desplegar en Cloudflare Pages.
