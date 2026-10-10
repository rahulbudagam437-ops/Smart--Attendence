import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { facultyService } from '../../services/attendanceService';
import { QRCodeSVG } from 'qrcode.react';
import LoadingSpinner from '../../components/LoadingSpinner';
import EmptyState from '../../components/EmptyState';
import Modal from '../../components/Modal';
import { useToast } from '../../components/Toast';
import {
  QrCode,
  Clock,
  CheckCircle2,
  AlertCircle,
  Copy,
  RefreshCw,
  PowerOff,
  UserCheck,
  Check,
  Calendar,
  Layers,
  BookOpen
} from 'lucide-react';

const LiveSessionQR = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const sessionId = searchParams.get('id');

  const [session, setSession] = useState(null);
  const [sessionsList, setSessionsList] = useState([]);
  const [roster, setRoster] = useState([]);
  const [timeLeft, setTimeLeft] = useState(null); // seconds
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [closing, setClosing] = useState(false);
  const [isCloseModalOpen, setIsCloseModalOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const { addToast } = useToast();

  useEffect(() => {
    loadSessions();
  }, []);

  useEffect(() => {
    if (sessionId) {
      loadSessionData(sessionId);
    }
  }, [sessionId]);

  // Countdown timer effect
  useEffect(() => {
    if (!session || session.status !== 'ACTIVE' || !session.expiresAt) return;

    const interval = setInterval(() => {
      const expiry = new Date(session.expiresAt).getTime();
      const now = new Date().getTime();
      const diffSec = Math.floor((expiry - now) / 1000);

      if (diffSec <= 0) {
        setTimeLeft(0);
        setSession(prev => ({ ...prev, status: 'EXPIRED' }));
        clearInterval(interval);
      } else {
        setTimeLeft(diffSec);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [session]);

  // Real-time roster and session polling (every 3 seconds while session is ACTIVE)
  useEffect(() => {
    if (!session || session.status !== 'ACTIVE') return;

    const pollInterval = setInterval(async () => {
      try {
        const [sessRes, rosterRes] = await Promise.all([
          facultyService.getSessionDetails(session.id),
          facultyService.getSessionAttendance(session.id)
        ]);
        if (sessRes.success) setSession(sessRes.data);
        if (rosterRes.success) setRoster(rosterRes.data);
      } catch (e) {
        // quiet background poll
      }
    }, 3000);

    return () => clearInterval(pollInterval);
  }, [session?.id, session?.status]);

  const loadSessions = async () => {
    try {
      const res = await facultyService.getSessions();
      if (res.success && res.data) {
        setSessionsList(res.data);
        if (!sessionId && res.data.length > 0) {
          setSearchParams({ id: res.data[0].id });
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  const loadSessionData = async (id) => {
    try {
      setLoading(true);
      const [sessRes, rosterRes] = await Promise.all([
        facultyService.getSessionDetails(id),
        facultyService.getSessionAttendance(id)
      ]);

      if (sessRes.success) {
        setSession(sessRes.data);
      }
      if (rosterRes.success) {
        setRoster(rosterRes.data);
      }
    } catch (err) {
      addToast('Failed to load session details', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleRefreshRoster = async () => {
    if (!session) return;
    try {
      setRefreshing(true);
      const [sessRes, rosterRes] = await Promise.all([
        facultyService.getSessionDetails(session.id),
        facultyService.getSessionAttendance(session.id)
      ]);
      if (sessRes.success) setSession(sessRes.data);
      if (rosterRes.success) setRoster(rosterRes.data);
      addToast('Attendee roster updated', 'info');
    } catch (err) {
      addToast('Refresh failed', 'error');
    } finally {
      setRefreshing(false);
    }
  };

  const handleCloseSession = async () => {
    if (!session) return;
    try {
      setClosing(true);
      const res = await facultyService.closeSession(session.id);
      if (res.success) {
        setSession(res.data);
        setIsCloseModalOpen(false);
        addToast('Session closed! All non-scanning students marked as Absent.', 'success');
        handleRefreshRoster();
      }
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to close session', 'error');
    } finally {
      setClosing(false);
    }
  };

  const copySessionToken = () => {
    if (!session) return;
    navigator.clipboard.writeText(session.sessionToken);
    setCopied(true);
    addToast('Session token copied to clipboard!', 'success');
    setTimeout(() => setCopied(false), 2000);
  };

  const formatCountdown = (seconds) => {
    if (seconds === null || seconds <= 0) return '00:00';
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  if (loading && !session) return <LoadingSpinner message="Loading live attendance session..." />;
  if (!session && sessionsList.length === 0) {
    return (
      <EmptyState
        title="No active sessions found"
        description="You have not created any attendance sessions yet."
        action={
          <Link to="/faculty/create-session" className="btn btn-primary btn-sm">
            Create Attendance Session
          </Link>
        }
      />
    );
  }

  const presentCount = roster.filter(r => r.status === 'PRESENT').length;
  const lateCount = roster.filter(r => r.status === 'LATE').length;
  const absentCount = roster.filter(r => r.status === 'ABSENT').length;
  const pendingCount = roster.filter(r => r.status === 'PENDING').length;
  const total = roster.length;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 className="page-title">Live QR Attendance Broadcaster</h1>
          <p className="page-subtitle">Project this display in the lecture room for students to scan using their mobile camera</p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          {sessionsList.length > 1 && (
            <select
              className="form-select"
              style={{ width: 'auto' }}
              value={session?.id || ''}
              onChange={(e) => setSearchParams({ id: e.target.value })}
            >
              {sessionsList.map(s => (
                <option key={s.id} value={s.id}>
                  {s.subjectCode} - {s.sessionDate} ({s.status})
                </option>
              ))}
            </select>
          )}

          <button onClick={handleRefreshRoster} disabled={refreshing} className="btn btn-secondary btn-sm">
            <RefreshCw size={16} className={refreshing ? 'animate-spin' : ''} />
            <span>Refresh Roster</span>
          </button>

          {session?.status === 'ACTIVE' && (
            <button onClick={() => setIsCloseModalOpen(true)} className="btn btn-danger btn-sm">
              <PowerOff size={16} />
              <span>Close Session</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Grid: Left QR & Info / Right Realtime Roster */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(340px, 420px) 1fr', gap: '1.5rem', alignItems: 'start' }}>
        
        {/* Left Column: QR Card */}
        <div className="card" style={{ textAlign: 'center', padding: '2rem 1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <span className={`badge badge-${session.status === 'ACTIVE' ? 'present' : 'closed'}`} style={{ fontSize: '0.8125rem' }}>
              Status: {session.status}
            </span>
            <span style={{ fontSize: '0.75rem', color: 'var(--gray-500)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              <Calendar size={12} /> {session.sessionDate}
            </span>
          </div>

          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--gray-900)', marginBottom: '0.25rem' }}>
            {session.subjectName}
          </h2>
          <div style={{ fontSize: '0.875rem', color: 'var(--primary-700)', fontWeight: 600, marginBottom: '0.5rem' }}>
            {session.className} • {session.subjectCode}
          </div>
          {session.topic && (
            <div style={{ fontSize: '0.8125rem', color: 'var(--gray-600)', fontStyle: 'italic', marginBottom: '1.25rem' }}>
              "{session.topic}"
            </div>
          )}

          {/* QR Code Container */}
          <div style={{
            background: 'var(--white)',
            padding: '1.25rem',
            borderRadius: 'var(--radius-lg)',
            border: '2px solid var(--primary-100)',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: 'var(--shadow-md)',
            marginBottom: '1.25rem',
            position: 'relative'
          }}>
            {session.status === 'ACTIVE' ? (
              <QRCodeSVG
                value={session.sessionToken}
                size={240}
                level="H"
                includeMargin={true}
              />
            ) : (
              <div style={{ width: 240, height: 240, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f8fafc', borderRadius: '8px' }}>
                <AlertCircle size={48} color="#dc2626" style={{ marginBottom: '0.5rem' }} />
                <span style={{ fontWeight: 700, color: '#dc2626' }}>SESSION {session.status}</span>
                <span style={{ fontSize: '0.75rem', color: 'var(--gray-500)', marginTop: '0.25rem' }}>QR scanning no longer permitted</span>
              </div>
            )}
          </div>

          {/* Countdown Clock */}
          {session.status === 'ACTIVE' && (
            <div style={{
              background: '#eff6ff',
              border: '1px solid #bfdbfe',
              borderRadius: 'var(--radius-md)',
              padding: '0.75rem',
              marginBottom: '1rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              color: '#1e3a8a'
            }}>
              <Clock size={20} className="animate-spin" />
              <span style={{ fontSize: '0.875rem', fontWeight: 600 }}>Expires in:</span>
              <span style={{ fontSize: '1.25rem', fontWeight: 800, fontFamily: 'monospace' }}>
                {formatCountdown(timeLeft)}
              </span>
            </div>
          )}

          {/* Manual Token Fallback */}
          <div style={{
            background: '#f8fafc',
            border: '1px solid var(--gray-200)',
            borderRadius: 'var(--radius-md)',
            padding: '0.75rem',
            fontSize: '0.75rem',
            textAlign: 'left'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
              <span style={{ fontWeight: 600, color: 'var(--gray-600)' }}>Emergency Manual Token:</span>
              <button
                onClick={copySessionToken}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--primary-600)', display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.75rem', fontWeight: 600 }}
              >
                {copied ? <Check size={12} /> : <Copy size={12} />}
                {copied ? 'Copied' : 'Copy'}
              </button>
            </div>
            <code style={{ wordBreak: 'break-all', color: 'var(--gray-800)', fontSize: '0.6875rem' }}>
              {session.sessionToken}
            </code>
          </div>
        </div>

        {/* Right Column: Live Attendee Roster */}
        <div className="card">
          <div className="card-header">
            <div>
              <h2 className="card-title">Live Class Roster Check-In Status</h2>
              <span style={{ fontSize: '0.8125rem', color: 'var(--gray-500)' }}>
                {presentCount + lateCount} of {total} checked in ({Math.round(((presentCount + lateCount) / (total || 1)) * 100)}%)
              </span>
            </div>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <span className="badge badge-present">{presentCount} Present</span>
              {lateCount > 0 && <span className="badge badge-late">{lateCount} Late</span>}
              <span className="badge badge-absent">{session.status === 'ACTIVE' ? `${pendingCount} Pending` : `${absentCount} Absent`}</span>
            </div>
          </div>

          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Roll Number</th>
                  <th>Student Name</th>
                  <th>Status</th>
                  <th>Check-In Time</th>
                  <th>Verification Method</th>
                </tr>
              </thead>
              <tbody>
                {roster.map((st) => (
                  <tr key={st.studentId}>
                    <td style={{ fontWeight: 600 }}>{st.rollNumber}</td>
                    <td>{st.fullName}</td>
                    <td>
                      <span className={`badge badge-${st.status === 'PRESENT' ? 'present' : st.status === 'LATE' ? 'late' : st.status === 'PENDING' ? 'active' : 'absent'}`}>
                        {st.status}
                      </span>
                    </td>
                    <td style={{ fontSize: '0.8125rem' }}>
                      {st.markedAt ? new Date(st.markedAt).toLocaleTimeString() : '—'}
                    </td>
                    <td style={{ fontSize: '0.75rem' }}>
                      {st.method ? <code>{st.method}</code> : <span style={{ color: 'var(--gray-400)' }}>Pending scan</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Confirmation Modal to Close Session */}
      <Modal
        isOpen={isCloseModalOpen}
        onClose={() => setIsCloseModalOpen(false)}
        title="Finalize & Close Attendance Session"
      >
        <p style={{ fontSize: '0.875rem', color: 'var(--gray-600)', marginBottom: '1.25rem' }}>
          Closing this session will permanently expire the QR code. All students who have not yet scanned the code will be officially recorded in the database as <strong>ABSENT</strong>.
        </p>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
          <button onClick={() => setIsCloseModalOpen(false)} className="btn btn-secondary">
            Cancel
          </button>
          <button onClick={handleCloseSession} disabled={closing} className="btn btn-danger">
            {closing ? 'Finalizing Absences...' : 'Confirm Closure'}
          </button>
        </div>
      </Modal>
    </div>
  );
};

export default LiveSessionQR;
