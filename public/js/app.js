/* ==========================================================================
   AEGIS CYBER DEFENSE - CLIENT INTERACTION ENGINE
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  initCyberCanvas();
  initThreatFeed();
  initRiskCalculator();
  initTerminalScanner();
  initContactForm();
  initServiceButtons();
  initMobileMenu();
  initTelemetryLogStream();
});

/* ==========================================================================
   1. CYBER MATRIX / NETWORK CANVAS BACKGROUND
   ========================================================================== */
function initCyberCanvas() {
  const canvas = document.getElementById('cyber-canvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  let width = (canvas.width = window.innerWidth);
  let height = (canvas.height = window.innerHeight);

  window.addEventListener('resize', () => {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
  });

  const nodes = [];
  const nodeCount = Math.min(width > 768 ? 60 : 30, 80);

  for (let i = 0; i < nodeCount; i++) {
    nodes.push({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.4,
      vy: (Math.random() - 0.5) * 0.4,
      radius: Math.random() * 1.5 + 1
    });
  }

  function draw() {
    ctx.clearRect(0, 0, width, height);

    // Draw connection lines
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const dx = nodes[i].x - nodes[j].x;
        const dy = nodes[i].y - nodes[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < 140) {
          ctx.beginPath();
          ctx.moveTo(nodes[i].x, nodes[i].y);
          ctx.lineTo(nodes[j].x, nodes[j].y);
          ctx.strokeStyle = `rgba(0, 240, 255, ${0.15 * (1 - dist / 140)})`;
          ctx.lineWidth = 0.6;
          ctx.stroke();
        }
      }
    }

    // Draw nodes
    for (let i = 0; i < nodes.length; i++) {
      const node = nodes[i];
      node.x += node.vx;
      node.y += node.vy;

      if (node.x < 0 || node.x > width) node.vx *= -1;
      if (node.y < 0 || node.y > height) node.vy *= -1;

      ctx.beginPath();
      ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(0, 240, 255, 0.6)';
      ctx.fill();
    }

    requestAnimationFrame(draw);
  }

  draw();
}

/* ==========================================================================
   2. LIVE THREAT FEED & TICKER
   ========================================================================== */
async function initThreatFeed() {
  const tableBody = document.getElementById('threat-feed-tbody');
  const liveTickerText = document.getElementById('live-ticker-text');
  const refreshBtn = document.getElementById('refresh-threats-btn');

  async function fetchThreats() {
    try {
      const res = await fetch('/api/threat-feed');
      if (!res.ok) throw new Error('Network response failed');
      const data = await res.json();

      if (data.feed && tableBody) {
        tableBody.innerHTML = '';
        data.feed.forEach((item) => {
          const tr = document.createElement('tr');
          const sevClass = item.severity.toLowerCase();

          tr.innerHTML = `
            <td>
              <strong class="text-white">${escapeHtml(item.type)}</strong>
              <div class="text-dim text-xs mono-code">Target: ${escapeHtml(item.target)}</div>
            </td>
            <td>
              <span class="mono-code">${escapeHtml(item.source)}</span>
              <div class="text-muted text-xs">${escapeHtml(item.country)}</div>
            </td>
            <td>
              <span class="badge-severity ${sevClass}">${item.severity}</span>
            </td>
            <td>
              <span class="text-green text-xs mono-code"><i class="fa-solid fa-shield-check"></i> ${escapeHtml(item.status)}</span>
            </td>
          `;
          tableBody.appendChild(tr);
        });

        // Update ticker text with random latest attack
        if (liveTickerText && data.feed.length > 0) {
          const sample = data.feed[Math.floor(Math.random() * data.feed.length)];
          liveTickerText.innerHTML = `
            <strong>[INTERCEPTED]</strong> ${sample.type} targeting <em>${sample.target}</em> from ${sample.source} (${sample.country}) - ${sample.status}
          `;
        }
      }
    } catch (err) {
      console.warn('Threat feed offline / fallback active:', err);
    }
  }

  fetchThreats();
  setInterval(fetchThreats, 15000); // Polling every 15 seconds

  if (refreshBtn) {
    refreshBtn.addEventListener('click', () => {
      refreshBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Fetching...';
      fetchThreats().finally(() => {
        setTimeout(() => {
          refreshBtn.innerHTML = '<i class="fa-solid fa-rotate"></i> Refresh Feed';
        }, 600);
      });
    });
  }
}

/* ==========================================================================
   3. CYBER RISK ASSESSMENT CALCULATOR
   ========================================================================== */
function initRiskCalculator() {
  const form = document.getElementById('risk-calc-form');
  const resultBox = document.getElementById('calculator-result');
  const recalcBtn = document.getElementById('recalculate-btn');

  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const submitBtn = document.getElementById('calc-submit-btn');
    const originalBtnHtml = submitBtn.innerHTML;
    submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Processing Telemetry...';
    submitBtn.disabled = true;

    const companyName = document.getElementById('calc-company').value.trim();
    const email = document.getElementById('calc-email').value.trim();
    const industry = document.getElementById('calc-industry').value;
    const companySize = document.getElementById('calc-size').value;

    const hasSOC = document.getElementById('toggle-soc').checked;
    const hasPenTestRecently = document.getElementById('toggle-pentest').checked;
    const cloudMulti = document.getElementById('toggle-cloud').checked;

    try {
      const res = await fetch('/api/audit-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          companyName,
          email,
          industry,
          companySize,
          hasSOC,
          hasPenTestRecently,
          cloudProviders: cloudMulti ? ['AWS', 'GCP', 'Azure'] : ['AWS']
        })
      });

      const data = await res.json();
      if (data.success && data.report) {
        renderRiskReport(data.report);
      } else {
        showToast(data.message || 'Error processing assessment', 'error');
      }
    } catch (err) {
      console.error(err);
      showToast('Network error during risk computation.', 'error');
    } finally {
      submitBtn.innerHTML = originalBtnHtml;
      submitBtn.disabled = false;
    }
  });

  if (recalcBtn) {
    recalcBtn.addEventListener('click', () => {
      if (resultBox) resultBox.classList.add('hidden');
      form.scrollIntoView({ behavior: 'smooth' });
    });
  }
}

function renderRiskReport(report) {
  const resultBox = document.getElementById('calculator-result');
  if (!resultBox) return;

  document.getElementById('result-ticket-id').textContent = report.id;
  document.getElementById('risk-score-value').textContent = report.riskScore;
  document.getElementById('risk-posture-label').textContent = report.threatPosture;
  document.getElementById('risk-posture-label').style.color = report.postureColor;

  const scoreCircle = document.getElementById('risk-score-circle');
  if (scoreCircle) {
    scoreCircle.style.borderColor = report.postureColor;
    scoreCircle.style.boxShadow = `0 0 25px ${report.postureColor}55`;
  }

  document.getElementById('result-company-name').textContent = report.companyName;
  document.getElementById('result-cve-count').textContent = `~${report.estimatedVulnerabilities} Exposure Points`;
  document.getElementById('result-package').textContent = report.suggestedPackage;

  const recList = document.getElementById('recommendations-list');
  recList.innerHTML = '';
  report.recommendations.forEach((rec) => {
    const li = document.createElement('li');
    li.textContent = rec;
    recList.appendChild(li);
  });

  resultBox.classList.remove('hidden');
  resultBox.scrollIntoView({ behavior: 'smooth' });

  // Pre-fill consultation form with company & email
  const contactName = document.getElementById('contact-name');
  const contactEmail = document.getElementById('contact-email');
  const contactCompany = document.getElementById('contact-company');
  const contactMessage = document.getElementById('contact-message');

  if (contactCompany) contactCompany.value = report.companyName;
  if (contactEmail) contactEmail.value = report.email;
  if (contactMessage) {
    contactMessage.value = `Risk Assessment ID: ${report.id}. Risk Score: ${report.riskScore}/100 (${report.threatPosture}). Suggested Scope: ${report.suggestedPackage}`;
  }
}

/* ==========================================================================
   4. TERMINAL VAPT SCANNER SIMULATOR
   ========================================================================== */
function initTerminalScanner() {
  const runBtn = document.getElementById('run-terminal-scan-btn');
  const clearBtn = document.getElementById('clear-terminal-btn');
  const screen = document.getElementById('terminal-screen');

  if (!runBtn || !screen) return;

  const scanSteps = [
    { text: 'root@aegis:~# aegis-recon --target edge.gateway.corp --deep-enum', color: 'text-white' },
    { text: '[+] Resolving DNS records, CDN proxies & BGP routing ASNs...', color: 'text-muted' },
    { text: '[+] Discovered 24 open ports: 22(SSH), 80(HTTP), 443(HTTPS), 6443(Kubernetes API), 9200(Elasticsearch)', color: 'text-cyan' },
    { text: '[!] WARNING: Elasticsearch cluster (port 9200) unauthenticated cluster query allowed.', color: 'text-danger' },
    { text: '[+] Checking TLS cipher suites: Found deprecated TLS 1.0 & Weak CBC Ciphers.', color: 'text-warning' },
    { text: '[+] Fuzzing API endpoints: /api/v1/user/export [SQLi Blind Timing detected]', color: 'text-danger' },
    { text: '[+] Analyzing container egress: Pod metadata service instance credentials reachable.', color: 'text-danger' },
    { text: '[✔] Scan completed in 3.42s. 3 Critical, 2 High, 4 Medium findings identified.', color: 'text-green' },
    { text: '[✔] Automated remediation patches staged for Aegis Managed SOC.', color: 'text-cyan' }
  ];

  let isScanning = false;

  runBtn.addEventListener('click', () => {
    if (isScanning) return;
    isScanning = true;
    screen.innerHTML = '';

    let i = 0;
    function printNextLine() {
      if (i < scanSteps.length) {
        const line = document.createElement('div');
        line.className = `term-line ${scanSteps[i].color}`;
        line.textContent = scanSteps[i].text;
        screen.appendChild(line);
        screen.scrollTop = screen.scrollHeight;
        i++;
        setTimeout(printNextLine, 450);
      } else {
        isScanning = false;
        const promptLine = document.createElement('div');
        promptLine.className = 'term-line';
        promptLine.innerHTML = '<span class="prompt text-green">root@aegis:~#</span> <span class="cursor-blink">_</span>';
        screen.appendChild(promptLine);
        screen.scrollTop = screen.scrollHeight;
      }
    }

    printNextLine();
  });

  if (clearBtn) {
    clearBtn.addEventListener('click', () => {
      screen.innerHTML = `
        <div class="term-line text-cyan">Aegis Offensive Engine v4.8 [Ready]</div>
        <div class="term-line text-muted">Type or click 'Run Simulation' to execute multi-vector cloud perimeter inspection.</div>
        <div class="term-line"><span class="prompt text-green">root@aegis:~#</span> <span class="cursor-blink">_</span></div>
      `;
    });
  }
}

/* ==========================================================================
   5. CONTACT & EMERGENCY INCIDENT FORM
   ========================================================================== */
function initContactForm() {
  const form = document.getElementById('contact-booking-form');
  const feedback = document.getElementById('contact-feedback');
  const tabStandard = document.getElementById('tab-standard');
  const tabEmergency = document.getElementById('tab-emergency');
  const urgencyInput = document.getElementById('form-urgency-input');
  const submitBtn = document.getElementById('contact-submit-btn');

  if (tabStandard && tabEmergency && urgencyInput) {
    tabStandard.addEventListener('click', () => {
      tabStandard.classList.add('active');
      tabEmergency.classList.remove('active');
      urgencyInput.value = 'Standard';
      if (submitBtn) {
        submitBtn.className = 'btn btn-primary btn-block btn-lg';
        submitBtn.innerHTML = '<i class="fa-solid fa-paper-plane"></i> Submit Security Request';
      }
    });

    tabEmergency.addEventListener('click', () => {
      tabEmergency.classList.add('active');
      tabStandard.classList.remove('active');
      urgencyInput.value = 'Emergency';
      if (submitBtn) {
        submitBtn.className = 'btn btn-danger btn-block btn-lg';
        submitBtn.innerHTML = '<i class="fa-solid fa-bolt"></i> DISPATCH INCIDENT COMMANDER (URGENT)';
      }
    });
  }

  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const originalBtnContent = submitBtn.innerHTML;
    submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Transmitting Encrypted Payload...';
    submitBtn.disabled = true;

    const payload = {
      name: document.getElementById('contact-name').value.trim(),
      email: document.getElementById('contact-email').value.trim(),
      phone: document.getElementById('contact-phone').value.trim(),
      company: document.getElementById('contact-company').value.trim(),
      serviceType: document.getElementById('contact-service').value,
      urgency: urgencyInput ? urgencyInput.value : 'Standard',
      message: document.getElementById('contact-message').value.trim()
    };

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (data.success) {
        feedback.className = `feedback-toast ${payload.urgency === 'Emergency' ? 'danger' : 'success'}`;
        feedback.innerHTML = `
          <strong>${data.message}</strong>
          <div class="mono-code text-xs mt-1">Ticket Reference: ${data.ticketId} | SLA Response: ${data.responseTime}</div>
        `;
        feedback.classList.remove('hidden');
        showToast(data.message, payload.urgency === 'Emergency' ? 'emergency' : 'success');
        form.reset();
      } else {
        showToast(data.message || 'Failed to submit request', 'error');
      }
    } catch (err) {
      console.error(err);
      showToast('Error communicating with defense gateway', 'error');
    } finally {
      submitBtn.innerHTML = originalBtnContent;
      submitBtn.disabled = false;
    }
  });
}

/* ==========================================================================
   6. SERVICE CARD BUTTON ACTIONS
   ========================================================================== */
function initServiceButtons() {
  const buttons = document.querySelectorAll('.select-service-btn');
  const serviceSelect = document.getElementById('contact-service');
  const contactSection = document.getElementById('contact');

  buttons.forEach((btn) => {
    btn.addEventListener('click', () => {
      const serviceId = btn.getAttribute('data-service-id');
      if (serviceSelect) {
        if (serviceId === 'vapt') serviceSelect.value = 'Penetration Testing & VAPT';
        else if (serviceId === 'soc') serviceSelect.value = '24/7 Managed SOC & MDR';
        else if (serviceId === 'red-team') serviceSelect.value = 'Red Teaming & Simulation';
        else if (serviceId === 'cloud-security') serviceSelect.value = 'Cloud Zero-Trust Architecture';
        else if (serviceId === 'incident-response') {
          serviceSelect.value = 'Emergency Incident Response';
          const tabEmergency = document.getElementById('tab-emergency');
          if (tabEmergency) tabEmergency.click();
        } else if (serviceId === 'compliance') serviceSelect.value = 'Compliance & GRC (ISO/SOC2/PCI)';
      }

      if (contactSection) {
        contactSection.scrollIntoView({ behavior: 'smooth' });
      }
    });
  });
}

/* ==========================================================================
   7. LIVE TELEMETRY LOG STREAM (HERO)
   ========================================================================== */
function initTelemetryLogStream() {
  const stream = document.getElementById('hero-log-stream');
  if (!stream) return;

  const sampleEvents = [
    { text: '[{TIME}] SSH Brute-Force from AS4812 blocked by fail2ban mesh.', color: 'text-cyan' },
    { text: '[{TIME}] Anomalous AWS KMS decrypt spike detected - Rate limited.', color: 'text-warning' },
    { text: '[{TIME}] Zero-Day signature matched: CVE-2026-8911 neutralized.', color: 'text-danger' },
    { text: '[{TIME}] Automated TLS certificate renewal completed across 48 domains.', color: 'text-green' },
    { text: '[{TIME}] SOC Analyst tier-3 containment dispatched for node #819.', color: 'text-muted' },
    { text: '[{TIME}] API Gateway WAF blocked SQL injection attempt on /v2/auth.', color: 'text-cyan' }
  ];

  setInterval(() => {
    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;
    const ev = sampleEvents[Math.floor(Math.random() * sampleEvents.length)];

    const line = document.createElement('div');
    line.className = `log-line ${ev.color}`;
    line.textContent = ev.text.replace('{TIME}', timeStr);

    stream.appendChild(line);
    if (stream.children.length > 5) {
      stream.removeChild(stream.firstElementChild);
    }
  }, 4000);
}

/* ==========================================================================
   8. MOBILE MENU & UTILITIES
   ========================================================================== */
function initMobileMenu() {
  const toggle = document.getElementById('mobile-menu-toggle');
  const menu = document.getElementById('nav-menu');

  if (toggle && menu) {
    toggle.addEventListener('click', () => {
      menu.classList.toggle('open');
    });

    // Close on navigation link click
    document.querySelectorAll('.nav-link').forEach((link) => {
      link.addEventListener('click', () => {
        menu.classList.remove('open');
      });
    });
  }
}

function showToast(message, type = 'success') {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = `toast ${type === 'emergency' ? 'toast-emergency' : ''}`;
  toast.innerHTML = `
    <i class="fa-solid ${type === 'emergency' ? 'fa-triangle-exclamation text-danger' : 'fa-circle-check text-green'}"></i>
    <span>${escapeHtml(message)}</span>
  `;

  container.appendChild(toast);
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(100%)';
    toast.style.transition = 'all 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 4500);
}

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
