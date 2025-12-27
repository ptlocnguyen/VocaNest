// resetPassword.js
// Supabase đã inject session từ link email

const btn = document.getElementById("btnReset");
const msg = document.getElementById("msg");

btn.onclick = async () => {
  const password = document.getElementById("newPassword").value.trim();

  if (password.length < 6) {
    msg.textContent = "Mật khẩu phải ít nhất 6 ký tự";
    return;
  }

  const { error } = await supabaseClient.auth.update({
    password: password
  });

  if (error) {
    msg.textContent = error.message;
    return;
  }

  msg.textContent = "Đặt lại mật khẩu thành công";

  setTimeout(() => {
    window.location.href = "./auth.html";
  }, 1500);
};
