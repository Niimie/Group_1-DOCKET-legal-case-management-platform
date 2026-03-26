let currentSlide = 0;
const backBtns = document.querySelectorAll(".prev-btn");
const nextBtns = document.querySelectorAll(".next-btn");
const sections = document.querySelectorAll(".form-section");
const sectionTitle = document.querySelectorAll(".current-title li");
const radioGroups = document.querySelectorAll(".radio-group");
const radios = document.querySelectorAll("input[name ='role-selection']");
const progressBars = document.querySelectorAll(".progress-bar");
const firmPlaces = document.querySelectorAll(".firm-name");
const stepDisplay = document.querySelector(".step-display");
const btnSubmit = document.querySelector(".btn-submit");
const fullName = document.getElementById("full-name");
const workEmail = document.getElementById("work-email");
const lawFirm = document.getElementById("law-firm");
const password = document.getElementById("password");
const repeatedPassword = document.getElementById("repeat-password");
const form = document.getElementById("form");
const errors = document.querySelectorAll(".inline-error");
const inputs = document.querySelectorAll("input");
const formStatus = document.getElementById("form-status");
btnSubmit.disabled = true;
stepDisplay.textContent = currentSlide + 1;

radioGroups.forEach((radioGroup, i) => {
  radioGroup.addEventListener("click", function () {
    radios[i].checked = true;
  });
});

function goToFill() {
  currentSlide = 1;
  changeSection(currentSlide - 1);
  sectionTitle.forEach((sectionKeyword) =>
    sectionKeyword.classList.remove("active"),
  );
  sectionTitle[currentSlide].classList.add("active");
  progressBars.forEach((progressBar) =>
    progressBar.classList.remove("current"),
  );
  progressBars[currentSlide].classList.add("current");
  stepDisplay.textContent = currentSlide + 1;
}

function goToSelect() {
  currentSlide = 2;
  changeSection(currentSlide - 1);
  sectionTitle.forEach((sectionKeyword) =>
    sectionKeyword.classList.remove("active"),
  );
  sectionTitle[currentSlide].classList.add("active");
  progressBars[currentSlide + 1].classList.remove("current");
  stepDisplay.textContent = currentSlide + 1;
}

backBtns.forEach((backBtn) => {
  backBtn.addEventListener("click", function (e) {
    changeSection(currentSlide - 1);
    sectionTitle.forEach((sectionKeyword) =>
      sectionKeyword.classList.remove("active"),
    );
    sectionTitle[currentSlide].classList.add("active");
    progressBars[currentSlide + 1].classList.remove("current");
    stepDisplay.textContent = currentSlide + 1;
  });
});

nextBtns.forEach((nextBtn) => {
  nextBtn.addEventListener("click", function () {
    firmPlaces.forEach(
      (firmPlace) => (firmPlace.innerHTML = `${lawFirm.value}`),
    );
    changeSection(currentSlide + 1);
    sectionTitle.forEach((sectionKeyword) =>
      sectionKeyword.classList.remove("active"),
    );
    sectionTitle[currentSlide].classList.add("active");
    progressBars[currentSlide].classList.add("current");
    stepDisplay.textContent = currentSlide + 1;
  });
});

function changeSection(index) {
  sections.forEach((section) => section.classList.remove("active"));

  currentSlide = (index + sections.length) % sections.length;

  sections[currentSlide].classList.add("active");
  if (sections[2].classList.contains("active")) {
    btnSubmit.disabled = false;
  } else {
    btnSubmit.disabled = true;
  }
}

function removeError() {
  inputs.forEach((input) => {
    input.addEventListener("click", function () {
      errors.forEach((error) => (error.textContent = ""));
      btnSubmit.disabled = false;
      return false;
    });
  });

  radioGroups.forEach((radioGroup) => {
    radioGroup.addEventListener("click", function () {
      errors.forEach((error) => (error.textContent = ""));
      btnSubmit.disabled = false;
      return false;
    });
  });
}

function setFormStatus(type, message, withSpinner = false) {
  if (!formStatus) return;
  formStatus.className = `form-status visible ${type}`;
  formStatus.innerHTML = withSpinner
    ? `<span class="status-spinner" aria-hidden="true"></span><span>${message}</span>`
    : `<span>${message}</span>`;
}

function clearFormStatus() {
  if (!formStatus) return;
  formStatus.className = "form-status";
  formStatus.innerHTML = "";
}

form.addEventListener("submit", function (e) {
  e.preventDefault();
  clearFormStatus();
  const selectedRole = document.querySelector(
    "input[name='role-selection']:checked",
  );
  btnSubmit.disabled = true;

  if (fullName.value.trim() === "") {
    goToFill();
    document.getElementById("full-name-error").textContent =
      "❗Full name is required";
    removeError();
    return false;
  }

  if (workEmail.value.trim() === "") {
    goToFill();
    document.getElementById("email-error").textContent = "❗Email is required";
    // removeError();
    return false;
  }

  if (!workEmail.value.includes("@")) {
    goToFill();
    document.getElementById("email-error").textContent =
      "❗Email address must contain '@' keyword.";
    removeError();
    return false;
  }

  if (workEmail.value.length < 11) {
    goToFill();
    document.getElementById("email-error").textContent =
      "❗This is not a valid email address";
    removeError();
    return false;
  }

  if (lawFirm.value.trim() === "") {
    goToFill();
    document.getElementById("firm-error").textContent =
      "❗Law firm is required";
    removeError();
    return false;
  }

  if (selectedRole == null) {
    goToSelect();
    document.getElementById("radio-error").textContent =
      "❗An option must be selected";
    removeError();
    return false;
  }

  if (password.value.trim() === "") {
    document.getElementById("password-error").textContent =
      "❗Password is required";
    removeError();
    return false;
  }

  if (password.value.length < 6) {
    document.getElementById("password-error").textContent =
      "❗Password must be a minimum of 6 characters";
    removeError();
    return false;
  }

  if (repeatedPassword.value.trim() === "") {
    document.getElementById("repeat-error").textContent =
      "❗Please confirm your password";
    removeError();
    return false;
  }

  if (repeatedPassword.value !== password.value) {
    document.getElementById("repeat-error").textContent =
      "❗The passwords do not match";
    removeError();
    return false;
  }

  const collectedData = {
    full_name: fullName.value,
    email: workEmail.value,
    role: selectedRole.value,
    password: password.value,
    phone: "",
    specialty: "",
  };

  setFormStatus("loading", "Creating your account. Please wait...", true);
  createUser(collectedData);
});

async function createUser(userData) {
  const url =
    "https://docket-backend-tcg1cp-production.up.railway.app/api/auth/register";

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(userData),
    });

    const result = await response.json();

    if (response.ok) {
      setFormStatus(
        "success",
        "Account created successfully. Redirecting to login...",
      );
      setTimeout(() => {
        window.location.href = "../login/index.html";
      }, 1400);
    } else {
      console.error("Validation Errors:", result.errors);
      setFormStatus(
        "error",
        `Could not create account: ${result.message || "Please check your details and try again."}`,
      );
      btnSubmit.disabled = false;
    }
  } catch (error) {
    console.error("Error:", error);
    setFormStatus(
      "error",
      "Server is unreachable. Check your internet connection and try again.",
    );
    btnSubmit.disabled = false;
  }
}
