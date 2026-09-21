const express = require('express');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// In-memory data store for audits & incidents
const auditRequests = [];
const portalSessions = [];
const crisisDispatches = [];

// Cyber Shield Security Catalog
const coreServices = [
  {
    id: 'pentest',
    name: 'Penetration Testing',
    icon: 'fa-arrow-right-arrow-left',
    category: 'Offensive Security',
    description: 'Black-box, grey-box, and white-box adversary simulation against web, API, mobile, and Active Directory environments.',
    metrics: '99.4% Critical Vulnerability Discovery'
  },
  {
    id: 'network-sec',
    name: 'Network Security',
    icon: 'fa-network-wired',
    category: 'Infrastructure',
    description: 'Next-generation firewall management, deep packet inspection, IDS/IPS tuning, and internal subnet micro-segmentation.',
    metrics: 'Sub-millisecond Threat Scrubbing'
  },
  {
    id: 'incident-response',
    name: 'Incident Response',
    icon: 'fa-shield-halved',
    category: 'Crisis Defense',
    description: 'Rapid containment, malware analysis, digital forensics, and emergency ransomware negotiation & remediation.',
    metrics: '< 15 Min SLA Dispatch'
  },
  {
    id: 'cloud-protection',
    name: 'Cloud Protection',
    icon: 'fa-cloud',
    category: 'Cloud & Zero Trust',
    description: 'Automated CSPM, Kubernetes container hardening, AWS/Azure/GCP IAM blast radius elimination.',
    metrics: '100% Zero-Trust Compliance'
  },
  {
    id: 'code-audits',
    name: 'Code Audits',
    icon: 'fa-code',
    category: 'DevSecOps',
    description: 'Static (SAST) and Dynamic (DAST) source code auditing, dependency chain scanning, and secret leak detection.',
    metrics: 'OWASP & CWE Alignment'
  }
];

const allServices = [
  { id: 'net-prot', title: 'NETWORK PROTECTION', icon: 'fa-crosshairs', desc: 'Perimeter firewalls, DDoS scrubbing & encrypted tunnels.' },
  { id: 'infra-shield', title: 'INFRASTRUCTURE SHIELD', icon: 'fa-shield-virus', desc: 'Host hardening, kernel integrity checks & zero-trust gateways.' },
  { id: 'cyber-def', title: 'CYBER DEFENSE', icon: 'fa-shield', desc: '24/7 SIEM monitoring, behavioral telemetry & automated quarantine.' },
  { id: 'vuln-assess', title: 'VULNERABILITY ASSESSMENT', icon: 'fa-magnifying-glass', desc: 'Continuous automated and manual CVE surface inspection.' },
  { id: 'sec-consulting', title: 'SECURITY CONSULTING', icon: 'fa-key', desc: 'CISO advisory, ISO 27001, SOC 2, and NIST framework compliance.' },
  { id: 'crisis-resp', title: 'CRISIS RESPONSE', icon: 'fa-triangle-exclamation', desc: 'Immediate incident commander dispatch for active breach triage.' }
];

// Live Simulated Exploit Log Lines
const exploitSnippets = [
  '10.100.400.111 Exploit code - Memory buffer overrun detected on port 8080 (BLOCKED)',
  '192.168.1.104 Exploit code - SQLi blind timing probe injected into /v1/auth (QUARANTINED)',
  '172.16.42.89 Exploit code - Cobalt strike beacon probe blocked by IDS filter',
  '10.0.12.55 Exploit code - Zero-day deserialization attempt on Spring cloud cluster (DROPPED)',
  '185.220.101.5 Exploit code - TOR exit node brute-force on SSH port 22 (BANNED)'
];

// --- API Endpoints ---

// 1. Live Threat Monitoring Telemetry
app.get('/api/threat-monitoring', (req, res) => {
  const baseIPs = [
    '235.983.234',
    '135.187.559',
    '135.183.300',
    '153.183.556',
    '153.182.355',
    '194.165.118',
    '178.62.204'
  ];

  // Pick random active IPs
  const activeIPs = baseIPs.slice(0, 5).map(ip => ({
    ip: `IP: ${ip}`,
    status: Math.random() > 0.3 ? 'INTERCEPTED' : 'ANALYZING',
    threat: ['DDoS Cluster', 'RCE Probe', 'Credential Stuffing', 'C2 Beacon', 'Port Scan'][Math.floor(Math.random() * 5)],
    latency: `${Math.floor(Math.random() * 30) + 5}ms`
  }));

  res.json({
    success: true,
    status: 'ONLINE',
    liveAttacksCount: 1234 + Math.floor(Math.random() * 50),
    activeIPs,
    exploitStream: exploitSnippets[Math.floor(Math.random() * exploitSnippets.length)],
    timestamp: new Date().toISOString()
  });
});

// 2. Services List
app.get('/api/services', (req, res) => {
  res.json({
    success: true,
    coreServices,
    allServices
  });
});

// 3. Security Audit Computation & Submission
app.post('/api/audit-request', (req, res) => {
  const { companyName, email, industry, companySize, scope, cloudProviders } = req.body;

  if (!companyName || !email) {
    return res.status(400).json({
      success: false,
      message: 'Company name and email address are required.'
    });
  }

  // Calculate Cyber Risk Score
  let riskScore = 48;
  if (industry === 'Finance' || industry === 'Crypto' || industry === 'Healthcare') riskScore += 24;
  if (companySize === '500+') riskScore += 18;
  if (Array.isArray(cloudProviders) && cloudProviders.length > 2) riskScore += 10;
  riskScore = Math.min(98, Math.max(12, riskScore));

  let threatPosture = riskScore > 75 ? 'Critical Risk' : (riskScore > 45 ? 'Elevated Exposure' : 'Low Risk');
  let postureColor = riskScore > 75 ? '#FF0055' : (riskScore > 45 ? '#00E5FF' : '#00FF88');

  const report = {
    id: `CSS-AUD-${Date.now().toString(36).toUpperCase()}`,
    companyName,
    email,
    riskScore,
    threatPosture,
    postureColor,
    scope: scope || 'Full Infrastructure & Cloud VAPT',
    estimatedVulnerabilities: Math.round(riskScore * 1.35),
    recommendedSolutions: [
      'Proactive Black-Box Penetration Testing & API Fuzzing',
      '24/7 Automated Network & Endpoint Shield Monitoring',
      'Cloud Zero-Trust Architecture & IAM Hardening',
      'Continuous Threat Intel & Vulnerability Scanning'
    ],
    timestamp: new Date().toISOString()
  };

  auditRequests.push(report);

  res.json({
    success: true,
    message: 'Security Audit Request processed successfully. Our Cyber Defense unit is compiling your report.',
    report
  });
});

// 4. Portal Login Simulator
app.post('/api/auth/portal-login', (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ success: false, message: 'Operator ID and Security Key required.' });
  }

  const sessionToken = `CSS-AUTH-${Math.random().toString(36).substring(2, 10).toUpperCase()}`;
  portalSessions.push({ username, sessionToken, loggedInAt: new Date().toISOString() });

  res.json({
    success: true,
    message: 'Access Granted: Encrypted Cyber Shield Command Terminal Activated.',
    sessionToken,
    user: {
      username,
      role: 'CERTIFIED CYBER DEFENDER',
      clearance: 'LEVEL-5 TOP SECRET',
      activeShieldNodes: 48,
      defenseStatus: 'OPTIMAL'
    }
  });
});

// 5. Emergency Crisis Response Dispatch
app.post('/api/crisis-response', (req, res) => {
  const { company, contactName, phone, email, breachType, notes } = req.body;

  if (!contactName || !phone) {
    return res.status(400).json({ success: false, message: 'Contact Name and Emergency Phone are required.' });
  }

  const dispatch = {
    dispatchId: `CRISIS-${Date.now().toString(36).toUpperCase()}`,
    company: company || 'Emergency Client',
    contactName,
    phone,
    email: email || 'N/A',
    breachType: breachType || 'Active Ransomware / APT Intrusion',
    notes: notes || 'Immediate response requested',
    dispatchedAt: new Date().toISOString(),
    status: 'COMMANDER_DISPATCHED'
  };

  crisisDispatches.push(dispatch);

  res.json({
    success: true,
    message: '🚨 EMERGENCY CRISIS TEAM DISPATCHED. Lead Incident Commander is calling your phone in < 10 minutes.',
    dispatchId: dispatch.dispatchId,
    eta: '< 10 Minutes'
  });
});

// Cyber News & Intelligence Feed
const cyberNews = [
  {
    id: 'NEWS-01',
    title: 'Zero-Day RCE in Enterprise Cloud Edge Routers Actively Exploited',
    category: 'Zero-Days',
    severity: 'CRITICAL',
    time: '12 mins ago',
    source: 'Aegis Threat Lab',
    summary: 'Nation-state APT actors are actively chaining an unauthenticated buffer overflow with memory tampering to bypass edge firewalls and achieve root execution.',
    cve: 'CVE-2026-8912',
    mitigation: 'Deploy virtual patching rule #99401 and restrict external administrative web interfaces.'
  },
  {
    id: 'NEWS-02',
    title: 'New Ransomware Variant "ShadowLock" Targeting Kubernetes API Endpoints',
    category: 'Ransomware',
    severity: 'CRITICAL',
    time: '45 mins ago',
    source: 'Global SOC Wire',
    summary: 'Automated extortion bots are searching for open port 6443 clusters and injecting cryptojacking & volume encryption payloads into cluster pods.',
    cve: 'CVE-2026-3401',
    mitigation: 'Enforce RBAC mutual TLS and disable anonymous authentication on kube-apiserver.'
  },
  {
    id: 'NEWS-03',
    title: 'AI-Synthesized Voice Phishing Campaign Infiltrates Major Fintech Portals',
    category: 'Breaches',
    severity: 'HIGH',
    time: '2 hours ago',
    source: 'Cyber Defense Review',
    summary: 'Attackers used real-time conversational deepfakes to impersonate C-level executives and approve fraudulent SWIFT fund re-routes.',
    cve: 'SOCIAL-ENG-2026',
    mitigation: 'Implement out-of-band cryptographic multi-party authorization for high-value transactions.'
  },
  {
    id: 'NEWS-04',
    title: 'Massive Multi-Vector DDoS Wave Peaks at 3.8 Tbps Against DNS Root Nodes',
    category: 'DDoS',
    severity: 'HIGH',
    time: '4 hours ago',
    source: 'Cloud Armor Feed',
    summary: 'A botnet comprised of over 180,000 hijacked smart IoT cameras launched an amplified DNS/NTP reflection assault across North America.',
    cve: 'BOTNET-RECON-99',
    mitigation: 'Utilize BGP Anycast routing and automated Layer-7 rate-limiting scrubbing pipelines.'
  },
  {
    id: 'NEWS-05',
    title: 'CISA Issues Emergency Directive for Active Directory Kerberos Hardening',
    category: 'Advisories',
    severity: 'MEDIUM',
    time: '6 hours ago',
    source: 'US-CERT / CISA',
    summary: 'Security bulletin warns of golden ticket forging vulnerabilities when domain controllers use legacy RC4-HMAC encryption keys.',
    cve: 'CVE-2026-1180',
    mitigation: 'Upgrade AD forests to AES-256-CTS-HMAC-SHA1-96 and enable PAC validation signatures.'
  }
];

// 6. Cyber News Feed API
app.get('/api/cyber-news', (req, res) => {
  const { category } = req.query;
  let filtered = cyberNews;
  if (category && category !== 'All') {
    filtered = cyberNews.filter(n => n.category.toLowerCase() === category.toLowerCase());
  }
  res.json({
    success: true,
    count: filtered.length,
    news: filtered
  });
});

// 7. General Contact
app.post('/api/contact', (req, res) => {
  const { name, email, service, message } = req.body;
  res.json({
    success: true,
    message: 'Transmission received. A Cyber Shield Security Specialist will reach out within 2 hours.',
    ticketId: `TICK-${Date.now().toString(36).toUpperCase()}`
  });
});

// Dedicated Login Page Route
app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

// Catch-all route to serve the SPA
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start Server with Graceful Port Fallback
function startServer(portToTry) {
  const server = app.listen(portToTry, () => {
    console.log(`=====================================================`);
    console.log(`🛡️  CYBER SHIELD SECURITY COMMAND HUB IS LIVE`);
    console.log(`🌐  Local URL: http://localhost:${portToTry}`);
    console.log(`🔒  DEFENSE STATUS: ACTIVE // 100% SENSORS ARMED`);
    console.log(`=====================================================`);
  });

  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.warn(`⚠️  Port ${portToTry} is in use. Trying port ${portToTry + 1}...`);
      startServer(portToTry + 1);
    } else {
      console.error('Server error:', err);
    }
  });
}

startServer(Number(PORT));
