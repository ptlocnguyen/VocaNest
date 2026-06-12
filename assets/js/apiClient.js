(() => {
  const TOKEN_KEY = "vocanest_session_token";

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
    if (token) {
      localStorage.setItem(TOKEN_KEY, token);
    } else {
      localStorage.removeItem(TOKEN_KEY);
    }
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
    post,
    authPost
  };
})();
