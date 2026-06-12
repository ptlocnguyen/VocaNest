(() => {
  const TOKEN_KEY = "vocanest_session_token";
  const USER_KEY = "vocanest_current_user";
  const USER_CACHE_MS = 5 * 60 * 1000;

  function getApiUrl() {
    const url = window.APP_CONFIG && window.APP_CONFIG.API_URL;

    if (!url || url.includes("YOUR_WORKERS_SUBDOMAIN")) {
      throw new Error("Chưa cấu hình API_URL của Cloudflare Worker trong assets/js/config.js");
    }

    return url;
  }

  function getToken() {
    return localStorage.getItem(TOKEN_KEY) || "";
  }

  function setToken(token) {
    const previous = getToken();

    if (token) {
      localStorage.setItem(TOKEN_KEY, token);
    } else {
      localStorage.removeItem(TOKEN_KEY);
    }

    if (!token || previous !== token) {
      sessionStorage.removeItem(USER_KEY);
    }
  }

  function setCurrentUser(user) {
    if (!user) {
      sessionStorage.removeItem(USER_KEY);
      return;
    }

    sessionStorage.setItem(USER_KEY, JSON.stringify({
      user,
      expiresAt: Date.now() + USER_CACHE_MS
    }));
  }

  function getCachedUser() {
    try {
      const cached = JSON.parse(sessionStorage.getItem(USER_KEY) || "null");
      if (!cached || cached.expiresAt < Date.now()) {
        sessionStorage.removeItem(USER_KEY);
        return null;
      }
      return cached.user || null;
    } catch {
      sessionStorage.removeItem(USER_KEY);
      return null;
    }
  }

  function setSession(token, user) {
    setToken(token);
    setCurrentUser(user);
  }

  async function post(action, payload = {}) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000);

    try {
      const res = await fetch(getApiUrl(), {
        method: "POST",
        headers: {
          "Content-Type": "text/plain;charset=utf-8"
        },
        body: JSON.stringify({
          ...payload,
          action
        }),
        signal: controller.signal
      });

      const data = await res.json();
      if (!res.ok || !data.ok) {
        if (res.status === 401 || data.error === "Invalid session" || data.error === "Session expired") {
          setToken("");
        }
        throw new Error(data.error || "Request failed");
      }

      return data;
    } catch (err) {
      if (err.name === "AbortError") {
        throw new Error("Máy chủ phản hồi quá lâu. Vui lòng thử lại.");
      }
      throw err;
    } finally {
      clearTimeout(timeoutId);
    }
  }

  async function authPost(action, payload = {}) {
    return post(action, {
      ...payload,
      token: getToken()
    });
  }

  window.vocaApi = {
    getToken,
    setToken,
    setSession,
    setCurrentUser,
    getCachedUser,
    post,
    authPost
  };
})();
