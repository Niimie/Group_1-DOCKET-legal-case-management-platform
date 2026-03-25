const roles = document.querySelectorAll(".role")
let selectedRole = "secretary"

roles.forEach((btn) => {
  btn.addEventListener("click", () => {
    roles.forEach((r) => r.classList.remove("active"))
    btn.classList.add("active")
    selectedRole = btn.dataset.role
  })
})

// PASSWORD TOGGLE
const togglePassword = document.getElementById("togglePassword")
const passwordInput = document.getElementById("password")

togglePassword.addEventListener("click", () => {
  const type = passwordInput.getAttribute("type") === "password" ? "text" : "password"
  passwordInput.setAttribute("type", type)
  togglePassword.classList.toggle("ph-eye-slash") // Optional: change icon
})

// MOBILE PAGE SWITCH
const container = document.querySelector(".container")
const nextBtn = document.querySelector(".nextBtn")
const backBtn = document.querySelector(".backBtn")

if (nextBtn) {
  nextBtn.addEventListener("click", () => {
    container.style.transform = "translateX(-50%)"
  })
}

if (backBtn) {
  backBtn.addEventListener("click", () => {
    container.style.transform = "translateX(0)"
  })
}

// LOGIN FUNCTION (MERGED WITH API)
const loginForm = document.getElementById("loginForm")

loginForm.addEventListener("submit", async function (e) {
  e.preventDefault();

  const email = document.getElementById("email").value;
  const password = passwordInput.value;

  if (!email || !password) {
    alert("Please fill all fields");
    return;
  }

  // API Configuration
  const url = "https://docket-backend-tcg1cp-production.up.railway.app/api/auth/login";

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    const result = await response.json();

    if (response.ok) {
      // SAVE TOKEN: Critical for accessing cases later
      localStorage.setItem('docketToken', result.data.token);
      
      // Redirect only after successful API verification
      window.location.href = "../dashboard/dashboard.html";
    } else {
      // Display specific error from ErrorEnvelope
      alert(`Login Failed: ${result.message}`);
      console.error("Validation Errors:", result.errors);
    }
  } catch (error) {
    console.error("Network Error:", error);
    alert("Cannot connect to server. Check your connection.");
  }
});