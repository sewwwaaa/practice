import React, { useState, useEffect } from 'react';
import { 
  Users, Building2, ShieldAlert, Activity, UserPlus, 
  CheckCircle, XCircle, Shield, FileText, Server, Lock, RefreshCw, Key
} from 'lucide-react';

export default function AdminPortalView() {
  const [users, setUsers] = useState([]);
  const [metrics, setMetrics] = useState({ totalUsers: 1284, activeOrganizations: 86, criticalThreats: 7, securityIncidents: 12 });
  const [auditLogs, setAuditLogs] = useState([]);
  const [health, setHealth] = useState({ apiGateway: 'Operational', databaseEngine: 'Operational', securityMonitoring: 'Operational', threatIntelFeed: 'Operational' });
  const [showAddModal, setShowAddModal] = useState(false);
  
  // New User Form State
  const [newUsername, setNewUsername] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newOrg, setNewOrg] = useState('Acme Cyber');
  const [newRole, setNewRole] = useState('Security Analyst');

  const fetchAdminData = () => {
    fetch('/api/admin/users')
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setUsers(data.users);
          if (data.metrics) setMetrics(data.metrics);
        }
      });

    fetch('/api/admin/audit-logs')
      .then(res => res.json())
      .then(data => {
        if (data.success) setAuditLogs(data.logs);
      });

    fetch('/api/admin/system-health')
      .then(res => res.json())
      .then(data => {
        if (data.success) setHealth(data.health);
      });
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const handleAddUser = (e) => {
    e.preventDefault();
    if (!newUsername || !newEmail) return;

    fetch('/api/admin/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: newUsername,
        email: newEmail,
        organization: newOrg,
        role: newRole
      })
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setShowAddModal(false);
          setNewUsername('');
          setNewEmail('');
          fetchAdminData();
        }
      });
  };

  const handleToggleStatus = (id) => {
    fetch(`/api/admin/users/${id}/toggle`, { method: 'POST' })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          fetchAdminData();
        }
      });
  };

  return (
    <div>
      {/* Header */}
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 className="page-title">
            <Lock style={{ color: '#00ffcc' }} /> ROOT ADMIN CONTROL
          </h1>
          <p className="page-subtitle">
            Manage users, permissions, organizations and system settings.
          </p>
        </div>
        <button className="btn-cyber" onClick={() => setShowAddModal(true)}>
          <UserPlus size={16} /> Add User
        </button>
      </div>

      {/* Top 4 Metrics Header */}
      <div className="metrics-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)', marginBottom: '24px' }}>
        <div className="metric-card">
          <div className="metric-icon-wrap">
            <Users size={20} />
          </div>
          <div>
            <div className="metric-value">{metrics.totalUsers.toLocaleString()}</div>
            <div className="metric-label">Total Users</div>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon-wrap" style={{ color: '#00ff99', background: 'rgba(0, 255, 153, 0.08)' }}>
            <Building2 size={20} />
          </div>
          <div>
            <div className="metric-value">{metrics.activeOrganizations}</div>
            <div className="metric-label">Active Organizations</div>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon-wrap" style={{ color: '#ff0055', background: 'rgba(255, 0, 85, 0.08)' }}>
            <ShieldAlert size={20} />
          </div>
          <div>
            <div className="metric-value" style={{ color: '#ff0055' }}>{String(metrics.criticalThreats).padStart(2, '0')}</div>
            <div className="metric-label">Critical Threats</div>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon-wrap" style={{ color: '#ffaa00', background: 'rgba(255, 170, 0, 0.08)' }}>
            <Activity size={20} />
          </div>
          <div>
            <div className="metric-value" style={{ color: '#ffaa00' }}>{metrics.securityIncidents}</div>
            <div className="metric-label">Security Incidents</div>
          </div>
        </div>
      </div>

      {/* Main Grid: User Management Table (Left 2fr) + Roles & Audit Logs (Right 1fr) */}
      <div style={{ display: 'grid', gridTemplateColumns: '2.2fr 1fr', gap: '20px' }}>
        
        {/* User Management Table */}
        <div className="card">
          <div className="card-title">
            <span>USER MANAGEMENT</span>
            <span style={{ fontSize: '11px', color: '#8492a6' }}>Showing {users.length} Active Accounts</span>
          </div>

          <div className="table-responsive">
            <table className="cyber-table">
              <thead>
                <tr>
                  <th>User</th>
                  <th>Organization</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Last Login</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map(u => (
                  <tr key={u.id}>
                    <td>
                      <div style={{ fontWeight: 600, color: '#fff' }}>{u.username}</div>
                      <div style={{ fontSize: '11px', color: '#8492a6' }}>{u.email}</div>
                    </td>
                    <td>{u.organization}</td>
                    <td>
                      <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '11.5px', color: '#00e5ff' }}>
                        {u.role}
                      </span>
                    </td>
                    <td>
                      <span className={`badge ${u.status === 'Active' ? 'badge-active' : 'badge-disabled'}`}>
                        {u.status}
                      </span>
                    </td>
                    <td style={{ fontSize: '12px', color: '#8492a6' }}>{u.lastLogin}</td>
                    <td>
                      <button 
                        className="btn-cyber-outline" 
                        style={{ fontSize: '11px', borderColor: u.status === 'Active' ? 'rgba(255,0,85,0.4)' : 'rgba(0,255,153,0.4)' }}
                        onClick={() => handleToggleStatus(u.id)}
                      >
                        {u.status === 'Active' ? 'Disable' : 'Enable'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Sidebar: System Health & Audit Logs */}
        <div>
          {/* System Health */}
          <div className="card" style={{ marginBottom: '20px' }}>
            <div className="card-title">
              <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Server size={16} style={{ color: '#00ffcc' }} /> SYSTEM HEALTH
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', background: 'rgba(0,0,0,0.3)', borderRadius: '6px' }}>
                <span style={{ fontSize: '12px', color: '#8492a6' }}>API Gateway</span>
                <span className="badge badge-active">{health.apiGateway}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', background: 'rgba(0,0,0,0.3)', borderRadius: '6px' }}>
                <span style={{ fontSize: '12px', color: '#8492a6' }}>Database Engine</span>
                <span className="badge badge-active">{health.databaseEngine}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', background: 'rgba(0,0,0,0.3)', borderRadius: '6px' }}>
                <span style={{ fontSize: '12px', color: '#8492a6' }}>Security Monitoring</span>
                <span className="badge badge-active">{health.securityMonitoring}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', background: 'rgba(0,0,0,0.3)', borderRadius: '6px' }}>
                <span style={{ fontSize: '12px', color: '#8492a6' }}>Threat Intel Feed</span>
                <span className="badge badge-active">{health.threatIntelFeed}</span>
              </div>
            </div>
          </div>

          {/* Audit Logs */}
          <div className="card">
            <div className="card-title">
              <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <FileText size={16} style={{ color: '#00e5ff' }} /> AUDIT LOGS
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '200px', overflowY: 'auto' }}>
              {auditLogs.map(log => (
                <div key={log.id} style={{ background: 'rgba(0,0,0,0.3)', padding: '8px 10px', borderRadius: '4px', fontSize: '11px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: '#fff', fontWeight: 600 }}>
                    <span>{log.user} - {log.action}</span>
                    <span style={{ color: log.status === 'Success' ? '#00ff99' : '#ff0055' }}>{log.status}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748b', marginTop: '2px', fontFamily: 'JetBrains Mono, monospace' }}>
                    <span>IP: {log.ip}</span>
                    <span>{log.time}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>

      {/* Add User Modal */}
      {showAddModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.7)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="card" style={{ width: '420px', background: '#08101e' }}>
            <div className="card-title" style={{ fontSize: '16px' }}>ADD NEW OPERATOR USER</div>

            <form onSubmit={handleAddUser}>
              <div className="login-form-group">
                <label>Username</label>
                <input
                  type="text"
                  className="login-input"
                  value={newUsername}
                  onChange={e => setNewUsername(e.target.value)}
                  placeholder="e.g. alex.m"
                  required
                />
              </div>

              <div className="login-form-group">
                <label>Email Address</label>
                <input
                  type="email"
                  className="login-input"
                  value={newEmail}
                  onChange={e => setNewEmail(e.target.value)}
                  placeholder="alex@company.com"
                  required
                />
              </div>

              <div className="login-form-group">
                <label>Organization</label>
                <input
                  type="text"
                  className="login-input"
                  value={newOrg}
                  onChange={e => setNewOrg(e.target.value)}
                />
              </div>

              <div className="login-form-group">
                <label>Role</label>
                <select
                  className="login-input"
                  value={newRole}
                  onChange={e => setNewRole(e.target.value)}
                >
                  <option value="Super Admin">Super Admin</option>
                  <option value="Security Analyst">Security Analyst</option>
                  <option value="Security Manager">Security Manager</option>
                  <option value="Client Admin">Client Admin</option>
                  <option value="Client User">Client User</option>
                </select>
              </div>

              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '20px' }}>
                <button type="button" className="btn-cyber-outline" onClick={() => setShowAddModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-cyber">
                  Create User
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
