-- ============================================================
-- GESTIÓN NATURA — Esquema de base de datos (Supabase / Postgres)
-- Ejecutar completo, una sola vez, en: Supabase → SQL Editor → New query
-- ============================================================

-- ---------- Extensión para generar IDs ----------
create extension if not exists "pgcrypto";

-- ---------- Tabla: pages (banner de cada página) ----------
create table if not exists pages (
  slug text primary key,
  hero_image_url text,
  images text[],                   -- fotos adicionales del banner (opcional)
  eyebrow text,
  title text,
  subtitle text,
  updated_at timestamptz default now()
);

-- ---------- Tabla: services (catálogo de servicios) ----------
create table if not exists services (
  id uuid primary key default gen_random_uuid(),
  category text not null,          -- 'impacto' | 'topografia' | 'rellenos' | 'residuos'
  icon text not null default 'leaf',
  title text not null,
  description text,
  price text,                      -- ej. "Desde $8,000" o "Cotización" (opcional)
  images text[],                   -- fotos adicionales del servicio (opcional)
  sort_order int default 0,
  created_at timestamptz default now()
);

-- ---------- Tabla: gallery_photos (fotos de Proyectos) ----------
create table if not exists gallery_photos (
  id uuid primary key default gen_random_uuid(),
  image_url text not null,
  tag text,
  title text,
  description text,
  sort_order int default 0,
  created_at timestamptz default now()
);

-- ---------- Tabla: blog_posts ----------
create table if not exists blog_posts (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  category text,
  title text not null,
  excerpt text,
  content text,
  cover_image_url text,
  external_url text,               -- si se llena, la entrada es un enlace a una noticia externa
  images text[],                   -- fotos adicionales del artículo (opcional)
  published boolean default false,
  created_at timestamptz default now()
);

-- ============================================================
-- SEGURIDAD (RLS): cualquiera puede LEER; solo un usuario con
-- sesión iniciada (el dashboard) puede escribir.
-- ============================================================
alter table pages enable row level security;
alter table services enable row level security;
alter table gallery_photos enable row level security;
alter table blog_posts enable row level security;

create policy "pages_public_read" on pages for select using (true);
create policy "pages_auth_write" on pages for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

create policy "services_public_read" on services for select using (true);
create policy "services_auth_write" on services for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

create policy "gallery_public_read" on gallery_photos for select using (true);
create policy "gallery_auth_write" on gallery_photos for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

create policy "posts_public_read_published" on blog_posts for select using (published = true);
create policy "posts_auth_read_all" on blog_posts for select using (auth.role() = 'authenticated');
create policy "posts_auth_write" on blog_posts for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

-- ============================================================
-- ALMACENAMIENTO (fotos que suba tu tío desde el dashboard)
-- ============================================================
insert into storage.buckets (id, name, public)
values ('media', 'media', true)
on conflict (id) do nothing;

create policy "media_public_read" on storage.objects for select using (bucket_id = 'media');
create policy "media_auth_upload" on storage.objects for insert with check (bucket_id = 'media' and auth.role() = 'authenticated');
create policy "media_auth_update" on storage.objects for update using (bucket_id = 'media' and auth.role() = 'authenticated');
create policy "media_auth_delete" on storage.objects for delete using (bucket_id = 'media' and auth.role() = 'authenticated');

-- ============================================================
-- CONTENIDO INICIAL (lo que el sitio ya muestra hoy, para que
-- el dashboard arranque poblado en vez de vacío)
-- ============================================================
insert into pages (slug, hero_image_url, eyebrow, title, subtitle) values
('index',           'assets/img/photos/hero-relleno.jpg', '19.54°N  96.91°W  ·  Xalapa, Veracruz', 'Convertimos un basurero en un relleno que cumple.', 'Más de 20 años de experiencia en consultoría ambiental e ingeniería de rellenos sanitarios, con alcance nacional.'),
('nosotros',        'assets/img/photos/hero-relleno.jpg', 'Quiénes somos', 'Un referente de consultoría ambiental en el Sur de México', 'Alto nivel de exigencia técnica, trato honesto y cercano.'),
('servicios',       'assets/img/photos/hero-relleno.jpg', 'Catálogo de servicios', 'Todo el proyecto ambiental, del estudio a la operación', 'Cuatro áreas de especialidad bajo un mismo responsable.'),
('proyectos',       'assets/img/photos/geomembrana.jpg',  'Proyectos', 'Trabajo real, resultados que perduran', 'Fotografía real de obra, del archivo de Gestión Natura.'),
('contacto',        'assets/img/photos/hero-relleno.jpg', 'Contacto', 'Platícanos tu proyecto', 'Estamos seguros de que podemos ayudarte.'),
('como-trabajamos', 'assets/img/photos/geomembrana.jpg',  'El proceso', 'Cómo se construye un relleno sanitario', 'Un corte de ingeniería en 3D, etapa por etapa.'),
('blog',            'assets/img/photos/hero-relleno.jpg',   'Blog', 'Ideas y contexto técnico sobre gestión ambiental', 'Notas breves sobre rellenos sanitarios, saneamiento y cumplimiento normativo.')
on conflict (slug) do nothing;

insert into services (category, icon, title, description, sort_order) values
('impacto', 'leaf', 'Manifiestos de Impacto Ambiental', 'Elaboración de MIA para autorizar tu proyecto ante la autoridad.', 1),
('impacto', 'file', 'Estudios de prefactibilidad', 'Análisis inicial de viabilidad técnica y ambiental del proyecto.', 2),
('impacto', 'compass', 'ETJ y cambios de uso de suelo forestal', 'Trámites de cambio de uso de suelo ante SEMARNAT.', 3),
('impacto', 'file', 'Reglamentos municipales', 'Apoyo en la elaboración y cumplimiento de reglamentación local.', 4),
('impacto', 'shield', 'Atención de actas de PMA y PROFEPA', 'Seguimiento a requerimientos y actas de inspección.', 5),
('impacto', 'users', 'Estudios socioeconómicos', 'Diagnóstico social como parte del expediente ambiental.', 6),
('topografia', 'compass', 'Topografía y control de obra', 'Levantamientos topográficos para el diseño y seguimiento de obra.', 1),
('topografia', 'droplet', 'Hidrología y geohidrología', 'Estudios de agua superficial y subterránea del sitio.', 2),
('topografia', 'layers', 'Mecánica de suelos', 'Caracterización del subsuelo para el diseño de cimentaciones y celdas.', 3),
('rellenos', 'compass', 'Selección de sitios', 'Estudios para elegir el sitio idóneo de un relleno sanitario.', 1),
('rellenos', 'layers', 'Proyectos ejecutivos A, B, C y D', 'Diseño de rellenos sanitarios según la clasificación de la NOM-083.', 2),
('rellenos', 'recycle', 'Saneamiento y clausura', 'Rehabilitación de basureros a cielo abierto y su cierre técnico.', 3),
('rellenos', 'building', 'Plantas de separación y valorización', 'Proyectos llave en mano de valorización de residuos.', 4),
('rellenos', 'leaf', 'Compostaje y reciclaje', 'Aprovechamiento de residuos orgánicos e inorgánicos.', 5),
('rellenos', 'users', 'Capacitación de personal', 'Adiestramiento para operar sitios de disposición final.', 6),
('residuos', 'recycle', 'Planes de manejo de residuos', 'RSU, de manejo especial y peligrosos.', 1),
('residuos', 'file', 'Permisos de recolección y disposición', 'Trámites RSU (recolección) y RME (disposición).', 2),
('residuos', 'shield', 'Supervisión ambiental y seguridad de obras', 'Acompañamiento técnico durante la ejecución de obra.', 3)
on conflict do nothing;

insert into gallery_photos (image_url, tag, title, description, sort_order) values
('assets/img/photos/geomembrana.jpg', 'Disposición final', 'Celda con geomembrana', 'Impermeabilización de celda de relleno sanitario.', 1),
('assets/img/photos/cuadrilla.jpg', 'Obra', 'Instalación en talud', 'Colocación de geomembrana con personal en campo.', 2),
('assets/img/photos/excavacion.jpg', 'Obra', 'Conformación del sitio', 'Movimiento de tierras y preparación de la celda.', 3),
('assets/img/photos/vista-aerea.jpg', 'Disposición final', 'Vista aérea del sitio', 'Escala real de una celda de disposición final en operación.', 4),
('assets/img/photos/evolucion-relleno.jpg', 'Obra', 'Evolución de una celda', 'Mismo sitio, tres meses de avance: de la excavación a la celda impermeabilizada.', 5)
on conflict do nothing;
