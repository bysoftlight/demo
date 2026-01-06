let currentUser = null;
let historyData = [];
let currentFilter = 'week';
let selectedMonth = new Date().getMonth();
let selectedYear = new Date().getFullYear();

// Logout
window.handleLogout = () => {
    if (confirm('คุณต้องการออกจากระบบและปิดแอพ HR Paper Mill ใช่ไหม')) {
        localStorage.removeItem('HR_PAPER_USER_ID');
        window.location.href = 'index.html';
    }
};

window.setFilter = (type) => {
    currentFilter = type;
    updateFilterUI();
    renderList();
};

window.closeImageModal = () => {
    document.getElementById('img-modal').classList.add('hidden');
};

document.addEventListener('DOMContentLoaded', async () => {
    const savedId = localStorage.getItem('HR_PAPER_USER_ID');
    if (!savedId) { window.location.href = 'index.html'; return; }

    // Header Day
    const days = ['วันอาทิตย์', 'วันจันทร์', 'วันอังคาร', 'วันพุธ', 'วันพฤหัสบดี', 'วันศุกร์', 'วันเสาร์'];
    document.getElementById('header-day').innerText = days[new Date().getDay()];

    // Load User
    const cachedUser = localStorage.getItem('HR_PAPER_USER_DATA');
    if (cachedUser) {
        currentUser = JSON.parse(cachedUser);
        document.getElementById('user-pic').src = currentUser.pic;
        document.getElementById('user-name').innerText = currentUser.name;
        document.getElementById('user-id').innerText = currentUser.id;
        document.getElementById('user-status').innerText = currentUser.status;
    }

    // Default UI
    updateFilterUI();

    // Fetch History
    const res = await callApi('history', { userId: savedId });
    if (res.success && res.history) {
        historyData = res.history;
        renderList();
    } else {
        document.getElementById('history-list').innerHTML = '<div class="text-center text-gray-400 mt-10">ไม่พบข้อมูล</div>';
    }
});

function updateFilterUI() {
    ['week', 'month', 'year'].forEach(t => {
        const btn = document.getElementById(`f-${t}`);
        if (t === currentFilter) {
            btn.className = "px-6 py-2 rounded-full border border-[#5fbaff] font-bold transition-colors bg-[#5fbaff] text-white";
        } else {
            btn.className = "px-6 py-2 rounded-full border border-gray-300 font-bold transition-colors bg-white text-gray-400";
        }
    });
}

function renderList() {
    const container = document.getElementById('history-list');
    const now = new Date();

    const filtered = historyData.filter(item => {
        const d = new Date(item.timestamp);
        if (currentFilter === 'week') {
            const startOfWeek = new Date(now);
            startOfWeek.setDate(now.getDate() - now.getDay());
            startOfWeek.setHours(0, 0, 0, 0);
            return d >= startOfWeek;
        } else if (currentFilter === 'month') {
            return d.getMonth() === selectedMonth && d.getFullYear() === selectedYear;
        } else {
            return d.getFullYear() === selectedYear;
        }
    });

    // Update Summary
    document.getElementById('summary-count').innerText = filtered.length;

    const monthNames = ["มกราคม", "กุมภาพันธ์", "มีนาคม", "เมษายน", "พฤษภาคม", "มิถุนายน", "กรกฎาคม", "สิงหาคม", "กันยายน", "ตุลาคม", "พฤศจิกายน", "ธันวาคม"];

    if (currentFilter === 'week') {
        // Simple week calc matching React logic
        const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const pastDaysOfMonth = (now.getTime() - firstDayOfMonth.getTime()) / 86400000;
        const weekNum = Math.ceil((pastDaysOfMonth + firstDayOfMonth.getDay() + 1) / 7);
        document.getElementById('summary-title').innerHTML = `สัปดาห์ที่ ${weekNum} ของเดือน${monthNames[now.getMonth()]}`;
        document.getElementById('summary-desc').innerText = "ยอดส่งงานสัปดาห์นี้";
    } else if (currentFilter === 'month') {
        document.getElementById('summary-title').innerHTML = `เดือน ${monthNames[selectedMonth]} ${selectedYear + 543}`;
        document.getElementById('summary-desc').innerText = "ยอดส่งงานรายเดือน";
    } else {
        document.getElementById('summary-title').innerHTML = `ปี ${selectedYear + 543}`;
        document.getElementById('summary-desc').innerText = "ยอดรวมทั้งปี";
    }

    if (filtered.length === 0) {
        container.innerHTML = '<div class="text-center text-gray-400 mt-10">ไม่พบข้อมูล</div>';
        return;
    }

    container.innerHTML = filtered.map((item, index) => {
        const isToday = new Date(item.timestamp).toDateString() === now.toDateString();
        const dateStr = new Date(item.timestamp).toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: '2-digit' });

        return `
        <div>
            ${isToday && index === 0 ? '<div class="text-lg font-bold mb-2 ml-2">วันนี้</div>' : ''}
            <div class="bg-white rounded-3xl overflow-hidden transition-all duration-300 shadow-sm p-4 cursor-pointer" onclick="toggleItem(this)">
                <div class="flex items-center justify-between">
                    <div class="flex items-center gap-4">
                        <div class="w-3 h-3 rounded-full ${isToday ? 'bg-green-500' : 'bg-gray-300'}"></div>
                        <div class="w-12 h-12 rounded-full flex items-center justify-center font-bold text-white bg-pink-100"></div>
                        <div>
                            <div class="font-bold text-black">${item.type}</div>
                            <div class="text-xs text-gray-500">${currentUser.name}</div>
                        </div>
                    </div>
                    <div class="text-right">
                        <div class="text-xs text-gray-500">${item.time} น.</div>
                        <i class="bi bi-chevron-down text-gray-400 text-xs transition-transform block mt-1 chevron-icon"></i>
                    </div>
                </div>
                <div class="details hidden mt-4 animate-fade-in">
                    <div class="rounded-xl overflow-hidden shadow-inner mb-2" onclick="event.stopPropagation(); openImage('${item.image}')">
                        <img src="${item.image}" class="w-full h-48 object-cover">
                    </div>
                    <div class="text-center text-[10px] text-gray-500">${dateStr} ${item.time} น.</div>
                </div>
            </div>
        </div>`;
    }).join('');
}

window.toggleItem = (el) => {
    const details = el.querySelector('.details');
    const icon = el.querySelector('.chevron-icon');
    const avatar = el.querySelector('.bg-pink-100, .bg-pink-200');

    if (details.classList.contains('hidden')) {
        details.classList.remove('hidden');
        icon.classList.add('rotate-180');
        el.classList.add('bg-gradient-to-b', 'from-green-50', 'to-green-100/50');
        if (avatar) { avatar.classList.remove('bg-pink-100'); avatar.classList.add('bg-pink-200'); }
    } else {
        details.classList.add('hidden');
        icon.classList.remove('rotate-180');
        el.classList.remove('bg-gradient-to-b', 'from-green-50', 'to-green-100/50');
        if (avatar) { avatar.classList.remove('bg-pink-200'); avatar.classList.add('bg-pink-100'); }
    }
};

window.openImage = (url) => {
    document.getElementById('modal-image').src = url;
    document.getElementById('modal-download').href = url;
    document.getElementById('img-modal').classList.remove('hidden');
};