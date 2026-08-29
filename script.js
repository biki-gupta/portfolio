// ===== Neural network ambient background =====
// A quiet nod to the AI/ML focus: nodes drift, and edges draw themselves
// between nodes that pass close to one another (and to the cursor).
(function initNeuralBg() {
  const canvas = document.getElementById('neuralBg');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const palette = ['124,92,255', '255,79,168', '34,211,238', '46,230,172'];
  let width, height, dpr, nodes, mouse = { x: -9999, y: -9999, active: false };

  function sizeCanvas() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = width + 'px';
    canvas.style.height = height + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function buildNodes() {
    const density = width < 640 ? 17000 : width < 1100 ? 12500 : 10000;
    const count = Math.max(30, Math.min(110, Math.round((width * height) / density)));
    nodes = Array.from({ length: count }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.28,
      vy: (Math.random() - 0.5) * 0.28,
      r: Math.random() * 1.6 + 1,
      c: palette[Math.floor(Math.random() * palette.length)]
    }));
  }

  const linkDist = width => (width < 640 ? 100 : 140);

  function step() {
    ctx.clearRect(0, 0, width, height);
    const maxDist = linkDist(width);

    for (const n of nodes) {
      n.x += n.vx;
      n.y += n.vy;
      if (n.x < -20) n.x = width + 20; else if (n.x > width + 20) n.x = -20;
      if (n.y < -20) n.y = height + 20; else if (n.y > height + 20) n.y = -20;

      if (mouse.active) {
        const dx = n.x - mouse.x, dy = n.y - mouse.y;
        const d = Math.hypot(dx, dy);
        if (d < 130 && d > 0.01) {
          const pull = (130 - d) / 130 * 0.02;
          n.vx += (dx / d) * pull;
          n.vy += (dy / d) * pull;
        }
      }
      n.vx *= 0.995; n.vy *= 0.995;
    }

    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const a = nodes[i], b = nodes[j];
        const dx = a.x - b.x, dy = a.y - b.y;
        const d = Math.hypot(dx, dy);
        if (d < maxDist) {
          ctx.strokeStyle = `rgba(${a.c},${(1 - d / maxDist) * 0.45})`;
          ctx.lineWidth = 1.1;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.stroke();
        }
      }
      if (mouse.active) {
        const dx = a.x - mouse.x, dy = a.y - mouse.y;
        const d = Math.hypot(dx, dy);
        if (d < 170) {
          ctx.strokeStyle = `rgba(${nodes[i].c},${(1 - d / 170) * 0.6})`;
          ctx.lineWidth = 1.1;
          ctx.beginPath();
          ctx.moveTo(nodes[i].x, nodes[i].y);
          ctx.lineTo(mouse.x, mouse.y);
          ctx.stroke();
        }
      }
    }

    for (const n of nodes) {
      ctx.save();
      ctx.shadowColor = `rgba(${n.c},0.9)`;
      ctx.shadowBlur = 8;
      ctx.beginPath();
      ctx.fillStyle = `rgba(${n.c},0.95)`;
      ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    if (mouse.active) {
      ctx.save();
      ctx.shadowColor = 'rgba(167,139,255,0.9)';
      ctx.shadowBlur = 14;
      ctx.beginPath();
      ctx.fillStyle = 'rgba(167,139,255,0.8)';
      ctx.arc(mouse.x, mouse.y, 2.2, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }

  let rafId;
  function loop() { step(); rafId = requestAnimationFrame(loop); }

  sizeCanvas();
  buildNodes();
  if (reduceMotion) {
    step();
  } else {
    loop();
  }

  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      sizeCanvas();
      buildNodes();
      if (reduceMotion) step();
    }, 150);
  });

  window.addEventListener('pointermove', (e) => {
    mouse.x = e.clientX; mouse.y = e.clientY; mouse.active = true;
  }, { passive: true });
  window.addEventListener('pointerleave', () => { mouse.active = false; });
})();

// ===== Mobile menu toggle =====
const menuBtn = document.getElementById('menuBtn');
const siteNav = document.getElementById('siteNav');

if (menuBtn && siteNav) {
  menuBtn.addEventListener('click', () => {
    const isOpen = siteNav.classList.toggle('open');
    menuBtn.classList.toggle('open', isOpen);
    menuBtn.setAttribute('aria-expanded', isOpen);
  });
  siteNav.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      siteNav.classList.remove('open');
      menuBtn.classList.remove('open');
      menuBtn.setAttribute('aria-expanded', 'false');
    });
  });
}

// ===== Scroll reveal for sections =====
const reveals = document.querySelectorAll('.reveal');
if ('IntersectionObserver' in window && reveals.length) {
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in-view');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });
  reveals.forEach(el => revealObserver.observe(el));
} else {
  reveals.forEach(el => el.classList.add('in-view'));
}

// ===== Active nav link on scroll =====
const navLinks = document.querySelectorAll('#siteNav a');
const sections = Array.from(navLinks)
  .map(link => document.querySelector(link.getAttribute('href')))
  .filter(Boolean);

function setActiveLink() {
  let currentId = sections[0]?.id;
  const scrollPos = window.scrollY + 140;
  sections.forEach(section => {
    if (section.offsetTop <= scrollPos) currentId = section.id;
  });
  navLinks.forEach(link => {
    link.classList.toggle('active', link.getAttribute('href') === `#${currentId}`);
  });
}
window.addEventListener('scroll', setActiveLink, { passive: true });
setActiveLink();

// ===== Hero terminal ticker =====
const tickerText = document.getElementById('tickerText');
const tickerLines = [
  '> analyzing doctor-patient transcript...',
  '> flagging clinical documentation gap ✓',
  '> embedding resume against job description...',
  '> cosine similarity score: 0.94',
  '> training XGBoost on attendance data...',
  '> validation accuracy: 91.2% ✓'
];
let tickerIndex = 0;

function typeLine(text, cb) {
  if (!tickerText) return;
  tickerText.textContent = '';
  let i = 0;
  const type = setInterval(() => {
    tickerText.textContent += text[i];
    i++;
    if (i >= text.length) {
      clearInterval(type);
      setTimeout(cb, 1600);
    }
  }, 28);
}

function runTicker() {
  typeLine(tickerLines[tickerIndex], () => {
    tickerIndex = (tickerIndex + 1) % tickerLines.length;
    runTicker();
  });
}
if (tickerText) runTicker();

// ===== Count-up stats =====
const counters = document.querySelectorAll('.stats strong[data-count]');
if ('IntersectionObserver' in window && counters.length) {
  const counterObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      if (el.dataset.static) { el.textContent = el.dataset.count; }
      else {
        const target = parseFloat(el.dataset.count);
        const isDecimal = el.dataset.count.includes('.');
        let current = 0;
        const step = target / 40;
        const tick = setInterval(() => {
          current += step;
          if (current >= target) {
            el.textContent = el.dataset.count;
            clearInterval(tick);
          } else {
            el.textContent = isDecimal ? current.toFixed(2) : Math.round(current);
          }
        }, 25);
      }
      counterObserver.unobserve(el);
    });
  }, { threshold: 0.4 });
  counters.forEach(el => counterObserver.observe(el));
}
