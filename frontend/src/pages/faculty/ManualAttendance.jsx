import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { facultyService } from '../../services/attendanceService';
import LoadingSpinner from '../../components/LoadingSpinner';
import EmptyState from '../../components/EmptyState';
import Modal from '../../components/Modal';
import { useToast } from '../../components/Toast';
import {
  ClipboardCheck,
  Search,
  Filter,
  History,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle
} from 'lucide-react';

const ManualAttendance = () => {
  const [searchParams] = useSearchParams();
  const initialSessionId = searchParams.get('sessionId');

  const [sessions, setSessions] = useState([]);
  const [selectedSessionId, setSelectedSessionId] = useState(initialSessionId || '');
  const [roster, setRoster] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Correction Modal State
  const [editingStudent, setEditingStudent] = useState(null);
  const [newStatus, setNewStatus] = useState('PRESENT');
  const [reason, setReason] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Audit Logs Modal
  const [viewingAuditRecordId, setViewingAuditRecordId] = useState(null);
  const [auditLogs, setAuditLogs] = useState([]);
  const [loadingAudit, setLoadingAudit] = useState(false);

  const { addToast } = useToast();

  useEffect(() => {
    loadSessions();
  }, []);

  useEffect(() => {
    if (selectedSessionId) {
      loadRoster(selectedSessionId);
    }
  }, [selectedSessionId]);

  const loadSessions = async () => {
    try {
      const res = await facultyService.getSessions();
      if (res.success && res.data) {
        setSessions(res.data);
        if (!selectedSessionId && res.data.length > 0) {
          setSelectedSessionId(res.data[0].id);
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  const loadRoster = async (sessionId) => {
    try {
      setLoading(true);
      const res = await facultyService.getSessionAttendance(sessionId);
      if (res.success) {
        setRoster(res.data);
      }
    } catch (err) {
      addToast('Failed to load roster', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCorrection = (student) => {
    setEditingStudent(student);
    setNewStatus(student.status === 'PENDING' ? 'PRESENT' : student.status);
    setReason('');
  };

  const handleSubmitCorrection = async (e) => {
    e.preventDefault();
    if (!reason.trim()) {
      addToast('A valid reason is required for manual attendance correction', 'error');
      return;
    }

    setSubmitting(true);
    try {
      const res = await facultyService.manualMarkAttendance({
        sessionId: Number(selectedSessionId),
        studentId: editingStudent.studentId,
        status: newStatus,
        reason: reason.trim()
      });

      if (res.success) {
        addToast(`Attendance for ${editingStudent.fullName} updated to ${newStatus}`, 'success');
        setEditingStudent(null);
        loadRoster(selectedSessionId);
      }
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to update attendance', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleViewAudit = async (recordId) => {
    if (!recordId) return;
    setViewingAuditRecordId(recordId);
    setLoadingAudit(true);
    try {
      const res = await facultyService.getAuditLogs(recordId);
      if (res.success) {
        setAuditLogs(res.data);
      }
    } catch (err) {
      addToast('Failed to load audit history', 'error');
    } finally {
      setLoadingAudit(false);
    }
  };

  const filteredRoster = roster.filter(st => {
    const matchesSearch = st.fullName.toLowerCase().includes(search.toLowerCase()) ||
                          st.rollNumber.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || st.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 className="page-title">Attendance Management & Audit</h1>
          <p className="page-subtitle">Manual overrides, excuse verification, and complete modification audit trail</p>
        </div>

        {sessions.length > 0 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--gray-700)' }}>Select Session:</span>
            <select
              className="form-select"
              style={{ width: 'auto' }}
              value={selectedSessionId}
              onChange={(e) => setSelectedSessionId(e.target.value)}
            >
              {sessions.map(s => (
                <option key={s.id} value={s.id}>
                  {s.subjectCode} • {s.className} ({s.sessionDate} • {s.status})
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Search and Filters */}
      <div className="card" style={{ padding: '1rem', marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: '240px', position: 'relative' }}>
            <Search size={18} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--gray-400)' }} />
            <input
              type="text"
              className="form-input"
              style={{ paddingLeft: '2.25rem' }}
              placeholder="Search by student name or roll number..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div style={{ width: '180px' }}>
            <select
              className="form-select"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="ALL">All Statuses</option>
              <option value="PRESENT">Present</option>
              <option value="LATE">Late</option>
              <option value="ABSENT">Absent</option>
              <option value="PENDING">Pending</option>
            </select>
          </div>
        </div>
      </div>

      {/* Roster Table */}
      {loading ? (
        <LoadingSpinner message="Loading attendance roster..." />
      ) : filteredRoster.length === 0 ? (
        <EmptyState title="No students match criteria" description="Select a different session or adjust filters." />
      ) : (
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Roll Number</th>
                <th>Student Name</th>
                <th>Registration No</th>
                <th>Current Status</th>
                <th>Last Timestamp</th>
                <th>Method</th>
                <th>Remarks / Reason</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredRoster.map(st => (
                <tr key={st.studentId}>
                  <td style={{ fontWeight: 600 }}>{st.rollNumber}</td>
                  <td>{st.fullName}</td>
                  <td><code>{st.registrationNo}</code></td>
                  <td>
                    <span className={`badge badge-${st.status.toLowerCase()}`}>
                      {st.status}
                    </span>
                  </td>
                  <td style={{ fontSize: '0.8125rem' }}>
                    {st.markedAt ? new Date(st.markedAt).toLocaleTimeString() : '—'}
                  </td>
                  <td style={{ fontSize: '0.75rem' }}>
                    {st.method ? <code>{st.method}</code> : '—'}
                  </td>
                  <td style={{ fontSize: '0.8125rem', color: 'var(--gray-500)', maxWidth: '200px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {st.remarks || '—'}
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.375rem' }}>
                      <button
                        onClick={() => handleOpenCorrection(st)}
                        className="btn btn-secondary btn-sm"
                        style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem' }}
                      >
                        Adjust Status
                      </button>

                      {st.recordId && (
                        <button
                          onClick={() => handleViewAudit(st.recordId)}
                          className="btn btn-secondary btn-sm"
                          title="View Audit Log"
                          style={{ padding: '0.25rem 0.5rem' }}
                        >
                          <History size={14} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Manual Correction Modal */}
      <Modal
        isOpen={!!editingStudent}
        onClose={() => setEditingStudent(null)}
        title={`Adjust Attendance: ${editingStudent?.fullName} (${editingStudent?.rollNumber})`}
      >
        <form onSubmit={handleSubmitCorrection}>
          <div className="form-group">
            <label className="form-label">New Attendance Status</label>
            <select
              className="form-select"
              value={newStatus}
              onChange={(e) => setNewStatus(e.target.value)}
              required
            >
              <option value="PRESENT">Present</option>
              <option value="LATE">Late</option>
              <option value="ABSENT">Absent</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">
              Mandatory Audit Reason / Explanation <span style={{ color: '#dc2626' }}>*</span>
            </label>
            <textarea
              className="form-textarea"
              rows={3}
              placeholder="e.g. Student presented valid medical prescription slip verified by department head"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              required
            />
            <span style={{ fontSize: '0.75rem', color: 'var(--gray-500)' }}>
              This explanation is stored immutably in the attendance audit log alongside your faculty identity.
            </span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.25rem' }}>
            <button type="button" onClick={() => setEditingStudent(null)} className="btn btn-secondary">
              Cancel
            </button>
            <button type="submit" disabled={submitting} className="btn btn-primary">
              {submitting ? 'Recording Audit...' : 'Save Correction'}
            </button>
          </div>
        </form>
      </Modal>

      {/* View Audit Trail Modal */}
      <Modal
        isOpen={!!viewingAuditRecordId}
        onClose={() => setViewingAuditRecordId(null)}
        title="Attendance Modification Audit Trail"
        maxWidth="600px"
      >
        {loadingAudit ? (
          <LoadingSpinner message="Retrieving audit trail..." />
        ) : auditLogs.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '1.5rem', color: 'var(--gray-500)' }}>
            No prior manual modifications recorded for this record.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {auditLogs.map((log) => (
              <div
                key={log.id}
                style={{
                  border: '1px solid var(--gray-200)',
                  borderRadius: 'var(--radius-md)',
                  padding: '0.875rem',
                  background: '#f8fafc'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.375rem' }}>
                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    <span className="badge badge-absent">{log.previousStatus}</span>
                    <span>&rarr;</span>
                    <span className="badge badge-present">{log.newStatus}</span>
                  </div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--gray-500)' }}>
                    {new Date(log.modifiedAt).toLocaleString()}
                  </span>
                </div>
                <div style={{ fontSize: '0.8125rem', color: 'var(--gray-800)', marginBottom: '0.25rem' }}>
                  <strong>Reason:</strong> {log.reason}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--gray-500)' }}>
                  Modified by: {log.modifiedByUser?.fullName} ({log.modifiedByUser?.role})
                </div>
              </div>
            ))}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default ManualAttendance;
