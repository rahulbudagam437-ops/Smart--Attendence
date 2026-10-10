import React, { useState, useEffect } from 'react';
import { studentService } from '../../services/attendanceService';
import LoadingSpinner from '../../components/LoadingSpinner';
import EmptyState from '../../components/EmptyState';
import { useToast } from '../../components/Toast';
import { PieChart, BookOpen, AlertCircle, CheckCircle2 } from 'lucide-react';

const StudentSubjectSummary = () => {
  const [summaries, setSummaries] = useState([]);
  const [loading, setLoading] = useState(true);
  const { addToast } = useToast();

  useEffect(() => {
    fetchSummary();
  }, []);

  const fetchSummary = async () => {
    try {
      setLoading(true);
      const res = await studentService.getSubjectSummary();
      if (res.success) {
        setSummaries(res.data);
      }
    } catch (err) {
      addToast('Failed to load subject summaries', 'error');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingSpinner message="Calculating course percentages..." />;
  if (summaries.length === 0) return <EmptyState title="No course summaries" description="No attendance sessions have been conducted for your enrolled subjects yet." />;

  return (
    <div>
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 className="page-title">Subject Attendance Metrics</h1>
        <p className="page-subtitle">Formula: Attendance Percentage = (Sessions Present / Sessions Eligible) × 100</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.25rem' }}>
        {summaries.map(sub => {
          const isBelow = sub.belowThreshold;
          return (
            <div
              key={sub.subjectId}
              className="card"
              style={{
                borderLeft: `4px solid ${isBelow ? '#dc2626' : '#16a34a'}`,
                backgroundColor: isBelow ? '#fffbfb' : '#ffffff'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                <div>
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--primary-700)' }}>
                    {sub.subjectCode}
                  </span>
                  <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--gray-900)', marginTop: '0.125rem' }}>
                    {sub.subjectName}
                  </h3>
                </div>
                <span className={`badge badge-${isBelow ? 'absent' : 'present'}`} style={{ fontSize: '0.875rem', fontWeight: 800 }}>
                  {sub.percentage}%
                </span>
              </div>

              {/* Visual Progress Bar */}
              <div style={{ width: '100%', height: '10px', backgroundColor: '#e2e8f0', borderRadius: '5px', overflow: 'hidden', margin: '1rem 0' }}>
                <div
                  style={{
                    width: `${Math.min(sub.percentage, 100)}%`,
                    height: '100%',
                    backgroundColor: isBelow ? '#dc2626' : '#16a34a',
                    borderRadius: '5px',
                    transition: 'width 0.3s ease'
                  }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem', textAlign: 'center', background: '#f8fafc', padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--gray-200)', marginBottom: '0.75rem' }}>
                <div>
                  <div style={{ fontSize: '0.6875rem', color: 'var(--gray-500)', fontWeight: 600 }}>ATTENDED</div>
                  <div style={{ fontSize: '1rem', fontWeight: 700, color: '#16a34a' }}>{sub.attendedSessions}</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.6875rem', color: 'var(--gray-500)', fontWeight: 600 }}>LATE</div>
                  <div style={{ fontSize: '1rem', fontWeight: 700, color: '#d97706' }}>{sub.lateSessions}</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.6875rem', color: 'var(--gray-500)', fontWeight: 600 }}>ABSENT</div>
                  <div style={{ fontSize: '1rem', fontWeight: 700, color: sub.absentSessions > 0 ? '#dc2626' : 'inherit' }}>{sub.absentSessions}</div>
                </div>
              </div>

              <div style={{ fontSize: '0.75rem', color: isBelow ? '#dc2626' : '#16a34a', display: 'flex', alignItems: 'center', gap: '0.375rem', fontWeight: 600 }}>
                {isBelow ? <AlertCircle size={14} /> : <CheckCircle2 size={14} />}
                <span>
                  {isBelow ? 'Below 75% Requirement • Examination eligibility at risk' : 'Meets Institutional Attendance Threshold'}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default StudentSubjectSummary;
