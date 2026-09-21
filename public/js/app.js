/* ==========================================================================
   CYBERNEXUS — SECURITY OPERATIONS CENTER — DASHBOARD ENGINE
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  initMatrixBg();
  initSidebar();
  initTerminal();
  initStatCounters();
  initVulnBars();
  initBottomBar();
  initNewsSection();
  initMobileToggle();
  initScanButton();
});

/* ══════════════════════════════════════════════════════════════════════
   1. MATRIX RAIN BACKGROUND CANVAS
══════════════════════════════════════════════════════════════════════ */
function initMatrixBg() {
  const canvas = document.getElementById('matrix-bg-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  function resize() {
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  const CHARS = '01アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘ';
  let cols = Math.floor(window.innerWidth / 16);
  const drops = Array.from({ length: cols }, () => Math.random() * -60);

  window.addEventListener('resize', () => {
    cols = Math.floor(window.innerWidth / 16);
  });

  function draw() {
    ctx.fillStyle = 'rgba(3, 10, 18, 0.055)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.font = '12px JetBrains Mono, monospace';

    for (let i = 0; i < drops.length; i++) {
      const ch = CHARS[Math.floor(Math.random() * CHARS.length)];
      const brightness = Math.random();
      ctx.fillStyle = brightness > 0.92
        ? `rgba(0,229,255,0.9)`
        : `rgba(0,255,136,${0.3 + brightness * 0.5})`;
      ctx.fillText(ch, i * 16, drops[i] * 16);
      if (drops[i] * 16 > canvas.height && Math.random() > 0.978) drops[i] = 0;
      drops[i] += 0.35;
    }
  }

  setInterval(draw, 60);
}

/* ══════════════════════════════════════════════════════════════════════
   2. SIDEBAR NAV — Collapsible Groups + Active State
══════════════════════════════════════════════════════════════════════ */
function initSidebar() {
  // Collapsible groups
  document.querySelectorAll('.sb-has-children').forEach(btn => {
    btn.addEventListener('click', () => {
      const grp = btn.closest('.sb-group');
      const isOpen = grp.classList.contains('open');
      // Close all
      document.querySelectorAll('.sb-group.open').forEach(g => g.classList.remove('open'));
      if (!isOpen) grp.classList.add('open');
    });
  });

  // Nav item active state
  document.querySelectorAll('.sb-item:not(.sb-has-children)').forEach(item => {
    item.addEventListener('click', (e) => {
      if (item.tagName === 'A') {
        document.querySelectorAll('.sb-item.active').forEach(i => i.classList.remove('active'));
        item.classList.add('active');
      }
    });
  });
}

/* ══════════════════════════════════════════════════════════════════════
   3. LIVE TERMINAL IN SIDEBAR
══════════════════════════════════════════════════════════════════════ */
function initTerminal() {
  const body = document.getElementById('sb-terminal-body');
  if (!body) return;

  const lines = [
    '<span class="td">&gt;</span> Initializing CYBERNEXUS...',
    '<span class="td">&gt;</span> Security systems <span class="tc">ONLINE</span>',
    '<span class="td">&gt;</span> Scanning vulnerabilities...',
    '<span class="td">&gt;</span> Monitoring network traffic...',
    '<span class="td">&gt;</span> Threat intel feed <span class="tc">SYNCED</span>',
    '<span class="td">&gt;</span> Updating threat intelligence...',
    '<span class="td">&gt;</span> System status: <span class="tc">SECURE</span>',
    '<span class="td">&gt;</span> <span class="tr">ALERT:</span> 3 new CVEs detected',
    '<span class="td">&gt;</span> Auto-patching shield nodes...',
    '<span class="td">&gt;</span> Cyber news feed <span class="tc">LOADED</span>',
    '<span class="td">&gt;</span> Awaiting commands...',
    '<span class="td">&gt;</span> IDS/IPS signatures <span class="tc">UPDATED</span>',
    '<span class="td">&gt;</span> <span class="tr">WARN:</span> brute-force on SSH:22',
    '<span class="td">&gt;</span> Blocked: <span class="tr">192.168.4.101</span>',
  ];

  let idx = 0;
  const MAX = 5;

  // Seed initial lines (no animation)
  for (let i = 0; i < Math.min(4, MAX); i++) {
    const el = document.createElement('div');
    el.className = 'sb-term-line';
    el.style.cssText = 'opacity:1;animation:none;';
    el.innerHTML = lines[i];
    body.appendChild(el);
    idx++;
  }

  setInterval(() => {
    if (body.children.length >= MAX) body.removeChild(body.firstChild);
    const el = document.createElement('div');
    el.className = 'sb-term-line';
    el.innerHTML = lines[idx % lines.length];
    body.appendChild(el);
    idx++;
  }, 2400);
}

/* ══════════════════════════════════════════════════════════════════════
   4. STAT COUNTER ANIMATIONS
══════════════════════════════════════════════════════════════════════ */
function initStatCounters() {
  function animateCounter(el, target, format, duration = 1400) {
    if (!el) return;
    const start = performance.now();
    function step(now) {
      const p = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      el.textContent = format(Math.round(eased * target));
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  animateCounter(document.getElementById('ov-score'),     86,  v => v + '%');
  animateCounter(document.getElementById('ov-crit'),       4,  v => String(v).padStart(2,'0'));
  animateCounter(document.getElementById('ov-threats'),    3,  v => String(v).padStart(2,'0'));
  animateCounter(document.getElementById('ov-assets'),   248,  v => String(v));
  animateCounter(document.getElementById('ov-incidents'),  2,  v => String(v).padStart(2,'0'));
}

/* ══════════════════════════════════════════════════════════════════════
   5. VULNERABILITY BARS — Animated fill
══════════════════════════════════════════════════════════════════════ */
function initVulnBars() {
  // Reset widths to 0, then animate to target
  const bars = document.querySelectorAll('.vb-fill');
  bars.forEach(bar => {
    const target = bar.dataset.target || '0';
    bar.style.width = '0%';
    setTimeout(() => { bar.style.width = target + '%'; }, 400);
  });
}

/* ══════════════════════════════════════════════════════════════════════
   6. BOTTOM STATUS BAR — Clock + Live Attack Counter
══════════════════════════════════════════════════════════════════════ */
function initBottomBar() {
  // Live UTC clock
  const clockEl = document.getElementById('bb-clock');
  function updateClock() {
    if (!clockEl) return;
    const now = new Date();
    const pad = n => String(n).padStart(2, '0');
    clockEl.textContent = `UTC ${pad(now.getUTCHours())}:${pad(now.getUTCMinutes())}:${pad(now.getUTCSeconds())}`;
  }
  updateClock();
  setInterval(updateClock, 1000);

  // Attack counter fluctuation
  const attackEl = document.getElementById('bb-attacks');
  let attacks = 1247;
  function updateAttacks() {
    attacks += Math.floor(Math.random() * 8) - 2;
    if (attacks < 1200) attacks = 1200;
    if (attackEl) attackEl.textContent = attacks.toLocaleString();
  }
  setInterval(updateAttacks, 2800);

  // Notification counter
  const notifEl = document.getElementById('th-notif-count');
  let notifCount = 3;
  const notifBtn  = document.getElementById('th-notif-btn');
  if (notifBtn) {
    notifBtn.addEventListener('click', () => {
      notifCount = 0;
      if (notifEl) { notifEl.style.display = 'none'; }
      notifBtn.style.borderColor = 'rgba(0,229,255,0.25)';
    });
  }
}

/* ══════════════════════════════════════════════════════════════════════
   7. CYBER NEWS — Fetch from API and render
══════════════════════════════════════════════════════════════════════ */
function initNewsSection() {
  const grid    = document.getElementById('news-grid');
  const filters = document.getElementById('news-filters');
  if (!grid) return;

  let allNews = [];

  async function fetchNews(cat = 'All') {
    const url = cat === 'All' ? '/api/cyber-news' : `/api/cyber-news?category=${encodeURIComponent(cat)}`;
    try {
      const res  = await fetch(url);
      const data = await res.json();
      if (data.success) {
        allNews = data.news;
        renderNews(data.news);
      }
    } catch (err) {
      grid.innerHTML = `<div class="news-loading"><i class="fa-solid fa-triangle-exclamation"></i>&nbsp;Failed to load intel feed.</div>`;
    }
  }

  function renderNews(items) {
    if (!items || items.length === 0) {
      grid.innerHTML = `<div class="news-loading">No news matching that filter.</div>`;
      return;
    }

    grid.innerHTML = items.map(n => {
      const sevClass = n.severity === 'CRITICAL' ? 'CRITICAL' : (n.severity === 'HIGH' ? 'HIGH' : 'MEDIUM');
      const cardBorder = n.severity === 'CRITICAL' ? '' : (n.severity === 'HIGH' ? ' high' : ' medium');
      return `
        <article class="news-card${cardBorder}">
          <div class="news-severity ${sevClass}">
            <i class="fa-solid fa-circle" style="font-size:0.45rem"></i>
            ${n.severity}
          </div>
          <h3 class="news-title">${n.title}</h3>
          <div class="news-meta">${n.source} &nbsp;|&nbsp; ${n.time} &nbsp;|&nbsp; ${n.cve}</div>
          <p class="news-summary">${n.summary}</p>
          <a href="javascript:void(0)" class="news-read-btn" data-id="${n.id}">
            READ ARTICLE <i class="fa-solid fa-arrow-right" style="font-size:0.55rem"></i>
          </a>
        </article>
      `;
    }).join('');

    // Article expand on click
    grid.querySelectorAll('.news-read-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const news = allNews.find(n => n.id === btn.dataset.id);
        if (!news) return;
        showNewsModal(news);
      });
    });
  }

  // News Filters
  if (filters) {
    filters.querySelectorAll('.nf-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        filters.querySelectorAll('.nf-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        fetchNews(btn.dataset.cat);
      });
    });
  }

  fetchNews();

  // Auto-refresh news every 60s
  setInterval(() => {
    const activeBtn = filters ? filters.querySelector('.nf-btn.active') : null;
    fetchNews(activeBtn ? activeBtn.dataset.cat : 'All');
  }, 60000);
}

/* ══════════════════════════════════════════════════════════════════════
   8. NEWS MODAL (expand article)
══════════════════════════════════════════════════════════════════════ */
function showNewsModal(news) {
  // Remove existing modal
  const existing = document.getElementById('news-modal');
  if (existing) existing.remove();

  const sevColor = news.severity === 'CRITICAL' ? '#FF0055' : (news.severity === 'HIGH' ? '#FFB800' : '#00E5FF');

  const modal = document.createElement('div');
  modal.id = 'news-modal';
  modal.style.cssText = `
    position: fixed; inset: 0; z-index: 9999;
    background: rgba(3,10,18,0.88);
    display: flex; align-items: center; justify-content: center;
    padding: 20px;
    backdrop-filter: blur(10px);
    animation: modal-fade-in 0.25s ease forwards;
  `;

  modal.innerHTML = `
    <style>
      @keyframes modal-fade-in {
        from { opacity: 0; transform: scale(0.97); }
        to   { opacity: 1; transform: scale(1); }
      }
    </style>
    <div style="
      background: rgba(6,14,28,0.98);
      border: 1px solid ${sevColor}55;
      border-top: 2px solid ${sevColor};
      border-radius: 10px;
      padding: 28px 32px;
      max-width: 560px;
      width: 100%;
      position: relative;
      box-shadow: 0 20px 80px rgba(0,0,0,0.7), 0 0 40px ${sevColor}15;
    ">
      <button id="modal-close-btn" style="
        position: absolute; top: 14px; right: 16px;
        background: none; border: none;
        color: #445570; font-size: 1rem; cursor: pointer;
        transition: color 0.2s;
      " aria-label="Close modal">
        <i class="fa-solid fa-xmark"></i>
      </button>

      <div style="
        display: inline-flex; align-items: center; gap: 5px;
        font-family: 'JetBrains Mono',monospace; font-size: 0.58rem;
        letter-spacing: 0.12em; padding: 3px 10px; border-radius: 3px;
        margin-bottom: 14px; text-transform: uppercase;
        background: ${sevColor}18; color: ${sevColor};
        border: 1px solid ${sevColor}40;
      ">
        <i class="fa-solid fa-circle" style="font-size:0.4rem"></i>
        ${news.severity}
      </div>

      <h2 style="
        font-family: 'Orbitron',sans-serif; font-size: 0.95rem;
        font-weight: 800; color: #ffffff; letter-spacing: 0.04em;
        line-height: 1.35; margin-bottom: 10px; text-transform: uppercase;
      ">${news.title}</h2>

      <div style="
        font-family: 'JetBrains Mono',monospace; font-size: 0.62rem;
        color: #445570; letter-spacing: 0.06em; margin-bottom: 14px;
      ">${news.source} &nbsp;|&nbsp; ${news.time} &nbsp;|&nbsp; ${news.cve}</div>

      <p style="
        font-family: 'Inter',sans-serif; font-size: 0.82rem;
        color: #7A93B5; line-height: 1.65; margin-bottom: 16px;
      ">${news.summary}</p>

      <div style="
        background: rgba(0,229,255,0.05);
        border: 1px solid rgba(0,229,255,0.18);
        border-radius: 6px; padding: 12px 14px;
      ">
        <div style="
          font-family: 'JetBrains Mono',monospace; font-size: 0.58rem;
          letter-spacing: 0.14em; color: #00E5FF; text-transform: uppercase; margin-bottom: 5px;
        "><i class="fa-solid fa-shield-halved"></i>&nbsp; MITIGATION</div>
        <p style="
          font-family: 'Rajdhani',sans-serif; font-size: 0.88rem;
          color: #CDD9EC; line-height: 1.5;
        ">${news.mitigation}</p>
      </div>
    </div>
  `;

  document.body.appendChild(modal);

  // Close handlers
  modal.addEventListener('click', (e) => { if (e.target === modal) modal.remove(); });
  document.getElementById('modal-close-btn').addEventListener('click', () => modal.remove());
  document.addEventListener('keydown', function onEsc(e) {
    if (e.key === 'Escape') { modal.remove(); document.removeEventListener('keydown', onEsc); }
  });
}

/* ══════════════════════════════════════════════════════════════════════
   9. MOBILE SIDEBAR TOGGLE
══════════════════════════════════════════════════════════════════════ */
function initMobileToggle() {
  const toggle  = document.getElementById('th-mobile-toggle');
  const sidebar = document.getElementById('sidebar');
  if (!toggle || !sidebar) return;

  toggle.addEventListener('click', () => {
    sidebar.classList.toggle('mobile-open');
  });

  // Close on outside click
  document.addEventListener('click', (e) => {
    if (window.innerWidth <= 900 &&
        !sidebar.contains(e.target) &&
        !toggle.contains(e.target)) {
      sidebar.classList.remove('mobile-open');
    }
  });
}

/* ══════════════════════════════════════════════════════════════════════
   10. RUN SCAN BUTTON
══════════════════════════════════════════════════════════════════════ */
function initScanButton() {
  const btn = document.getElementById('btn-run-scan');
  if (!btn) return;

  btn.addEventListener('click', async () => {
    const orig = btn.innerHTML;
    btn.innerHTML = '<i class="fa-solid fa-circle-notch fa-spin"></i> Scanning...';
    btn.disabled = true;

    // Fetch live threat data
    try {
      const res  = await fetch('/api/threat-monitoring');
      const data = await res.json();
      if (data.success) {
        // Update stat counter
        const assetsEl = document.getElementById('ov-assets');
        if (assetsEl) {
          assetsEl.style.transition = 'all 0.4s';
          assetsEl.style.color = '#00FF88';
          setTimeout(() => { assetsEl.style.color = ''; }, 1200);
        }
      }
    } catch (e) { /* silent */ }

    await new Promise(r => setTimeout(r, 2200));
    btn.innerHTML = '<i class="fa-solid fa-check"></i> Scan Complete';
    btn.style.color = '#00FF88';
    btn.style.borderColor = '#00FF88';
    await new Promise(r => setTimeout(r, 1800));
    btn.innerHTML = orig;
    btn.style.color = '';
    btn.style.borderColor = '';
    btn.disabled = false;
  });
}
