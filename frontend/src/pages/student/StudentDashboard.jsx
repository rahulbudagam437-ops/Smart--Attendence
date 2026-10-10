import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { studentService } from '../../services/attendanceService';
import StatCard from '../../components/StatCard';
import LoadingSpinner from '../../components/LoadingSpinner';
import EmptyState from '../../components/EmptyState';
import { useToast } from '../../components/Toast';
import {
  Camera,
  Percent,
  CheckCircle2,
  XCircle,
  Clock,
  AlertTriangle,
  BookOpen,
  ArrowRight
} from 'lucide-react';

const StudentDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const { addToast } = useToast();

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      const res = await studentService.getDashboard();
      if (res.success) {
        setData(res.data);
      }
    } catch (err) {
      addToast('Failed to load student dashboard', 'error');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingSpinner message="Loading your attendance dashboard..." />;
  if (!data) return <EmptyState title="Dashboard Unavailable" description="Unable to load student attendance data." />;

  const isLowAttendance = data.overallPercentage < data.lowAttendanceThreshold;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 className="page-title">Student Portal</h1>
          <p className="page-subtitle">
            {data.fullName} • Roll: <strong>{data.rollNumber}</strong> • {data.className}
          </p>
        </div>
        <Link to="/student/scan" className="btn btn-primary" style={{ padding: '0.75rem 1.25rem' }}>
          <Camera size={18} />
          <span>Scan Attendance QR</span>
        </Link>
      </div>

      {/* Threshold Warning Banner */}
      {isLowAttendance && (
        <div style={{
          backgroundColor: '#fef2f2',
          border: '1px solid #fecaca',
          borderRadius: 'var(--radius-md)',
          padding: '1rem 1.25rem',
          marginBottom: '1.5rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          color: '#991b1b'
        }}>
          <AlertTriangle size={24} style={{ flexShrink: 0, color: '#dc2626' }} />
          <div>
            <div style={{ fontWeight: 700, fontSize: '0.9375rem' }}>
              Attendance Warning: Your attendance ({data.overallPercentage}%) is below the {data.lowAttendanceThreshold}% requirement!
            </div>
            <div style={{ fontSize: '0.8125rem', color: '#b91c1c', marginTop: '0.125rem' }}>
              Institutional rules require a minimum of {data.lowAttendanceThreshold}% attendance to be eligible for end-semester examinations. Please attend upcoming lectures regularly.
            </div>
          </div>
        </div>
      )}

      {/* KPI Cards */}
      <div className="stats-grid">
        <StatCard
          title="Overall Attendance Rate"
          value={`${data.overallPercentage}%`}
          icon={Percent}
          color={isLowAttendance ? 'red' : 'green'}
          subtext={`Threshold: ${data.lowAttendanceThreshold}% required`}
        />
        <StatCard
          title="Sessions Attended"
          value={data.presentSessions}
          icon={CheckCircle2}
          color="green"
          subtext="Verified Present"
        />
        <StatCard
          title="Late Check-Ins"
          value={data.lateSessions}
          icon={Clock}
          color="amber"
          subtext="Recognized Late attendance"
        />
        <StatCard
          title="Absences Recorded"
          value={data.absentSessions}
          icon={XCircle}
          color="red"
          subtext={`Out of ${data.totalEligibleSessions} eligible sessions`}
        />
      </div>

      {/* Subject-Wise Breakdown Cards */}
      <div className="card" style={{ marginBottom: '1.75rem' }}>
        <div className="card-header">
          <h2 className="card-title">Subject-Wise Attendance Breakdown</h2>
          <Link to="/student/subjects" style={{ fontSize: '0.8125rem', color: 'var(--primary-600)', fontWeight: 600, textDecoration: 'none' }}>
            View Details &rarr;
          </Link>
        </div>

        {data.subjectSummaries && data.subjectSummaries.length > 0 ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
            {data.subjectSummaries.map((sub) => {
              const isBelow = sub.percentage < data.lowAttendanceThreshold;
              return (
                <div
                  key={sub.subjectId}
                  style={{
                    border: '1px solid var(--gray-200)',
                    borderRadius: 'var(--radius-md)',
                    padding: '1.25rem',
                    background: isBelow ? '#fffbfb' : '#ffffff',
                    borderLeft: `4px solid ${isBelow ? '#dc2626' : '#16a34a'}`
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--primary-700)' }}>
                      {sub.subjectCode}
                    </span>
                    <span className={`badge badge-${isBelow ? 'absent' : 'present'}`} style={{ fontWeight: 700 }}>
                      {sub.percentage}%
                    </span>
                  </div>

                  <h3 style={{ fontSize: '0.9375rem', fontWeight: 600, color: 'var(--gray-900)', marginBottom: '0.75rem' }}>
                    {sub.subjectName}
                  </h3>

                  {/* Progress Bar */}
                  <div style={{ width: '100%', height: '8px', backgroundColor: '#e2e8f0', borderRadius: '4px', overflow: 'hidden', marginBottom: '0.75rem' }}>
                    <div
                      style={{
                        width: `${Math.min(sub.percentage, 100)}%`,
                        height: '100%',
                        backgroundColor: isBelow ? '#dc2626' : '#16a34a',
                        borderRadius: '4px',
                        transition: 'width 0.3s ease'
                      }}
                    />
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--gray-600)' }}>
                    <span>Attended: <strong>{sub.attendedSessions + sub.lateSessions}</strong></span>
                    <span>Total: <strong>{sub.totalSessions}</strong></span>
                    <span>Absent: <strong style={{ color: sub.absentSessions > 0 ? '#dc2626' : 'inherit' }}>{sub.absentSessions}</strong></span>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <EmptyState title="No course records found" description="You have not been evaluated in any sessions yet." />
        )}
      </div>

      {/* Recent Attendance Activity */}
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">Recent Attendance Check-Ins</h2>
          <Link to="/student/history" style={{ fontSize: '0.8125rem', color: 'var(--primary-600)', fontWeight: 600, textDecoration: 'none' }}>
            Full History &rarr;
          </Link>
        </div>

        {data.recentAttendance && data.recentAttendance.length > 0 ? (
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Timestamp</th>
                  <th>Subject</th>
                  <th>Status</th>
                  <th>Method</th>
                  <th>Remarks</th>
                </tr>
              </thead>
              <tbody>
                {data.recentAttendance.map((rec) => (
                  <tr key={rec.id}>
                    <td style={{ fontSize: '0.8125rem' }}>
                      {rec.markedAt ? new Date(rec.markedAt).toLocaleString() : 'N/A'}
                    </td>
                    <td style={{ fontWeight: 600 }}>{rec.subjectName}</td>
                    <td>
                      <span className={`badge badge-${rec.status.toLowerCase()}`}>
                        {rec.status}
                      </span>
                    </td>
                    <td style={{ fontSize: '0.75rem' }}><code>{rec.method}</code></td>
                    <td style={{ fontSize: '0.8125rem', color: 'var(--gray-500)' }}>{rec.remarks || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState title="No attendance logs" description="Scan a lecture QR code to view your check-ins here." />
        )}
      </div>
    </div>
  );
};

export default StudentDashboard;
