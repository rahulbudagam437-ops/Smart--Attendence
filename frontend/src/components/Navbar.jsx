import React from 'react';
import { useAuth } from '../context/AuthContext';
import { LogOut, User, Menu, GraduationCap } from 'lucide-react';

const Navbar = ({ onToggleSidebar }) => {
  const { user, logout } = useAuth();

  return (
    <header style={{
      height: '64px',
      backgroundColor: 'var(--white)',
      borderBottom: '1px solid var(--gray-200)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 1.5rem',
      position: 'sticky',
      top: 0,
      zIndex: 100
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <button
          onClick={onToggleSidebar}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: '0.5rem',
            color: 'var(--gray-600)',
            display: 'flex',
            borderRadius: 'var(--radius-sm)'
          }}
          aria-label="Toggle navigation"
        >
          <Menu size={22} />
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
          <div style={{
            width: '36px',
            height: '36px',
            borderRadius: 'var(--radius-md)',
            backgroundColor: 'var(--primary-700)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--white)'
          }}>
            <GraduationCap size={22} />
          </div>
          <div>
            <span style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--primary-900)', display: 'block', lineHeight: 1.2 }}>
              Smart Attendance
            </span>
            <span style={{ fontSize: '0.75rem', color: 'var(--primary-600)', fontWeight: 600 }}>
              Academic Portal
            </span>
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
        {user && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ textAlign: 'right', display: 'none', md: 'block' }}>
              <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--gray-900)' }}>
                {user.fullName}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '0.5rem' }}>
                <span className={`badge badge-role-${user.role.toLowerCase()}`}>
                  {user.role}
                </span>
                {user.rollNumber && (
                  <span style={{ fontSize: '0.75rem', color: 'var(--gray-500)' }}>
                    {user.rollNumber}
                  </span>
                )}
                {user.employeeId && (
                  <span style={{ fontSize: '0.75rem', color: 'var(--gray-500)' }}>
                    {user.employeeId}
                  </span>
                )}
              </div>
            </div>

            <div style={{
              width: '38px',
              height: '38px',
              borderRadius: '50%',
              backgroundColor: 'var(--accent-100)',
              color: 'var(--accent-600)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 600,
              fontSize: '0.875rem'
            }}>
              {user.fullName ? user.fullName.charAt(0).toUpperCase() : <User size={18} />}
            </div>
          </div>
        )}

        <button
          onClick={logout}
          className="btn btn-secondary btn-sm"
          title="Sign out"
          style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}
        >
          <LogOut size={16} />
          <span>Logout</span>
        </button>
      </div>
    </header>
  );
};

export default Navbar;
