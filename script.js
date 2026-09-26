// ============================================================
//  НАСТРОЙКИ МАГАЗИНА — МЕНЯТЬ ТОЛЬКО ЗДЕСЬ
// ============================================================

// Номер WhatsApp без плюса и пробелов: 7 + код города + номер
const WA_NUMBER = '79232419031';

const MESSAGES = {
  6: 'Хочу заказать набор 6 шт.',
  12: 'Хочу заказать набор 12 шт.',
  order: 'Здравствуйте! Хочу заказать сырники с начинкой',
  fab: 'Здравствуйте! Хочу заказать сырники с начинкой',
};

for (const el of document.querySelectorAll('[data-wa]')) {
  const text = MESSAGES[el.dataset.wa] || '';
  el.href = `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(text)}`;
}

// ============================================================
//  ЭФФЕКТЫ
// ============================================================

document.getElementById('year').textContent = new Date().getFullYear();

const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

/* --- заголовки: пословное появление --- */
for (const el of document.querySelectorAll('.reveal-text')) {
  const words = el.textContent.trim().split(/\s+/);
  el.textContent = '';
  words.forEach((word, i) => {
    const span = document.createElement('span');
    span.className = 'w';
    span.style.setProperty('--d', `${i * 85}ms`);
    span.textContent = word;
    el.appendChild(span);
    if (i < words.length - 1) el.appendChild(document.createTextNode(' '));
  });
}

/* --- появление при скролле + счётчик цен --- */
const targets = document.querySelectorAll(
  '.reveal, .reveal-text, .panel, .slip, .steps li'
);

if (reduced) {
  for (const el of targets) {
    el.classList.add('in');
    if (el.dataset.count) el.textContent = `${el.dataset.count} ₽`;
  }
} else {
  const io = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        const el = entry.target;
        el.classList.add('in');
        if (el.dataset.count) countUp(el);
        io.unobserve(el);
      }
    },
    { threshold: 0.12, rootMargin: '0px 0px -50px 0px' }
  );

  for (const el of targets) {
    if (el.classList.contains('panel') || el.classList.contains('slip')) {
      const sibs = [...el.parentElement.children].indexOf(el);
      el.style.transitionDelay = `${(sibs % 4) * 90}ms`;
    }
    io.observe(el);
  }
}

/* --- счётчик цен --- */
function countUp(el) {
  const target = Number(el.dataset.count);
  const dur = 1000;
  const start = performance.now();

  function frame(now) {
    const t = Math.min((now - start) / dur, 1);
    const eased = 1 - Math.pow(1 - t, 3);
    el.textContent = `${Math.round(target * eased)} ₽`;
    if (t < 1) requestAnimationFrame(frame);
  }

  requestAnimationFrame(frame);
}

/* --- мягкий наклон талона за курсором --- */
if (!reduced && matchMedia('(pointer:fine)').matches) {
  for (const slip of document.querySelectorAll('.slip')) {
    slip.addEventListener('pointermove', (e) => {
      const r = slip.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - 0.5;
      const y = (e.clientY - r.top) / r.height - 0.5;
      slip.style.transform =
        `perspective(700px) rotateY(${x * 5}deg) rotateX(${-y * 5}deg) translateY(-5px)`;
    });
    slip.addEventListener('pointerleave', () => {
      slip.style.transform = '';
    });
  }
}

/* --- полоса прокрутки --- */
const bar = document.getElementById('progress');
let ticking = false;

function onScroll() {
  const max = document.documentElement.scrollHeight - innerHeight;
  bar.style.transform = `scaleX(${max > 0 ? scrollY / max : 0})`;
  ticking = false;
}

addEventListener('scroll', () => {
  if (!ticking) {
    ticking = true;
    requestAnimationFrame(onScroll);
  }
}, { passive: true });

onScroll();

/* --- плавный переход по меню --- */
document.querySelectorAll('a[href^="#"]').forEach((a) => {
  a.addEventListener('click', (e) => {
    const id = a.getAttribute('href');
    if (id === '#' || id.length < 2) return;
    const target = document.querySelector(id);
    if (!target) return;
    e.preventDefault();
    target.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'start' });
  });
});
