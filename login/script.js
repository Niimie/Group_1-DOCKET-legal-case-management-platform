// ROLE SELECTION

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
const password = document.getElementById("password")

togglePassword.addEventListener("click", () => {
  const type =
    password.getAttribute("type") === "password"
      ? "text"
      : "password"

  password.setAttribute("type", type)
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

// LOGIN FUNCTION

const form = document.getElementById("loginForm")

form.addEventListener("submit", function (e) {
  e.preventDefault()

  const email = document.getElementById("email").value
  const password = document.getElementById("password").value

  if (!email || !password) {
    alert("Please fill all fields")
    return
  }

  alert(`Logged in as ${selectedRole}`);
  window.location.href = "../dashboard/dashboard.html";
})

//document.getElementById("loginForm").addEventListener("submit", function (e) {
 // e.preventDefault(); // stop reload
  //  window.location.href = "./dashboard/dashboard.html";



//});
