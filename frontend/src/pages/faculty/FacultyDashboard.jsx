import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { facultyService } from '../../services/attendanceService';
import StatCard from '../../components/StatCard';
import LoadingSpinner from '../../components/LoadingSpinner';
import EmptyState from '../../components/EmptyState';
import { useToast } from '../../components/Toast';
import {
  BookOpen,
  Calendar,
  CheckCircle2,
  XCircle,
  PlusCircle,
  QrCode,
  ArrowRight,
  Clock,
  Layers
} from 'lucide-react';

const FacultyDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const { addToast } = useToast();

  useEffect(() => {
    fetchDashboard(true);

    // Real-time telemetry refresh every 8 seconds
    const interval = setInterval(() => {
      fetchDashboard(false);
    }, 8000);

    return () => clearInterval(interval);
  }, []);

  const fetchDashboard = async (showLoading = false) => {
    try {
      if (showLoading) setLoading(true);
      const res = await facultyService.getDashboard();
      if (res.success) {
        setData(res.data);
      }
    } catch (err) {
      if (showLoading) addToast('Failed to load faculty dashboard', 'error');
    } finally {
      if (showLoading) setLoading(false);
    }
  };

  if (loading) return <LoadingSpinner message="Loading faculty portal..." />;
  if (!data) return <EmptyState title="Dashboard Unavailable" description="Unable to fetch faculty records." />;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 className="page-title">Faculty Portal</h1>
          <p className="page-subtitle">Welcome, {data.fullName} ({data.employeeId} • {data.departmentName})</p>
        </div>
        <Link to="/faculty/create-session" className="btn btn-primary">
          <PlusCircle size={18} />
          <span>Start Attendance Session</span>
        </Link>
      </div>

      {/* Top Stat Cards */}
      <div className="stats-grid">
        <StatCard
          title="Assigned Classes"
          value={data.totalAssignedClasses}
          icon={Layers}
          color="blue"
          subtext={`${data.totalAssignedSubjects} accredited courses`}
        />
        <StatCard
          title="Today's Sessions"
          value={data.todaySessionsCount}
          icon={Calendar}
          color="indigo"
          subtext="Conducted or scheduled today"
        />
        <StatCard
          title="Students Present Today"
          value={data.presentCountToday}
          icon={CheckCircle2}
          color="green"
          subtext="Verified via QR or manual"
        />
        <StatCard
          title="Unrecorded / Absent"
          value={data.absentCountToday}
          icon={XCircle}
          color="red"
          subtext="Absences recorded today"
        />
      </div>

      {/* Today's Active / Recent Sessions */}
      <div className="card" style={{ marginBottom: '1.75rem' }}>
        <div className="card-header">
          <h2 className="card-title">Today's Sessions & Live QR Monitors</h2>
          <span className="badge badge-active">{data.todaySessions?.length || 0} Scheduled</span>
        </div>

        {data.todaySessions && data.todaySessions.length > 0 ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1rem' }}>
            {data.todaySessions.map((session) => (
              <div
                key={session.id}
                style={{
                  border: '1px solid var(--gray-200)',
                  borderRadius: 'var(--radius-md)',
                  padding: '1.25rem',
                  backgroundColor: session.status === 'ACTIVE' ? '#f0fdf4' : '#f8fafc',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between'
                }}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                    <span className={`badge badge-${session.status === 'ACTIVE' ? 'present' : 'closed'}`}>
                      {session.status}
                    </span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--gray-500)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                      <Clock size={12} /> {session.startTime} - {session.endTime}
                    </span>
                  </div>

                  <h3 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--gray-900)', marginBottom: '0.25rem' }}>
                    {session.subjectName} ({session.subjectCode})
                  </h3>
                  <div style={{ fontSize: '0.8125rem', color: 'var(--gray-600)', marginBottom: '0.5rem' }}>
                    Class: <strong>{session.className}</strong>
                  </div>
                  {session.topic && (
                    <div style={{ fontSize: '0.75rem', color: 'var(--gray-500)', fontStyle: 'italic', marginBottom: '0.75rem' }}>
                      "{session.topic}"
                    </div>
                  )}

                  <div style={{ display: 'flex', gap: '1rem', fontSize: '0.8125rem', padding: '0.5rem 0', borderTop: '1px solid rgba(0,0,0,0.05)', marginBottom: '0.75rem' }}>
                    <span>Present: <strong>{session.presentCount}</strong></span>
                    <span>Late: <strong>{session.lateCount}</strong></span>
                    <span>Total Class: <strong>{session.totalStudents}</strong></span>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <Link
                    to={`/faculty/sessions?id=${session.id}`}
                    className="btn btn-primary btn-sm"
                    style={{ flex: 1 }}
                  >
                    <QrCode size={14} /> Display QR Code
                  </Link>
                  <Link
                    to={`/faculty/manual?sessionId=${session.id}`}
                    className="btn btn-secondary btn-sm"
                  >
                    Roster
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState
            title="No sessions scheduled for today yet"
            description="Create an attendance session to generate dynamic QR codes and track live check-ins."
            action={
              <Link to="/faculty/create-session" className="btn btn-primary btn-sm">
                <PlusCircle size={14} /> Create Session Now
              </Link>
            }
          />
        )}
      </div>

      {/* Recent Sessions Table */}
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">Recent Attendance Sessions History</h2>
          <Link to="/faculty/reports" style={{ fontSize: '0.8125rem', color: 'var(--primary-600)', fontWeight: 600, textDecoration: 'none' }}>
            View Full Reports &rarr;
          </Link>
        </div>

        {data.recentSessions && data.recentSessions.length > 0 ? (
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Session Code</th>
                  <th>Date</th>
                  <th>Class</th>
                  <th>Subject</th>
                  <th>Topic</th>
                  <th>Turnout (Present / Total)</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {data.recentSessions.map((sess) => (
                  <tr key={sess.id}>
                    <td><code>{sess.sessionCode}</code></td>
                    <td>{sess.sessionDate}</td>
                    <td>{sess.className}</td>
                    <td style={{ fontWeight: 600 }}>{sess.subjectCode}</td>
                    <td style={{ maxWidth: '200px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {sess.topic || '—'}
                    </td>
                    <td>
                      <strong>{sess.presentCount + sess.lateCount}</strong> / {sess.totalStudents}
                    </td>
                    <td>
                      <span className={`badge badge-${sess.status === 'ACTIVE' ? 'present' : 'closed'}`}>
                        {sess.status}
                      </span>
                    </td>
                    <td>
                      <Link to={`/faculty/sessions?id=${sess.id}`} className="btn btn-secondary btn-sm" style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}>
                        View
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState title="No historical sessions" description="Completed attendance sessions will be logged here." />
        )}
      </div>
    </div>
  );
};

export default FacultyDashboard;
