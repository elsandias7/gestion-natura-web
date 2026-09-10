# Conectar el panel de administración (Supabase)

Esto se hace **una sola vez**. Después de esto, cualquier cambio que tú o tu tío
hagan desde `/admin/` aparece solo en el sitio, sin volver a publicar nada.

## 1. Crear la cuenta (gratis)

1. Entra a **[supabase.com](https://supabase.com)** y da clic en **Start your project**.
2. Regístrate con tu correo o con tu cuenta de Google (gratis, no pide tarjeta).
3. Da clic en **New project**.
   - **Name**: `gestion-natura`
   - **Database Password**: genera una y guárdala en un lugar seguro (no la necesitarás seguido).
   - **Region**: la más cercana a México (ej. `East US` o `South America`).
4. Espera 1-2 minutos mientras se crea el proyecto.

## 2. Crear las tablas

1. En el menú izquierdo, entra a **SQL Editor**.
2. Da clic en **New query**.
3. Abre el archivo [`supabase/schema.sql`](schema.sql) de esta carpeta, copia **todo** su contenido y pégalo ahí.
4. Da clic en **Run**. Debe decir "Success. No rows returned".

Esto crea las tablas (páginas, servicios, fotos, blog), la seguridad (solo alguien
con sesión iniciada puede editar) y deja precargado el contenido que el sitio ya
tiene hoy, para que el panel no arranque vacío.

## 3. Obtener las llaves

1. En el menú izquierdo: **Project Settings** (ícono de engrane) → **API**.
2. Copia dos valores:
   - **Project URL** (algo como `https://xxxxx.supabase.co`)
   - **anon public** key (una llave larga, empieza distinto a la `service_role`, **usa la `anon public`, nunca la `service_role`**)

## 4. Pegar las llaves en el sitio

Abre [`assets/js/supabase.config.js`](../assets/js/supabase.config.js) y reemplaza:

```js
window.GN_SUPABASE_URL = "";
window.GN_SUPABASE_ANON_KEY = "";
```

por tus valores reales:

```js
window.GN_SUPABASE_URL = "https://xxxxx.supabase.co";
window.GN_SUPABASE_ANON_KEY = "eyJhbG...tu-llave-completa";
```

Guarda el archivo y vuelve a subir el sitio **una sola vez** (arrastrando la
carpeta de nuevo en Cloudflare Pages → Deployments). Esta es la única vez que
hace falta volver a desplegar por este motivo.

## 4.b Si ya habías configurado el panel antes (actualización)

Si ya tenías las tablas creadas de una versión anterior, entra de nuevo al
**SQL Editor**, abre una **New query** y corre, en este orden (si ya corriste
alguno, sáltalo):

1. [`supabase/schema_update_2.sql`](schema_update_2.sql) — agrega el precio en
   servicios y los enlaces/fotos adicionales del blog.
2. [`supabase/schema_update_3.sql`](schema_update_3.sql) — permite varias fotos
   en los banners de cada página y en cada servicio del catálogo.
3. [`supabase/schema_update_4.sql`](schema_update_4.sql) — quita 2 fotos viejas
   y borrosas de la galería de Proyectos que se habían quedado guardadas de
   antes, y corrige un par de textos/fotos de banner que seguían con la
   versión vieja aunque el sitio ya se hubiera actualizado.

**Importante**: recuerda que una vez que el panel está conectado, el sitio
siempre muestra primero lo que hay guardado en la base de datos, no lo que
esté escrito en el código. Si cambias texto o fotos directamente en los
archivos del sitio pero esa página/sección ya tiene datos guardados en
Supabase (banners, servicios, galería, blog), el cambio en el código no se
va a notar hasta que también lo actualices ahí — ya sea desde `/admin/` o
con una consulta SQL como las de arriba.

Ninguno borra lo que ya tenías guardado.

## 5. Crear los usuarios del panel (tu tío y tú)

1. En Supabase, ve a **Authentication** → **Users**.
2. Da clic en **Add user** → **Create new user**.
3. Pon el correo de tu tío, marca **Auto Confirm User**, y asígnale una contraseña temporal (pídele que la cambie después desde ahí mismo, o compártesela por un medio seguro).
4. Repite el paso para tu propio correo.

## 6. Entrar al panel

Abre `tudominio.pages.dev/admin/` (o `/admin/index.html` en local) e inicia sesión
con el correo y contraseña que acabas de crear.

---

### Preguntas frecuentes

**¿Es seguro que la llave `anon` esté visible en el código del sitio?**
Sí. Está diseñada para ser pública: por sí sola solo permite *leer* datos. Nadie
puede editar nada sin iniciar sesión, gracias a las reglas de seguridad (RLS) que
ya vienen en `schema.sql`.

**¿Cuánto cuesta esto?**
Nada, mientras el sitio se mantenga en un tráfico normal de una pyme. El plan
gratuito de Supabase incluye 500 MB de base de datos y 1 GB de almacenamiento
para fotos, de sobra para este sitio.

**¿Qué pasa si algo sale mal al pegar las llaves?**
Nada se rompe: si `supabase.config.js` está vacío o mal, el sitio simplemente
sigue mostrando el contenido escrito a mano, como hasta ahora.
