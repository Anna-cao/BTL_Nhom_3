/* ============================================================
   REGISTER.JS — Xử lý đăng ký MobileShop
   ============================================================ */
'use strict';

/* ---------- Đăng ký tài khoản mới ---------- */
function doRegister() {
  var name = document.getElementById('regName').value.trim();
  var email = document.getElementById('regEmail').value.trim();
  var phone = document.getElementById('regPhone').value.trim();
  var pw = document.getElementById('regPw').value;
  var pwConf = document.getElementById('regPwConfirm').value;

  // Validate
  if (!name || !email || !phone || !pw) {
    alert('Vui lòng điền đầy đủ thông tin!');
    return;
  }
  if (!email.includes('@')) {
    alert('Email không hợp lệ!');
    return;
  }
  if (pw.length < 6) {
    alert('Mật khẩu tối thiểu 6 ký tự!');
    return;
  }
  if (pw !== pwConf) {
    alert('Xác nhận mật khẩu không khớp!');
    return;
  }

  // Kiểm tra email đã tồn tại chưa
  var users = JSON.parse(localStorage.getItem('ms_users') || '[]');
  var emailExists = users.some(function (u) {
    return u.email === email;
  });
  if (emailExists) {
    alert('Email này đã được đăng ký! Vui lòng dùng email khác hoặc đăng nhập.');
    return;
  }

  // Thêm user mới vào mảng
  var newUser = {
    name: name,
    email: email,
    password: pw,
    phone: phone,
    role: 'customer'
  };
  users.push(newUser);
  localStorage.setItem('ms_users', JSON.stringify(users));

  // Tự động đăng nhập
  var session = { name: name, email: email, role: 'customer' };
  localStorage.setItem('ms_session', JSON.stringify(session));

  // Thông báo thành công
  if (typeof accToast === 'function') {
    accToast('Đăng ký thành công! Chào mừng ' + name + ' 🎉');
  }

  // Chuyển hướng
  setTimeout(function () {
    var redirectCheckout = sessionStorage.getItem('redirect_to_checkout') === 'true';
    if (redirectCheckout) {
      sessionStorage.removeItem('redirect_to_checkout');
      window.location.href = 'checkout.html';
    } else {
      window.location.href = 'index.html';
    }
  }, 800);
}

/* ---------- Kiểm tra độ mạnh mật khẩu ---------- */
function checkStrength(val) {
  var bar = document.getElementById('pwBarFill');
  var txt = document.getElementById('pwStrengthText');
  if (!bar) return;

  var score = 0;
  if (val.length >= 6) score++;
  if (val.length >= 10) score++;
  if (/[A-Z]/.test(val)) score++;
  if (/[0-9]/.test(val)) score++;
  if (/[^A-Za-z0-9]/.test(val)) score++;

  var levels = [
    { pct: '0%', color: '#e5e7eb', label: 'Nhập mật khẩu' },
    { pct: '25%', color: '#f87171', label: 'Yếu' },
    { pct: '50%', color: '#fb923c', label: 'Trung bình' },
    { pct: '75%', color: '#facc15', label: 'Khá mạnh' },
    { pct: '90%', color: '#4ade80', label: 'Mạnh' },
    { pct: '100%', color: '#22c55e', label: 'Rất mạnh' }
  ];
  var lv = levels[Math.min(score, 5)];
  bar.style.width = lv.pct;
  bar.style.background = lv.color;
  txt.textContent = lv.label;
}
