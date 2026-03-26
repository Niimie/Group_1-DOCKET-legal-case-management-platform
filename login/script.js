const roles = document.querySelectorAll(".role");
let selectedRole = "secretary";

roles.forEach((btn) => {
  btn.addEventListener("click", () => {
    roles.forEach((r) => r.classList.remove("active"));
    btn.classList.add("active");
    selectedRole = btn.dataset.role;
  });
});

// PASSWORD TOGGLE
const togglePassword = document.getElementById("togglePassword");
const passwordInput = document.getElementById("password");

togglePassword.addEventListener("click", () => {
  const type =
    passwordInput.getAttribute("type") === "password" ? "text" : "password";
  passwordInput.setAttribute("type", type);
  togglePassword.classList.toggle("ph-eye-slash"); // Optional: change icon
});

// MOBILE PAGE SWITCH
const container = document.querySelector(".container");
const nextBtn = document.querySelector(".nextBtn");
const backBtn = document.querySelector(".backBtn");

if (nextBtn) {
  nextBtn.addEventListener("click", () => {
    container.style.transform = "translateX(-50%)";
  });
}

if (backBtn) {
  backBtn.addEventListener("click", () => {
    container.style.transform = "translateX(0)";
  });
}

// LOGIN FUNCTION (MERGED WITH API)
const loginForm = document.getElementById("loginForm");
const loginStatus = document.getElementById("login-status");
const signInBtn = document.querySelector(".signin-btn");

function setLoginStatus(type, message, withSpinner = false) {
  if (!loginStatus) return;
  loginStatus.className = `login-status visible ${type}`;
  loginStatus.innerHTML = withSpinner
    ? `<span class="status-spinner" aria-hidden="true"></span><span>${message}</span>`
    : `<span>${message}</span>`;
}

function clearLoginStatus() {
  if (!loginStatus) return;
  loginStatus.className = "login-status";
  loginStatus.innerHTML = "";
}

loginForm.addEventListener("submit", async function (e) {
  e.preventDefault();
  clearLoginStatus();

  const email = document.getElementById("email").value;
  const password = passwordInput.value;

  if (!email || !password) {
    setLoginStatus("error", "Please fill in both email and password.");
    return;
  }

  if (signInBtn) signInBtn.disabled = true;
  setLoginStatus("loading", "Signing you in. Please wait...", true);

  // API Configuration
  const url =
    "https://docket-backend-tcg1cp-production.up.railway.app/api/auth/login";

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const result = await response.json();

    if (response.ok) {
      // SAVE TOKEN: Critical for accessing cases later
      localStorage.setItem("docketToken", result.data.token);

      setLoginStatus(
        "success",
        "Login successful. Redirecting to your dashboard...",
      );

      // Redirect only after successful API verification
      setTimeout(() => {
        window.location.href = "../dashboard/dashboard.html";
      }, 1200);
    } else {
      // Display specific error from ErrorEnvelope
      setLoginStatus(
        "error",
        `Login failed: ${result.message || "Please check your credentials and try again."}`,
      );
      console.error("Validation Errors:", result.errors);
      if (signInBtn) signInBtn.disabled = false;
    }
  } catch (error) {
    console.error("Network Error:", error);
    setLoginStatus(
      "error",
      "Cannot connect to server. Check your connection and try again.",
    );
    if (signInBtn) signInBtn.disabled = false;
  }
});
