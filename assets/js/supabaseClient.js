// supabaseClient.js
// Dùng Supabase v1 CDN (global supabase)

(() => {
  const { SUPABASE_URL, SUPABASE_ANON_KEY } = window.APP_CONFIG || {};

  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    throw new Error("Thiếu SUPABASE_URL hoặc SUPABASE_ANON_KEY trong config.js");
  }

  if (!window.supabase || typeof window.supabase.createClient !== "function") {
    throw new Error("Supabase CDN chưa được load");
  }

  window.supabaseClient = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_ANON_KEY
  );
})();
