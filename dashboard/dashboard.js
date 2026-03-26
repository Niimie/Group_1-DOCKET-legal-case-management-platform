const data = JSON.parse(localStorage.getItem("storedData")) || [];
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

    renderCasesTable(result.data || []);
  } catch (error) {
    console.error("Cases fetch error:", error);
  }
}

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

function mapCases() {
  const casesTable = document.querySelector(".cases-table tbody");

  casesTable.innerHTML = data
    .map((caseData) => {
      return `
        <tr>
                    <td>SLT-${(data.indexOf(caseData) + 1).toString().padStart(3, "0")}</td>
                    <td>
                      <div>
                        <h4>${caseData.case}</h4>
                          <p>Civic Litigation</p>
                      </div>
                    </td>
                    <td>${caseData.client}</td>
                    <td>${caseData.lawyer}</td>
                    <td>
                      <button class="case-active"><svg width="10" height="10" viewBox="0 0 10 10" fill="none"
                          xmlns="http://www.w3.org/2000/svg">
                          <path
                            d="M5 10C6.32608 10 7.59785 9.47322 8.53553 8.53553C9.47322 7.59785 10 6.32608 10 5C10 3.67392 9.47322 2.40215 8.53553 1.46447C7.59785 0.526784 6.32608 0 5 0C3.67392 0 2.40215 0.526784 1.46447 1.46447C0.526784 2.40215 0 3.67392 0 5C0 6.32608 0.526784 7.59785 1.46447 8.53553C2.40215 9.47322 3.67392 10 5 10Z"
                            fill="#34C759" />
                        </svg> &nbsp;Active
                      </button>
                    </td>
                    <td>${caseData.date}</td>
                    <td>${caseData.filed}</td>
                  </tr>
        `;
    })
    .join("");
}

mapCases();

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

function mapHearing() {
  const hearingTable = document.querySelector(".hearing-table tbody");

  hearingTable.innerHTML = data
    .map((caseData) => {
      return `
        <tr>
                <td class="hearing-flex">
                  <p class="slt">SLT-${(data.indexOf(caseData) + 1).toString().padStart(3, "0")}</p>
                  <P class="V">${caseData.case}</P>
                </td>
                <td>${caseData.client}</td>
                <td>${caseData.lawyer}</td>
                <td>${caseData.date}</td>
                <td><span class="badge-blue">${getDate(caseData.date)} days</span></td>
                <td><span class="badge-active"><svg width="8" height="8" viewBox="0 0 8 8" fill="none"
                      xmlns="http://www.w3.org/2000/svg">
                      <circle cx="4" cy="4" r="4" fill="#34C759" />
                    </svg>
                    &nbsp;Active</span></td>
              </tr>
    `;
    })
    .join("");
}

mapHearing();

function mapLawyer() {
  const lawyer = document.querySelector(".section");
  lawyer.innerHTML = data.map((caseData) => {
    return `
        <div class="lawyer-container">
            <h2 class="lawyer-initials">${caseData.lawyer
              .split(" ")
              .map((word) => word.charAt(0).toUpperCase())
              .join("")}</h2>
            <h2 class="lawyer-name">${caseData.lawyer}</h2>
            <p class="lawyer-case">${caseData.type}</p>
            <p class="active-number">Active Case: 1</p>
          </div>
    `;
  });
}

mapLawyer();
fetchDashboardStats();
fetchRecentCases();
fetchUpcomingHearings();
fetchCases();
fetchClients();

//Nav section showing
const navItems = document.querySelectorAll(".lists");
const sections = document.querySelectorAll(".direct");

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
  });
});

const navBtn = document.querySelector(".btn_1");
const form = document.querySelector("form");
const cancelForm = document.querySelector(".cancel-case-btn");
const addBtn = document.querySelector(".add-case");

navBtn.addEventListener("click", function () {
  form.classList.remove("hidden");
  overlay.classList.remove("hidden");
});

cancelForm.addEventListener("click", function () {
  form.classList.add("hidden");
  overlay.classList.add("hidden");
});

overlay.addEventListener("click", function () {
  form.classList.add("hidden");
});

form.addEventListener("submit", function (e) {
  e.preventDefault();

  const caseTitle = document.getElementById("case").value;
  const clientName = document.getElementById("client").value;
  const hearingDate = document.getElementById("date").value;
  const caseType = document.getElementById("case-type").value;
  const assignedLawyer = document.getElementById("assign-lawyer").value;
  const filedDate = document.getElementById("filed").value;

  const collectData = {
    case: caseTitle,
    client: clientName,
    date: hearingDate,
    type: caseType,
    lawyer: assignedLawyer,
    filed: filedDate,
  };

  data.push(collectData);
  localStorage.setItem("storedData", JSON.stringify(data));

  form.reset();
  form.classList.add("hidden");
  overlay.classList.add("hidden");
  mapCases();
  mapHearing();
  mapLawyer();
});
