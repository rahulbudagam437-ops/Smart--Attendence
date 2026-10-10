import React, { useState, useEffect } from 'react';
import { studentService } from '../../services/attendanceService';
import LoadingSpinner from '../../components/LoadingSpinner';
import EmptyState from '../../components/EmptyState';
import { useToast } from '../../components/Toast';
import { Clock, Filter, Search, Calendar } from 'lucide-react';

const StudentAttendanceHistory = () => {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const { addToast } = useToast();

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      const res = await studentService.getAttendanceHistory();
      if (res.success) {
        setRecords(res.data);
      }
    } catch (err) {
      addToast('Failed to load attendance history', 'error');
    } finally {
      setLoading(false);
    }
  };

  const filteredRecords = records.filter(r => {
    const matchesSearch = r.subjectName.toLowerCase().includes(search.toLowerCase()) ||
                          r.sessionCode.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || r.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div>
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 className="page-title">Personal Attendance History</h1>
        <p className="page-subtitle">Complete chronological record of all your lecture check-ins and session audits</p>
      </div>

      {/* Filter and Search */}
      <div className="card" style={{ padding: '1rem', marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: '240px', position: 'relative' }}>
            <Search size={18} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--gray-400)' }} />
            <input
              type="text"
              className="form-input"
              style={{ paddingLeft: '2.25rem' }}
              placeholder="Search by subject name or session code..."
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
            </select>
          </div>
        </div>
      </div>

      {/* Records Table */}
      {loading ? (
        <LoadingSpinner message="Loading attendance logs..." />
      ) : filteredRecords.length === 0 ? (
        <EmptyState title="No attendance logs found" description="You have not participated in any recorded sessions matching your filters." />
      ) : (
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Date & Timestamp</th>
                <th>Subject Course</th>
                <th>Class Session</th>
                <th>Status</th>
                <th>Check-In Method</th>
                <th>Remarks</th>
              </tr>
            </thead>
            <tbody>
              {filteredRecords.map(r => (
                <tr key={r.id}>
                  <td style={{ fontSize: '0.8125rem' }}>
                    {r.markedAt ? new Date(r.markedAt).toLocaleString() : 'N/A'}
                  </td>
                  <td style={{ fontWeight: 600 }}>{r.subjectName}</td>
                  <td><code>{r.sessionCode}</code></td>
                  <td>
                    <span className={`badge badge-${r.status.toLowerCase()}`}>
                      {r.status}
                    </span>
                  </td>
                  <td style={{ fontSize: '0.75rem' }}>
                    <code>{r.method}</code>
                  </td>
                  <td style={{ fontSize: '0.8125rem', color: 'var(--gray-500)' }}>
                    {r.remarks || '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default StudentAttendanceHistory;
