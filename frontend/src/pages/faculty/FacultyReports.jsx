import React, { useState, useEffect } from 'react';
import { facultyService, reportService } from '../../services/attendanceService';
import LoadingSpinner from '../../components/LoadingSpinner';
import EmptyState from '../../components/EmptyState';
import { useToast } from '../../components/Toast';
import { Download, Printer, Filter } from 'lucide-react';

const FacultyReports = () => {
  const [classes, setClasses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const { addToast } = useToast();

  const [filters, setFilters] = useState({
    classId: '',
    subjectId: '',
    startDate: '',
    endDate: '',
    status: ''
  });

  useEffect(() => {
    loadMetadata();
    fetchReport();
  }, []);

  const loadMetadata = async () => {
    try {
      const [cRes, sRes] = await Promise.all([
        facultyService.getClasses(),
        facultyService.getSubjects()
      ]);
      if (cRes.success) setClasses(cRes.data);
      if (sRes.success) setSubjects(sRes.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchReport = async () => {
    try {
      setLoading(true);
      const params = {};
      if (filters.classId) params.classId = filters.classId;
      if (filters.subjectId) params.subjectId = filters.subjectId;
      if (filters.startDate) params.startDate = filters.startDate;
      if (filters.endDate) params.endDate = filters.endDate;
      if (filters.status) params.status = filters.status;

      const res = await reportService.getAttendanceReport(params);
      if (res.success) setRecords(res.data);
    } catch (err) {
      addToast('Failed to fetch attendance records', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleExportCsv = async () => {
    try {
      setDownloading(true);
      const params = {};
      if (filters.classId) params.classId = filters.classId;
      if (filters.subjectId) params.subjectId = filters.subjectId;
      if (filters.startDate) params.startDate = filters.startDate;
      if (filters.endDate) params.endDate = filters.endDate;
      if (filters.status) params.status = filters.status;

      const blob = await reportService.exportAttendanceCsv(params);
      const url = window.URL.createObjectURL(new Blob([blob], { type: 'text/csv' }));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `faculty_attendance_report_${new Date().toISOString().slice(0, 10)}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      addToast('CSV export downloaded successfully', 'success');
    } catch (err) {
      addToast('Failed to download CSV', 'error');
    } finally {
      setDownloading(false);
    }
  };

  const total = records.length;
  const presentCount = records.filter(r => r.status === 'PRESENT').length;
  const lateCount = records.filter(r => r.status === 'LATE').length;
  const absentCount = records.filter(r => r.status === 'ABSENT').length;
  const pct = total === 0 ? 0 : Math.round(((presentCount + lateCount) * 100 / total) * 10) / 10;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 className="page-title">Course Attendance Reports</h1>
          <p className="page-subtitle">Detailed attendance logs for your assigned academic courses</p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button onClick={() => window.print()} className="btn btn-secondary btn-sm">
            <Printer size={16} /> Print
          </button>
          <button onClick={handleExportCsv} disabled={downloading} className="btn btn-primary btn-sm">
            <Download size={16} /> {downloading ? 'Exporting...' : 'Export CSV'}
          </button>
        </div>
      </div>

      {/* Filter Card */}
      <div className="card" style={{ padding: '1.25rem', marginBottom: '1.5rem' }}>
        <form onSubmit={(e) => { e.preventDefault(); fetchReport(); }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem' }}>
            <div>
              <label className="form-label">Class</label>
              <select
                className="form-select"
                value={filters.classId}
                onChange={e => setFilters({ ...filters, classId: e.target.value })}
              >
                <option value="">All Assigned Classes</option>
                {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>

            <div>
              <label className="form-label">Subject</label>
              <select
                className="form-select"
                value={filters.subjectId}
                onChange={e => setFilters({ ...filters, subjectId: e.target.value })}
              >
                <option value="">All Assigned Subjects</option>
                {subjects.map(s => <option key={s.id} value={s.id}>{s.name} ({s.code})</option>)}
              </select>
            </div>

            <div>
              <label className="form-label">Status</label>
              <select
                className="form-select"
                value={filters.status}
                onChange={e => setFilters({ ...filters, status: e.target.value })}
              >
                <option value="">All Statuses</option>
                <option value="PRESENT">Present Only</option>
                <option value="LATE">Late Only</option>
                <option value="ABSENT">Absent Only</option>
              </select>
            </div>

            <div>
              <label className="form-label">Start Date</label>
              <input
                type="date"
                className="form-input"
                value={filters.startDate}
                onChange={e => setFilters({ ...filters, startDate: e.target.value })}
              />
            </div>

            <div>
              <label className="form-label">End Date</label>
              <input
                type="date"
                className="form-input"
                value={filters.endDate}
                onChange={e => setFilters({ ...filters, endDate: e.target.value })}
              />
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1rem', gap: '0.75rem' }}>
            <button
              type="button"
              onClick={() => {
                setFilters({ classId: '', subjectId: '', startDate: '', endDate: '', status: '' });
                fetchReport();
              }}
              className="btn btn-secondary btn-sm"
            >
              Reset Filters
            </button>
            <button type="submit" className="btn btn-primary btn-sm">
              <Filter size={16} /> Filter
            </button>
          </div>
        </form>
      </div>

      {/* Summary KPI Strip */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
        <div style={{ background: 'var(--white)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--gray-200)', textAlign: 'center' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--gray-500)', fontWeight: 600 }}>TOTAL RECORDS</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--gray-900)' }}>{total}</div>
        </div>
        <div style={{ background: 'var(--white)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--gray-200)', textAlign: 'center' }}>
          <div style={{ fontSize: '0.75rem', color: '#16a34a', fontWeight: 600 }}>PRESENT</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#16a34a' }}>{presentCount}</div>
        </div>
        <div style={{ background: 'var(--white)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--gray-200)', textAlign: 'center' }}>
          <div style={{ fontSize: '0.75rem', color: '#d97706', fontWeight: 600 }}>LATE</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#d97706' }}>{lateCount}</div>
        </div>
        <div style={{ background: 'var(--white)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--gray-200)', textAlign: 'center' }}>
          <div style={{ fontSize: '0.75rem', color: '#dc2626', fontWeight: 600 }}>ABSENT</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#dc2626' }}>{absentCount}</div>
        </div>
        <div style={{ background: 'var(--white)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--gray-200)', textAlign: 'center' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--primary-700)', fontWeight: 600 }}>ATTENDANCE RATE</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--primary-700)' }}>{pct}%</div>
        </div>
      </div>

      {/* Reports Table */}
      {loading ? (
        <LoadingSpinner message="Loading course reports..." />
      ) : records.length === 0 ? (
        <EmptyState title="No records found" description="Adjust filters to view attendance records." />
      ) : (
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Date & Time</th>
                <th>Class</th>
                <th>Subject</th>
                <th>Student</th>
                <th>Roll Number</th>
                <th>Status</th>
                <th>Method</th>
                <th>Remarks</th>
              </tr>
            </thead>
            <tbody>
              {records.map(r => (
                <tr key={r.id}>
                  <td style={{ fontSize: '0.8125rem' }}>
                    {r.markedAt ? new Date(r.markedAt).toLocaleString() : 'N/A'}
                  </td>
                  <td>{r.className}</td>
                  <td>{r.subjectName}</td>
                  <td style={{ fontWeight: 600 }}>{r.studentName}</td>
                  <td><code>{r.rollNumber}</code></td>
                  <td>
                    <span className={`badge badge-${r.status.toLowerCase()}`}>
                      {r.status}
                    </span>
                  </td>
                  <td style={{ fontSize: '0.75rem' }}><code>{r.method}</code></td>
                  <td style={{ fontSize: '0.8125rem', color: 'var(--gray-500)' }}>{r.remarks || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default FacultyReports;
