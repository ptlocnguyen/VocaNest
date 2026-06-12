async function requireAuth() {
  if (!window.vocaApi || !window.vocaApi.getToken()) {
    window.location.replace("./auth.html");
    return null;
  }

  const cachedUser = window.vocaApi.getCachedUser();
  if (cachedUser) return cachedUser;

  try {
    const { user } = await window.vocaApi.authPost("me");
    window.vocaApi.setCurrentUser(user);
    return user;
  } catch (err) {
    console.error(err);
    window.vocaApi.setToken("");
    window.location.replace("./auth.html");
    return null;
  }
}

window.requireAuth = requireAuth;
