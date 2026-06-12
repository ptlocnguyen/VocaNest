(async () => {
  const userEmailEl = document.getElementById("userEmail");
  const user = await requireAuth();

  if (user && userEmailEl) {
    userEmailEl.textContent = user.email;
  }
})();
