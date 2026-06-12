(async () => {
  const user = await window.requireAuth();
  if (!user) return;

  const emailEl = document.getElementById("accountEmail");
  const createdAtEl = document.getElementById("accountCreatedAt");
  const passwordInput = document.getElementById("newPassword");
  const changeBtn = document.getElementById("changePasswordBtn");
  const alertBox = document.getElementById("alertBox");

  emailEl.textContent = user.email || "-";

  if (user.created_at) {
    const d = new Date(user.created_at);
    createdAtEl.textContent = d.toLocaleString("vi-VN");
  } else {
    createdAtEl.textContent = "-";
  }

  function showAlert(type, msg) {
    alertBox.style.display = "block";
    alertBox.className = "alert " + (type === "ok" ? "ok" : "err");
    alertBox.textContent = msg;
  }

  function hideAlert() {
    alertBox.style.display = "none";
    alertBox.textContent = "";
  }

  changeBtn.addEventListener("click", async () => {
    hideAlert();

    const password = passwordInput.value.trim();
    if (password.length < 6) {
      showAlert("err", "Mật khẩu phải có ít nhất 6 ký tự");
      return;
    }

    changeBtn.disabled = true;

    try {
      await window.vocaApi.authPost("changePassword", { password });
      passwordInput.value = "";
      showAlert("ok", "Đổi mật khẩu thành công");
    } catch (err) {
      console.error(err);
      showAlert("err", err.message || "Đổi mật khẩu thất bại");
    } finally {
      changeBtn.disabled = false;
    }
  });

  const logoutBtn = document.getElementById("logoutBtn");

  if (logoutBtn) {
    logoutBtn.addEventListener("click", async () => {
      const ok = confirm("Bạn có chắc chắn muốn đăng xuất?");
      if (!ok) return;

      logoutBtn.disabled = true;

      try {
        await window.vocaApi.authPost("logout");
      } catch (err) {
        console.error(err);
      } finally {
        window.vocaApi.setToken("");
        window.location.replace("./auth.html");
      }
    });
  }
})();
