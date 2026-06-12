async function requireAuth() {
  if (!window.vocaApi || !window.vocaApi.getToken()) {
    window.location.replace("./auth.html");
    return null;
  }

  try {
    const { user } = await window.vocaApi.authPost("me");
    return user;
  } catch (err) {
    console.error(err);
    window.vocaApi.setToken("");
    window.location.replace("./auth.html");
    return null;
  }
}

window.requireAuth = requireAuth;
