-- ============================================================
-- GESTIÓN NATURA — Actualización 3
-- Permite varias fotos en los banners de cada página y en cada
-- servicio del catálogo (antes solo se podía una por banner y
-- ninguna en servicios).
--
-- Ejecuta esto en Supabase → SQL Editor → New query → Run.
-- Si aún no habías corrido schema_update_2.sql, corre primero ese.
-- ============================================================
alter table pages    add column if not exists images text[];
alter table services add column if not exists images text[];
