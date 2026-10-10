import api from './api';

export const adminService = {
  getDashboard: async () => {
    const res = await api.get('/admin/dashboard');
    return res.data;
  },

  getUsers: async () => {
    const res = await api.get('/admin/users');
    return res.data;
  },

  createUser: async (userData) => {
    const res = await api.post('/admin/users', userData);
    return res.data;
  },

  updateUserStatus: async (userId, isActive) => {
    const res = await api.patch(`/admin/users/${userId}/status`, { isActive });
    return res.data;
  },

  getClasses: async () => {
    const res = await api.get('/admin/classes');
    return res.data;
  },

  createClass: async (classData) => {
    const res = await api.post('/admin/classes', classData);
    return res.data;
  },

  getSubjects: async () => {
    const res = await api.get('/admin/subjects');
    return res.data;
  },

  createSubject: async (subjectData) => {
    const res = await api.post('/admin/subjects', subjectData);
    return res.data;
  },

  getDepartments: async () => {
    const res = await api.get('/admin/departments');
    return res.data;
  },

  createDepartment: async (deptData) => {
    const res = await api.post('/admin/departments', deptData);
    return res.data;
  },

  assignFaculty: async (assignmentData) => {
    const res = await api.post('/admin/assign', assignmentData);
    return res.data;
  }
};

export const facultyService = {
  getDashboard: async () => {
    const res = await api.get('/faculty/dashboard');
    return res.data;
  },

  getClasses: async () => {
    const res = await api.get('/faculty/classes');
    return res.data;
  },

  getSubjects: async () => {
    const res = await api.get('/faculty/subjects');
    return res.data;
  },

  createSession: async (sessionData) => {
    const res = await api.post('/faculty/sessions', sessionData);
    return res.data;
  },

  getSessions: async () => {
    const res = await api.get('/faculty/sessions');
    return res.data;
  },

  getSessionDetails: async (sessionId) => {
    const res = await api.get(`/faculty/sessions/${sessionId}`);
    return res.data;
  },

  closeSession: async (sessionId) => {
    const res = await api.post(`/faculty/sessions/${sessionId}/close`);
    return res.data;
  },

  getSessionAttendance: async (sessionId) => {
    const res = await api.get(`/faculty/sessions/${sessionId}/attendance`);
    return res.data;
  },

  manualMarkAttendance: async (data) => {
    const res = await api.put('/faculty/attendance', data);
    return res.data;
  },

  getAuditLogs: async (recordId) => {
    const res = await api.get(`/faculty/attendance/${recordId}/audit`);
    return res.data;
  }
};

export const studentService = {
  getDashboard: async () => {
    const res = await api.get('/student/dashboard');
    return res.data;
  },

  getAttendanceHistory: async () => {
    const res = await api.get('/student/attendance');
    return res.data;
  },

  getSubjectSummary: async () => {
    const res = await api.get('/student/attendance/summary');
    return res.data;
  },

  scanAttendance: async (sessionToken) => {
    const res = await api.post('/student/attendance/scan', { sessionToken });
    return res.data;
  }
};

export const reportService = {
  getAttendanceReport: async (params) => {
    const res = await api.get('/reports/attendance', { params });
    return res.data;
  },

  exportAttendanceCsv: async (params) => {
    const res = await api.get('/reports/attendance/export', {
      params,
      responseType: 'blob'
    });
    return res.data;
  }
};

export const analyticsService = {
  getOverview: async () => {
    const res = await api.get('/analytics/overview');
    return res.data;
  },

  getLowAttendance: async (threshold = 75.0) => {
    const res = await api.get('/analytics/low-attendance', { params: { threshold } });
    return res.data;
  }
};
