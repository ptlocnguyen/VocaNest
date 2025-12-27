// forgotPassword.js
// Trang public

const btn = document.getElementById("btnSend");
const msg = document.getElementById("msg");

btn.onclick = async () => {
  const email = document.getElementById("email").value.trim();

  if (!email) {
    msg.textContent = "Vui lòng nhập email";
    return;
  }

  const { error } = await supabaseClient.auth.api.resetPasswordForEmail(
    email,
    {
      redirectTo: window.location.origin + "/pages/reset-password.html"
    }
  );

  if (error) {
    msg.textContent = error.message;
    return;
  }

  msg.textContent = "Đã gửi email khôi phục mật khẩu";
};
