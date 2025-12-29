const userEmailEl = document.getElementById("userEmail");

// Guard
const user = requireAuth();
if (user) {
  userEmailEl.textContent = user.email;
}
