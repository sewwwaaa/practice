import React, { useState, useEffect } from 'react';
import {
  Users, Building2, ShieldAlert, Activity, UserPlus,
  FileText, Server, Lock, X, UserCog
} from 'lucide-react';

import { PageHeader } from './ui.jsx';

const HEALTH_LABELS = [
  ['apiGateway', 'API Gateway'],
  ['databaseEngine', 'Database Engine'],
  ['securityMonitoring', 'Security Monitoring'],
  ['threatIntelFeed', 'Threat Intel Feed'],
];

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
      })
      .catch(() => {});

    fetch('/api/admin/audit-logs')
      .then(res => res.json())
      .then(data => {
        if (data.success) setAuditLogs(data.logs);
      })
      .catch(() => {});

    fetch('/api/admin/system-health')
      .then(res => res.json())
      .then(data => {
        if (data.success) setHealth(data.health);
      })
      .catch(() => {});
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  useEffect(() => {
    if (!showAddModal) return undefined;
    const onKey = (e) => { if (e.key === 'Escape') setShowAddModal(false); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [showAddModal]);

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
      })
      .catch(() => {});
  };

  const handleToggleStatus = (id) => {
    fetch(`/api/admin/users/${id}/toggle`, { method: 'POST' })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          fetchAdminData();
        }
      })
      .catch(() => {});
  };

  const metricCards = [
    { label: 'Total Users', value: metrics.totalUsers.toLocaleString(), icon: Users, color: '#00ffd5' },
    { label: 'Active Organizations', value: metrics.activeOrganizations, icon: Building2, color: '#00e676' },
    { label: 'Critical Threats', value: String(metrics.criticalThreats).padStart(2, '0'), icon: ShieldAlert, color: '#ff1744' },
    { label: 'Security Incidents', value: metrics.securityIncidents, icon: Activity, color: '#ff9100' },
  ];

  return (
    <div className="view-stack">
      <PageHeader
        eyebrow="Module 04 · Root Access"
        icon={Lock}
        title="ROOT ADMIN CONTROL"
        subtitle="Manage users, permissions, organizations and system settings."
        actions={(
          <button className="btn-cyber" onClick={() => setShowAddModal(true)}>
            <UserPlus size={15} /> Add User
          </button>
        )}
      />

      {/* Metrics */}
      <div className="metrics-grid metric-grid-4 animate-in animate-in-delay-1">
        {metricCards.map(card => {
          const Icon = card.icon;
          return (
            <div key={card.label} className="metric-card" style={{ '--c': card.color }}>
              <div className="metric-icon-wrap"><Icon size={20} /></div>
              <div>
                <div className="metric-value">{card.value}</div>
                <div className="metric-label">{card.label}</div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid-main-side animate-in animate-in-delay-2">
        {/* Users */}
        <section className="card">
          <div className="card-title">
            <span className="card-title-left"><UserCog size={14} /> USER MANAGEMENT</span>
            <span className="card-title-meta">{users.length} ACCOUNTS</span>
          </div>

          {users.length === 0 ? (
            <div className="empty-state">
              <Users size={26} />
              <strong style={{ color: 'var(--text-strong)' }}>No operator accounts loaded</strong>
              <span>User records are served from MongoDB via the SOC API.</span>
            </div>
          ) : (
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
                        <div className="user-cell">
                          <span className="user-cell-avatar">{(u.username || '?').charAt(0).toUpperCase()}</span>
                          <div>
                            <strong>{u.username}</strong>
                            <small>{u.email}</small>
                          </div>
                        </div>
                      </td>
                      <td>{u.organization}</td>
                      <td><span className="mono" style={{ fontSize: '11.5px', color: '#4fd1ff' }}>{u.role}</span></td>
                      <td>
                        <span className={`badge ${u.status === 'Active' ? 'badge-active' : 'badge-disabled'}`}>
                          {u.status}
                        </span>
                      </td>
                      <td className="mono" style={{ fontSize: '11.5px' }}>{u.lastLogin}</td>
                      <td>
                        <button
                          className={`btn-cyber-outline ${u.status === 'Active' ? 'is-danger' : 'is-success'}`}
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
          )}
        </section>

        {/* Sidebar */}
        <aside className="stack">
          <section className="card hud">
            <div className="card-title">
              <span className="card-title-left"><Server size={14} /> SYSTEM HEALTH</span>
              <span className="status-pill">ALL SYSTEMS</span>
            </div>
            <div className="stack-sm">
              {HEALTH_LABELS.map(([key, label]) => (
                <div key={key} className="kv-row">
                  <span>{label}</span>
                  <span className="badge badge-active">{health[key]}</span>
                </div>
              ))}
            </div>
          </section>

          <section className="card">
            <div className="card-title">
              <span className="card-title-left"><FileText size={14} /> AUDIT LOGS</span>
              <span className="card-title-meta">{auditLogs.length} EVENTS</span>
            </div>
            <div className="stack-sm" style={{ maxHeight: '260px', overflowY: 'auto' }}>
              {auditLogs.length === 0 && (
                <div className="muted" style={{ fontSize: '12px', textAlign: 'center', padding: '14px 0' }}>No audit events yet.</div>
              )}
              {auditLogs.map(log => (
                <div key={log.id} className="audit-item">
                  <div className="audit-item-top">
                    <span>{log.user} — {log.action}</span>
                    <span style={{ color: log.status === 'Success' ? 'var(--status-success)' : '#ff4d6d' }}>{log.status}</span>
                  </div>
                  <div className="audit-item-bottom">
                    <span>IP {log.ip}</span>
                    <span>{log.time}</span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </aside>
      </div>

      {/* Add User Modal */}
      {showAddModal && (
        <div className="modal-backdrop" onClick={() => setShowAddModal(false)}>
          <div
            className="card hud modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="add-user-title"
            onClick={e => e.stopPropagation()}
          >
            <div className="card-title">
              <span className="card-title-left" id="add-user-title"><UserPlus size={14} /> ADD NEW OPERATOR</span>
              <button className="icon-btn" style={{ width: 30, height: 30 }} onClick={() => setShowAddModal(false)} aria-label="Close">
                <X size={14} />
              </button>
            </div>

            <form onSubmit={handleAddUser}>
              <div className="login-form-group">
                <label htmlFor="new-username">Username</label>
                <input
                  id="new-username"
                  type="text"
                  className="login-input"
                  value={newUsername}
                  onChange={e => setNewUsername(e.target.value)}
                  placeholder="e.g. alex.m"
                  required
                  autoFocus
                />
              </div>

              <div className="login-form-group">
                <label htmlFor="new-email">Email Address</label>
                <input
                  id="new-email"
                  type="email"
                  className="login-input"
                  value={newEmail}
                  onChange={e => setNewEmail(e.target.value)}
                  placeholder="alex@company.com"
                  required
                />
              </div>

              <div className="login-form-group">
                <label htmlFor="new-org">Organization</label>
                <input
                  id="new-org"
                  type="text"
                  className="login-input"
                  value={newOrg}
                  onChange={e => setNewOrg(e.target.value)}
                />
              </div>

              <div className="login-form-group">
                <label htmlFor="new-role">Role</label>
                <select
                  id="new-role"
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

              <div className="modal-actions">
                <button type="button" className="btn-ghost" onClick={() => setShowAddModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-cyber">
                  <UserPlus size={14} /> Create User
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
