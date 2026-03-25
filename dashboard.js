// toggle sidebar// 
const toggleBtn = document.querySelector('.toggle-btn');
const sidebar = document.querySelector('.side-bar');

toggleBtn.addEventListener('click', function() {
    sidebar.classList.toggle('show-sidebar');
});

// close sidebar when clicking outside of it //
document.addEventListener('click', function(e) {
    if (!sidebar.contains(e.target) && !toggleBtn.contains(e.target)) {
        sidebar.classList.remove('show-sidebar');
    }
});


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
