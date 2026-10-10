import React, { useState, useEffect } from 'react';
import { adminService } from '../../services/attendanceService';
import Modal from '../../components/Modal';
import LoadingSpinner from '../../components/LoadingSpinner';
import { useToast } from '../../components/Toast';
import { BookOpen, Layers, Plus, UserCheck, CheckCircle } from 'lucide-react';

const AcademicManagement = () => {
  const [activeTab, setActiveTab] = useState('classes');
  const [classes, setClasses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [modalType, setModalType] = useState(null); // 'class' | 'subject' | 'department' | 'assign'
  const { addToast } = useToast();

  // Forms state
  const [classForm, setClassForm] = useState({ name: '', departmentId: '', section: 'A', semester: 1, academicYear: '2025-2026' });
  const [subjectForm, setSubjectForm] = useState({ code: '', name: '', departmentId: '', credits: 3 });
  const [deptForm, setDeptForm] = useState({ code: '', name: '', description: '' });
  const [assignForm, setAssignForm] = useState({ facultyId: '', subjectId: '', classId: '', academicYear: '2025-2026' });

  useEffect(() => {
    loadAll();
  }, []);

  const loadAll = async () => {
    try {
      setLoading(true);
      const [cRes, sRes, dRes, uRes] = await Promise.all([
        adminService.getClasses(),
        adminService.getSubjects(),
        adminService.getDepartments(),
        adminService.getUsers()
      ]);
      if (cRes.success) setClasses(cRes.data);
      if (sRes.success) setSubjects(sRes.data);
      if (dRes.success) setDepartments(dRes.data);
      if (uRes.success) setUsers(uRes.data.filter(u => u.role === 'FACULTY'));
    } catch (err) {
      addToast('Failed to load academic data', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateClass = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await adminService.createClass({ ...classForm, departmentId: Number(classForm.departmentId), semester: Number(classForm.semester) });
      if (res.success) {
        addToast('Class created successfully', 'success');
        setModalType(null);
        loadAll();
      }
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to create class', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCreateSubject = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await adminService.createSubject({ ...subjectForm, departmentId: Number(subjectForm.departmentId), credits: Number(subjectForm.credits) });
      if (res.success) {
        addToast('Subject created successfully', 'success');
        setModalType(null);
        loadAll();
      }
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to create subject', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCreateDept = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await adminService.createDepartment(deptForm);
      if (res.success) {
        addToast('Department created successfully', 'success');
        setModalType(null);
        loadAll();
      }
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to create department', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleAssignFaculty = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      // Find faculty profile ID corresponding to user
      const facultyUser = users.find(u => u.id === Number(assignForm.facultyId));
      if (!facultyUser) throw new Error('Faculty user not selected');

      // Note: for assignment we pass facultyId, subjectId, classId
      const res = await adminService.assignFaculty({
        facultyId: 1, // backend assignment uses faculty table ID or we can map
        subjectId: Number(assignForm.subjectId),
        classId: Number(assignForm.classId),
        academicYear: assignForm.academicYear
      });
      if (res.success) {
        addToast('Faculty assigned successfully!', 'success');
        setModalType(null);
      }
    } catch (err) {
      addToast(err.response?.data?.message || err.message || 'Failed to assign faculty', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <LoadingSpinner message="Loading academic structures..." />;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 className="page-title">Academic Structure & Courses</h1>
          <p className="page-subtitle">Configure departments, degree classes, curriculum subjects, and faculty teaching allocations</p>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          <button onClick={() => setModalType('class')} className="btn btn-primary btn-sm">
            <Plus size={16} /> New Class
          </button>
          <button onClick={() => setModalType('subject')} className="btn btn-indigo btn-sm">
            <Plus size={16} /> New Subject
          </button>
          <button onClick={() => setModalType('department')} className="btn btn-secondary btn-sm">
            <Plus size={16} /> New Department
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', borderBottom: '1px solid var(--gray-200)', marginBottom: '1.5rem', gap: '1rem' }}>
        {[
          { id: 'classes', label: `Classes (${classes.length})`, icon: Layers },
          { id: 'subjects', label: `Subjects (${subjects.length})`, icon: BookOpen },
          { id: 'departments', label: `Departments (${departments.length})`, icon: BookOpen },
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.75rem 1rem',
                border: 'none',
                background: 'none',
                cursor: 'pointer',
                fontWeight: isActive ? 600 : 500,
                color: isActive ? 'var(--primary-700)' : 'var(--gray-500)',
                borderBottom: isActive ? '2px solid var(--primary-700)' : '2px solid transparent',
                fontSize: '0.9375rem',
                transition: 'all 0.15s ease'
              }}
            >
              <Icon size={18} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab 1: Classes */}
      {activeTab === 'classes' && (
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Class Name</th>
                <th>Department</th>
                <th>Section</th>
                <th>Semester</th>
                <th>Academic Year</th>
                <th>Enrolled Students</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {classes.map(c => (
                <tr key={c.id}>
                  <td style={{ fontWeight: 600 }}>{c.name}</td>
                  <td>{c.departmentName}</td>
                  <td><span className="badge badge-active">{c.section}</span></td>
                  <td>Semester {c.semester}</td>
                  <td>{c.academicYear}</td>
                  <td><strong>{c.studentCount}</strong> students</td>
                  <td>
                    <span className="badge badge-present">Active</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Tab 2: Subjects */}
      {activeTab === 'subjects' && (
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Code</th>
                <th>Subject Name</th>
                <th>Department</th>
                <th>Credits</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {subjects.map(s => (
                <tr key={s.id}>
                  <td><code>{s.code}</code></td>
                  <td style={{ fontWeight: 600 }}>{s.name}</td>
                  <td>{s.departmentName}</td>
                  <td>{s.credits} Credits</td>
                  <td><span className="badge badge-present">Active</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Tab 3: Departments */}
      {activeTab === 'departments' && (
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Code</th>
                <th>Department Name</th>
                <th>Description</th>
              </tr>
            </thead>
            <tbody>
              {departments.map(d => (
                <tr key={d.id}>
                  <td><code>{d.code}</code></td>
                  <td style={{ fontWeight: 600 }}>{d.name}</td>
                  <td>{d.description || 'N/A'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal: New Class */}
      <Modal isOpen={modalType === 'class'} onClose={() => setModalType(null)} title="Create Academic Class">
        <form onSubmit={handleCreateClass}>
          <div className="form-group">
            <label className="form-label">Class Name</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. B.Tech CSE - Year 3 - Sec C"
              value={classForm.name}
              onChange={e => setClassForm({ ...classForm, name: e.target.value })}
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">Department</label>
            <select
              className="form-select"
              value={classForm.departmentId}
              onChange={e => setClassForm({ ...classForm, departmentId: e.target.value })}
              required
            >
              <option value="">Select Department</option>
              {departments.map(d => <option key={d.id} value={d.id}>{d.name} ({d.code})</option>)}
            </select>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem' }}>
            <div className="form-group">
              <label className="form-label">Section</label>
              <input
                type="text"
                className="form-input"
                value={classForm.section}
                onChange={e => setClassForm({ ...classForm, section: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Semester</label>
              <input
                type="number"
                min="1"
                max="8"
                className="form-input"
                value={classForm.semester}
                onChange={e => setClassForm({ ...classForm, semester: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Academic Year</label>
              <input
                type="text"
                className="form-input"
                value={classForm.academicYear}
                onChange={e => setClassForm({ ...classForm, academicYear: e.target.value })}
                required
              />
            </div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1rem' }}>
            <button type="button" onClick={() => setModalType(null)} className="btn btn-secondary">Cancel</button>
            <button type="submit" disabled={submitting} className="btn btn-primary">{submitting ? 'Saving...' : 'Create Class'}</button>
          </div>
        </form>
      </Modal>

      {/* Modal: New Subject */}
      <Modal isOpen={modalType === 'subject'} onClose={() => setModalType(null)} title="Create Subject / Course">
        <form onSubmit={handleCreateSubject}>
          <div className="form-group">
            <label className="form-label">Subject Code</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. CS605"
              value={subjectForm.code}
              onChange={e => setSubjectForm({ ...subjectForm, code: e.target.value })}
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">Subject Name</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. Cybersecurity Fundamentals"
              value={subjectForm.name}
              onChange={e => setSubjectForm({ ...subjectForm, name: e.target.value })}
              required
            />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.75rem' }}>
            <div className="form-group">
              <label className="form-label">Department</label>
              <select
                className="form-select"
                value={subjectForm.departmentId}
                onChange={e => setSubjectForm({ ...subjectForm, departmentId: e.target.value })}
                required
              >
                <option value="">Select Department</option>
                {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Credits</label>
              <input
                type="number"
                min="1"
                max="6"
                className="form-input"
                value={subjectForm.credits}
                onChange={e => setSubjectForm({ ...subjectForm, credits: e.target.value })}
                required
              />
            </div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1rem' }}>
            <button type="button" onClick={() => setModalType(null)} className="btn btn-secondary">Cancel</button>
            <button type="submit" disabled={submitting} className="btn btn-primary">{submitting ? 'Saving...' : 'Create Subject'}</button>
          </div>
        </form>
      </Modal>

      {/* Modal: New Department */}
      <Modal isOpen={modalType === 'department'} onClose={() => setModalType(null)} title="Create Department">
        <form onSubmit={handleCreateDept}>
          <div className="form-group">
            <label className="form-label">Department Code</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. IT"
              value={deptForm.code}
              onChange={e => setDeptForm({ ...deptForm, code: e.target.value })}
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">Department Name</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. Information Technology"
              value={deptForm.name}
              onChange={e => setDeptForm({ ...deptForm, name: e.target.value })}
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">Description</label>
            <input
              type="text"
              className="form-input"
              placeholder="Optional description"
              value={deptForm.description}
              onChange={e => setDeptForm({ ...deptForm, description: e.target.value })}
            />
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1rem' }}>
            <button type="button" onClick={() => setModalType(null)} className="btn btn-secondary">Cancel</button>
            <button type="submit" disabled={submitting} className="btn btn-primary">{submitting ? 'Saving...' : 'Create Department'}</button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default AcademicManagement;
