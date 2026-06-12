if (!window.vocaApi) {
  throw new Error("API client chưa sẵn sàng trong auth.js");
}

const emailInput = document.getElementById("emailInput");
const passwordInput = document.getElementById("passwordInput");
const submitBtn = document.getElementById("submitBtn");

const toggleMode = document.getElementById("toggleMode");
const toggleText = document.getElementById("toggleText");
const modeBadge = document.getElementById("modeBadge");
const alertBox = document.getElementById("alertBox");

const card = document.querySelector(".card");

let isLoginMode = true;

function showAlert(type, message) {
  alertBox.style.display = "block";
  alertBox.className = "alert " + (type === "ok" ? "ok" : "err");
  alertBox.textContent = message;
}

function hideAlert() {
  alertBox.style.display = "none";
  alertBox.textContent = "";
}

function setMode(login) {
  const titleEl = document.getElementById("authTitle");
  const descEl = document.getElementById("authDesc");
  isLoginMode = login;
  hideAlert();

  if (login) {
    submitBtn.textContent = "Đăng nhập";
    toggleText.textContent = "Chưa có tài khoản?";
    toggleMode.textContent = "Đăng ký";
    modeBadge.textContent = "Login";
    card.classList.remove("auth--register");
    titleEl.textContent = "Đăng nhập";
    descEl.textContent =
      "Truy cập tài khoản để quản lý bộ từ vựng và flashcards.";
  } else {
    submitBtn.textContent = "Tạo tài khoản";
    toggleText.textContent = "Đã có tài khoản?";
    toggleMode.textContent = "Đăng nhập";
    modeBadge.textContent = "Register";
    card.classList.add("auth--register");
    titleEl.textContent = "Tạo tài khoản";
    descEl.textContent =
      "Tạo tài khoản mới để bắt đầu học và lưu từ vựng.";
  }
}

async function redirectIfLoggedIn() {
  if (!window.vocaApi.getToken()) return;

  if (window.vocaApi.getCachedUser()) {
    window.location.replace("./home.html");
    return;
  }

  try {
    const { user } = await window.vocaApi.authPost("me");
    window.vocaApi.setCurrentUser(user);
    window.location.replace("./home.html");
  } catch (err) {
    window.vocaApi.setToken("");
  }
}

toggleMode.addEventListener("click", (e) => {
  e.preventDefault();
  setMode(!isLoginMode);
});

submitBtn.addEventListener("click", async () => {
  hideAlert();

  const email = emailInput.value.trim();
  const password = passwordInput.value;

  if (!email || !password) {
    showAlert("err", "Vui lòng nhập email và mật khẩu");
    return;
  }

  if (!emailInput.validity.valid) {
    showAlert("err", "Email không đúng định dạng");
    emailInput.focus();
    return;
  }

  if (!isLoginMode && password.length < 6) {
    showAlert("err", "Mật khẩu phải có ít nhất 6 ký tự");
    passwordInput.focus();
    return;
  }

  submitBtn.disabled = true;

  try {
    const action = isLoginMode ? "login" : "register";
    const { token, user } = await window.vocaApi.post(action, {
      email,
      password
    });

    window.vocaApi.setSession(token, user);
    window.location.replace("./home.html");
  } catch (err) {
    console.error(err);
    showAlert("err", err.message || "Có lỗi xảy ra");
  } finally {
    submitBtn.disabled = false;
  }
});

passwordInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    submitBtn.click();
  }
});

setMode(true);
redirectIfLoggedIn();
