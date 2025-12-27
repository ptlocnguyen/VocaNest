// account.js
// Trang private: yêu cầu đăng nhập

(() => {
  const user = window.requireAuth();
  if (!user) return;

  const emailEl = document.getElementById("accountEmail");
  const createdAtEl = document.getElementById("accountCreatedAt");
  const passwordInput = document.getElementById("newPassword");
  const changeBtn = document.getElementById("changePasswordBtn");
  const alertBox = document.getElementById("alertBox");

  // Hiển thị thông tin tài khoản
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

  // Đổi mật khẩu
  changeBtn.addEventListener("click", async () => {
    hideAlert();

    const password = passwordInput.value.trim();
    if (password.length < 6) {
      showAlert("err", "Mật khẩu phải có ít nhất 6 ký tự");
      return;
    }

    changeBtn.disabled = true;

    const { error } = await supabaseClient.auth.update({
      password: password
    });

    changeBtn.disabled = false;

    if (error) {
      showAlert("err", error.message);
      return;
    }

    passwordInput.value = "";
    showAlert("ok", "Đổi mật khẩu thành công");
  });
})();
