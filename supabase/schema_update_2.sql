-- ============================================================
-- GESTIÓN NATURA — Actualización 2
-- Agrega: precio en servicios, y enlaces externos + fotos
-- adicionales en el blog.
--
-- Solo ejecuta esto UNA VEZ si ya habías corrido schema.sql antes
-- (si es tu primera vez configurando el panel, no hace falta este
-- archivo por separado: ya está incluido en schema.sql).
-- ============================================================
alter table services   add column if not exists price text;
alter table blog_posts add column if not exists external_url text;
alter table blog_posts add column if not exists images text[];
