const  data = JSON.parse(localStorage.getItem("storedData")) || [];
// toggle sidebar// 
const toggleBtns = document.querySelectorAll('.toggle-btn');
const sidebar = document.querySelector('.side-bar');
const overlay = document.querySelector(".overlay");
toggleBtns.forEach((toggleBtn) => {
    toggleBtn.addEventListener('click', function() {
        sidebar.classList.toggle('show-sidebar');
        overlay.classList.remove("hidden");
    });
})

// close sidebar when clicking outside of it
overlay.addEventListener("click", function() {
    sidebar.classList.remove("show-sidebar");
    overlay.classList.add("hidden");
})

// status dropdown // 
const statuses = [
    { cls: 'ba', txt: 'Active' },
    { cls: 'bb', txt: 'Urgent' },
    { cls: 'bc', txt: 'Pending' },
    { cls: 'bd', txt: 'In Review' }
];

const statusBadges = document.querySelectorAll('.case-status');

statusBadges.forEach(badge => {
    let current = 0;
    badge.addEventListener('click', function() {
        current = (current + 1) % statuses.length;
        badge.className = 'case-status ' + statuses[current].cls;
        badge.querySelector('.status-txt').textContent = statuses[current].txt;
    });
});

function mapCases() {
    const casesTable = document.querySelector(".cases-table tbody");
       
        casesTable.innerHTML = data.map((caseData) => { return `
        <tr>
                    <td>SLT-${(data.indexOf(caseData) + 1).toString().padStart(3, '0')}</td>
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
    }).join("")
}

mapCases();

function getDate(date) {
    const userDate = new Date(date);
    const dateToday = new Date();
    
    userDate.setHours(0, 0, 0);
    dateToday.setHours(0, 0, 0);

    const diffTime = userDate - dateToday;

    if(diffTime < 0) {
        return "Expired";
    }

    const milliseconds = (24 * 60 * 60 * 1000);
    const remainingDays = Math.ceil(Math.floor(diffTime / milliseconds));
    return remainingDays;
}

getDate(data.map((caseData) => caseData.date))

function mapHearing() {
    const hearingTable = document.querySelector(".hearing-table tbody");

    hearingTable.innerHTML = data.map((caseData) => {
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
    `}).join("");
}

mapHearing();

function mapLawyer() {
    const lawyer = document.querySelector(".section");
    lawyer.innerHTML = data.map((caseData) => { return`
        <div class="lawyer-container">
            <h2 class="lawyer-initials">${(caseData.lawyer).split(" ").map(word => word.charAt(0).toUpperCase()).join("")}</h2>
            <h2 class="lawyer-name">${caseData.lawyer}</h2>
            <p class="lawyer-case">${caseData.type}</p>
            <p class="active-number">Active Case: 1</p>
          </div>
    `})
}

mapLawyer();



//Nav section showing
const navItems = document.querySelectorAll(".lists");
const sections = document.querySelectorAll(".direct");

navItems.forEach((navItem, i) => {
    navItem.addEventListener("click", function() {
        navItems.forEach((item) => {
           item.classList.remove("nav-list")
    });
        navItem.classList.add("nav-list");
        sections.forEach((section) => {
            section.classList.remove("visible");
        });
        sections[i].classList.add("visible");
    })
})

const navBtn = document.querySelector(".btn_1");
const form = document.querySelector("form");
const cancelForm = document.querySelector(".cancel-case-btn");
const addBtn = document.querySelector(".add-case")

navBtn.addEventListener("click", function() {
    form.classList.remove("hidden");
    overlay.classList.remove("hidden");
});

cancelForm.addEventListener("click", function() {
    form.classList.add("hidden");
    overlay.classList.add("hidden");
})

overlay.addEventListener("click", function() {
    form.classList.add("hidden");
});


form.addEventListener("submit", function(e) {
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
    }

    data.push(collectData);
    localStorage.setItem("storedData", JSON.stringify(data));

    form.reset();
    form.classList.add("hidden");
    overlay.classList.add("hidden");
    mapCases();
    mapHearing();
    mapLawyer();
})
