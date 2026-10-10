import React, { useState, useEffect } from 'react';
import { adminService } from '../../services/attendanceService';
import Modal from '../../components/Modal';
import LoadingSpinner from '../../components/LoadingSpinner';
import EmptyState from '../../components/EmptyState';
import { useToast } from '../../components/Toast';
import { UserPlus, Search, Filter, CheckCircle, XCircle } from 'lucide-react';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [classes, setClasses] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const { addToast } = useToast();

  const [formData, setFormData] = useState({
    username: '',
    password: '',
    email: '',
    fullName: '',
    role: 'STUDENT',
    phone: '',
    departmentId: '',
    employeeId: '',
    designation: 'Assistant Professor',
    qualification: 'M.Tech',
    classId: '',
    rollNumber: '',
    registrationNo: '',
    batchYear: '2023-2027'
  });

  useEffect(() => {
    fetchUsers();
    fetchMetadata();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await adminService.getUsers();
      if (res.success) setUsers(res.data);
    } catch (err) {
      addToast('Failed to load users', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchMetadata = async () => {
    try {
      const [classRes, deptRes] = await Promise.all([
        adminService.getClasses(),
        adminService.getDepartments()
      ]);
      if (classRes.success) setClasses(classRes.data);
      if (deptRes.success) setDepartments(deptRes.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleToggleStatus = async (user) => {
    const nextStatus = !user.isActive;
    const actionLabel = nextStatus ? 'activate' : 'deactivate';
    if (!window.confirm(`Are you sure you want to ${actionLabel} ${user.fullName}?`)) return;

    try {
      const res = await adminService.updateUserStatus(user.id, nextStatus);
      if (res.success) {
        addToast(`User ${user.fullName} ${nextStatus ? 'activated' : 'deactivated'} successfully`, 'success');
        setUsers(users.map(u => u.id === user.id ? { ...u, isActive: nextStatus } : u));
      }
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to update user status', 'error');
    }
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = { ...formData };
      if (payload.role === 'FACULTY') {
        payload.departmentId = Number(payload.departmentId);
      } else if (payload.role === 'STUDENT') {
        payload.classId = Number(payload.classId);
      }

      const res = await adminService.createUser(payload);
      if (res.success) {
        addToast('New user account registered successfully!', 'success');
        setIsModalOpen(false);
        fetchUsers();
        setFormData({
          username: '',
          password: '',
          email: '',
          fullName: '',
          role: 'STUDENT',
          phone: '',
          departmentId: '',
          employeeId: '',
          designation: 'Assistant Professor',
          qualification: 'M.Tech',
          classId: '',
          rollNumber: '',
          registrationNo: '',
          batchYear: '2023-2027'
        });
      }
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to create user', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const filteredUsers = users.filter(u => {
    const matchSearch = u.fullName.toLowerCase().includes(search.toLowerCase()) ||
                        u.username.toLowerCase().includes(search.toLowerCase()) ||
                        u.email.toLowerCase().includes(search.toLowerCase()) ||
                        (u.rollNumber && u.rollNumber.toLowerCase().includes(search.toLowerCase()));
    const matchRole = roleFilter === 'ALL' || u.role === roleFilter;
    return matchSearch && matchRole;
  });

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 className="page-title">User Account Directory</h1>
          <p className="page-subtitle">Manage administrative, faculty, and student profiles and access status</p>
        </div>
        <button onClick={() => setIsModalOpen(true)} className="btn btn-primary">
          <UserPlus size={16} />
          <span>Register New User</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="card" style={{ padding: '1rem', marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: '240px', position: 'relative' }}>
            <Search size={18} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--gray-400)' }} />
            <input
              type="text"
              className="form-input"
              style={{ paddingLeft: '2.25rem' }}
              placeholder="Search by name, username, roll number, or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div style={{ width: '180px' }}>
            <select
              className="form-select"
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
            >
              <option value="ALL">All Roles</option>
              <option value="ADMIN">Administrators</option>
              <option value="FACULTY">Faculty Members</option>
              <option value="STUDENT">Students</option>
            </select>
          </div>
        </div>
      </div>

      {/* Users Table */}
      {loading ? (
        <LoadingSpinner message="Loading user directory..." />
      ) : filteredUsers.length === 0 ? (
        <EmptyState title="No matching users found" description="Try adjusting your search or role filter criteria." />
      ) : (
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Full Name</th>
                <th>Username</th>
                <th>Role</th>
                <th>Identifiers / Class</th>
                <th>Email</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((u) => (
                <tr key={u.id}>
                  <td style={{ fontWeight: 600 }}>{u.fullName}</td>
                  <td><code>{u.username}</code></td>
                  <td>
                    <span className={`badge badge-role-${u.role.toLowerCase()}`}>
                      {u.role}
                    </span>
                  </td>
                  <td>
                    {u.role === 'STUDENT' && (
                      <span style={{ fontSize: '0.8125rem' }}>
                        Roll: <strong>{u.rollNumber || 'N/A'}</strong> ({u.className || 'General'})
                      </span>
                    )}
                    {u.role === 'FACULTY' && (
                      <span style={{ fontSize: '0.8125rem' }}>
                        Emp: <strong>{u.employeeId || 'N/A'}</strong> ({u.departmentName || 'Dept'})
                      </span>
                    )}
                    {u.role === 'ADMIN' && (
                      <span style={{ fontSize: '0.8125rem', color: 'var(--gray-500)' }}>
                        Institutional Admin
                      </span>
                    )}
                  </td>
                  <td>{u.email}</td>
                  <td>
                    {u.isActive ? (
                      <span className="badge badge-present">
                        <CheckCircle size={12} /> Active
                      </span>
                    ) : (
                      <span className="badge badge-absent">
                        <XCircle size={12} /> Deactivated
                      </span>
                    )}
                  </td>
                  <td>
                    <button
                      onClick={() => handleToggleStatus(u)}
                      className={`btn btn-sm ${u.isActive ? 'btn-secondary' : 'btn-primary'}`}
                      style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem' }}
                    >
                      {u.isActive ? 'Deactivate' : 'Activate'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Register User Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Register Academic User" maxWidth="600px">
        <form onSubmit={handleCreateUser}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Role</label>
              <select
                className="form-select"
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                required
              >
                <option value="STUDENT">Student</option>
                <option value="FACULTY">Faculty</option>
                <option value="ADMIN">Administrator</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Dr. Rajesh Sharma"
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Username</label>
              <input
                type="text"
                className="form-input"
                placeholder="Unique username"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Password</label>
              <input
                type="password"
                className="form-input"
                placeholder="Initial password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input
                type="email"
                className="form-input"
                placeholder="name@institution.edu"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Phone Number</label>
              <input
                type="text"
                className="form-input"
                placeholder="+91 9876543210"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
            </div>
          </div>

          {/* Role specific form sections */}
          {formData.role === 'STUDENT' && (
            <div style={{ marginTop: '0.75rem', padding: '1rem', background: '#f8fafc', borderRadius: 'var(--radius-md)', border: '1px solid var(--gray-200)' }}>
              <h4 style={{ fontSize: '0.875rem', marginBottom: '0.75rem', color: 'var(--primary-700)' }}>Student Profile Details</h4>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.75rem' }}>
                <div>
                  <label className="form-label">Enrolled Class</label>
                  <select
                    className="form-select"
                    value={formData.classId}
                    onChange={(e) => setFormData({ ...formData, classId: e.target.value })}
                    required
                  >
                    <option value="">Select Class</option>
                    {classes.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="form-label">Roll Number</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. 2023CS0106"
                    value={formData.rollNumber}
                    onChange={(e) => setFormData({ ...formData, rollNumber: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <label className="form-label">Registration Number</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. REG-2023-0106"
                    value={formData.registrationNo}
                    onChange={(e) => setFormData({ ...formData, registrationNo: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <label className="form-label">Batch Year</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. 2023-2027"
                    value={formData.batchYear}
                    onChange={(e) => setFormData({ ...formData, batchYear: e.target.value })}
                  />
                </div>
              </div>
            </div>
          )}

          {formData.role === 'FACULTY' && (
            <div style={{ marginTop: '0.75rem', padding: '1rem', background: '#f8fafc', borderRadius: 'var(--radius-md)', border: '1px solid var(--gray-200)' }}>
              <h4 style={{ fontSize: '0.875rem', marginBottom: '0.75rem', color: 'var(--accent-600)' }}>Faculty Profile Details</h4>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.75rem' }}>
                <div>
                  <label className="form-label">Department</label>
                  <select
                    className="form-select"
                    value={formData.departmentId}
                    onChange={(e) => setFormData({ ...formData, departmentId: e.target.value })}
                    required
                  >
                    <option value="">Select Department</option>
                    {departments.map(d => (
                      <option key={d.id} value={d.id}>{d.name} ({d.code})</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="form-label">Employee ID</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. FAC-CSE-005"
                    value={formData.employeeId}
                    onChange={(e) => setFormData({ ...formData, employeeId: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <label className="form-label">Designation</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. Assistant Professor"
                    value={formData.designation}
                    onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                  />
                </div>

                <div>
                  <label className="form-label">Qualification</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. Ph.D / M.Tech"
                    value={formData.qualification}
                    onChange={(e) => setFormData({ ...formData, qualification: e.target.value })}
                  />
                </div>
              </div>
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
            <button type="button" onClick={() => setIsModalOpen(false)} className="btn btn-secondary">
              Cancel
            </button>
            <button type="submit" disabled={submitting} className="btn btn-primary">
              {submitting ? 'Registering...' : 'Register User'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default UserManagement;
