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

  // Build dots
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

  // Keyboard
  document.addEventListener('keydown', e => {
    if (e.key === 'ArrowLeft') goTo(current - 1);
    if (e.key === 'ArrowRight') goTo(current + 1);
  });

  // Touch swipe
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
   HEADER — scroll shadow + sticky shrink
   ============================================================ */
(function () {
  const header = document.getElementById('header');
  if (!header) return;
  const onScroll = () => {
    header.classList.toggle('scrolled', window.scrollY > 10);
  };
  window.addEventListener('scroll', onScroll, { passive: true });
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

  // Close on outside click
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
   CART
   ============================================================ */
const Cart = (function () {
  let items = JSON.parse(localStorage.getItem('ms_cart') || '[]');

  function save() { localStorage.setItem('ms_cart', JSON.stringify(items)); }

  function count() { return items.reduce((s, i) => s + i.qty, 0); }

  function add(id, name, price) {
    const existing = items.find(i => i.id === id);
    if (existing) { existing.qty++; }
    else { items.push({ id, name, price, qty: 1 }); }
    save();
    updateUI();
    return name;
  }

  function updateUI() {
    const el = document.getElementById('cartCount');
    if (!el) return;
    const n = count();
    el.textContent = n;
    el.classList.remove('bump');
    void el.offsetWidth; // reflow
    el.classList.add('bump');
    setTimeout(() => el.classList.remove('bump'), 300);
  }

  // Init count on load
  updateUI();

  return { add, count };
})();


/* ============================================================
   TOAST NOTIFICATION
   ============================================================ */
(function () {
  const toast = document.getElementById('toast');
  const toastMsg = document.getElementById('toastMsg');
  if (!toast) return;

  let hideTimer;

  window.showToast = function (msg) {
    toastMsg.textContent = msg;
    toast.classList.add('show');
    clearTimeout(hideTimer);
    hideTimer = setTimeout(() => toast.classList.remove('show'), 2800);
  };
})();


/* ============================================================
   ADD TO CART — Buy buttons
   ============================================================ */
(function () {
  document.querySelectorAll('.btn-buy').forEach(btn => {
    btn.addEventListener('click', function () {
      const { id, name, price } = this.dataset;
      Cart.add(id, name, Number(price));
      showToast(`Đã thêm "${name}" vào giỏ hàng`);

      // Animate button
      const orig = this.innerHTML;
      this.innerHTML = '<i class="fa-solid fa-check" aria-hidden="true"></i> Đã thêm';
      this.style.background = '#2a7a4b';
      this.style.borderColor = '#2a7a4b';
      setTimeout(() => {
        this.innerHTML = orig;
        this.style.background = '';
        this.style.borderColor = '';
      }, 1600);
    });
  });
})();


/* ============================================================
   WISHLIST
   ============================================================ */
(function () {
  let wishlist = JSON.parse(localStorage.getItem('ms_wishlist') || '[]');

  function save() { localStorage.setItem('ms_wishlist', JSON.stringify(wishlist)); }

  // Restore state
  document.querySelectorAll('.wishlist-btn').forEach(btn => {
    const id = btn.dataset.wishlist;
    if (wishlist.includes(id)) btn.classList.add('active');

    btn.addEventListener('click', function () {
      const idx = wishlist.indexOf(id);
      if (idx === -1) {
        wishlist.push(id);
        this.classList.add('active');
        showToast('Đã thêm vào danh sách yêu thích ♥');
      } else {
        wishlist.splice(idx, 1);
        this.classList.remove('active');
        showToast('Đã xoá khỏi danh sách yêu thích');
      }
      save();
    });
  });
})();


/* ============================================================
   PRODUCT FILTER & SORT
   ============================================================ */
(function () {
  const grid = document.getElementById('productGrid');
  const emptyState = document.getElementById('emptyState');
  if (!grid) return;

  const cards = Array.from(grid.querySelectorAll('.product-card'));

  // Collect all pill buttons (both filter bar + sidebar)
  const allPillBtns = document.querySelectorAll('.pill-btn');
  const sortSelect = document.getElementById('sortSelect');
  const resetBtns = document.querySelectorAll('#resetFilter, #resetFromEmpty');

  // Active filters state
  const filters = { brand: 'all', storage: null, price: null };

  // Price ranges (VND)
  const priceRanges = {
    under10:  [0,         10_000_000],
    '10to20': [10_000_000, 20_000_000],
    over20:  [20_000_000, Infinity],
  };

  function matchesFilters(card) {
    const brand   = card.dataset.brand;
    const storage = card.dataset.storage;
    const price   = Number(card.dataset.price);

    if (filters.brand !== 'all' && brand !== filters.brand) return false;
    if (filters.storage && storage !== filters.storage) return false;
    if (filters.price) {
      const [min, max] = priceRanges[filters.price] || [0, Infinity];
      if (price < min || price > max) return false;
    }
    return true;
  }

  function sortCards(list) {
    const val = sortSelect ? sortSelect.value : 'featured';
    return [...list].sort((a, b) => {
      if (val === 'price-asc')  return Number(a.dataset.price) - Number(b.dataset.price);
      if (val === 'price-desc') return Number(b.dataset.price) - Number(a.dataset.price);
      if (val === 'discount')   return Number(b.dataset.discount) - Number(a.dataset.discount);
      return 0; // featured — original order
    });
  }

  function applyFilters() {
    const sorted = sortCards(cards);
    let visible = 0;

    sorted.forEach(card => {
      const show = matchesFilters(card);
      card.hidden = !show;
      if (show) visible++;
      // Re-append in sorted order
      grid.appendChild(card);
    });

    if (emptyState) emptyState.hidden = visible > 0;

    // Featured class only makes sense when brand = all & no storage filter
    const featured = grid.querySelector('.product-card--featured');
    if (featured) {
      const showFeatured = filters.brand === 'all' && !filters.storage && !filters.price;
      featured.classList.toggle('product-card--featured', showFeatured);
    }
  }

  // Handle pill clicks — grouped by data-filter
  allPillBtns.forEach(btn => {
    btn.addEventListener('click', function () {
      const filterKey = this.dataset.filter;
      const value = this.dataset.value;

      if (filterKey === 'brand') {
        // Single-select: deactivate all brand pills, activate clicked
        document.querySelectorAll('[data-filter="brand"]').forEach(b => b.classList.remove('active'));
        this.classList.add('active');
        filters.brand = value;
      } else {
        // Toggle (storage, price)
        const alreadyActive = this.classList.contains('active');
        document.querySelectorAll(`[data-filter="${filterKey}"]`).forEach(b => b.classList.remove('active'));
        if (!alreadyActive) {
          this.classList.add('active');
          filters[filterKey] = value;
        } else {
          filters[filterKey] = null;
        }
      }
      applyFilters();
    });
  });

  sortSelect && sortSelect.addEventListener('change', applyFilters);

  // Reset
  resetBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filters.brand = 'all';
      filters.storage = null;
      filters.price = null;
      allPillBtns.forEach(b => {
        b.classList.remove('active');
        if (b.dataset.filter === 'brand' && b.dataset.value === 'all') {
          b.classList.add('active');
        }
      });
      if (sortSelect) sortSelect.value = 'featured';
      applyFilters();
    });
  });

  applyFilters();
})();


/* ============================================================
   NEWSLETTER
   ============================================================ */
(function () {
  const btn = document.getElementById('newsletterBtn');
  if (!btn) return;
  btn.addEventListener('click', () => {
    const input = btn.previousElementSibling;
    if (!input || !input.value.includes('@')) {
      showToast('Vui lòng nhập email hợp lệ');
      return;
    }
    showToast('Đăng ký thành công! Cảm ơn bạn 🎉');
    input.value = '';
  });
})();


/* ============================================================
   LAZY IMAGE FALLBACK
   ============================================================ */
document.querySelectorAll('img[loading="lazy"]').forEach(img => {
  img.addEventListener('error', function () {
    this.src = `https://placehold.co/400x400/f5f4f0/b8b7b2?text=${encodeURIComponent(this.alt || 'Sản phẩm')}`;
  });
});
