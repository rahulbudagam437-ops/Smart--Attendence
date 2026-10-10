import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { studentService } from '../../services/attendanceService';
import LoadingSpinner from '../../components/LoadingSpinner';
import { User, Mail, Phone, BookOpen, Layers, Award, Shield } from 'lucide-react';

const StudentProfile = () => {
  const { user } = useAuth();
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const res = await studentService.getDashboard();
      if (res.success) {
        setDashboard(res.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingSpinner message="Loading student profile..." />;

  return (
    <div style={{ maxWidth: '680px', margin: '0 auto' }}>
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 className="page-title">Student Academic Profile</h1>
        <p className="page-subtitle">Personal enrollment credentials and institutional identity records</p>
      </div>

      <div className="card" style={{ padding: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', marginBottom: '2rem', paddingBottom: '1.5rem', borderBottom: '1px solid var(--gray-200)', flexWrap: 'wrap' }}>
          <div style={{
            width: '72px',
            height: '72px',
            borderRadius: '50%',
            backgroundColor: 'var(--primary-700)',
            color: 'var(--white)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.75rem',
            fontWeight: 700
          }}>
            {user?.fullName?.charAt(0) || 'S'}
          </div>

          <div>
            <h2 style={{ fontSize: '1.375rem', fontWeight: 700, color: 'var(--gray-900)' }}>
              {user?.fullName}
            </h2>
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginTop: '0.25rem' }}>
              <span className="badge badge-role-student">STUDENT</span>
              <span style={{ fontSize: '0.875rem', color: 'var(--gray-600)' }}>
                Roll Number: <strong>{dashboard?.rollNumber}</strong>
              </span>
            </div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.25rem' }}>
          <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--gray-200)' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--gray-500)', fontWeight: 600, marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
              <Award size={14} color="var(--primary-600)" />
              <span>REGISTRATION NUMBER</span>
            </div>
            <div style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--gray-900)' }}>
              {dashboard?.registrationNo || 'N/A'}
            </div>
          </div>

          <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--gray-200)' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--gray-500)', fontWeight: 600, marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
              <Layers size={14} color="var(--primary-600)" />
              <span>ENROLLED CLASS</span>
            </div>
            <div style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--gray-900)' }}>
              {dashboard?.className || 'N/A'}
            </div>
          </div>

          <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--gray-200)' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--gray-500)', fontWeight: 600, marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
              <BookOpen size={14} color="var(--primary-600)" />
              <span>DEPARTMENT</span>
            </div>
            <div style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--gray-900)' }}>
              {dashboard?.departmentName || 'Computer Science & Engineering'}
            </div>
          </div>

          <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--gray-200)' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--gray-500)', fontWeight: 600, marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
              <Mail size={14} color="var(--primary-600)" />
              <span>OFFICIAL EMAIL</span>
            </div>
            <div style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--gray-900)' }}>
              {user?.email || 'N/A'}
            </div>
          </div>

          <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--gray-200)' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--gray-500)', fontWeight: 600, marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
              <Shield size={14} color="var(--primary-600)" />
              <span>ACCOUNT STATUS</span>
            </div>
            <div style={{ fontSize: '1rem', fontWeight: 600, color: '#16a34a' }}>
              Active & Verified
            </div>
          </div>

          <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--gray-200)' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--gray-500)', fontWeight: 600, marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
              <User size={14} color="var(--primary-600)" />
              <span>USERNAME</span>
            </div>
            <div style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--gray-900)' }}>
              <code>{user?.username}</code>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentProfile;
