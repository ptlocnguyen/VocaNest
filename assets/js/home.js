const userEmailEl = document.getElementById("userEmail");
const logoutBtn = document.getElementById("logoutBtn");

// Guard
const user = requireAuth();
if (user) {
  userEmailEl.textContent = user.email;
}

logoutBtn.addEventListener("click", async () => {
  logoutBtn.disabled = true;

  try {
    await supabaseClient.auth.signOut();
    window.location.replace("./auth.html");
  } catch (err) {
    console.error(err);
    logoutBtn.disabled = false;
    alert("Đăng xuất thất bại");
  }
});
