const btn = document.getElementById("btnReset");
const msg = document.getElementById("msg");

function showMessage(text, type = "ok") {
  msg.style.display = "block";
  msg.className = "alert " + type;
  msg.textContent = text;
}

btn.onclick = async () => {
  const password = document.getElementById("newPassword").value.trim();
  const resetToken = new URLSearchParams(window.location.search).get("token");

  if (!resetToken) {
    showMessage("Link đặt lại mật khẩu không hợp lệ", "err");
    return;
  }

  if (password.length < 6) {
    showMessage("Mật khẩu phải ít nhất 6 ký tự", "err");
    return;
  }

  btn.disabled = true;

  try {
    await window.vocaApi.post("resetPassword", {
      resetToken,
      password
    });

    window.vocaApi.setToken("");
    showMessage("Đặt lại mật khẩu thành công", "ok");

    setTimeout(() => {
      window.location.href = "./auth.html";
    }, 1500);
  } catch (err) {
    console.error(err);
    showMessage(err.message || "Đặt lại mật khẩu thất bại", "err");
  } finally {
    btn.disabled = false;
  }
};
