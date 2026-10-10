import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  Users,
  BookOpen,
  FileText,
  BarChart3,
  QrCode,
  ClipboardCheck,
  Camera,
  Clock,
  PieChart,
  User,
  PlusCircle,
  ShieldCheck
} from 'lucide-react';

const Sidebar = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  if (!user) return null;

  const role = user.role;

  const adminLinks = [
    { to: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/admin/users', label: 'User Management', icon: Users },
    { to: '/admin/academic', label: 'Academic Setup', icon: BookOpen },
    { to: '/admin/reports', label: 'Institutional Reports', icon: FileText },
    { to: '/admin/analytics', label: 'Analytics & Insights', icon: BarChart3 },
  ];

  const facultyLinks = [
    { to: '/faculty/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/faculty/create-session', label: 'New Attendance Session', icon: PlusCircle },
    { to: '/faculty/sessions', label: 'Live QR Sessions', icon: QrCode },
    { to: '/faculty/manual', label: 'Attendance Roster', icon: ClipboardCheck },
    { to: '/faculty/reports', label: 'Reports & Export', icon: FileText },
    { to: '/faculty/analytics', label: 'Class Analytics', icon: BarChart3 },
  ];

  const studentLinks = [
    { to: '/student/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/student/scan', label: 'Scan QR Attendance', icon: Camera },
    { to: '/student/history', label: 'Attendance History', icon: Clock },
    { to: '/student/subjects', label: 'Subject Breakdown', icon: PieChart },
    { to: '/student/profile', label: 'Student Profile', icon: User },
  ];

  let links = [];
  if (role === 'ADMIN') links = adminLinks;
  else if (role === 'FACULTY') links = facultyLinks;
  else if (role === 'STUDENT') links = studentLinks;

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.4)',
            zIndex: 90,
            display: 'block',
          }}
        />
      )}

      <aside
        style={{
          width: '260px',
          backgroundColor: '#0f172a',
          color: '#e2e8f0',
          display: 'flex',
          flexDirection: 'column',
          flexShrink: 0,
          borderRight: '1px solid #1e293b',
          transition: 'transform 0.2s ease-in-out',
          zIndex: 95,
          position: isOpen ? 'fixed' : 'relative',
          top: 0,
          bottom: 0,
          left: 0,
          transform: isOpen ? 'translateX(0)' : undefined
        }}
      >
        <div style={{
          padding: '1.25rem 1.5rem',
          borderBottom: '1px solid #1e293b',
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem'
        }}>
          <ShieldCheck size={20} color="#38bdf8" />
          <span style={{ fontSize: '0.8125rem', fontWeight: 700, letterSpacing: '0.05em', color: '#94a3b8', textTransform: 'uppercase' }}>
            {role} PORTAL
          </span>
        </div>

        <nav style={{ padding: '1rem 0.75rem', flex: 1, display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
          {links.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={onClose}
                style={({ isActive }) => ({
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  padding: '0.625rem 0.875rem',
                  borderRadius: 'var(--radius-md)',
                  fontSize: '0.875rem',
                  fontWeight: isActive ? 600 : 500,
                  color: isActive ? '#ffffff' : '#94a3b8',
                  backgroundColor: isActive ? '#1e3a8a' : 'transparent',
                  textDecoration: 'none',
                  transition: 'all 0.15s ease'
                })}
              >
                <Icon size={18} />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>

        <div style={{ padding: '1.25rem', borderTop: '1px solid #1e293b', fontSize: '0.75rem', color: '#64748b' }}>
          <div>Smart Attendance System v1.0</div>
          <div>Academic Year 2025-2026</div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
