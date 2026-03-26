const API_BASE = "https://docket-backend-tcg1cp-production.up.railway.app/api";
const authToken = localStorage.getItem("docketToken");

const form = document.getElementById("create-client-form");
const submitBtn = document.getElementById("submit-btn");
const btnText = submitBtn.querySelector(".btn-text");
const btnSpinner = submitBtn.querySelector(".btn-spinner");
const errorBox = document.getElementById("form-error");
const successBox = document.getElementById("form-success");

function setLoading(loading) {
  submitBtn.disabled = loading;
  btnText.textContent = loading ? "Creating..." : "Create Client";
  btnSpinner.classList.toggle("hidden", !loading);
}

function showError(msg) {
  successBox.classList.add("hidden");
  errorBox.textContent = msg;
  errorBox.classList.remove("hidden");
}

function showSuccess(msg) {
  errorBox.classList.add("hidden");
  successBox.textContent = msg;
  successBox.classList.remove("hidden");
}

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  errorBox.classList.add("hidden");
  successBox.classList.add("hidden");

  const fullName = form.full_name.value.trim();
  const email = form.email.value.trim();
  const phone = form.phone.value.trim();
  const clientType = form.client_type.value;
  const address = form.address.value.trim();

  // Basic validation
  if (!fullName || !email || !clientType) {
    showError("Please fill in all required fields.");
    return;
  }

  const body = {
    full_name: fullName,
    email: email,
    client_type: clientType,
  };
  if (phone) body.phone = phone;
  if (address) body.address = address;

  setLoading(true);

  try {
    const headers = { "Content-Type": "application/json" };
    if (authToken) headers.Authorization = `Bearer ${authToken}`;

    const response = await fetch(`${API_BASE}/clients`, {
      method: "POST",
      headers,
      body: JSON.stringify(body),
    });

    const result = await response.json();

    if (!response.ok || !result.success) {
      showError(result.message || "Failed to create client. Please try again.");
      return;
    }

    showSuccess("Client created successfully! Redirecting...");
    form.reset();

    setTimeout(() => {
      window.location.href = "../dashboard/dashboard.html";
    }, 1500);
  } catch (error) {
    console.error("Create client error:", error);
    showError("Network error. Please check your connection and try again.");
  } finally {
    setLoading(false);
  }
});
