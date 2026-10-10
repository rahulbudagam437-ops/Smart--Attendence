import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { facultyService } from '../../services/attendanceService';
import LoadingSpinner from '../../components/LoadingSpinner';
import { useToast } from '../../components/Toast';
import { PlusCircle, QrCode, ArrowLeft, Clock, Calendar, BookOpen, Layers } from 'lucide-react';

const CreateSession = () => {
  const [classes, setClasses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const { addToast } = useToast();
  const navigate = useNavigate();

  // Initial time defaults
  const today = new Date().toISOString().slice(0, 10);
  const now = new Date();
  const startHour = String(now.getHours()).padStart(2, '0') + ':00';
  const endHour = String((now.getHours() + 1) % 24).padStart(2, '0') + ':00';

  const [formData, setFormData] = useState({
    classId: '',
    subjectId: '',
    sessionDate: today,
    startTime: startHour,
    endTime: endHour,
    expiryMinutes: 10,
    topic: '',
    allowLate: false
  });

  useEffect(() => {
    loadAssignedData();
  }, []);

  const loadAssignedData = async () => {
    try {
      setLoading(true);
      const [classRes, subjRes] = await Promise.all([
        facultyService.getClasses(),
        facultyService.getSubjects()
      ]);
      if (classRes.success) {
        setClasses(classRes.data);
        if (classRes.data.length > 0) {
          setFormData(prev => ({ ...prev, classId: classRes.data[0].id }));
        }
      }
      if (subjRes.success) {
        setSubjects(subjRes.data);
        if (subjRes.data.length > 0) {
          setFormData(prev => ({ ...prev, subjectId: subjRes.data[0].id }));
        }
      }
    } catch (err) {
      addToast('Failed to load assigned classes and subjects', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.classId || !formData.subjectId) {
      addToast('Please select both a class and subject', 'error');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        ...formData,
        classId: Number(formData.classId),
        subjectId: Number(formData.subjectId),
        expiryMinutes: Number(formData.expiryMinutes)
      };

      const res = await facultyService.createSession(payload);
      if (res.success && res.data) {
        addToast('Attendance session activated! QR Code ready for student scanning.', 'success');
        navigate(`/faculty/sessions?id=${res.data.id}`);
      }
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to create attendance session', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <LoadingSpinner message="Loading assigned courses..." />;

  return (
    <div style={{ maxWidth: '720px', margin: '0 auto' }}>
      <div style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <button onClick={() => navigate(-1)} className="btn btn-secondary btn-sm" style={{ padding: '0.375rem 0.5rem' }}>
          <ArrowLeft size={16} />
        </button>
        <div>
          <h1 className="page-title">Generate Dynamic QR Attendance Session</h1>
          <p className="page-subtitle">Configure class parameters and broadcast a live, expiring QR code</p>
        </div>
      </div>

      <div className="card">
        <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1.25rem' }}>
            <div className="form-group">
              <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                <Layers size={14} color="var(--primary-600)" />
                <span>Assigned Class & Section</span>
              </label>
              <select
                className="form-select"
                value={formData.classId}
                onChange={e => setFormData({ ...formData, classId: e.target.value })}
                required
              >
                {classes.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.studentCount} students)
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                <BookOpen size={14} color="var(--primary-600)" />
                <span>Assigned Subject</span>
              </label>
              <select
                className="form-select"
                value={formData.subjectId}
                onChange={e => setFormData({ ...formData, subjectId: e.target.value })}
                required
              >
                {subjects.map(s => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.code})
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                <Calendar size={14} color="var(--primary-600)" />
                <span>Session Date</span>
              </label>
              <input
                type="date"
                className="form-input"
                value={formData.sessionDate}
                onChange={e => setFormData({ ...formData, sessionDate: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                <Clock size={14} color="var(--primary-600)" />
                <span>QR Expiration Timer (Minutes)</span>
              </label>
              <select
                className="form-select"
                value={formData.expiryMinutes}
                onChange={e => setFormData({ ...formData, expiryMinutes: e.target.value })}
                required
              >
                <option value={3}>3 Minutes (Strict Check-in)</option>
                <option value={5}>5 Minutes (Recommended)</option>
                <option value={10}>10 Minutes (Standard)</option>
                <option value={15}>15 Minutes (Extended)</option>
                <option value={30}>30 Minutes</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Scheduled Start Time</label>
              <input
                type="time"
                className="form-input"
                value={formData.startTime}
                onChange={e => setFormData({ ...formData, startTime: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Scheduled End Time</label>
              <input
                type="time"
                className="form-input"
                value={formData.endTime}
                onChange={e => setFormData({ ...formData, endTime: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="form-group" style={{ marginTop: '0.5rem' }}>
            <label className="form-label">Lecture Topic / Learning Objective</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. Distributed Database Transactions & Two-Phase Commit"
              value={formData.topic}
              onChange={e => setFormData({ ...formData, topic: e.target.value })}
            />
          </div>

          <div style={{ padding: '0.75rem', background: '#f8fafc', borderRadius: 'var(--radius-md)', border: '1px solid var(--gray-200)', marginBottom: '1.5rem' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.875rem' }}>
              <input
                type="checkbox"
                checked={formData.allowLate}
                onChange={e => setFormData({ ...formData, allowLate: e.target.checked })}
              />
              <span style={{ fontWeight: 500, color: 'var(--gray-800)' }}>
                Enable Late Attendance Window (marks check-ins after 50% timer as "LATE" instead of rejecting)
              </span>
            </label>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
            <button type="button" onClick={() => navigate(-1)} className="btn btn-secondary">
              Cancel
            </button>
            <button type="submit" disabled={submitting} className="btn btn-primary" style={{ padding: '0.75rem 1.5rem' }}>
              <QrCode size={18} />
              <span>{submitting ? 'Generating...' : 'Launch QR Code'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateSession;
