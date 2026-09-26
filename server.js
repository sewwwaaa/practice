import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import cors from 'cors';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import User from './models/User.js';

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || 'zerolock-super-secret-key-12345';
const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
  console.error('❌ [CONFIG ERROR] MONGO_URI is not defined in environment variables (.env)');
} else {
  mongoose.connect(MONGO_URI)
    .then(() => console.log('✅ Connected to MongoDB successfully'))
    .catch(err => console.error('❌ MongoDB connection error:', err));
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve built React SPA assets from dist
app.use(express.static(path.join(__dirname, 'dist')));


// --- Data Stores (In-Memory for SOC Engine) ---

// 1. Initial Dashboard Summary Metrics
let dashboardMetrics = {
  securityScore: 86,
  scoreChange: 5,
  criticalVulnerabilities: 4,
  vulnChange: -2,
  activeThreats: 3,
  threatsChange: 40,
  protectedAssets: 248,
  assetsChange: 12,
  securityIncidents: 2,
  incidentsChange: -50,
  systemStatus: 'ONLINE'
};

// 2. Active Threats Stream
let liveThreats = [
  { id: 'TRT-8901', name: 'Suspicious Login', location: 'Tokyo Node', severity: 'Critical', time: '2 mins ago', ip: '185.220.101.5', status: 'ACTIVE' },
  { id: 'TRT-8902', name: 'Malware Detection', location: 'Frankfurt DC', severity: 'High', time: '5 mins ago', ip: '194.165.118.42', status: 'QUARANTINED' },
  { id: 'TRT-8903', name: 'Port Scan Probe', location: 'US-East AWS', severity: 'Medium', time: '12 mins ago', ip: '178.62.204.11', status: 'BLOCKED' },
  { id: 'TRT-8904', name: 'Brute Force Attempt', location: 'London Gateway', severity: 'High', time: '18 mins ago', ip: '235.98.234.19', status: 'BLOCKED' },
  { id: 'TRT-8905', name: 'Vulnerability Detected', location: 'Singapore Edge', severity: 'Low', time: '24 mins ago', ip: '153.183.55.6', status: 'LOGGED' }
];

// 3. Security Services
let securityServices = [
  {
    id: 'vuln-assessment',
    title: 'Vulnerability Assessment',
    description: 'Scan applications, infrastructure & APIs for security vulnerabilities continuously.',
    status: 'ACTIVE',
    badge: 'ACTIVE',
    badgeType: 'success',
    progress: 78,
    lastRun: '10 mins ago',
    icon: 'ShieldCheck'
  },
  {
    id: 'pen-testing',
    title: 'Penetration Testing',
    description: 'Identify exploitable weaknesses through authorized ethical hacking.',
    status: 'SCHEDULED',
    badge: 'SCHEDULED',
    badgeType: 'warning',
    nextRun: 'Apr 28, 2026 10:00 AM',
    lastRun: '3 days ago',
    icon: 'Terminal'
  },
  {
    id: 'sec-monitoring',
    title: 'Security Monitoring',
    description: 'Continuously monitor security events and suspicious activities 24/7.',
    status: 'ONLINE',
    badge: 'ONLINE',
    badgeType: 'success',
    uptime: '99.9%',
    lastRun: 'Live',
    icon: 'Activity'
  },
  {
    id: 'cloud-sec',
    title: 'Cloud Security',
    description: 'Monitor and protect Cloud workloads, configurations and SaaS environments.',
    status: 'ONLINE',
    badge: 'ONLINE',
    badgeType: 'success',
    compliance: '99%',
    lastRun: 'Live',
    icon: 'Cloud'
  },
  {
    id: 'incident-resp',
    title: 'Incident Response',
    description: 'Detect, investigate and respond to security incidents in real time.',
    status: 'READY',
    badge: 'READY',
    badgeType: 'primary',
    responseTime: '< 15m',
    lastRun: 'Standby',
    icon: 'Zap'
  },
  {
    id: 'compliance-audit',
    title: 'Compliance & Security Audit',
    description: 'Assess security controls against regulatory and industry requirements.',
    status: 'IN_PROGRESS',
    badge: '92% COMPLETE',
    badgeType: 'info',
    auditProgress: 92,
    lastRun: '1 hour ago',
    icon: 'FileCheck'
  }
];

// 4. Vulnerabilities Database
let vulnerabilities = [
  { id: 'VULN-001', name: 'CVE-2025-4918 - Remote Code Execution', severity: 'Critical', asset: 'Web Server', status: 'Open', cvss: 9.8, cve: 'CVE-2025-4918' },
  { id: 'VULN-002', name: 'SQL Injection in /api/v1/auth', severity: 'Critical', asset: 'API Gateway', status: 'Open', cvss: 9.1, cve: 'CVE-2026-1029' },
  { id: 'VULN-003', name: 'XSS Flaw in Comment Input', severity: 'High', asset: 'Web Application', status: 'In Progress', cvss: 7.5, cve: 'CVE-2025-8831' },
  { id: 'VULN-004', name: 'Outdated Node.js Package (lodash)', severity: 'Medium', asset: 'Backend API', status: 'Open', cvss: 5.3, cve: 'CVE-2024-3891' },
  { id: 'VULN-005', name: 'Weak Encryption Algorithm (DES)', severity: 'Medium', asset: 'Database Engine', status: 'Open', cvss: 4.8, cve: 'CVE-2023-9901' },
  { id: 'VULN-006', name: 'S3 Bucket Misconfiguration', severity: 'Low', asset: 'Cloud Storage', status: 'Resolved', cvss: 3.1, cve: 'CVE-2025-1102' },
  { id: 'VULN-007', name: 'Missing HSTS Header', severity: 'Low', asset: 'Load Balancer', status: 'Resolved', cvss: 2.5, cve: 'CWE-693' }
];

// 5. Threat Intelligence & News
let threatNews = [
  {
    id: 'NEWS-01',
    title: 'VMware ESXi zero-day vulnerability (CVE-2025-22224) actively exploited in the wild',
    summary: 'Nation-state actors are actively chaining heap overflow with auth bypass to gain root execution on hypervisors.',
    source: 'The Hacker News',
    time: '3 hours ago',
    category: 'Vulnerabilities',
    severity: 'Critical',
    cve: 'CVE-2025-22224',
    riskLevel: 'Critical (CVSS 9.8)'
  },
  {
    id: 'NEWS-02',
    title: 'Ransomware group targets healthcare organizations worldwide with new wiper payload',
    summary: 'A sophisticated threat group has deployed a multi-threaded encryptor with hardcoded SMB lateral movement modules.',
    source: 'BleepingComputer',
    time: '4 hours ago',
    category: 'Ransomware',
    severity: 'High',
    cve: 'RANSOM-2026-X',
    riskLevel: 'High'
  },
  {
    id: 'NEWS-03',
    title: 'Google releases critical security update for Chrome browser patch',
    summary: 'Emergency update addresses an in-the-wild zero-day memory corruption vulnerability in the V8 JavaScript engine.',
    source: 'SecurityWeek',
    time: '6 hours ago',
    category: 'Vulnerabilities',
    severity: 'Medium',
    cve: 'CVE-2026-9011',
    riskLevel: 'Medium'
  },
  {
    id: 'NEWS-04',
    title: 'AI models found vulnerable to indirect prompt injection in enterprise search systems',
    summary: 'Security researchers demonstrate data exfiltration by embedding hidden instructions inside ingested PDF documents.',
    source: 'Dark Reading',
    time: '12 hours ago',
    category: 'AI Security',
    severity: 'Medium',
    cve: 'AI-INJECT-01',
    riskLevel: 'Medium'
  }
];

// 6. Admin Users & Audit Logs
const defaultPasswordHash = bcrypt.hashSync('password123', 10);

const seedDefaultUser = async () => {
  try {
    const adminExists = await User.findOne({ email: 'admin@zerolock.io' });
    if (!adminExists) {
      await User.create({
        username: 'admin',
        email: 'admin@zerolock.io',
        password: defaultPasswordHash,
        organization: 'Global Cyber Command',
        role: 'Super Admin',
      });
      console.log('✅ Seeded default admin user');
    }
  } catch (err) {
    console.error('Error seeding user:', err);
  }
};
mongoose.connection.once('open', seedDefaultUser);

let auditLogs = [
  { id: 'LOG-991', user: 'admin', action: 'User Login', ip: '192.168.1.10', time: '14:32:01', status: 'Success' },
  { id: 'LOG-990', user: 'admin', action: 'Rule Updated', ip: '192.168.1.10', time: '14:28:44', status: 'Success' },
  { id: 'LOG-989', user: 'sarah.c', action: 'View Report', ip: '172.16.42.88', time: '14:15:10', status: 'Success' },
  { id: 'LOG-988', user: 'system', action: 'Update Check', ip: '127.0.0.1', time: '14:00:00', status: 'Success' },
  { id: 'LOG-987', user: 'unknown', action: 'Failed Auth', ip: '185.220.101.5', time: '13:58:22', status: 'Blocked' }
];

// --- API ENDPOINTS ---

// 1. Auth Login Endpoint
app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ success: false, message: 'Email and password required' });
  }

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    // Audit log entry
    auditLogs.unshift({
      id: `LOG-${Math.floor(1000 + Math.random() * 9000)}`,
      user: user.username,
      action: 'User Login',
      ip: '192.168.1.100',
      time: new Date().toLocaleTimeString(),
      status: 'Success'
    });

    const token = jwt.sign(
      { id: user._id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      success: true,
      token: token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        clearance: user.clearance,
        status: 'AUTHENTICATED'
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// 2. Auth Register Endpoint
app.post('/api/auth/register', async (req, res) => {
  const { fullName, email, organization, clearance, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ success: false, message: 'Email and password are required' });
  }

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'Email already registered' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newOperator = new User({
      username: fullName || email.split('@')[0],
      email: email,
      password: hashedPassword,
      organization: organization || 'Cyber Command',
      clearance: clearance || 'LEVEL-5 TOP SECRET'
    });

    await newOperator.save();

    auditLogs.unshift({
      id: `LOG-${Math.floor(1000 + Math.random() * 9000)}`,
      user: newOperator.username,
      action: 'Operator Registration',
      ip: '192.168.1.100',
      time: new Date().toLocaleTimeString(),
      status: 'Success'
    });

    const token = jwt.sign(
      { id: newOperator._id, email: newOperator.email, role: newOperator.role },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      success: true,
      message: 'Operator account registered successfully',
      token: token,
      user: {
        id: newOperator._id,
        username: newOperator.username,
        email: newOperator.email,
        organization: newOperator.organization,
        role: newOperator.role,
        clearance: newOperator.clearance,
        status: 'AUTHENTICATED'
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error during registration' });
  }
});


// 2. Dashboard Metrics
app.get('/api/dashboard/summary', (req, res) => {
  res.json({
    success: true,
    metrics: dashboardMetrics,
    threats: liveThreats,
    vulnerabilitiesCount: {
      total: vulnerabilities.length,
      critical: vulnerabilities.filter(v => v.severity === 'Critical').length,
      high: vulnerabilities.filter(v => v.severity === 'High').length,
      medium: vulnerabilities.filter(v => v.severity === 'Medium').length,
      low: vulnerabilities.filter(v => v.severity === 'Low').length
    }
  });
});

// 3. Security Services
app.get('/api/services', (req, res) => {
  res.json({
    success: true,
    services: securityServices,
    summary: {
      total: securityServices.length,
      active: securityServices.filter(s => s.status === 'ACTIVE' || s.status === 'ONLINE').length,
      scheduled: securityServices.filter(s => s.status === 'SCHEDULED').length,
      ready: securityServices.filter(s => s.status === 'READY').length
    }
  });
});

app.post('/api/services/:id/trigger', (req, res) => {
  const { id } = req.params;
  const service = securityServices.find(s => s.id === id);
  if (!service) {
    return res.status(404).json({ success: false, message: 'Service not found' });
  }

  service.lastRun = 'Just now';
  service.status = 'ACTIVE';
  service.badge = 'ACTIVE';

  res.json({
    success: true,
    message: `Service ${service.title} triggered successfully.`,
    service
  });
});

// 4. Vulnerability Scanner
app.get('/api/vulnerabilities', (req, res) => {
  res.json({
    success: true,
    vulnerabilities,
    counts: {
      total: vulnerabilities.length,
      critical: vulnerabilities.filter(v => v.severity === 'Critical').length,
      high: vulnerabilities.filter(v => v.severity === 'High').length,
      medium: vulnerabilities.filter(v => v.severity === 'Medium').length,
      low: vulnerabilities.filter(v => v.severity === 'Low').length
    }
  });
});

app.post('/api/vulnerabilities/scan', (req, res) => {
  const { target, scanType } = req.body;

  // Add a newly discovered vulnerability dynamically
  const newId = `VULN-00${vulnerabilities.length + 1}`;
  const mockVuln = {
    id: newId,
    name: `Scan Output: Memory Heap Leak in ${target || 'Production Cloud'}`,
    severity: 'High',
    asset: target || 'All Assets',
    status: 'Open',
    cvss: 7.8,
    cve: `CVE-2026-${Math.floor(1000 + Math.random() * 9000)}`
  };

  vulnerabilities.unshift(mockVuln);

  res.json({
    success: true,
    message: `Vulnerability scan initiated on ${target || 'All Assets'} (${scanType || 'Full Scan'}).`,
    newVulnerability: mockVuln
  });
});

app.post('/api/vulnerabilities/:id/remediate', (req, res) => {
  const { id } = req.params;
  const item = vulnerabilities.find(v => v.id === id);
  if (!item) {
    return res.status(404).json({ success: false, message: 'Vulnerability not found' });
  }

  item.status = 'Resolved';
  res.json({
    success: true,
    message: `Vulnerability ${id} marked as Resolved and patch verified.`,
    vulnerability: item
  });
});

// 5. Threat Intelligence & Cyber News
app.get('/api/threat-intel', (req, res) => {
  const { category, search } = req.query;
  let filtered = threatNews;

  if (category && category !== 'All') {
    filtered = filtered.filter(n => n.category.toLowerCase() === category.toLowerCase());
  }

  if (search) {
    const q = search.toLowerCase();
    filtered = filtered.filter(n =>
      n.title.toLowerCase().includes(q) ||
      n.summary.toLowerCase().includes(q) ||
      (n.cve && n.cve.toLowerCase().includes(q))
    );
  }

  res.json({
    success: true,
    news: filtered,
    stats: {
      newCvesToday: 18,
      criticalVulns: 4,
      activeMalware: 14,
      ransomwareCampaigns: 5,
      securityAdvisories: 9
    }
  });
});

// 6. Root Admin Control Endpoints
app.get('/api/admin/users', async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.json({
      success: true,
      users: users,
      metrics: {
        totalUsers: users.length,
        activeOrganizations: 86,
        criticalThreats: 7,
        securityIncidents: 12
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

app.post('/api/admin/users', async (req, res) => {
  const { username, email, organization, role } = req.body;
  if (!username || !email) {
    return res.status(400).json({ success: false, message: 'Username and email are required' });
  }

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'Email already exists' });
    }

    const defaultPassword = await bcrypt.hash('password123', 10);
    const newUser = new User({
      username,
      email,
      password: defaultPassword,
      organization: organization || 'General Client',
      role: role || 'Security Analyst'
    });

    await newUser.save();

    // Add to audit logs
    auditLogs.unshift({
      id: `LOG-${Math.floor(1000 + Math.random() * 9000)}`,
      user: 'admin',
      action: `Created User ${username}`,
      ip: '192.168.1.10',
      time: new Date().toLocaleTimeString(),
      status: 'Success'
    });

    const userResponse = newUser.toObject();
    delete userResponse.password;
    res.json({ success: true, message: 'User added successfully', user: userResponse });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

app.post('/api/admin/users/:id/toggle', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    user.status = user.status === 'Active' ? 'Disabled' : 'Active';
    await user.save();
    res.json({ success: true, message: `User status changed to ${user.status}`, user });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

app.get('/api/admin/audit-logs', (req, res) => {
  res.json({ success: true, logs: auditLogs });
});

app.get('/api/admin/system-health', (req, res) => {
  res.json({
    success: true,
    health: {
      apiGateway: 'Operational',
      databaseEngine: 'Operational',
      securityMonitoring: 'Operational',
      threatIntelFeed: 'Operational'
    }
  });
});

// Live Terminal Telemetry Snippet Stream
app.get('/api/terminal/logs', (req, res) => {
  const logPool = [
    'Initializing ZEROLOCK SOC Engine v4.2.0...',
    'Connecting to Threat Telemetry Node Tokyo-01 [ESTABLISHED]',
    'Parsing incoming packet captures on interface eth0...',
    'Zero-Day Vulnerability signature match: CVE-2025-22224 (BLOCKED)',
    'SIEM Core: 142,890 events/sec processed without latency',
    'Automated Firewall Rule #99401 applied to IP 185.220.101.5',
    'Updating local CVE database cache... Done (0.04s)',
    'Neural Anomaly Detector: Posture status OPTIMAL'
  ];

  const randomLog = logPool[Math.floor(Math.random() * logPool.length)];
  res.json({
    timestamp: new Date().toLocaleTimeString(),
    log: randomLog
  });
});

// Catch-all route to serve SPA index.html for non-API routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'), (err) => {
    if (err) {
      res.sendFile(path.join(__dirname, 'index.html'));
    }
  });
});

// Start Server with Graceful Port Fallback
function startServer(portToTry) {
  const server = app.listen(portToTry, () => {
    console.log(`=====================================================`);
    console.log(`🛡️  ZEROLOCK CYBER SECURITY OPERATIONS CENTER API LIVE`);
    console.log(`🌐  URL: http://localhost:${portToTry}`);
    console.log(`🔒  DEFENSE POSTURE: ACTIVE // 100% SENSORS ARMED`);
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
