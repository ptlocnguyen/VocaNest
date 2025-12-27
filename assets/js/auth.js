if (!window.supabaseClient) {
  throw new Error("Supabase client chưa sẵn sàng trong auth.js");
}

const emailInput = document.getElementById("emailInput");
const passwordInput = document.getElementById("passwordInput");
const submitBtn = document.getElementById("submitBtn");

const toggleMode = document.getElementById("toggleMode");
const toggleText = document.getElementById("toggleText");
const modeBadge = document.getElementById("modeBadge");
const alertBox = document.getElementById("alertBox");

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
  isLoginMode = login;
  hideAlert();

  if (login) {
    submitBtn.textContent = "Đăng nhập";
    toggleText.textContent = "Chưa có tài khoản?";
    toggleMode.textContent = "Đăng ký";
    modeBadge.textContent = "Login";
  } else {
    submitBtn.textContent = "Tạo tài khoản";
    toggleText.textContent = "Đã có tài khoản?";
    toggleMode.textContent = "Đăng nhập";
    modeBadge.textContent = "Register";
  }
}

// CHỈ redirect nếu đã login
async function redirectIfLoggedIn() {
  const session = supabaseClient.auth.session();
  if (session) {
    window.location.replace("./home.html");
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

  submitBtn.disabled = true;

  try {
    if (isLoginMode) {
      const { error } = await supabaseClient.auth.signIn({
        email,
        password
      });

      if (error) {
        showAlert("err", error.message);
        return;
      }

      window.location.replace("./home.html");
    } else {
      const { error } = await supabaseClient.auth.signUp({
        email,
        password
      });

      if (error) {
        showAlert("err", error.message);
        return;
      }

      showAlert("ok", "Đăng ký thành công, bạn có thể đăng nhập");
      setMode(true);
    }
  } catch (err) {
    console.error(err);
    showAlert("err", "Có lỗi xảy ra");
  } finally {
    submitBtn.disabled = false;
  }
});

setMode(true);
redirectIfLoggedIn();
