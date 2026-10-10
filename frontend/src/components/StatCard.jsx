import React from 'react';

const StatCard = ({ title, value, icon: Icon, color = 'blue', subtext }) => {
  const colorMap = {
    blue: { bg: '#eff6ff', text: '#2563eb' },
    indigo: { bg: '#eef2ff', text: '#4f46e5' },
    green: { bg: '#f0fdf4', text: '#16a34a' },
    amber: { bg: '#fffbeb', text: '#d97706' },
    red: { bg: '#fef2f2', text: '#dc2626' },
    purple: { bg: '#faf5ff', text: '#9333ea' }
  };

  const theme = colorMap[color] || colorMap.blue;

  return (
    <div className="stat-card">
      {Icon && (
        <div className="stat-icon-wrapper" style={{ backgroundColor: theme.bg, color: theme.text }}>
          <Icon size={24} />
        </div>
      )}
      <div style={{ flex: 1 }}>
        <div className="stat-label">{title}</div>
        <div className="stat-value">{value}</div>
        {subtext && <div style={{ fontSize: '0.75rem', color: 'var(--gray-500)', marginTop: '0.25rem' }}>{subtext}</div>}
      </div>
    </div>
  );
};

export default StatCard;
