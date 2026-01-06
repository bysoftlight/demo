document.addEventListener('DOMContentLoaded', () => {
    // Check Auto Login
    const savedId = localStorage.getItem('HR_PAPER_USER_ID');
    if (savedId) {
        // Redirect to form logic (skip login check for speed or re-verify)
        window.location.href = 'form.html';
        return;
    }

    // Set Header Date
    const days = ['วันอาทิตย์', 'วันจันทร์', 'วันอังคาร', 'วันพุธ', 'วันพฤหัสบดี', 'วันศุกร์', 'วันเสาร์'];
    document.getElementById('header-day').innerText = days[new Date().getDay()];

    const loginInput = document.getElementById('login-id');
    const loginBtn = document.getElementById('btn-login');

    loginInput.addEventListener('input', (e) => {
        const val = e.target.value.toUpperCase();
        e.target.value = val;

        if (val.length === 6) {
            loginBtn.disabled = false;
            loginBtn.classList.remove('bg-blue-300', 'cursor-not-allowed');
            loginBtn.classList.add('bg-blue-500', 'hover:bg-blue-600', 'shadow-blue-500/30');
        } else {
            loginBtn.disabled = true;
            loginBtn.classList.add('bg-blue-300', 'cursor-not-allowed');
            loginBtn.classList.remove('bg-blue-500', 'hover:bg-blue-600', 'shadow-blue-500/30');
        }
    });

    document.getElementById('login-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        loginBtn.innerText = "กำลังตรวจสอบ...";
        loginBtn.disabled = true;

        const res = await callApi('login', { userId: loginInput.value });

        if (res.success && res.data) {
            localStorage.setItem('HR_PAPER_USER_ID', res.data.id);
            localStorage.setItem('HR_PAPER_USER_DATA', JSON.stringify(res.data)); // Cache user data
            window.location.href = 'form.html';
        } else {
            alert(res.message || 'รหัสไม่ถูกต้อง');
            loginBtn.innerText = "ตรวจสอบข้อมูล";
            loginBtn.disabled = false;
            localStorage.removeItem('HR_PAPER_USER_ID');
        }
    });
});
