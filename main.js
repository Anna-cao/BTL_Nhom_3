// ===== BANNER SLIDESHOW =====
(function () {
  const slides = document.querySelectorAll('.slide');
  const dotsWrap = document.getElementById('bannerDots');
  if (!slides.length || !dotsWrap) return;

  let current = 0, timer;

  // Tạo dots tự động theo số slide
  slides.forEach((_, i) => {
    const dot = document.createElement('div');
    dot.className = 'dot' + (i === 0 ? ' active' : '');
    dot.addEventListener('click', () => { goTo(i); resetTimer(); });
    dotsWrap.appendChild(dot);
  });

  function goTo(n) {
    slides[current].classList.remove('active');
    dotsWrap.children[current].classList.remove('active');
    current = (n + slides.length) % slides.length;
    slides[current].classList.add('active');
    dotsWrap.children[current].classList.add('active');
  }

  // Hàm dùng cho nút mũi tên (onclick trong HTML)
  window.changeSlide = function (dir) {
    goTo(current + dir);
    resetTimer();
  };

  function startTimer() {
    timer = setInterval(() => goTo(current + 1), 4000);
  }

  function resetTimer() {
    clearInterval(timer);
    startTimer();
  }

  // Dừng khi hover vào banner
  const banner = document.getElementById('banner');
  banner.addEventListener('mouseenter', () => clearInterval(timer));
  banner.addEventListener('mouseleave', startTimer);

  startTimer();
})();
