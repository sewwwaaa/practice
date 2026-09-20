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

// Mock In-memory Storage for inquiries/reports
const consultations = [];
const auditRequests = [];

// Cyber Security Services Catalog
const services = [
  {
    id: 'vapt',
    title: 'Penetration Testing & VAPT',
    icon: 'fa-shield-halved',
    badge: 'Offensive Security',
    description: 'Simulate real-world nation-state cyberattacks against web apps, mobile APIs, network perimeters, and active directories.',
    features: [
      'OWASP Top 10 & SANS Top 25 Audit',
      'Zero-Day Vulnerability Research',
      'API & Cloud Perimeter Stress Testing',
      'Executive & Technical Remediation Reports'
    ],
    sla: '5-Day Rapid Turnaround'
  },
  {
    id: 'soc',
    title: '24/7 Managed SOC & MDR',
    icon: 'fa-tower-broadcast',
    badge: 'Continuous Defense',
    description: 'AI-accelerated 24/7/365 Security Operations Center with real-time threat hunting, SIEM integration, and proactive containment.',
    features: [
      'Sub-5-minute Incident Triage',
      'Behavioral EDR & XDR Telemetry',
      'Automated Threat Quarantine',
      'Dedicated Tier-3 Security Analyst'
    ],
    sla: '< 15 Min SLA Response'
  },
  {
    id: 'red-team',
    title: 'Red Teaming & Adversary Emulation',
    icon: 'fa-skull-crossbones',
    badge: 'Advanced Simulation',
    description: 'Comprehensive multi-vector attack scenarios including physical intrusion, deep spear-phishing, social engineering, and covert data exfiltration.',
    features: [
      'MITRE ATT&CK Framework Alignment',
      'Custom Stealth C2 Payload Crafting',
      'Phishing & Employee Resilience Drills',
      'Blue Team Tactical Defense Debrief'
    ],
    sla: 'Custom Campaign'
  },
  {
    id: 'cloud-security',
    title: 'Cloud & Zero-Trust Architecture',
    icon: 'fa-cloud-arrow-up',
    badge: 'Infrastructure',
    description: 'Harden AWS, Azure, GCP, and Kubernetes environments with micro-segmentation, IAM least-privilege, and automated CSPM posture management.',
    features: [
      'Kubernetes & Container Hardening',
      'IAM Blast-Radius Reduction',
      'Continuous Compliance & Drift Alarms',
      'CI/CD DevSecOps Pipeline Security'
    ],
    sla: 'Complete Architecture Audit'
  },
  {
    id: 'incident-response',
    title: 'Emergency Incident Response',
    icon: 'fa-triangle-exclamation',
    badge: 'Critical Rapid Response',
    description: 'Immediate containment, forensic investigation, and ransomware recovery to mitigate business interruption and data loss.',
    features: [
      '1-Hour Emergency On-Call Team',
      'Digital Forensics & Root Cause Analysis',
      'Ransomware Negotiation & Decryption Support',
      'Regulatory Reporting & Evidence Preservation'
    ],
    sla: '24/7 Emergency Line'
  },
  {
    id: 'compliance',
    title: 'Compliance & Governance (GRC)',
    icon: 'fa-file-shield',
    badge: 'Audit & Advisory',
    description: 'End-to-end audit readiness and certification assistance for global data privacy and cybersecurity standards.',
    features: [
      'ISO 27001:2022 & SOC 2 Type II',
      'PCI-DSS 4.0 & HIPAA Security Rule',
      'GDPR & NIST CSF Frameworks',
      'Automated Evidence Gathering Support'
    ],
    sla: 'Guaranteed Audit Readiness'
  }
];

// Live Simulated Threat Intelligence Stream
const sampleThreats = [
  { type: 'Distributed Denial of Service (DDoS)', source: 'Botnet Cluster (AS45102)', country: 'Global Relay', severity: 'Critical', target: 'Financial Gateway', status: 'Blocked by Scrubbing Center' },
  { type: 'Zero-Day Remote Code Execution (RCE)', source: 'Unknown APT Actor', country: 'Eastern Europe', severity: 'High', target: 'Web Application API', status: 'Virtual Patch Applied' },
  { type: 'Credential Stuffing Assault', source: 'Tor Exit Node Pool', country: 'Multi-Region', severity: 'Medium', target: 'Customer Identity Portal', status: 'Adaptive MFA Triggered' },
  { type: 'Ransomware C2 Beaconing', source: 'Cobalt Strike Derivative', country: 'South America', severity: 'Critical', target: 'Legacy Database Server', status: 'Endpoint Quarantined' },
  { type: 'Suspicious Cloud IAM Escalation', source: 'Anomalous Token Usage', country: 'North America', severity: 'High', target: 'AWS S3 Bucket Policy', status: 'Session Terminated' },
  { type: 'SQL Injection / Data Exfiltration Attempt', source: 'Automated Exploit Kit', country: 'Asia Pacific', severity: 'High', target: 'E-Commerce Checkout', status: 'WAF Rule Blocked' }
];

// --- API Endpoints ---

// 1. Get Service Catalog
app.get('/api/services', (req, res) => {
  res.json({ success: true, count: services.length, services });
});

// 2. Threat Feed (returns dynamic simulated threat telemetry)
app.get('/api/threat-feed', (req, res) => {
  const randomizedThreats = sampleThreats.map((threat, idx) => ({
    ...threat,
    id: `THR-${Date.now()}-${idx}`,
    timestamp: new Date(Date.now() - (idx * 45000 + Math.floor(Math.random() * 20000))).toISOString(),
    blockedRequests: Math.floor(Math.random() * 45000) + 12000
  }));

  res.json({
    success: true,
    threatLevel: 'DEFCON 3 - ELEVATED VIGILANCE',
    activeAttacksBlocked24h: 1849204 + Math.floor(Math.random() * 5000),
    globalRadarStatus: 'ONLINE - 100% SENSORS ACTIVE',
    feed: randomizedThreats
  });
});

// 3. Security Risk Calculator API
app.post('/api/audit-request', (req, res) => {
  const { companyName, email, industry, companySize, cloudProviders, hasSOC, hasPenTestRecently } = req.body;

  if (!companyName || !email) {
    return res.status(400).json({
      success: false,
      message: 'Company name and contact email are required.'
    });
  }

  // Calculate dynamic Cyber Risk Index (0 - 100)
  let riskScore = 45; // baseline

  if (industry === 'Finance' || industry === 'Healthcare' || industry === 'Crypto') riskScore += 20;
  if (companySize === '500+') riskScore += 15;
  else if (companySize === '50-500') riskScore += 10;

  if (Array.isArray(cloudProviders) && cloudProviders.length > 2) riskScore += 10;
  if (!hasSOC) riskScore += 20;
  if (!hasPenTestRecently) riskScore += 15;

  // Cap risk score between 15 and 98
  riskScore = Math.min(98, Math.max(15, riskScore));

  let threatPosture = 'Low Risk';
  let color = '#00FF9D';
  if (riskScore >= 75) {
    threatPosture = 'Critical Exposure';
    color = '#FF0055';
  } else if (riskScore >= 50) {
    threatPosture = 'High Vulnerability';
    color = '#FFB800';
  } else if (riskScore >= 30) {
    threatPosture = 'Moderate Exposure';
    color = '#00F0FF';
  }

  const recommendations = [];
  if (!hasSOC) recommendations.push('Deploy 24/7 Managed SOC & Real-Time Threat Hunting to eliminate blindspots.');
  if (!hasPenTestRecently) recommendations.push('Conduct immediate Full-Scope Penetration Testing (VAPT) on public endpoints.');
  if (Array.isArray(cloudProviders) && cloudProviders.length > 1) recommendations.push('Implement Multi-Cloud Zero-Trust IAM & Container Hardening.');
  if (industry === 'Finance' || industry === 'Healthcare') recommendations.push('Perform compliance readiness assessment for PCI-DSS 4.0 / HIPAA / SOC 2 Type II.');

  const report = {
    id: `AUD-${Date.now().toString(36).toUpperCase()}`,
    companyName,
    email,
    riskScore,
    threatPosture,
    postureColor: color,
    recommendations,
    estimatedVulnerabilities: Math.round(riskScore * 1.4),
    suggestedPackage: riskScore > 70 ? 'Enterprise Shield & 24/7 SOC' : (riskScore > 40 ? 'Advanced VAPT & Cloud Hardening' : 'Core Security Healthcheck'),
    generatedAt: new Date().toISOString()
  };

  auditRequests.push(report);

  res.json({
    success: true,
    message: 'Cyber Risk Assessment generated successfully.',
    report
  });
});

// 4. Contact & Consultation Booking Endpoint
app.post('/api/contact', (req, res) => {
  const { name, email, phone, company, serviceType, urgency, message } = req.body;

  if (!name || !email || !serviceType) {
    return res.status(400).json({
      success: false,
      message: 'Name, email, and service interest are required.'
    });
  }

  const consultationEntry = {
    id: `REQ-${Date.now().toString(36).toUpperCase()}`,
    name,
    email,
    phone: phone || 'N/A',
    company: company || 'N/A',
    serviceType,
    urgency: urgency || 'Standard',
    message: message || 'N/A',
    submittedAt: new Date().toISOString(),
    status: urgency === 'Emergency' ? 'DISPATCHED_TO_PAGERDUTY' : 'ASSIGNED_TO_ARCHITECT'
  };

  consultations.push(consultationEntry);

  res.json({
    success: true,
    message: urgency === 'Emergency'
      ? 'EMERGENCY ALERT RECEIVED. Our Incident Commander is contacting you in under 15 minutes.'
      : 'Consultation request received! A Senior Security Architect will contact you within 2 business hours.',
    ticketId: consultationEntry.id,
    responseTime: urgency === 'Emergency' ? '< 15 Minutes' : '< 2 Hours'
  });
});

// 5. System Health & Defense Readiness
app.get('/api/system-status', (req, res) => {
  res.json({
    status: 'OPTIMAL',
    uptime: '99.998%',
    socEngine: 'Active AI Co-Pilot v4.8',
    threatDefinitions: 'Updated 2 minutes ago',
    activeIncidentsUnderControl: 142
  });
});

// Catch-all route to serve the Single Page Application
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start Server with Port Fallback
function startServer(portToTry) {
  const server = app.listen(portToTry, () => {
    console.log(`=====================================================`);
    console.log(`🛡️  AEGIS CYBER DEFENSE SERVICES PLATFORM IS RUNNING`);
    console.log(`🌐  Local URL: http://localhost:${portToTry}`);
    console.log(`🔒  Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`=====================================================`);
  });

  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.warn(`⚠️  Port ${portToTry} is already in use. Trying port ${portToTry + 1}...`);
      startServer(portToTry + 1);
    } else {
      console.error('Server error:', err);
    }
  });
}

startServer(Number(PORT));

