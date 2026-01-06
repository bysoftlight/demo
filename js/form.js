let currentUser = null;
let locationData = null;
let salesType = 'SELF';
let selectedImageFile = null;

// Handle Sales Type Toggle
window.setSalesType = (type) => {
    salesType = type;
    const selfRadio = document.getElementById('radio-self');
    const agentRadio = document.getElementById('radio-agent');
    const reasonWrapper = document.getElementById('agent-reason-wrapper');
    const reasonInput = document.getElementById('agent-reason');

    const activeClass = "w-6 h-6 rounded-full border-2 border-blue-500 flex items-center justify-center";
    const inactiveClass = "w-6 h-6 rounded-full border-2 border-gray-300 flex items-center justify-center";
    const dot = '<div class="w-3 h-3 bg-blue-500 rounded-full"></div>';

    if (type === 'SELF') {
        selfRadio.className = activeClass; selfRadio.innerHTML = dot;
        agentRadio.className = inactiveClass; agentRadio.innerHTML = '';
        reasonWrapper.classList.add('hidden');
    } else {
        agentRadio.className = activeClass; agentRadio.innerHTML = dot;
        selfRadio.className = inactiveClass; selfRadio.innerHTML = '';
        reasonWrapper.classList.remove('hidden');
    }
    checkFormValidity();
};

window.handleLogout = () => {
    if (confirm('คุณต้องการออกจากระบบและปิดแอพ HR Paper Mill ใช่ไหม')) {
        localStorage.removeItem('HR_PAPER_USER_ID');
        window.location.href = 'index.html';
    }
};

document.addEventListener('DOMContentLoaded', async () => {
    // 1. Check User
    const savedId = localStorage.getItem('HR_PAPER_USER_ID');
    if (!savedId) { window.location.href = 'index.html'; return; }

    // Get Cached Profile
    const cachedUser = localStorage.getItem('HR_PAPER_USER_DATA');
    if (cachedUser) {
        currentUser = JSON.parse(cachedUser);
        renderUser(currentUser);
    } else {
        // Fetch fresh if needed (optional)
        const res = await callApi('login', { userId: savedId });
        if (res.success) {
            currentUser = res.data;
            renderUser(currentUser);
        }
    }

    // 2. Clock
    startClock();

    // 3. Location
    getLocation();

    // 4. Header Day
    const days = ['วันอาทิตย์', 'วันจันทร์', 'วันอังคาร', 'วันพุธ', 'วันพฤหัสบดี', 'วันศุกร์', 'วันเสาร์'];
    document.getElementById('header-day').innerText = days[new Date().getDay()];

    // 5. Events
    document.getElementById('btn-toggle-loc').addEventListener('click', () => {
        const panel = document.getElementById('location-panel');
        const arrow = document.getElementById('loc-arrow');
        panel.classList.toggle('hidden');
        arrow.classList.toggle('rotate-180');
    });
    document.getElementById('btn-refresh-loc').addEventListener('click', getLocation);
    document.getElementById('evidence-upload').addEventListener('change', handleImageChange);
    document.getElementById('agent-reason').addEventListener('input', checkFormValidity);
    document.getElementById('btn-submit').addEventListener('click', handleSubmit);
});

function renderUser(user) {
    document.getElementById('user-pic').src = user.pic;
    document.getElementById('user-name').innerText = user.name;
    document.getElementById('user-id').innerText = user.id;
    document.getElementById('user-status').innerText = user.status;
    document.getElementById('form-user-name').innerText = user.name;
}

function startClock() {
    const update = () => {
        const now = new Date();
        document.getElementById('current-date').innerText = now.toLocaleDateString('th-TH', { day: '2-digit', month: '2-digit', year: 'numeric' });
        document.getElementById('current-time').innerText = now.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' });
    };
    update();
    setInterval(update, 1000);
}

function getLocation() {
    const locText = document.getElementById('location-text');
    locText.innerText = "กำลังระบุพิกัด...";
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (pos) => {
                locationData = { lat: pos.coords.latitude, lng: pos.coords.longitude };
                locText.innerText = `ระบุตำแหน่งแล้ว (${locationData.lat.toFixed(4)}, ${locationData.lng.toFixed(4)})`;
                checkFormValidity();
            },
            (err) => {
                console.error(err);
                locText.innerText = "ไม่พบตำแหน่ง";
                checkFormValidity();
            },
            { enableHighAccuracy: true }
        );
    } else {
        locText.innerText = "Browser ไม่รองรับ GPS";
    }
}

function handleImageChange(e) {
    if (e.target.files && e.target.files[0]) {
        selectedImageFile = e.target.files[0];
        const reader = new FileReader();
        reader.onload = (ev) => {
            document.getElementById('image-preview').src = ev.target.result;
            document.getElementById('preview-container').classList.remove('hidden');
        };
        reader.readAsDataURL(selectedImageFile);

        const btn = document.getElementById('upload-btn');
        const hint = document.getElementById('upload-hint');

        btn.classList.remove('border-[#ff914d]', 'text-[#ff914d]', 'bg-white');
        btn.classList.add('border-gray-400', 'text-gray-600', 'bg-gray-50');

        hint.innerText = "เมื่อถ่ายรูปหลักฐานแล้ว ส่วนนี้จะเปลี่ยนเป็นสีเทา #737373";
        hint.classList.remove('text-[#ff914d]');
        hint.classList.add('text-[#737373]');

        checkFormValidity();
    }
}

function checkFormValidity() {
    const reason = document.getElementById('agent-reason').value;
    const isValid = locationData && selectedImageFile && (salesType === 'SELF' || (salesType === 'AGENT' && reason.trim() !== ''));

    const btn = document.getElementById('btn-submit');
    if (isValid) {
        btn.disabled = false;
        btn.classList.remove('bg-gray-300', 'cursor-not-allowed');
        btn.classList.add('bg-[#007ef1]', 'hover:bg-blue-600', 'shadow-blue-500/30');
    } else {
        btn.disabled = true;
        btn.classList.add('bg-gray-300', 'cursor-not-allowed');
        btn.classList.remove('bg-[#007ef1]', 'hover:bg-blue-600', 'shadow-blue-500/30');
    }
}

async function handleSubmit() {
    const btn = document.getElementById('btn-submit');
    btn.disabled = true;
    const originalText = btn.innerHTML;
    btn.innerHTML = '<span>กำลังบันทึก...</span>';

    try {
        const base64 = await compressImage(selectedImageFile);
        const formData = {
            userName: currentUser.name,
            salesType: salesType === 'SELF' ? 'ทำการขายด้วยตัวเอง' : 'ทำการขายโดยตัวแทน',
            reason: salesType === 'AGENT' ? document.getElementById('agent-reason').value : '',
            lat: locationData.lat,
            long: locationData.lng,
            imageFile: {
                name: selectedImageFile.name,
                mimeType: "image/jpeg",
                data: base64
            }
        };

        const res = await callApi('submit', { userId: currentUser.id, formData });
        if (res.success) {
            alert('บันทึกข้อมูลสำเร็จ');
            window.location.href = 'history.html';
        } else {
            alert('บันทึกไม่สำเร็จ: ' + res.message);
        }
    } catch (e) {
        console.error(e);
        alert('เกิดข้อผิดพลาด');
    } finally {
        btn.disabled = false;
        btn.innerHTML = originalText;
        checkFormValidity();
    }
}
