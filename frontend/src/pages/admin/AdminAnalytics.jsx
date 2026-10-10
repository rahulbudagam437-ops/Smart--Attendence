import React, { useState, useEffect } from 'react';
import { analyticsService } from '../../services/attendanceService';
import StatCard from '../../components/StatCard';
import LoadingSpinner from '../../components/LoadingSpinner';
import EmptyState from '../../components/EmptyState';
import { useToast } from '../../components/Toast';
import {
  Percent,
  CheckCircle2,
  XCircle,
  Clock,
  BarChart2,
  TrendingUp,
  AlertCircle
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid
} from 'recharts';

const AdminAnalytics = () => {
  const [data, setData] = useState(null);
  const [threshold, setThreshold] = useState(75.0);
  const [loading, setLoading] = useState(true);
  const { addToast } = useToast();

  useEffect(() => {
    fetchAnalytics();
  }, [threshold]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const [overviewRes, lowRes] = await Promise.all([
        analyticsService.getOverview(),
        analyticsService.getLowAttendance(threshold)
      ]);
      if (overviewRes.success) {
        const mergedData = {
          ...overviewRes.data,
          lowAttendanceStudents: (lowRes.success && lowRes.data) ? lowRes.data : overviewRes.data.lowAttendanceStudents
        };
        setData(mergedData);
      }
    } catch (err) {
      addToast('Failed to load institutional analytics', 'error');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingSpinner message="Calculating institutional telemetry and trends..." />;
  if (!data) return <EmptyState title="Analytics Unavailable" description="Unable to load analytics data from server." />;

  // Pie chart data
  const pieData = [
    { name: 'Present', value: data.presentCount, color: '#16a34a' },
    { name: 'Late', value: data.lateCount, color: '#d97706' },
    { name: 'Absent', value: data.absentCount, color: '#dc2626' }
  ].filter(d => d.value > 0);

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 className="page-title">Institution Analytics & Trends</h1>
          <p className="page-subtitle">Real-time attendance trends, multi-subject analytics, and low-attendance telemetry</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', background: 'var(--white)', padding: '0.5rem 0.875rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--gray-200)' }}>
          <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--gray-700)' }}>Risk Threshold:</span>
          <select
            className="form-select"
            style={{ width: 'auto', padding: '0.25rem 0.5rem', fontSize: '0.8125rem' }}
            value={threshold}
            onChange={(e) => setThreshold(Number(e.target.value))}
          >
            <option value={60}>60%</option>
            <option value={70}>70%</option>
            <option value={75}>75% (Standard)</option>
            <option value={80}>80%</option>
            <option value={85}>85%</option>
          </select>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="stats-grid">
        <StatCard
          title="Overall Attendance Rate"
          value={`${data.overallPercentage}%`}
          icon={Percent}
          color={data.overallPercentage >= 75 ? 'green' : 'amber'}
          subtext="Formula: (Present + Late) / Eligible"
        />
        <StatCard
          title="Present Check-Ins"
          value={data.presentCount}
          icon={CheckCircle2}
          color="green"
          subtext={`${data.presentPercentage}% of total logs`}
        />
        <StatCard
          title="Late Arrivals"
          value={data.lateCount}
          icon={Clock}
          color="amber"
          subtext={`${data.latePercentage}% of total logs`}
        />
        <StatCard
          title="Absences Recorded"
          value={data.absentCount}
          icon={XCircle}
          color="red"
          subtext={`${data.absentPercentage}% of total logs`}
        />
      </div>

      {/* Two Column Charts: Daily Trends and Distribution */}
      <div className="charts-grid">
        {/* Daily Trends Chart */}
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">Daily Attendance Progression (%)</h2>
            <TrendingUp size={18} color="var(--primary-600)" />
          </div>
          <div style={{ width: '100%', height: 260 }}>
            {data.dailyTrends && data.dailyTrends.length > 0 ? (
              <ResponsiveContainer>
                <LineChart data={data.dailyTrends} margin={{ top: 10, right: 20, left: 0, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="date" stroke="#64748b" fontSize={11} tickLine={false} />
                  <YAxis domain={[0, 100]} stroke="#64748b" fontSize={11} tickLine={false} unit="%" />
                  <Tooltip
                    formatter={(val) => [`${val}%`, 'Attendance Rate']}
                    contentStyle={{ backgroundColor: '#ffffff', borderRadius: '8px', border: '1px solid #e2e8f0' }}
                  />
                  <Line
                    type="monotone"
                    dataKey="percentage"
                    stroke="#2563eb"
                    strokeWidth={3}
                    dot={{ fill: '#2563eb', r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <EmptyState title="No daily trends yet" description="Records will populate daily charts." />
            )}
          </div>
        </div>

        {/* Present vs Absent vs Late Distribution */}
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">Attendance Status Distribution</h2>
            <BarChart2 size={18} color="var(--accent-600)" />
          </div>
          <div style={{ width: '100%', height: 260 }}>
            {pieData.length > 0 ? (
              <ResponsiveContainer>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(val, name) => [val, name]}
                    contentStyle={{ backgroundColor: '#ffffff', borderRadius: '8px', border: '1px solid #e2e8f0' }}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <EmptyState title="No records to distribute" description="Log session attendance to populate distribution." />
            )}
          </div>
        </div>
      </div>

      {/* Subject-Wise Attendance Breakdown */}
      <div className="card" style={{ marginBottom: '1.75rem' }}>
        <div className="card-header">
          <h2 className="card-title">Subject-Wise Attendance Comparison (%)</h2>
          <span style={{ fontSize: '0.8125rem', color: 'var(--gray-500)' }}>Aggregated across all sections</span>
        </div>
        <div style={{ width: '100%', height: 280 }}>
          {data.subjectAttendance && data.subjectAttendance.length > 0 ? (
            <ResponsiveContainer>
              <BarChart data={data.subjectAttendance} margin={{ top: 10, right: 20, left: 0, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="subjectCode" stroke="#64748b" fontSize={12} tickLine={false} />
                <YAxis domain={[0, 100]} stroke="#64748b" fontSize={12} tickLine={false} unit="%" />
                <Tooltip
                  formatter={(val, name, props) => [`${val}%`, props.payload.subjectName]}
                  contentStyle={{ backgroundColor: '#ffffff', borderRadius: '8px', border: '1px solid #e2e8f0' }}
                />
                <Bar dataKey="percentage" fill="#4338ca" radius={[6, 6, 0, 0]} maxBarSize={50} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <EmptyState title="No subject session records" description="Conduct subject sessions to view course comparison." />
          )}
        </div>
      </div>

      {/* Low Attendance Student Threshold Watchlist */}
      <div className="card">
        <div className="card-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <AlertCircle size={20} color="#dc2626" />
            <h2 className="card-title">Students Falling Below {threshold}% Threshold</h2>
          </div>
          <span className="badge badge-absent">
            {data.lowAttendanceStudents?.length || 0} Flagged
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
                  <th>Shortfall</th>
                </tr>
              </thead>
              <tbody>
                {data.lowAttendanceStudents.map((st) => {
                  const shortfall = Math.round((threshold - st.percentage) * 10) / 10;
                  return (
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
                      <td style={{ color: '#dc2626', fontWeight: 600 }}>
                        -{shortfall}% below requirement
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div style={{ padding: '2rem', textAlign: 'center', color: '#16a34a', fontWeight: 500 }}>
            No students currently below the {threshold}% threshold.
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminAnalytics;
