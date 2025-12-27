// authGuard.js
// Guard dùng cho Supabase v1
// Chỉ dùng auth.session(), không dùng getSession()

if (!window.supabaseClient) {
  throw new Error("Supabase client chưa sẵn sàng trong authGuard.js");
}

function requireAuth() {
  const session = supabaseClient.auth.session();

  if (!session || !session.user) {
    // Dùng replace để tránh quay lại trang private
    window.location.replace("./auth.html");
    return null;
  }

  return session.user;
}

// Export global
window.requireAuth = requireAuth;
