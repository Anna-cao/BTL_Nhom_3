/* ============================================================
   MOBILESHOP — main.js
   ============================================================ */
'use strict';

/* ============================================================
   HERO SLIDESHOW
   ============================================================ */
(function () {
  const slides = document.querySelectorAll('.hero-slide');
  const dotsContainer = document.getElementById('heroDots');
  const prevBtn = document.getElementById('heroPrev');
  const nextBtn = document.getElementById('heroNext');
  if (!slides.length) return;

  let current = 0;
  let timer = null;
  const INTERVAL = 5500;

  slides.forEach((_, i) => {
    const btn = document.createElement('button');
    btn.className = 'hero-dot' + (i === 0 ? ' active' : '');
    btn.setAttribute('role', 'tab');
    btn.setAttribute('aria-label', `Slide ${i + 1}`);
    btn.addEventListener('click', () => goTo(i));
    dotsContainer.appendChild(btn);
  });

  function getDots() { return dotsContainer.querySelectorAll('.hero-dot'); }

  function goTo(index) {
    slides[current].classList.remove('active');
    getDots()[current].classList.remove('active');
    current = (index + slides.length) % slides.length;
    slides[current].classList.add('active');
    getDots()[current].classList.add('active');
    resetTimer();
  }

  function resetTimer() {
    clearInterval(timer);
    timer = setInterval(() => goTo(current + 1), INTERVAL);
  }

  prevBtn && prevBtn.addEventListener('click', () => goTo(current - 1));
  nextBtn && nextBtn.addEventListener('click', () => goTo(current + 1));

  document.addEventListener('keydown', e => {
    if (e.key === 'ArrowLeft') goTo(current - 1);
    if (e.key === 'ArrowRight') goTo(current + 1);
  });

  let touchStartX = 0;
  const heroEl = document.getElementById('hero');
  if (heroEl) {
    heroEl.addEventListener('touchstart', e => { touchStartX = e.touches[0].clientX; }, { passive: true });
    heroEl.addEventListener('touchend', e => {
      const diff = touchStartX - e.changedTouches[0].clientX;
      if (Math.abs(diff) > 40) goTo(current + (diff > 0 ? 1 : -1));
    });
  }

  resetTimer();
})();


/* ============================================================
   HEADER — scroll shadow
   ============================================================ */
(function () {
  const header = document.getElementById('header');
  if (!header) return;
  window.addEventListener('scroll', () => {
    header.classList.toggle('scrolled', window.scrollY > 10);
  }, { passive: true });
})();


/* ============================================================
   MOBILE MENU TOGGLE
   ============================================================ */
(function () {
  const toggle = document.getElementById('menuToggle');
  const nav = document.querySelector('.main-nav');
  if (!toggle || !nav) return;

  toggle.addEventListener('click', () => {
    const open = nav.classList.toggle('open');
    toggle.classList.toggle('open', open);
    toggle.setAttribute('aria-expanded', open);
    document.body.style.overflow = open ? 'hidden' : '';
  });

  document.addEventListener('click', e => {
    if (!toggle.contains(e.target) && !nav.contains(e.target)) {
      nav.classList.remove('open');
      toggle.classList.remove('open');
      toggle.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
    }
  });
})();


/* ============================================================
   TOAST — PHẢI KHAI BÁO TRƯỚC TẤT CẢ CÁC PHẦN KHÁC
   ============================================================ */
window.showToast = (function () {
  const toast = document.getElementById('toast');
  const toastMsg = document.getElementById('toastMsg');

  // Ẩn ngay khi load trang
  if (toast) toast.classList.remove('show');

  let hideTimer;

  // Click vào toast để đóng nhanh
  if (toast) {
    toast.addEventListener('click', () => {
      clearTimeout(hideTimer);
      toast.classList.remove('show');
    });
  }

  return function (msg, type) {
    if (!toast || !toastMsg) return;
    type = type || 'success';

    toastMsg.textContent = msg;

    const icon = toast.querySelector('i');
    if (icon) {
      if (type === 'error') {
        icon.className = 'fa-solid fa-circle-xmark';
        icon.style.color = '#f87171';
      } else if (type === 'info') {
        icon.className = 'fa-solid fa-circle-info';
        icon.style.color = '#60a5fa';
      } else {
        icon.className = 'fa-solid fa-circle-check';
        icon.style.color = '#6ee7b7';
      }
    }

    toast.classList.add('show');
    clearTimeout(hideTimer);
    hideTimer = setTimeout(function () {
      toast.classList.remove('show');
    }, 2800);
  };
})();


/* ============================================================
   CART — Giỏ hàng
   ============================================================ */
var Cart = (function () {
  var items = JSON.parse(localStorage.getItem('ms_cart') || '[]');
  var selectedIds = [];

  function save() { localStorage.setItem('ms_cart', JSON.stringify(items)); }
  function count() { return items.reduce(function(s,i){ return s + i.qty; }, 0); }
  function total() { 
    return items.reduce(function(s,i){ 
      return selectedIds.includes(i.id) ? s + (Number(i.price) || 0) * i.qty : s; 
    }, 0); 
  }

  function add(id, name, price, img) {
    var existing = items.find(function(i){ return i.id === id; });
    if (existing) { existing.qty++; }
    else { items.push({ id: id, name: name, price: price, img: img, qty: 1 }); }
    if (!selectedIds.includes(id)) selectedIds.push(id);
    save();
    updateUI();
  }

  function remove(id, btn) {
    items = items.filter(function(i){ return i.id !== id; });
    selectedIds = selectedIds.filter(function(sid){ return sid !== id; });
    save(); updateUI(); 
    if (btn) {
      var itemEl = btn.closest('.cart-item');
      if (itemEl) {
        itemEl.style.transition = 'all 0.3s ease';
        itemEl.style.opacity = '0';
        itemEl.style.transform = 'scale(0.9)';
        setTimeout(function() { renderCartModal(); }, 300);
        return;
      }
    }
    renderCartModal();
  }

  function updateQty(id, delta) {
    var item = items.find(function(i){ return i.id === id; });
    if (!item) return;
    item.qty = Math.max(1, item.qty + delta);
    save(); updateUI(); renderCartModal();
  }

  function toggleSelect(id) {
    var idx = selectedIds.indexOf(id);
    if (idx !== -1) selectedIds.splice(idx, 1);
    else selectedIds.push(id);
    renderCartModal();
  }

  function toggleSelectAll(checked) {
    if (checked) {
      selectedIds = items.map(function(i){ return i.id; });
    } else {
      selectedIds = [];
    }
    renderCartModal();
  }

  function getSelectedItems() {
    return items.filter(function(i){ return selectedIds.includes(i.id); });
  }

  function initSelection() {
    // Select all by default when opened
    selectedIds = items.map(function(i){ return i.id; });
  }

  function clear() {
    items = []; selectedIds = []; save(); updateUI(); renderCartModal();
  }

  function formatPrice(p) {
    return (Number(p) || 0).toLocaleString('vi-VN') + 'đ';
  }

  function updateUI() {
    var el = document.getElementById('cartCount');
    if (!el) return;
    var n = count();
    el.textContent = n;
    el.classList.remove('bump');
    void el.offsetWidth;
    el.classList.add('bump');
    setTimeout(function(){ el.classList.remove('bump'); }, 300);
  }

  function renderCartModal() {
    var body = document.getElementById('cartModalBody');
    var totalEl = document.getElementById('cartModalTotal');
    if (!body) return;

    if (items.length === 0) {
      body.innerHTML = '<div class="cart-empty">'
        + '<i class="fa-solid fa-cart-shopping" style="font-size:3rem;color:#aaa;margin-bottom:1rem"></i>'
        + '<p>Giỏ hàng của bạn đang trống</p>'
        + '<button class="btn-ghost" onclick="document.getElementById(\'cartModal\').classList.remove(\'open\');document.body.style.overflow=\'\'">Tiếp tục mua sắm</button>'
        + '</div>';
      if (totalEl) totalEl.textContent = '0đ';
      return;
    }

    var isAllSelected = items.length > 0 && selectedIds.length === items.length;
    var html = '<div style="padding: 10px 16px; border-bottom: 1px solid #eee; display: flex; align-items: center; gap: 10px;">'
      + '<input type="checkbox" id="selectAllCart" ' + (isAllSelected ? 'checked' : '') + ' onchange="Cart.toggleSelectAll(this.checked)" style="width:16px;height:16px;cursor:pointer">'
      + '<label for="selectAllCart" style="font-weight:600;font-size:13.5px;cursor:pointer;flex:1">Chọn tất cả (' + items.length + ' sản phẩm)</label>'
      + '</div>';

    html += items.map(function(item) {
      var isSelected = selectedIds.includes(item.id);
      return '<div class="cart-item" style="' + (isSelected ? '' : 'opacity: 0.5; filter: grayscale(0.5);') + '">'
        + '<input type="checkbox" ' + (isSelected ? 'checked' : '') + ' onchange="Cart.toggleSelect(\'' + item.id + '\')" style="width:18px;height:18px;cursor:pointer;accent-color:#e85d2f;">'
        + (item.img ? '<img src="' + item.img + '" class="cart-item-img" alt="">' : '<div class="cart-item-img" style="display:flex;align-items:center;justify-content:center;background:#eee;color:#aaa"><i class="fa-solid fa-image"></i></div>')
        + '<div class="cart-item-info">'
        + '<span class="cart-item-name">' + item.name + '</span>'
        + '<span class="cart-item-price">' + formatPrice(item.price) + '</span>'
        + '</div>'
        + '<div class="cart-item-actions">'
        + '<button class="remove-btn" onclick="Cart.remove(\'' + item.id + '\', this)" aria-label="Xóa"><i class="fa-solid fa-trash-can"></i></button>'
        + '<div class="cart-item-controls">'
        + '<button class="qty-btn" onclick="Cart.updateQty(\'' + item.id + '\',-1)">−</button>'
        + '<span class="qty-val">' + item.qty + '</span>'
        + '<button class="qty-btn" onclick="Cart.updateQty(\'' + item.id + '\',1)">+</button>'
        + '</div>'
        + '</div>'
        + '</div>';
    }).join('');
    body.innerHTML = html;

    if (totalEl) totalEl.textContent = formatPrice(total());
  }

  updateUI();

  return { add: add, remove: remove, updateQty: updateQty, toggleSelect: toggleSelect, toggleSelectAll: toggleSelectAll, getSelectedItems: getSelectedItems, initSelection: initSelection, clear: clear, count: count, total: total, renderCartModal: renderCartModal };
})();


/* ============================================================
   CART MODAL — Sidebar giỏ hàng
   ============================================================ */
(function () {
  var modalHtml = '<div class="cart-modal-overlay" id="cartModal">'
    + '<div class="cart-modal">'
    + '<div class="cart-modal-header">'
    + '<h3><i class="fa-solid fa-cart-shopping"></i> Giỏ hàng</h3>'
    + '<button class="cart-modal-close" id="cartModalClose" aria-label="Đóng"><i class="fa-solid fa-xmark"></i></button>'
    + '</div>'
    + '<div class="cart-modal-body" id="cartModalBody"></div>'
    + '<div class="cart-modal-footer">'
    + '<div class="cart-total-row"><span>Tổng cộng:</span><span class="cart-total-price" id="cartModalTotal">0đ</span></div>'
    + '<div class="cart-modal-actions">'
    + '<button class="btn-ghost" id="cartClearBtn">Xóa tất cả</button>'
    + '<button class="btn-primary" onclick="goToCheckout()">Thanh toán</button>'
    + '</div></div></div></div>';
  document.body.insertAdjacentHTML('beforeend', modalHtml);

  var modal = document.getElementById('cartModal');
  var closeBtn = document.getElementById('cartModalClose');
  var clearBtn = document.getElementById('cartClearBtn');
  var cartBtn = document.querySelector('.cart-btn');

    if (cartBtn) {
    cartBtn.addEventListener('click', function(e) {
      e.preventDefault();
      Cart.initSelection();
      Cart.renderCartModal();
      modal.classList.add('open');
      document.body.style.overflow = 'hidden';
    });
  }

  function closeModal() {
    modal.classList.remove('open');
    document.body.style.overflow = '';
  }

  closeBtn && closeBtn.addEventListener('click', closeModal);
  clearBtn && clearBtn.addEventListener('click', function() {
    if (Cart.count() === 0) return;
    Cart.clear();
    showToast('Đã xóa toàn bộ giỏ hàng', 'info');
  });
  window.goToCheckout = function(isDirectBuy) {
    var checkoutItems = [];
    if (isDirectBuy) {
      // Trường hợp Mua ngay (chỉ lấy thông tin từ DOM hiện tại, hoặc item đã được lưu tạm)
      checkoutItems = JSON.parse(localStorage.getItem('ms_checkout_items') || '[]');
      if (checkoutItems.length === 0) return;
    } else {
      // Trường hợp bấm Thanh toán ở giỏ hàng (lọc các sản phẩm đang được chọn)
      checkoutItems = Cart.getSelectedItems();
      if (checkoutItems.length === 0) {
        if (typeof showToast === 'function') showToast('Vui lòng chọn ít nhất 1 sản phẩm để thanh toán!', 'warning');
        else alert('Vui lòng chọn ít nhất 1 sản phẩm để thanh toán!');
        return;
      }
      localStorage.setItem('ms_checkout_items', JSON.stringify(checkoutItems));
    }

    var session = JSON.parse(localStorage.getItem('ms_session') || 'null');
    if (!session) {
      sessionStorage.setItem('redirect_to_checkout', 'true');
      showLoginToast();
    } else {
      window.location.href = (window.location.pathname.includes('/product/') ? '../../checkout.html' : 'checkout.html');
    }
  };

  window.showLoginToast = function() {
    var existing = document.getElementById('loginToastOverlay');
    if (existing) existing.remove();
    var baseUrl = window.location.pathname.includes('/product/') ? '../../' : '';
    
    var toastHtml = '<div id="loginToastOverlay" style="position:fixed;inset:0;background:rgba(0,0,0,0.5);z-index:99999;display:flex;align-items:center;justify-content:center;">'
      + '<div style="background:#fff;padding:30px;border-radius:16px;text-align:center;max-width:350px;width:90%;box-shadow:0 10px 30px rgba(0,0,0,0.2);animation: toastPop 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);">'
      + '<i class="fa-solid fa-circle-exclamation" style="font-size:3rem;color:#facc15;margin-bottom:16px"></i>'
      + '<h3 style="font-size:1.2rem;font-weight:700;margin-bottom:10px;color:#111">Yêu cầu đăng nhập</h3>'
      + '<p style="font-size:0.9rem;color:#555;margin-bottom:24px;line-height:1.5">Vui lòng đăng nhập hoặc tạo tài khoản để tiến hành thanh toán nhé!</p>'
      + '<div style="display:flex;gap:12px">'
      + '<button onclick="document.getElementById(\'loginToastOverlay\').remove()" style="flex:1;padding:12px;background:#f1f5f9;color:#334155;border:none;border-radius:8px;font-weight:600;cursor:pointer">Hủy</button>'
      + '<a href="' + baseUrl + 'Account.html" style="flex:1;padding:12px;background:#111;color:#fff;border:none;border-radius:8px;font-weight:600;cursor:pointer;text-decoration:none">Đăng nhập</a>'
      + '</div></div></div>'
      + '<style>@keyframes toastPop { 0% { transform: scale(0.9); opacity: 0; } 100% { transform: scale(1); opacity: 1; } }</style>';
    
    document.body.insertAdjacentHTML('beforeend', toastHtml);
  };

  // Generic function to Add to Cart from product detail pages
  window.addProductToCart = function(isBuyNow) {
    // Đọc thông tin từ DOM
    var nameEl = document.querySelector('.info-name');
    var priceEl = document.querySelector('.price-current') || document.querySelector('.sticky-bar-price');
    var imgEl = document.getElementById('mainImg');
    
    if (!nameEl || !priceEl) return;
    
    var name = nameEl.textContent.trim();
    // Tạo ID dựa trên tên nếu không có data-id
    var id = name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    var priceText = priceEl.textContent.replace(/[^0-9]/g, '');
    var price = parseInt(priceText) || 0;
    var img = imgEl ? imgEl.src : '';
    
    if (isBuyNow) {
      // Lưu vào ms_checkout_items và chuyển sang checkout
      var checkoutItem = { id: id, name: name, price: price, img: img, qty: 1 };
      localStorage.setItem('ms_checkout_items', JSON.stringify([checkoutItem]));
      goToCheckout(true);
    } else {
      Cart.add(id, name, price, img);
      
      // Hiển thị toast giống bản cũ
      if (typeof showToast === 'function') {
        showToast('Đã thêm "' + name + '" vào giỏ hàng');
      }
      
      // Đổi hiệu ứng nút Thêm vào giỏ
      var btn = document.getElementById('addCartBtn');
      if (btn) {
        var orig = btn.innerHTML;
        btn.innerHTML = '<i class="fa-solid fa-check"></i> Đã thêm!';
        btn.style.background = '#00b894';
        btn.style.borderColor = '#00b894';
        btn.style.color = '#fff';
        btn.disabled = true;
        setTimeout(function() {
          btn.innerHTML = orig;
          btn.style.background = '';
          btn.style.borderColor = '';
          btn.style.color = '';
          btn.disabled = false;
        }, 1600);
      }
    }
  };
})();


/* ============================================================
   ADD TO CART — Nút mua hàng (Trang chủ)
   ============================================================ */
(function () {
  document.querySelectorAll('.btn-cart').forEach(function(btn) {
    btn.addEventListener('click', function (e) {
      e.preventDefault();
      var card = this.closest('.product-card');
      if (!card) return;
      
      var nameEl = card.querySelector('.product-name');
      if (!nameEl) return;
      var name = nameEl.textContent.trim();
      var id = name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      var price = Number(card.dataset.price) || 0;
      var imgEl = card.querySelector('img');
      var img = imgEl ? imgEl.src : '';
      
      Cart.add(id, name, price, img);
      if (typeof showToast === 'function') {
        showToast('Đã thêm "' + name + '" vào giỏ hàng');
      }

      // Hiện popup giỏ hàng
      var modal = document.getElementById('cartModal');
      if (modal) {
        Cart.initSelection();
        Cart.renderCartModal();
        modal.classList.add('open');
        document.body.style.overflow = 'hidden';
      }

      var orig = this.innerHTML;
      this.innerHTML = '<i class="fa-solid fa-check"></i> Đã thêm';
      this.style.background = '#2a7a4b';
      this.style.borderColor = '#2a7a4b';
      this.style.color = '#fff';
      this.disabled = true;
      var self = this;
      setTimeout(function() {
        self.innerHTML = orig;
        self.style.background = '';
        self.style.borderColor = '';
        self.style.color = '';
        self.disabled = false;
      }, 1600);
    });
  });
})();


/* ============================================================
   WISHLIST
   ============================================================ */
(function () {
  var wishlist = JSON.parse(localStorage.getItem('ms_wishlist') || '[]');
  function save() { localStorage.setItem('ms_wishlist', JSON.stringify(wishlist)); }

  document.querySelectorAll('.wishlist-btn').forEach(function(btn) {
    var id = btn.dataset.wishlist;
    var icon = btn.querySelector('i');
    if (wishlist.includes(id)) {
      btn.classList.add('active');
      if (icon) icon.className = 'fa-solid fa-heart';
    }
    btn.addEventListener('click', function() {
      var idx = wishlist.indexOf(id);
      if (idx === -1) {
        wishlist.push(id);
        this.classList.add('active');
        if (icon) icon.className = 'fa-solid fa-heart';
        showToast('Đã thêm vào danh sách yêu thích ♥');
      } else {
        wishlist.splice(idx, 1);
        this.classList.remove('active');
        if (icon) icon.className = 'fa-regular fa-heart';
        showToast('Đã xóa khỏi danh sách yêu thích');
      }
      save();
    });
  });
})();


/* ============================================================
   PRODUCT FILTER & SORT
   ============================================================ */
(function () {
  var grid = document.getElementById('productGrid');
  var emptyState = document.getElementById('emptyState');
  if (!grid) return;

  var cards = Array.from(grid.querySelectorAll('.product-card'));
  var allPillBtns = document.querySelectorAll('.pill-btn');
  var sortSelect = document.getElementById('sortSelect');
  var resetBtns = document.querySelectorAll('#resetFilter, #resetFromEmpty');
  var filters = { brand: 'all', storage: null, price: null };
  var priceRanges = { under10: [0, 10000000], '10to20': [10000000, 20000000], over20: [20000000, Infinity] };

  function matchesFilters(card) {
    if (filters.brand !== 'all' && card.dataset.brand !== filters.brand) return false;
    if (filters.storage && card.dataset.storage !== filters.storage) return false;
    if (filters.price) {
      var range = priceRanges[filters.price] || [0, Infinity];
      var p = Number(card.dataset.price);
      if (p < range[0] || p > range[1]) return false;
    }
    return true;
  }

  function sortCards(list) {
    var val = sortSelect ? sortSelect.value : 'featured';
    return list.slice().sort(function(a, b) {
      if (val === 'price-asc')  return Number(a.dataset.price) - Number(b.dataset.price);
      if (val === 'price-desc') return Number(b.dataset.price) - Number(a.dataset.price);
      if (val === 'discount')   return Number(b.dataset.discount) - Number(a.dataset.discount);
      return 0;
    });
  }

  function applyFilters() {
    var sorted = sortCards(cards);
    var visible = 0;
    sorted.forEach(function(card) {
      var show = matchesFilters(card);
      card.hidden = !show;
      if (show) visible++;
      grid.appendChild(card);
    });
    if (emptyState) emptyState.hidden = visible > 0;
  }

  allPillBtns.forEach(function(btn) {
    btn.addEventListener('click', function() {
      var filterKey = this.dataset.filter;
      var value = this.dataset.value;
      if (filterKey === 'brand') {
        document.querySelectorAll('[data-filter="brand"]').forEach(function(b){ b.classList.remove('active'); });
        this.classList.add('active');
        filters.brand = value;
      } else {
        var alreadyActive = this.classList.contains('active');
        document.querySelectorAll('[data-filter="' + filterKey + '"]').forEach(function(b){ b.classList.remove('active'); });
        if (!alreadyActive) { this.classList.add('active'); filters[filterKey] = value; }
        else { filters[filterKey] = null; }
      }
      applyFilters();
    });
  });

  sortSelect && sortSelect.addEventListener('change', applyFilters);

  resetBtns.forEach(function(btn) {
    btn.addEventListener('click', function() {
      filters.brand = 'all'; filters.storage = null; filters.price = null;
      allPillBtns.forEach(function(b) {
        b.classList.remove('active');
        if (b.dataset.filter === 'brand' && b.dataset.value === 'all') b.classList.add('active');
      });
      if (sortSelect) sortSelect.value = 'featured';
      applyFilters();
    });
  });

  applyFilters();
})();


/* ============================================================
   SEARCH — Tìm kiếm sản phẩm
   ============================================================ */
(function () {
  var searchInput = document.querySelector('.search-bar input');
  var searchBtn = document.querySelector('.search-bar button');
  if (!searchInput) return;

  function doSearch() {
    var keyword = searchInput.value.trim().toLowerCase();
    var grid = document.getElementById('productGrid');
    var emptyState = document.getElementById('emptyState');
    if (!grid) return;
    var visible = 0;
    grid.querySelectorAll('.product-card').forEach(function(card) {
      var name = (card.querySelector('.product-name') || {}).textContent || '';
      var brand = (card.querySelector('.product-brand') || {}).textContent || '';
      var match = !keyword || name.toLowerCase().includes(keyword) || brand.toLowerCase().includes(keyword);
      card.hidden = !match;
      if (match) visible++;
    });
    if (emptyState) emptyState.hidden = visible > 0;
    if (keyword && visible === 0) showToast('Không tìm thấy "' + searchInput.value + '"', 'info');
  }

  searchBtn && searchBtn.addEventListener('click', doSearch);
  searchInput.addEventListener('keydown', function(e) { if (e.key === 'Enter') doSearch(); });
  searchInput.addEventListener('input', function() {
    if (this.value === '') {
      var grid = document.getElementById('productGrid');
      var emptyState = document.getElementById('emptyState');
      if (grid) grid.querySelectorAll('.product-card').forEach(function(c){ c.hidden = false; });
      if (emptyState) emptyState.hidden = true;
    }
  });
})();


/* ============================================================
   NEWSLETTER
   ============================================================ */
(function () {
  var btn = document.getElementById('newsletterBtn');
  if (!btn) return;
  btn.addEventListener('click', function() {
    var input = btn.previousElementSibling;
    if (!input || !input.value.includes('@')) {
      showToast('Vui lòng nhập email hợp lệ', 'error');
      return;
    }
    showToast('Đăng ký thành công! Cảm ơn bạn 🎉');
    input.value = '';
  });
})();


/* ============================================================
   BACK TO TOP
   ============================================================ */
(function () {
  var btn = document.createElement('button');
  btn.id = 'backToTop';
  btn.setAttribute('aria-label', 'Về đầu trang');
  btn.innerHTML = '<i class="fa-solid fa-arrow-up"></i>';
  btn.style.cssText = 'position:fixed;bottom:2rem;right:2rem;width:44px;height:44px;border-radius:50%;background:#e85d2f;color:#fff;border:none;cursor:pointer;font-size:16px;box-shadow:0 4px 14px rgba(0,0,0,.25);display:none;align-items:center;justify-content:center;z-index:999;transition:opacity .3s';
  document.body.appendChild(btn);
  window.addEventListener('scroll', function() {
    btn.style.display = window.scrollY > 400 ? 'flex' : 'none';
  }, { passive: true });
  btn.addEventListener('click', function() { window.scrollTo({ top: 0, behavior: 'smooth' }); });
})();


/* ============================================================
   LAZY IMAGE FALLBACK
   ============================================================ */
document.querySelectorAll('img[loading="lazy"]').forEach(function(img) {
  img.addEventListener('error', function() {
    this.src = 'https://placehold.co/400x400/f5f4f0/b8b7b2?text=' + encodeURIComponent(this.alt || 'Sản phẩm');
  });
});
const ITEMS_PER_PAGE = 8;
let currentPage = 1;
function renderPagination() {
  const allCards = Array.from(document.querySelectorAll('.product-card'));
  const visibleCards = allCards.filter(
  c => !c.classList.contains('hidden'));
  const totalPages = Math.ceil(visibleCards.length / ITEMS_PER_PAGE);
  const pagination = document.getElementById('pagination');
  if (!pagination) return;

  // Ẩn tất cả card trước (kể cả card bị filter ẩn)
  allCards.forEach(card => { card.style.display = 'none'; });

  // Chỉ hiện card thuộc trang hiện tại (đã qua filter)
  visibleCards.forEach((card, idx) => {
    const page = Math.floor(idx / ITEMS_PER_PAGE) + 1;
    if (page === currentPage) card.style.display = 'flex';
  });

  pagination.innerHTML = '';

  const prev = document.createElement('button');
  prev.className = 'page-btn';
  prev.innerHTML = '<i class="fa-solid fa-chevron-left"></i>';
  prev.disabled = currentPage === 1;
  prev.addEventListener('click', () => { currentPage--; renderPagination(); window.scrollTo({top: 400, behavior: 'smooth'}); });
  pagination.appendChild(prev);

  for (let i = 1; i <= totalPages; i++) {
    const btn = document.createElement('button');
    btn.className = 'page-btn' + (i === currentPage ? ' active' : '');
    btn.textContent = i;
    btn.addEventListener('click', () => { currentPage = i; renderPagination(); window.scrollTo({top: 400, behavior: 'smooth'}); });
    pagination.appendChild(btn);
  }

  const next = document.createElement('button');
  next.className = 'page-btn';
  next.innerHTML = '<i class="fa-solid fa-chevron-right"></i>';
  next.disabled = currentPage === totalPages;
  next.addEventListener('click', () => { currentPage++; renderPagination(); window.scrollTo({top: 400, behavior: 'smooth'}); });
  pagination.appendChild(next);
}
renderPagination();

/* ============================================================
   CART MODAL CSS
   ============================================================ */
(function () {
  var style = document.createElement('style');
  style.textContent = [
    '.cart-modal-overlay{display:none;position:fixed;inset:0;background:rgba(0,0,0,.55);z-index:10000;align-items:flex-start;justify-content:flex-end}',
    '.cart-modal-overlay.open{display:flex}',
    '.cart-modal{background:#fff;width:min(420px,100vw);height:100dvh;display:flex;flex-direction:column;box-shadow:-4px 0 24px rgba(0,0,0,.2);animation:slideInRight .3s ease}',
    '@keyframes slideInRight{from{transform:translateX(100%)}to{transform:translateX(0)}}',
    '.cart-modal-header{display:flex;align-items:center;justify-content:space-between;padding:1.2rem 1.5rem;border-bottom:1px solid #eee;font-weight:600;font-size:1.1rem}',
    '.cart-modal-header h3{display:flex;align-items:center;gap:.6rem;margin:0}',
    '.cart-modal-close{background:none;border:none;cursor:pointer;font-size:1.3rem;color:#888;padding:4px 8px;border-radius:6px}',
    '.cart-modal-close:hover{background:#f5f5f5}',
    '.cart-modal-body{flex:1;overflow-y:auto;padding:1rem 1.5rem;display:flex;flex-direction:column;gap:.8rem}',
    '.cart-empty{flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:.5rem;text-align:center;color:#888;padding:3rem 0}',
    '.cart-item{display:flex;align-items:center;gap:.8rem;padding:.8rem;background:#fff;border-radius:12px;border:1px solid #f0f0f0;box-shadow:0 2px 8px rgba(0,0,0,0.03);position:relative;transition:all 0.3s ease}',
    '.cart-item-img{width:64px;height:64px;object-fit:contain;border-radius:8px;background:#f8f9fa;padding:2px}',
    '.cart-item-info{display:flex;flex-direction:column;justify-content:center;gap:4px;flex:1}',
    '.cart-item-name{font-weight:600;font-size:.95rem;color:#1e293b;line-height:1.3;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}',
    '.cart-item-price{font-size:.9rem;color:#e85d2f;font-weight:700}',
    '.cart-item-controls{display:flex;align-items:center;gap:.5rem;background:#f8f9fa;border-radius:8px;padding:4px}',
    '.qty-btn{width:24px;height:24px;border-radius:4px;border:none;background:#fff;cursor:pointer;font-size:1rem;display:flex;align-items:center;justify-content:center;transition:all .2s;color:#475569;box-shadow:0 1px 3px rgba(0,0,0,0.1)}',
    '.qty-btn:hover{background:#e85d2f;color:#fff}',
    '.qty-val{font-weight:600;min-width:20px;text-align:center;font-size:.9rem;color:#1e293b}',
    '.cart-item-actions{display:flex;flex-direction:column;align-items:flex-end;gap:.5rem}',
    '.remove-btn{background:none;border:none;cursor:pointer;color:#94a3b8;font-size:1.1rem;padding:4px;border-radius:6px;transition:all .2s}',
    '.remove-btn:hover{color:#ef4444;background:#fee2e2;transform:scale(1.1)}',
    '.cart-total-row{display:flex;justify-content:space-between;align-items:center;font-size:1rem;font-weight:500}',
    '.cart-total-price{font-size:1.2rem;font-weight:700;color:#e85d2f}',
    '.cart-modal-actions{display:flex;gap:.8rem;margin-top:.5rem}',
    '.cart-modal-actions .btn-ghost{flex:1;background:#f8f9fa;color:#64748b;border:1px solid #e2e8f0;padding:14px;border-radius:12px;font-weight:700;font-size:.95rem;cursor:pointer;transition:all .2s ease;font-family:inherit}',
    '.cart-modal-actions .btn-ghost:hover{background:#fee2e2;color:#ef4444;border-color:#fca5a5}',
    '.cart-modal-actions .btn-primary{flex:1.5;background:linear-gradient(135deg,#111,#333);color:#fff;border:none;padding:14px;border-radius:12px;font-weight:700;font-size:.95rem;cursor:pointer;transition:all .2s ease;font-family:inherit;box-shadow:0 4px 12px rgba(0,0,0,0.15)}',
    '.cart-modal-actions .btn-primary:hover{transform:translateY(-2px);box-shadow:0 8px 20px rgba(0,0,0,0.25)}',
    '.wishlist-btn.active{color:#ef4444}',
    '.toast{cursor:pointer}'
  ].join('');
  document.head.appendChild(style);
})();


document.addEventListener('DOMContentLoaded', () => {
 
  const pills = document.querySelectorAll('.pill');
  const cards = document.querySelectorAll('.product-card');
  const sortSelect = document.querySelector('.sort-select');
  const countEl = document.getElementById('count');
  const grid = document.getElementById('productGrid');
 
  let activeFilter = 'all';
 
  // Filter by category
  if (pills && pills.length > 0) {
    pills.forEach(pill => {
      pill.addEventListener('click', () => {
        pills.forEach(p => p.classList.remove('active'));
        pill.classList.add('active');
        activeFilter = pill.dataset.filter;
        applyFilterAndSort();
      });
    });
  }
 
  // Sort
  if (sortSelect) {
    sortSelect.addEventListener('change', applyFilterAndSort);
  }
 
  function applyFilterAndSort() {
    if (!grid) return;
    // Get all cards as array
    let cardArray = Array.from(cards);
 
    // Filter
    cardArray.forEach(card => {
      const cat = card.dataset.category;
      if (activeFilter === 'all' || cat === activeFilter) {
        card.classList.remove('hidden');
      } else {
        card.classList.add('hidden');
      }
    });
 
    // Sort visible cards
    const visible = cardArray.filter(c => !c.classList.contains('hidden'));
    const sortVal = sortSelect.value;
 
    visible.sort((a, b) => {
  const pa = parseInt(a.dataset.price);
  const pb = parseInt(b.dataset.price);

  if (sortVal === 'price-asc')  return pa - pb;
  if (sortVal === 'price-desc') return pb - pa;
  return 0;
});

    visible.sort((a, b) => {
  const pa = parseInt(a.dataset.price);
  const pb = parseInt(b.dataset.price);

  if (sortVal === 'price-asc')  return pa - pb;
  if (sortVal === 'price-desc') return pb - pa;

  if (sortVal === 'discount') {
    return parseInt(b.dataset.discount) - parseInt(a.dataset.discount);
  }

  return 0;
});
 
    // Re-append in sorted order
    if (grid) visible.forEach(card => grid.appendChild(card));
 
    // Update count
    if (countEl) countEl.textContent = visible.length;

    // Reset về trang 1 và render lại pagination
    if (typeof currentPage !== 'undefined' && typeof renderPagination === 'function') {
      currentPage = 1;
      renderPagination();
    }
  }
 
  // Gọi ngay khi load trang để hiển thị số lượng ban đầu
  if (grid) applyFilterAndSort();

  // Wishlist toggle
  document.querySelectorAll('.wishlist-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      btn.classList.toggle('active');
      const icon = btn.querySelector('i');
      if (btn.classList.contains('active')) {
        icon.classList.replace('fa-regular', 'fa-solid');
      } else {
        icon.classList.replace('fa-solid', 'fa-regular');
      }
    });
  });
 
  document.querySelectorAll('.color-dots').forEach(dotsGroup => {
    dotsGroup.querySelectorAll('.dot').forEach(dot => {
      dot.addEventListener('click', () => {
   
      const card = dot.closest('.product-card');
      const img = card.querySelector('.card-image img');
      img.src = dot.dataset.img;

      dotsGroup.querySelectorAll('.dot').forEach(d => d.classList.remove('active'));
      dot.classList.add('active');
    });
  });
});

});
/* ===== SIDEBAR ACCORDION + FILTER ===== */
(function() {
  // Accordion toggle
  document.querySelectorAll('.sidebar-group-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      btn.closest('.sidebar-group').classList.toggle('open');
    });
  });

  const allCards = () => Array.from(document.querySelectorAll('.product-card'));
  let activeCategory = 'all';
  let activePrice = 'all';

  const priceRanges = {
    all:     [0, Infinity],
    under10: [0, 9999999],
    '10to20':[10000000, 19999999],
    over20:  [20000000, Infinity]
  };

  function applyAll() {
    const [minP, maxP] = priceRanges[activePrice];
    let visible = 0;
    allCards().forEach(card => {
      const cat = card.dataset.category || '';
      const price = parseInt(card.dataset.price) || 0;
      const catMatch = activeCategory === 'all' || cat === activeCategory;
      const priceMatch = price >= minP && price <= maxP;
      const show = catMatch && priceMatch;
      card.style.display = show ? '' : 'none';
      card.classList.toggle('hidden', !show);
      if (show) visible++;
    });
    const counter = document.getElementById('sidebarCount');
    if (counter) counter.textContent = visible;
    // reset pagination
    if (typeof currentPage !== 'undefined') { currentPage = 1; renderPagination(); }
  }

  // Category pills (sidebar-sub + "Tất cả")
  document.querySelectorAll('.sidebar-block .pill-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.sidebar-block .pill-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      activeCategory = btn.dataset.filter || 'all';
      applyAll();
    });
  });

  // Price buttons
  document.querySelectorAll('.price-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.price-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      activePrice = btn.dataset.price;
      applyAll();
    });
  });

  // Sidebar sort
  const sidebarSort = document.getElementById('sidebarSort');
  if (sidebarSort) {
    sidebarSort.addEventListener('change', () => {
      const grid = document.getElementById('productGrid');
      const cards = allCards().filter(c => c.style.display !== 'none');
      cards.sort((a, b) => {
        const pa = parseInt(a.dataset.price), pb = parseInt(b.dataset.price);
        if (sidebarSort.value === 'price-asc') return pa - pb;
        if (sidebarSort.value === 'price-desc') return pb - pa;
        return 0;
      });
      cards.forEach(c => grid.appendChild(c));
    });
  }

  applyAll();
})();