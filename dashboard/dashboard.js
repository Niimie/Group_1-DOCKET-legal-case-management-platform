const navItems = document.querySelectorAll(".lists");
const sections = document.querySelectorAll(".direct");
const caseLink = document.querySelector(".case-link");
const data = JSON.parse(localStorage.getItem("storedData")) || [];
let allLawyers = [];
let allCases = [];

const DASHBOARD_API_BASE =
  "https://docket-backend-tcg1cp-production.up.railway.app/api";
const authToken = localStorage.getItem("docketToken");
const statsLoading = document.getElementById("stats-loading");
const caseCardsContainer = document.querySelector(".case-cards");

function setStatsLoading(isLoading) {
  if (statsLoading) {
    statsLoading.classList.toggle("is-visible", isLoading);
  }

  if (caseCardsContainer) {
    caseCardsContainer.classList.toggle("is-loading", isLoading);
  }
}

///HEADERS
const navHeader = document.querySelector(".nav-header");

function checkHeader() {
  if (navHeader) {
    if(sections[0].classList.contains("visible")){
    const userData = JSON.parse(localStorage.getItem("docketUser")) || {};
    navHeader.innerHTML = `
    <h3>Dashboard</h3>
    <p>Welcome, ${userData.full_name || "User"}!</p>`;
  }

  if(sections[1].classList.contains("visible")){ 
    navHeader.innerHTML = `
    <h3>Cases</h3>
    <p>Manage your cases effectively.</p>`;
  }
  
  if(sections[2].classList.contains("visible")){
    navHeader.innerHTML = `
    <h3>Clients</h3>
    <p>View and manage your clients.</p>`;
  }
  
    if(sections[3].classList.contains("visible")){
      navHeader.innerHTML = `
      <h3>Lawyers</h3>
      <p>View and manage your lawyers.</p>`;
    }

    if(sections[4].classList.contains("visible")){
      navHeader.innerHTML = `
      <h3>Hearings</h3>
      <p>View and manage upcoming hearings.</p>`;
    }

    if(sections[5].classList.contains("visible")){
      navHeader.innerHTML = `
      <h3>Settings</h3>
      <p>Manage your account settings.</p>`;
    }

    if(sections[6].classList.contains("visible")){
      navHeader.innerHTML = `
      <h3>Profile</h3>
      <p>View and edit your profile information.</p>`;
    }
}
}

checkHeader();

caseLink.addEventListener("click", function () {
  sections.forEach((section) => {
    section.classList.remove("visible");
  });
  sections[1].classList.add("visible");
  navItems.forEach((item) => {
    item.classList.remove("nav-list");
  });
  navItems[1].classList.add("nav-list");
  checkHeader();
})


function getTopCategory(categoryMap) {
  if (!categoryMap) return ["N/A", 0];
  const categoryEntries = Object.entries(categoryMap);
  if (!categoryEntries.length) return ["N/A", 0];

  return categoryEntries.reduce((topCategory, currentCategory) => {
    return currentCategory[1] > topCategory[1] ? currentCategory : topCategory;
  });
}

function renderDashboardStats(stats) {
  const cards = document.querySelectorAll(".case-cards .cards");
  if (cards.length < 4) return;

  const activeCases = stats.by_status?.Active || 0;
  const pendingCases = stats.by_status?.Pending || 0;
  const urgentCases = stats.by_status?.Urgent || 0;
  const inReviewCases = stats.by_status?.["In Review"] || 0;
  const closedCases = stats.by_status?.Closed || 0;
  const [topCaseType, topTypeCount] = getTopCategory(stats.by_type);

  const cardValues = [
    stats.total_cases || 0,
    activeCases,
    pendingCases,
    stats.upcoming_hearings || 0,
  ];

  const cardSubTitles = [
    `Clients: ${stats.total_clients || 0} • Top type: ${topCaseType} (${topTypeCount})`,
    `Urgent: ${urgentCases} • Closed: ${closedCases}`,
    `In Review: ${inReviewCases} • Awaiting action`,
    `Next 7 days: ${stats.upcoming_hearings || 0}`,
  ];

  cards.forEach((card, index) => {
    const valueNode = card.querySelector(".case-num");
    const subtitleNode = card.querySelector(".sub-no");

    if (valueNode) valueNode.textContent = cardValues[index];
    if (subtitleNode) subtitleNode.textContent = cardSubTitles[index];
  });
}

async function fetchDashboardStats() {
  setStatsLoading(true);
  try {
    const headers = {
      "Content-Type": "application/json",
    };

    if (authToken) {
      headers.Authorization = `Bearer ${authToken}`;
    }

    const response = await fetch(`${DASHBOARD_API_BASE}/dashboard/stats`, {
      method: "GET",
      headers,
    });

    const result = await response.json();

    if (!response.ok || !result.success) {
      console.error(
        "Unable to fetch dashboard stats:",
        result.message || "Request failed",
      );
      return;
    }

    renderDashboardStats(result.data || {});
  } catch (error) {
    console.error("Dashboard stats error:", error);
  } finally {
    setStatsLoading(false);
  }
}

// Recent Cases
const STATUS_CLASS_MAP = {
  Active: "ba",
  Urgent: "bb",
  Pending: "bc",
  "In Review": "bd",
  Closed: "bf",
};

function formatDate(dateStr) {
  if (!dateStr) return "—";
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function renderRecentCases(cases) {
  const tbody = document.querySelector(".recent-table tbody");
  if (!tbody) return;

  tbody.innerHTML = cases
    .map((c) => {
      const statusCls = STATUS_CLASS_MAP[c.status] || "ba";
      return `
      <tr>
      <td>
            <p class="case-id">${c.id}</p>
            <p class="case-title">${c.title}</p>
            <p class="case-type">${c.case_type}</p>
          </td>
          <td>${c.client?.full_name || "—"}</td>
          <td>${c.lawyer?.full_name || "—"}</td>
          <td>
            <div class="case-status ${statusCls}">
              <p class="status-txt">${c.status}</p>
            </div>
          </td>
          <td class="case-date">${formatDate(c.filed_date)}</td>
        </tr>`;
    })
    .join("");
}

function setRecentCasesLoading(isLoading) {
  const loader = document.getElementById("recent-cases-loading");
  const tableWrap = document.querySelector(".recent-case .table-wrap");
  if (loader) loader.classList.toggle("is-visible", isLoading);
  if (tableWrap) tableWrap.classList.toggle("is-loading", isLoading);
}

async function fetchRecentCases() {
  setRecentCasesLoading(true);
  try {
    const headers = { "Content-Type": "application/json" };
    if (authToken) headers.Authorization = `Bearer ${authToken}`;

    const response = await fetch(
      `${DASHBOARD_API_BASE}/dashboard/recent-cases`,
      { method: "GET", headers },
    );
    const result = await response.json();

    if (!response.ok || !result.success) {
      console.error(
        "Unable to fetch recent cases:",
        result.message || "Request failed",
      );
      return;
    }

    renderRecentCases(result.data || []);
  } catch (error) {
    console.error("Recent cases error:", error);
  } finally {
    setRecentCasesLoading(false);
  }
}

// Upcoming Hearings
function getDaysUntil(dateStr) {
  const hearing = new Date(dateStr);
  const today = new Date();
  hearing.setHours(0, 0, 0, 0);
  today.setHours(0, 0, 0, 0);
  const diff = Math.ceil((hearing - today) / (1000 * 60 * 60 * 24));
  if (diff < 0) return "Past";
  if (diff === 0) return "Today";
  if (diff === 1) return "1d";
  return `${diff}d`;
}

  const toTitleCase = (str) => {
    if (!str) return "";
    return str.toLowerCase()
              .split('_') // Handles your "senior_partner" underscores
              .map(word => word.charAt(0).toUpperCase() + word.slice(1))
              .join(' ');
};

function getDaysColor(dateStr) {
  const hearing = new Date(dateStr);
  const today = new Date();
  hearing.setHours(0, 0, 0, 0);
  today.setHours(0, 0, 0, 0);
  const diff = Math.ceil((hearing - today) / (1000 * 60 * 60 * 24));
  if (diff <= 3) return "#ff7800";
  if (diff <= 7) return "#c9a84c";
  return "#42ade2";
}

function getHearingColor(dateStr) {
  const hearing = new Date(dateStr);
  const today = new Date();
  hearing.setHours(0, 0, 0, 0);
  today.setHours(0, 0, 0, 0);
  const diff = Math.ceil((hearing - today) / (1000 * 60 * 60 * 24));
  if(diff <= 0) return "gray";
  if (diff <= 5) return "red";
  if (diff > 6) return "blue";
  // return "#42ade2";
}

function renderUpcomingHearings(hearings) {
  const list = document.querySelector(".hearing-side .hearing-list");
  if (!list) return;

  list.innerHTML = hearings
    .map((h) => {
      const date = new Date(h.hearing_date);
      const day = date.getDate();
      const month = date
        .toLocaleString("en-US", { month: "short" })
        .toUpperCase();
      const daysLabel = getDaysUntil(h.hearing_date);
      const daysColor = getDaysColor(h.hearing_date);
      const title = h.case?.title || "—";
      const lawyer = h.scheduledBy?.full_name || "—";
      const notes = h.notes || "";
      
      return `
      <div class="hearings">
      <div class="hearing-db">
      <p class="hearing-day">${day}</p>
      <p class="hearing-month">${month}</p>
      </div>
      <div class="hearing-info">
      <p class="hearing-title">${title}</p>
      <p class="hearing-sub">${lawyer} — ${notes}</p>
      </div>
      <div class="hdays">
            <p style="color: ${daysColor}">${daysLabel}</p>
          </div>
        </div>`;
    })
    .join("");
  }

function setHearingsLoading(isLoading) {
  const loader = document.getElementById("hearings-loading");
  const list = document.querySelector(".hearing-side .hearing-list");
  if (loader) loader.classList.toggle("is-visible", isLoading);
  if (list) list.classList.toggle("is-loading", isLoading);
}

async function fetchUpcomingHearings() {
  setHearingsLoading(true);
  try {
    const headers = { "Content-Type": "application/json" };
    if (authToken) headers.Authorization = `Bearer ${authToken}`;

    const response = await fetch(
      `${DASHBOARD_API_BASE}/dashboard/upcoming-hearings`,
      { method: "GET", headers },
    );
    const result = await response.json();
    
    if (!response.ok || !result.success) {
      console.error(
        "Unable to fetch upcoming hearings:",
        result.message || "Request failed",
      );
      return;
    }

    renderUpcomingHearings(result.data || []);
  } catch (error) {
    console.error("Upcoming hearings error:", error);
  } finally {
    setHearingsLoading(false);
  }
}

// Clients Table
function getInitials(name) {
  return name
  .split(" ")
    .map((w) => w.charAt(0).toUpperCase())
    .slice(0, 2)
    .join("");
}

function renderClientsTable(clients, count) {
  const countEl = document.querySelector(".table_container h4");
  if (countEl) countEl.textContent = `${count} Clients`;

  const table = document.querySelector(".client-table");
  if (!table) return;
  
  // Ensure we have a tbody to target
  let tbody = table.querySelector("tbody");
  if (!tbody) {
    // The original table has no tbody — wrap data rows
    tbody = document.createElement("tbody");
    table.appendChild(tbody);
  }
  
  tbody.innerHTML = clients
    .map((c) => {
      const initials = getInitials(c.full_name);
      const joined = formatDate(c.createdAt);
      return `
        <tr>
          <td><span class="avatar">${initials}</span>${c.full_name}</td>
          <td>${c.email}</td>
          <td>${c.phone || "\u2014"}</td>
          <td><span class="badge">\u2014</span></td>
          <td>${joined}</td>
        </tr>`;
    })
    .join("");
}

async function fetchClients() {
  try {
    const headers = { "Content-Type": "application/json" };
    if (authToken) headers.Authorization = `Bearer ${authToken}`;

    const response = await fetch(`${DASHBOARD_API_BASE}/clients`, {
      method: "GET",
      headers,
    });
    const result = await response.json();
    
    if (!response.ok || !result.success) {
      console.error(
        "Unable to fetch clients:",
        result.message || "Request failed",
      );
      return;
    }

    renderClientsTable(result.data || [], result.count || 0);
  } catch (error) {
    console.error("Clients fetch error:", error);
  }
}

// Cases Table
const CASES_STATUS_MAP = {
  Active: { cls: "case-active", color: "#34C759" },
  Urgent: { cls: "case-urgent", color: "#FF383C" },
  Pending: { cls: "case-pending", color: "#FF8D28" },
  "In Review": { cls: "case-in-review", color: "#0088FF" },
  Closed: { cls: "case-closed", color: "#A1A1A6" },
};

function renderCasesTable(cases) {
  const tbody = document.querySelector(".cases-table tbody");
  if (!tbody) return;
  
  tbody.innerHTML = cases
    .map((c) => {
      const s = CASES_STATUS_MAP[c.status] || CASES_STATUS_MAP.Active;
      return `
      <tr>
      <td>${c.id}</td>
          <td>
            <div>
            <h4>${c.title}</h4>
            <p>${c.case_type}</p>
            </div>
            </td>
          <td>${c.client?.full_name || "\u2014"}</td>
          <td>\u2014</td>
          <td>
          <button class="${s.cls}"><svg width="10" height="10" viewBox="0 0 10 10" fill="none"
                xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M5 10C6.32608 10 7.59785 9.47322 8.53553 8.53553C9.47322 7.59785 10 6.32608 10 5C10 3.67392 9.47322 2.40215 8.53553 1.46447C7.59785 0.526784 6.32608 0 5 0C3.67392 0 2.40215 0.526784 1.46447 1.46447C0.526784 2.40215 0 3.67392 0 5C0 6.32608 0.526784 7.59785 1.46447 8.53553C2.40215 9.47322 3.67392 10 5 10Z"
                  fill="${s.color}" />
              </svg> &nbsp;${c.status}
            </button>
          </td>
          <td>${formatDate(c.filed_date)}</td>
          <td>${formatDate(c.filed_date)}</td>
          </tr>`;
    })
    .join("");
}

async function fetchCases() {
  try {
    const headers = { "Content-Type": "application/json" };
    if (authToken) headers.Authorization = `Bearer ${authToken}`;

    const response = await fetch(`${DASHBOARD_API_BASE}/cases`, {
      method: "GET",
      headers,
    });
    const result = await response.json();

    if (!response.ok || !result.success) {
      console.error(
        "Unable to fetch cases:",
        result.message || "Request failed",
      );
      return;
    }

    allCases = result.data || [];

    renderCasesTable(allCases);
  } catch (error) {
    console.error("Cases fetch error:", error);
  }
}

const caseSearchInput = document.getElementById("case-search");
function searchCases() {
  const query = caseSearchInput.value.toLowerCase();
  const tbody = document.querySelector(".cases-table tbody");
  if (!tbody) return;
  const filtered = allCases.filter((c) => (c.client?.full_name?.toLowerCase().includes(query) || "") || ( c.id.toString().includes(query) || "") || (c.title.toLowerCase().includes(query) || ""));

  renderCasesTable(filtered);
}

caseSearchInput.addEventListener("input", searchCases);

async function fetchHearing() {
  try {
    const headers = { "Content-Type": "application/json" };
    if (authToken) headers.Authorization = `Bearer ${authToken}`;

    const response = await fetch(`${DASHBOARD_API_BASE}/hearings`, {
      method: "GET",
      headers,
    });
    const result = await response.json();
    
    if (!response.ok || !result.success) {
      console.error(
        "Unable to fetch hearings:",
        result.message || "Request failed",
      );
      return;
    }
    
    renderHearings(result.data || []);
  } catch (error) {
    console.error("Hearings fetch error:", error);
  }
}

function renderHearings(hearings) {
  const list = document.querySelector(".hearing-table tbody");
  if (!list) return;
  const s = CASES_STATUS_MAP[hearings.status] || "active";

  list.innerHTML = hearings.map((h) => {
    return `
    <td class="hearing-flex">
                  <p class="slt">${(h.case_id)}</p>
                  <P class="V">${h.title || "\u2014"}</P>
                </td>
                <td>${h.client?.full_name || "\u2014"}</td>
                <td>${h.lawyer?.full_name || "\u2014"}</td>
                <td>${h.outcome || formatDate(h.hearing_date) || "\u2014"}</td>
                <td><span class="badge-${getHearingColor(h.hearing_date)}">${getDaysUntil(h.hearing_date) || "\u2014"} days</span></td>
                <td><span class="badge-${s}"><svg width="8" height="8" viewBox="0 0 8 8" fill="none"
                      xmlns="http://www.w3.org/2000/svg">
                      <circle cx="4" cy="4" r="4" fill="#F7060A" />
                      </svg>
                    &nbsp;${h.urgency || "\u2014"}</span></td>
              </tr>
`

}).join("");
}

async function fetchLawyers() {
  try {
    const headers = { "Content-Type": "application/json" };
    if (authToken) headers.Authorization = `Bearer ${authToken}`;

    const response = await fetch(`${DASHBOARD_API_BASE}/lawyers`, {
      method: "GET",
      headers,
    });
    const result = await response.json();
    
    if (!response.ok || !result.success) {
      console.error(
        "Unable to fetch lawyers:",
        result.message || "Request failed",
      );
      return;
    }
    
    allLawyers = result.data || [];

    renderLawyers(allLawyers);
  } catch (error) {
    console.error("Lawyers fetch error:", error);
  }
}

function renderLawyers(lawyers) {
  const lawyer = document.querySelector(".section");
  if (!lawyer) return;
  const filterByRole = lawyers.filter((lawyer) => lawyer.role === "associate");
  lawyer.innerHTML = filterByRole
    .map((l) => {
      const initials = getInitials(l.full_name);
      const active = l.is_active ? "Active" : "Inactive"; 
      return `
      <div class="lawyer-container">
        <div class="lawyer-initials">${initials}</div>
          <h2 class="lawyer-name">${l.full_name || "\u2014"}</h2>
          <p class="lawyer-case">${l.specialization || "\u2014"}</p>
          <p class="active-number">${l.role ? toTitleCase(l.role) : "\u2014"}</p>
        </div>
      </div>
    `;
  }).join("");
}


  const searchInput = document.getElementById("search");
  function searchLawyers() {
    const query = searchInput.value.toLowerCase();
    const lawyer = document.querySelector(".section");
    if (!lawyer) return;
    const filtered = allLawyers.filter((l) =>
      l.full_name.toLowerCase().includes(query) && l.role === "associate"
    );

    renderLawyers(filtered)
  }
  
  searchInput.addEventListener("input", searchLawyers);

fetchLawyers();
//// tabs

const tabs = document.querySelectorAll(".tabs");
tabs.forEach((tab) => { 
  tab.addEventListener("click", function () {
  tabs.forEach((t) => t.classList.remove("active-tab"));
  tab.classList.add("active-tab");
  });
  }); 

// toggle sidebar//
const toggleBtns = document.querySelectorAll(".toggle-btn");
const sidebar = document.querySelector(".side-bar");
const overlay = document.querySelector(".overlay");
toggleBtns.forEach((toggleBtn) => {
  toggleBtn.addEventListener("click", function () {
    sidebar.classList.toggle("show-sidebar");
    overlay.classList.remove("hidden");
  });
});

// close sidebar when clicking outside of it
overlay.addEventListener("click", function () {
  sidebar.classList.remove("show-sidebar");
  overlay.classList.add("hidden");
});

// status dropdown //
const statuses = [
  { cls: "ba", txt: "Active" },
  { cls: "bb", txt: "Urgent" },
  { cls: "bc", txt: "Pending" },
  { cls: "bd", txt: "In Review" },
];

const statusBadges = document.querySelectorAll(".case-status");

statusBadges.forEach((badge) => {
  let current = 0;
  badge.addEventListener("click", function () {
    current = (current + 1) % statuses.length;
    badge.className = "case-status " + statuses[current].cls;
    badge.querySelector(".status-txt").textContent = statuses[current].txt;
  });
});



function getDate(date) {
  const userDate = new Date(date);
  const dateToday = new Date();

  userDate.setHours(0, 0, 0);
  dateToday.setHours(0, 0, 0);

  const diffTime = userDate - dateToday;

  if (diffTime < 0) {
    return "Expired";
  }

  const milliseconds = 24 * 60 * 60 * 1000;
  const remainingDays = Math.ceil(Math.floor(diffTime / milliseconds));
  return remainingDays;
}

getDate(data.map((caseData) => caseData.date));
fetchDashboardStats();
fetchRecentCases();
fetchUpcomingHearings();
fetchCases();
fetchClients();
fetchHearing();

//Nav section showing


navItems.forEach((navItem, i) => {
  navItem.addEventListener("click", function () {
    navItems.forEach((item) => {
      item.classList.remove("nav-list");
    });
    navItem.classList.add("nav-list");
    sections.forEach((section) => {
      section.classList.remove("visible");
    });
    sections[i].classList.add("visible");
    checkHeader();
  });

});

const navBtn = document.querySelector(".btn_1");
const form = document.querySelector("form");
const cancelBtns = document.querySelectorAll(".cancel-case-btn");
const addBtn = document.querySelector(".add-case");
const caseFormError = document.getElementById("case-form-error");
const caseFormSuccess = document.getElementById("case-form-success");

navBtn.addEventListener("click", function () {
  form.classList.remove("hidden");
  overlay.classList.remove("hidden");
});

cancelBtns.forEach((btn) => {
  btn.addEventListener("click", function () {
    form.classList.add("hidden");
    overlay.classList.add("hidden");
  });
});

overlay.addEventListener("click", function () {
  form.classList.add("hidden");
});

form.addEventListener("submit", async function (e) {
  e.preventDefault();
  if (caseFormError) caseFormError.classList.add("hidden");
  if (caseFormSuccess) caseFormSuccess.classList.add("hidden");

  const title = document.getElementById("case-title").value.trim();
  const description = document.getElementById("case-description").value.trim();
  const clientId = document.getElementById("case-client-id").value.trim();
  const caseType = document.getElementById("case-type").value;
  const status = document.getElementById("case-status").value;
  const lawyerId = document.getElementById("case-lawyer-id").value.trim();
  const filedDate = document.getElementById("case-filed-date").value;

  if (!title || !clientId || !caseType || !status || !filedDate) {
    if (caseFormError) {
      caseFormError.textContent = "Please fill in all required fields.";
      caseFormError.classList.remove("hidden");
    }
    return;
  }

  const body = {
    title,
    case_type: caseType,
    client_id: clientId,
    status,
    filed_date: filedDate,
  };
  if (description) body.description = description;
  if (lawyerId) body.lawyer_id = lawyerId;

  const submitButton = form.querySelector(".add-case");
  submitButton.disabled = true;
  submitButton.textContent = "Creating...";

  try {
    const headers = { "Content-Type": "application/json" };
    if (authToken) headers.Authorization = `Bearer ${authToken}`;

    const response = await fetch(`${DASHBOARD_API_BASE}/cases`, {
      method: "POST",
      headers,
      body: JSON.stringify(body),
    });

    const result = await response.json();

    if (!response.ok || !result.success) {
      if (caseFormError) {
        caseFormError.textContent =
          result.message || "Failed to create case. Please try again.";
        caseFormError.classList.remove("hidden");
      }
      return;
    }

    if (caseFormSuccess) {
      caseFormSuccess.textContent = "Case created successfully!";
      caseFormSuccess.classList.remove("hidden");
    }

    form.reset();
    // Refresh cases table and dashboard stats
    fetchCases();
    fetchRecentCases();
    fetchDashboardStats();
    fetchHearing();
    fetchUpcomingHearings();
    fetchLawyers();

    setTimeout(() => {
      form.classList.add("hidden");
      overlay.classList.add("hidden");
      if (caseFormSuccess) caseFormSuccess.classList.add("hidden");
    }, 1200);
  } catch (error) {
    console.error("Create case error:", error);
    if (caseFormError) {
      caseFormError.textContent =
        "Network error. Please check your connection and try again.";
      caseFormError.classList.remove("hidden");
    }
  } finally {
    submitButton.disabled = false;
    submitButton.textContent = "Create Case";
  }
});