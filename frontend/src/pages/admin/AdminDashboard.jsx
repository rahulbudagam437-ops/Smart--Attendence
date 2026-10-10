import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { adminService } from '../../services/attendanceService';
import StatCard from '../../components/StatCard';
import LoadingSpinner from '../../components/LoadingSpinner';
import EmptyState from '../../components/EmptyState';
import { useToast } from '../../components/Toast';
import {
  Users,
  GraduationCap,
  BookOpen,
  Percent,
  AlertTriangle,
  UserPlus,
  FileText,
  Calendar
} from 'lucide-react';
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

const AdminDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const { addToast } = useToast();

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      const res = await adminService.getDashboard();
      if (res.success) {
        setData(res.data);
      }
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to load admin dashboard', 'error');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingSpinner message="Loading institutional overview..." />;
  if (!data) return <EmptyState title="Dashboard Unavailable" description="Could not load metrics from backend." />;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 className="page-title">Institution Overview</h1>
          <p className="page-subtitle">Real-time attendance telemetry and academic structure metrics</p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <Link to="/admin/users" className="btn btn-secondary btn-sm">
            <UserPlus size={16} />
            <span>Manage Users</span>
          </Link>
          <Link to="/admin/reports" className="btn btn-primary btn-sm">
            <FileText size={16} />
            <span>Full Reports</span>
          </Link>
        </div>
      </div>

      {/* Top Stat Cards */}
      <div className="stats-grid">
        <StatCard
          title="Total Students"
          value={data.totalStudents}
          icon={GraduationCap}
          color="blue"
          subtext="Active student enrollments"
        />
        <StatCard
          title="Total Faculty"
          value={data.totalFaculty}
          icon={Users}
          color="indigo"
          subtext="Active teaching staff"
        />
        <StatCard
          title="Classes & Sections"
          value={data.totalClasses}
          icon={BookOpen}
          color="purple"
          subtext={`${data.totalSubjects} accredited subjects`}
        />
        <StatCard
          title="Overall Attendance"
          value={`${data.overallAttendancePercentage}%`}
          icon={Percent}
          color={data.overallAttendancePercentage >= 75 ? 'green' : 'amber'}
          subtext={`${data.totalSessionsConducted} sessions recorded`}
        />
      </div>

      {/* Class-wise Attendance Performance Chart */}
      <div className="card" style={{ marginBottom: '1.75rem' }}>
        <div className="card-header">
          <h2 className="card-title">Class-Wise Attendance Performance (%)</h2>
          <span style={{ fontSize: '0.8125rem', color: 'var(--gray-500)' }}>Aggregated from recorded sessions</span>
        </div>
        <div style={{ width: '100%', height: 280 }}>
          {data.classWiseAttendance && data.classWiseAttendance.length > 0 ? (
            <ResponsiveContainer>
              <BarChart data={data.classWiseAttendance} margin={{ top: 10, right: 20, left: 0, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="className" stroke="#64748b" fontSize={12} tickLine={false} />
                <YAxis domain={[0, 100]} stroke="#64748b" fontSize={12} tickLine={false} unit="%" />
                <Tooltip
                  formatter={(val) => [`${val}%`, 'Attendance']}
                  contentStyle={{ backgroundColor: '#ffffff', borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}
                />
                <Bar dataKey="attendancePercentage" radius={[6, 6, 0, 0]} maxBarSize={50}>
                  {data.classWiseAttendance.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.attendancePercentage >= 75 ? '#2563eb' : '#dc2626'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <EmptyState title="No class session data yet" description="Conduct sessions to visualize class comparisons." />
          )}
        </div>
      </div>

      {/* Low Attendance Alert Table */}
      <div className="card">
        <div className="card-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <AlertTriangle size={20} color="#dc2626" />
            <h2 className="card-title" style={{ color: '#dc2626' }}>
              Students Below Institutional Threshold (&lt; 75%)
            </h2>
          </div>
          <span className="badge badge-absent">
            {data.lowAttendanceStudents?.length || 0} At Risk
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
                  <th>Sessions Attended / Eligible</th>
                  <th>Attendance %</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {data.lowAttendanceStudents.map((st) => (
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
                    <td>
                      <Link to={`/admin/reports?studentId=${st.studentId}`} className="btn btn-secondary btn-sm">
                        View Records
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div style={{ padding: '2rem', textAlign: 'center', color: '#16a34a', fontWeight: 500 }}>
            No students currently below the 75% threshold. Institutional attendance is healthy!
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
