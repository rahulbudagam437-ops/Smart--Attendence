import React, { useState, useEffect } from 'react';
import { analyticsService } from '../../services/attendanceService';
import LoadingSpinner from '../../components/LoadingSpinner';
import EmptyState from '../../components/EmptyState';
import { useToast } from '../../components/Toast';
import { BarChart3, TrendingUp, AlertTriangle } from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Cell
} from 'recharts';

const FacultyAnalytics = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const { addToast } = useToast();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await analyticsService.getOverview();
      if (res.success) setData(res.data);
    } catch (err) {
      addToast('Failed to load analytics', 'error');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingSpinner message="Calculating analytics..." />;
  if (!data) return <EmptyState title="No analytics available" description="Conduct attendance sessions to generate charts." />;

  return (
    <div>
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 className="page-title">Course Analytics & Class Insights</h1>
        <p className="page-subtitle">Track course engagement, student attendance distributions, and learning continuity</p>
      </div>

      <div className="card" style={{ marginBottom: '1.75rem' }}>
        <div className="card-header">
          <h2 className="card-title">Class-Wise Attendance Comparison (%)</h2>
          <BarChart3 size={18} color="var(--primary-600)" />
        </div>
        <div style={{ width: '100%', height: 300 }}>
          {data.classComparisons && data.classComparisons.length > 0 ? (
            <ResponsiveContainer>
              <BarChart data={data.classComparisons} margin={{ top: 10, right: 20, left: 0, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="className" stroke="#64748b" fontSize={12} tickLine={false} />
                <YAxis domain={[0, 100]} stroke="#64748b" fontSize={12} tickLine={false} unit="%" />
                <Tooltip formatter={(val) => [`${val}%`, 'Attendance']} />
                <Bar dataKey="percentage" fill="#4338ca" radius={[6, 6, 0, 0]} maxBarSize={50}>
                  {data.classComparisons.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.percentage >= 75 ? '#2563eb' : '#dc2626'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <EmptyState title="No class comparison data" description="Record class attendance to view charts." />
          )}
        </div>
      </div>

      {/* Flagged Students */}
      <div className="card">
        <div className="card-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <AlertTriangle size={20} color="#dc2626" />
            <h2 className="card-title">Students at Risk (&lt; 75% Attendance)</h2>
          </div>
          <span className="badge badge-absent">
            {data.lowAttendanceStudents?.length || 0} Students
          </span>
        </div>

        {data.lowAttendanceStudents && data.lowAttendanceStudents.length > 0 ? (
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Roll Number</th>
                  <th>Student Name</th>
                  <th>Class</th>
                  <th>Attended / Eligible</th>
                  <th>Attendance %</th>
                </tr>
              </thead>
              <tbody>
                {data.lowAttendanceStudents.map(st => (
                  <tr key={st.studentId}>
                    <td style={{ fontWeight: 600 }}>{st.rollNumber}</td>
                    <td>{st.studentName}</td>
                    <td>{st.className}</td>
                    <td>{st.attendedSessions} / {st.eligibleSessions}</td>
                    <td>
                      <span className="badge badge-absent" style={{ fontWeight: 700 }}>
                        {st.percentage}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div style={{ padding: '2rem', textAlign: 'center', color: '#16a34a', fontWeight: 500 }}>
            No students currently below the 75% threshold in your assigned courses.
          </div>
        )}
      </div>
    </div>
  );
};

export default FacultyAnalytics;
