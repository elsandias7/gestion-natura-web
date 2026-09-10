-- ============================================================
-- GESTIÓN NATURA — Actualización 4
-- Corrige la galería de Proyectos: tu base de datos todavía tenía
-- guardadas 2 fotos viejas de muy baja calidad (topografia.jpg y
-- capacitacion.jpg) que ya no existen en el sitio. Como el sitio
-- siempre muestra primero lo que hay en la base de datos, esas 2
-- fotos rotas seguían apareciendo sin importar qué tan actualizado
-- estuviera el código.
--
-- Ejecuta esto en Supabase → SQL Editor → New query → Run.
-- ============================================================

-- Corrige 2 textos/fotos de banner que se habían quedado con la versión vieja
update pages set subtitle = 'Fotografía real de obra, del archivo de Gestión Natura.'
  where slug = 'proyectos';
update pages set hero_image_url = 'assets/img/photos/hero-relleno.jpg'
  where slug = 'blog' and hero_image_url = 'assets/img/photos/topografia.jpg';

-- Quita las 2 fotos rotas/borrosas
delete from gallery_photos where image_url in (
  'assets/img/photos/topografia.jpg',
  'assets/img/photos/capacitacion.jpg'
);

-- Agrega las fotos reales nuevas (si ya las habías agregado a mano
-- desde el panel, este paso no duplica nada gracias al "where not exists")
insert into gallery_photos (image_url, tag, title, description, sort_order)
select * from (values
  ('assets/img/photos/vista-aerea.jpg', 'Disposición final', 'Vista aérea del sitio', 'Escala real de una celda de disposición final en operación.', 4),
  ('assets/img/photos/evolucion-relleno.jpg', 'Obra', 'Evolución de una celda', 'Mismo sitio, tres meses de avance: de la excavación a la celda impermeabilizada.', 5),
  ('assets/img/photos/panoramica-zanja.jpg', 'Obra', 'Zanja de anclaje perimetral', 'Geomembrana anclada en todo el perímetro de la celda.', 6),
  ('assets/img/photos/cobertura-diaria.jpg', 'Operación', 'Cobertura diaria', 'Descarga y compactación de material de cobertura.', 7),
  ('assets/img/photos/antes-despues.jpg', 'Impacto real', 'De basurero a sitio controlado', 'El resultado de una intervención de saneamiento.', 8)
) as nuevas(image_url, tag, title, description, sort_order)
where not exists (
  select 1 from gallery_photos where gallery_photos.image_url = nuevas.image_url
);
