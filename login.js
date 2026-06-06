/* ============================================================
   LOGIN.JS — Xử lý đăng nhập MobileShop
   ============================================================ */
'use strict';

/* ---------- Tài khoản admin mặc định ---------- */
var DEFAULT_ADMIN = {
  name: 'Admin',
  email: 'admin@mobileshop.com',
  password: 'admin123',
  phone: '',
  role: 'admin'
};

/* ---------- Khởi tạo dữ liệu ---------- */
function initAuth() {
  var users = JSON.parse(localStorage.getItem('ms_users') || '[]');

  // Thêm admin mặc định nếu chưa có
  var hasAdmin = users.some(function (u) {
    return u.email === DEFAULT_ADMIN.email;
  });
  if (!hasAdmin) {
    users.push(DEFAULT_ADMIN);
    localStorage.setItem('ms_users', JSON.stringify(users));
  }

  // Di chuyển user cũ (ms_user) sang mảng ms_users nếu có
  var oldUser = JSON.parse(localStorage.getItem('ms_user') || 'null');
  if (oldUser && oldUser.email) {
    var exists = users.some(function (u) {
      return u.email === oldUser.email;
    });
    if (!exists) {
      users.push({
        name: oldUser.name || '',
        email: oldUser.email,
        password: oldUser.password || '',
        phone: oldUser.phone || '',
        role: oldUser.role || 'customer'
      });
      localStorage.setItem('ms_users', JSON.stringify(users));
    }
    localStorage.removeItem('ms_user');
  }
}

/* ---------- Lấy danh sách users ---------- */
function getUsers() {
  return JSON.parse(localStorage.getItem('ms_users') || '[]');
}

/* ---------- Đăng nhập ---------- */
function doLogin() {
  var email = document.getElementById('loginEmail').value.trim();
  var pw = document.getElementById('loginPw').value;

  if (!email || !pw) {
    alert('Vui lòng nhập đầy đủ email và mật khẩu!');
    return;
  }

  var users = getUsers();
  var found = users.find(function (u) {
    return u.email === email && u.password === pw;
  });

  if (!found) {
    alert('Email hoặc mật khẩu không đúng! Vui lòng kiểm tra lại hoặc đăng ký tài khoản mới.');
    return;
  }

  // Lưu session
  var session = { name: found.name, email: found.email, role: found.role };
  localStorage.setItem('ms_session', JSON.stringify(session));

  // Chuyển hướng theo role
  var redirectCheckout = sessionStorage.getItem('redirect_to_checkout') === 'true';
  if (redirectCheckout) {
    sessionStorage.removeItem('redirect_to_checkout');
    window.location.href = 'checkout.html';
  } else if (found.role === 'admin') {
    // Admin → ở lại trang dashboard
    if (typeof loadDashboard === 'function') {
      loadDashboard(session);
    }
    if (typeof accToast === 'function') {
      accToast('Chào mừng Admin! 🎉');
    }
  } else {
    // Customer → chuyển về trang chủ
    window.location.href = 'index.html';
  }
}
//hello

/* ---------- Đăng xuất ---------- */
function doLogout() {
  if (!confirm('Bạn có chắc muốn đăng xuất không?')) return;
  localStorage.removeItem('ms_session');

  // Nếu đang ở trang Account → hiện lại form login
  var dashboard = document.getElementById('dashboard');
  var authScreen = document.getElementById('authScreen');
  if (dashboard) dashboard.classList.remove('active');
  if (authScreen) authScreen.style.display = 'flex';

  // Nếu đang ở trang khác → chuyển về trang chủ
  if (!authScreen) {
    window.location.href = 'index.html';
  }
}

/* ---------- Kiểm tra session (auto login) ---------- */
function checkSession() {
  var session = JSON.parse(localStorage.getItem('ms_session') || 'null');
  if (session && typeof loadDashboard === 'function') {
    loadDashboard(session);
  }
}

/* ---------- Chuyển tab Login / Register ---------- */
function switchTab(tab) {
  var tabLogin = document.getElementById('tabLogin');
  var tabRegister = document.getElementById('tabRegister');
  var formLogin = document.getElementById('formLogin');
  var formRegister = document.getElementById('formRegister');
  if (tabLogin) tabLogin.classList.toggle('active', tab === 'login');
  if (tabRegister) tabRegister.classList.toggle('active', tab === 'register');
  if (formLogin) formLogin.classList.toggle('active', tab === 'login');
  if (formRegister) formRegister.classList.toggle('active', tab === 'register');
}

/* ---------- Toggle hiện/ẩn mật khẩu ---------- */
function togglePw(id, btn) {
  var inp = document.getElementById(id);
  if (!inp) return;
  var isText = inp.type === 'text';
  inp.type = isText ? 'password' : 'text';
  var icon = btn.querySelector('i');
  if (icon) icon.className = isText ? 'fa-regular fa-eye' : 'fa-regular fa-eye-slash';
}

/* ---------- Quên mật khẩu ---------- */
function forgotPw() {
  var email = document.getElementById('loginEmail').value.trim();
  if (!email) {
    alert('Vui lòng nhập email trước!');
    return;
  }
  if (typeof accToast === 'function') {
    accToast('Đã gửi link đặt lại mật khẩu tới ' + email, 'fa-envelope');
  } else {
    alert('Đã gửi link đặt lại mật khẩu tới ' + email);
  }
}

/* ---------- Khởi tạo khi load ---------- */
initAuth();
