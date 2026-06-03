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

  function save() { localStorage.setItem('ms_cart', JSON.stringify(items)); }
  function count() { return items.reduce(function(s,i){ return s + i.qty; }, 0); }
  function total() { return items.reduce(function(s,i){ return s + i.price * i.qty; }, 0); }

  function add(id, name, price) {
    var existing = items.find(function(i){ return i.id === id; });
    if (existing) { existing.qty++; }
    else { items.push({ id: id, name: name, price: price, qty: 1 }); }
    save();
    updateUI();
  }

  function remove(id) {
    items = items.filter(function(i){ return i.id !== id; });
    save(); updateUI(); renderCartModal();
  }

  function updateQty(id, delta) {
    var item = items.find(function(i){ return i.id === id; });
    if (!item) return;
    item.qty = Math.max(1, item.qty + delta);
    save(); updateUI(); renderCartModal();
  }

  function clear() {
    items = []; save(); updateUI(); renderCartModal();
  }

  function formatPrice(p) {
    return p.toLocaleString('vi-VN') + 'đ';
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

    body.innerHTML = items.map(function(item) {
      return '<div class="cart-item">'
        + '<div class="cart-item-info">'
        + '<span class="cart-item-name">' + item.name + '</span>'
        + '<span class="cart-item-price">' + formatPrice(item.price) + '</span>'
        + '</div>'
        + '<div class="cart-item-controls">'
        + '<button class="qty-btn" onclick="Cart.updateQty(\'' + item.id + '\',-1)">−</button>'
        + '<span class="qty-val">' + item.qty + '</span>'
        + '<button class="qty-btn" onclick="Cart.updateQty(\'' + item.id + '\',1)">+</button>'
        + '<button class="remove-btn" onclick="Cart.remove(\'' + item.id + '\')" aria-label="Xóa"><i class="fa-solid fa-trash-can"></i></button>'
        + '</div>'
        + '<div class="cart-item-subtotal">' + formatPrice(item.price * item.qty) + '</div>'
        + '</div>';
    }).join('');

    if (totalEl) totalEl.textContent = formatPrice(total());
  }

  updateUI();

  return { add: add, remove: remove, updateQty: updateQty, clear: clear, count: count, total: total, renderCartModal: renderCartModal };
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
    + '<button class="btn-primary" onclick="showToast(\'Tính năng đang phát triển 🚀\',\'info\')">Thanh toán</button>'
    + '</div></div></div></div>';
  document.body.insertAdjacentHTML('beforeend', modalHtml);

  var modal = document.getElementById('cartModal');
  var closeBtn = document.getElementById('cartModalClose');
  var clearBtn = document.getElementById('cartClearBtn');
  var cartBtn = document.querySelector('.cart-btn');

  if (cartBtn) {
    cartBtn.addEventListener('click', function(e) {
      e.preventDefault();
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
  modal.addEventListener('click', function(e) { if (e.target === modal) closeModal(); });
  document.addEventListener('keydown', function(e) { if (e.key === 'Escape') closeModal(); });
})();


/* ============================================================
   ADD TO CART — Nút mua hàng
   ============================================================ */
(function () {
  document.querySelectorAll('.btn-buy').forEach(function(btn) {
    btn.addEventListener('click', function () {
      var id = this.dataset.id;
      var name = this.dataset.name;
      var price = Number(this.dataset.price);
      Cart.add(id, name, price);
      showToast('Đã thêm "' + name + '" vào giỏ hàng');

      var orig = this.innerHTML;
      this.innerHTML = '<i class="fa-solid fa-check"></i> Đã thêm';
      this.style.background = '#2a7a4b';
      this.style.borderColor = '#2a7a4b';
      this.disabled = true;
      var self = this;
      setTimeout(function() {
        self.innerHTML = orig;
        self.style.background = '';
        self.style.borderColor = '';
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
  const visibleCards = allCards.filter(c => !c.hidden);
  const totalPages = Math.ceil(visibleCards.length / ITEMS_PER_PAGE);
  const pagination = document.getElementById('pagination');
  if (!pagination) return;

  visibleCards.forEach((card, idx) => {
    const page = Math.floor(idx / ITEMS_PER_PAGE) + 1;
    card.style.display = page === currentPage ? 'flex' : 'none';
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
    '.cart-item{display:flex;flex-direction:column;gap:.4rem;padding:.8rem;background:#f9f9f9;border-radius:10px;border:1px solid #eee}',
    '.cart-item-info{display:flex;justify-content:space-between;align-items:flex-start;gap:.5rem}',
    '.cart-item-name{font-weight:500;font-size:.9rem}',
    '.cart-item-price{font-size:.85rem;color:#888;white-space:nowrap}',
    '.cart-item-controls{display:flex;align-items:center;gap:.5rem}',
    '.qty-btn{width:28px;height:28px;border-radius:6px;border:1px solid #ddd;background:#fff;cursor:pointer;font-size:1rem;display:flex;align-items:center;justify-content:center;transition:background .15s}',
    '.qty-btn:hover{background:#e85d2f;color:#fff;border-color:transparent}',
    '.qty-val{font-weight:600;min-width:24px;text-align:center}',
    '.remove-btn{margin-left:auto;background:none;border:none;cursor:pointer;color:#f87171;font-size:.95rem;padding:4px 6px;border-radius:6px;transition:background .15s}',
    '.remove-btn:hover{background:#fee2e2}',
    '.cart-item-subtotal{font-weight:600;font-size:.95rem;color:#e85d2f;text-align:right}',
    '.cart-modal-footer{padding:1rem 1.5rem;border-top:1px solid #eee;display:flex;flex-direction:column;gap:.8rem}',
    '.cart-total-row{display:flex;justify-content:space-between;align-items:center;font-size:1rem;font-weight:500}',
    '.cart-total-price{font-size:1.2rem;font-weight:700;color:#e85d2f}',
    '.cart-modal-actions{display:flex;gap:.8rem}',
    '.cart-modal-actions .btn-ghost,.cart-modal-actions .btn-primary{flex:1;justify-content:center}',
    '.wishlist-btn.active{color:#ef4444}',
    '.toast{cursor:pointer}'
  ].join('');
  document.head.appendChild(style);
})();

/* JS CHO OPPO*/
document.addEventListener('DOMContentLoaded', () => {
 
  const pills = document.querySelectorAll('.pill');
  const cards = document.querySelectorAll('.product-card');
  const sortSelect = document.querySelector('.sort-select');
  const countEl = document.getElementById('count');
  const grid = document.getElementById('productGrid');
 
  let activeFilter = 'all';
 
  // Filter by category
  pills.forEach(pill => {
    pill.addEventListener('click', () => {
      pills.forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
      activeFilter = pill.dataset.filter;
      applyFilterAndSort();
    });
  });
 
  // Sort
  sortSelect.addEventListener('change', applyFilterAndSort);
 
  function applyFilterAndSort() {
    // Get all cards as array
    let cardArray = Array.from(cards);
    currentPage = 1;
    renderPagination();
 
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
 
    // Re-append in sorted order
    visible.forEach(card => grid.appendChild(card));
 
    // Update count
    countEl.textContent = visible.length;
  }
 
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
 
  // Add to cart feedback
  document.querySelectorAll('.btn-cart').forEach(btn => {
    btn.addEventListener('click', () => {
      const original = btn.innerHTML;
      btn.innerHTML = '<i class="fa-solid fa-check"></i> Đã thêm!';
      btn.style.background = '#00b894';
      setTimeout(() => {
        btn.innerHTML = original;
        btn.style.background = '';
      }, 1500);
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
