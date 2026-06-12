const btn = document.getElementById("btnSend");
const msg = document.getElementById("msg");

function showMessage(text, type = "ok") {
  msg.style.display = "block";
  msg.className = "alert " + type;
  msg.textContent = text;
}

btn.onclick = async () => {
  const email = document.getElementById("email").value.trim();

  if (!email) {
    showMessage("Vui lòng nhập email", "err");
    return;
  }

  btn.disabled = true;

  try {
    await window.vocaApi.post("forgotPassword", {
      email,
      resetBaseUrl: new URL("./reset-password.html", window.location.href).toString()
    });

    showMessage("Nếu email tồn tại, VocaNest đã gửi link khôi phục mật khẩu", "ok");
  } catch (err) {
    console.error(err);
    showMessage(err.message || "Gửi email khôi phục thất bại", "err");
  } finally {
    btn.disabled = false;
  }
};
