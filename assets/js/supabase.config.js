/* ============================================================
   GESTIÓN NATURA — Configuración de Supabase
   ------------------------------------------------------------
   Pega aquí la URL y la llave "anon public" de tu proyecto de
   Supabase (Project Settings → API). Es seguro que esta llave
   sea pública: solo permite LEER datos; la escritura requiere
   iniciar sesión (ver /admin/).

   Mientras estos dos valores estén vacíos, todo el sitio sigue
   funcionando normalmente con el contenido de ejemplo que ya
   trae escrito en cada página (no se rompe nada).
   ============================================================ */
window.GN_SUPABASE_URL = "https://ysuybkxinaelkhezhsbt.supabase.co";
window.GN_SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlzdXlia3hpbmFlbGtoZXpoc2J0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODg4MjUyNjIsImV4cCI6MjEwNDQwMTI2Mn0.GyXbLk-zCiVbuM3DDHioW5u-Db0qT1_CEWNfQFH-Uu4";

(function () {
  if (!window.GN_SUPABASE_URL || !window.GN_SUPABASE_ANON_KEY) {
    window.GN_DB = null; // sin configurar todavía: el sitio usa su contenido escrito a mano
    return;
  }
  try {
    window.GN_DB = window.supabase.createClient(window.GN_SUPABASE_URL, window.GN_SUPABASE_ANON_KEY);
  } catch (e) {
    console.warn("Supabase no se pudo inicializar:", e);
    window.GN_DB = null;
  }
})();
