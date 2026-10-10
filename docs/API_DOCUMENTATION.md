# Smart Attendance System (Advanced) - REST API Documentation

This document describes the REST APIs exposed by the Spring Boot backend (`http://localhost:8080/api`).

Interactive OpenAPI / Swagger UI documentation is also available live at:
`http://localhost:8080/swagger-ui.html`

---

## 1. Authentication & Security

All protected endpoints require an HTTP `Authorization` header containing a valid Bearer token:
```http
Authorization: Bearer <jwt-token>
```

### 1.1 Login
- **Endpoint**: `POST /api/auth/login`
- **Access**: Public
- **Request Body**:
```json
{
  "username": "prof.sharma",
  "password": "Faculty@123"
}
```
- **Response (200 OK)**:
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiJ9...",
    "type": "Bearer",
    "id": 2,
    "username": "prof.sharma",
    "email": "rajesh.sharma@institution.edu",
    "fullName": "Dr. Rajesh Sharma",
    "role": "FACULTY",
    "profileId": 1,
    "employeeId": "FAC-CSE-001"
  },
  "timestamp": "2026-10-10T10:15:00"
}
```

### 1.2 Current User Inspection
- **Endpoint**: `GET /api/auth/me`
- **Access**: Authenticated

### 1.3 Logout
- **Endpoint**: `POST /api/auth/logout`
- **Access**: Authenticated

---

## 2. Administration Module (`ROLE_ADMIN`)

### 2.1 Admin Dashboard
- **Endpoint**: `GET /api/admin/dashboard`
- **Response**: Aggregated metrics (total students, faculty, classes, overall attendance %, class-wise breakdown, low attendance watchlist).

### 2.2 List All Users
- **Endpoint**: `GET /api/admin/users`

### 2.3 Create User & Profile
- **Endpoint**: `POST /api/admin/users`
- **Request Body (Student Example)**:
```json
{
  "username": "student.neha",
  "password": "Student@123",
  "email": "neha.gupta@student.edu",
  "fullName": "Neha Gupta",
  "role": "STUDENT",
  "phone": "+91 9876543230",
  "classId": 1,
  "rollNumber": "2023CS0106",
  "registrationNo": "REG-2023-0106",
  "batchYear": "2023-2027"
}
```

### 2.4 Activate / Deactivate User
- **Endpoint**: `PATCH /api/admin/users/{id}/status`
- **Request Body**:
```json
{
  "isActive": false
}
```

### 2.5 Classes & Subjects
- `GET /api/admin/classes`
- `POST /api/admin/classes`
- `GET /api/admin/subjects`
- `POST /api/admin/subjects`
- `GET /api/admin/departments`
- `POST /api/admin/departments`

### 2.6 Assign Faculty to Class & Subject
- **Endpoint**: `POST /api/admin/assign`
- **Request Body**:
```json
{
  "facultyId": 1,
  "subjectId": 2,
  "classId": 1,
  "academicYear": "2025-2026"
}
```

---

## 3. Faculty Module (`ROLE_FACULTY`, `ROLE_ADMIN`)

### 3.1 Faculty Dashboard
- **Endpoint**: `GET /api/faculty/dashboard`
- **Response**: Today's sessions, attendee counts, assigned classes and courses.

### 3.2 Create Attendance Session & Dynamic QR Token
- **Endpoint**: `POST /api/faculty/sessions`
- **Request Body**:
```json
{
  "classId": 1,
  "subjectId": 1,
  "sessionDate": "2026-10-10",
  "startTime": "10:00:00",
  "endTime": "11:00:00",
  "expiryMinutes": 10,
  "topic": "Query Optimization Techniques",
  "allowLate": true
}
```
- **Response**: Returns session object with unpredictable `sessionToken` (encoded into QR), `sessionCode`, and expiration timestamp.

### 3.3 Close Session & Finalize Absences
- **Endpoint**: `POST /api/faculty/sessions/{id}/close`
- **Effect**: Freezes QR token and automatically marks all unscanned students in the enrolled class roster as `ABSENT`.

### 3.4 Live Session Roster
- **Endpoint**: `GET /api/faculty/sessions/{id}/attendance`
- **Response**: Real-time list of all students in class, check-in timestamps, status (PRESENT, LATE, ABSENT, PENDING).

### 3.5 Manual Attendance Correction with Audit Reason
- **Endpoint**: `PUT /api/faculty/attendance`
- **Request Body**:
```json
{
  "sessionId": 1,
  "studentId": 3,
  "status": "PRESENT",
  "reason": "Student presented official department duty slip for symposium participation"
}
```

### 3.6 Attendance Audit Log
- **Endpoint**: `GET /api/faculty/attendance/{recordId}/audit`

---

## 4. Student Module (`ROLE_STUDENT`, `ROLE_ADMIN`)

### 4.1 Student Dashboard
- **Endpoint**: `GET /api/student/dashboard`
- **Response**: Overall percentage, eligible vs attended sessions, warning flags if `< 75%`, course breakdowns.

### 4.2 Submit Scanned QR Token
- **Endpoint**: `POST /api/student/attendance/scan`
- **Request Body**:
```json
{
  "sessionToken": "d748f3e2-9b1a-4c2f-87a1-2b0e9c8f7a6f-a1b2c3d4e5",
  "deviceInfo": "Chrome Mobile / Android 14",
  "ipAddress": "192.168.1.45"
}
```
- **Server Validations**:
  1. Token exists and session is `ACTIVE`.
  2. Session has not expired.
  3. Student is authenticated and enrolled in the class.
  4. Duplicate check: prevents marking attendance more than once.
- **Response (200 OK)**:
```json
{
  "success": true,
  "message": "Attendance verified and marked successfully!",
  "data": {
    "id": 45,
    "sessionId": 9,
    "sessionCode": "SESS-LIVE-TODAY",
    "subjectName": "Advanced Database Systems",
    "status": "PRESENT",
    "markedAt": "2026-10-10T10:05:12",
    "method": "QR_SCAN"
  }
}
```

### 4.3 Full Attendance History
- **Endpoint**: `GET /api/student/attendance`

### 4.4 Subject-Wise Summary
- **Endpoint**: `GET /api/student/attendance/summary`

---

## 5. Reports & Analytics Module (`ROLE_ADMIN`, `ROLE_FACULTY`)

### 5.1 Filtered Attendance Report
- **Endpoint**: `GET /api/reports/attendance`
- **Query Parameters**:
  - `classId` (optional, Long)
  - `subjectId` (optional, Long)
  - `studentId` (optional, Long)
  - `startDate` (optional, YYYY-MM-DD)
  - `endDate` (optional, YYYY-MM-DD)
  - `status` (optional, PRESENT / LATE / ABSENT)

### 5.2 Export Downloadable CSV
- **Endpoint**: `GET /api/reports/attendance/export`
- **Query Parameters**: Same as 5.1.
- **Content-Type**: `text/csv`

### 5.3 Institutional Telemetry & Trends
- **Endpoint**: `GET /api/analytics/overview`
- **Response**: Daily progression lines, class comparisons, subject averages, status distribution.

### 5.4 Low-Attendance Risk Watchlist
- **Endpoint**: `GET /api/analytics/low-attendance?threshold=75.0`

---

## 6. HTTP Status Code Conventions
- `200 OK`: Request succeeded.
- `201 CREATED`: Resource created successfully.
- `400 BAD REQUEST`: Invalid input, validation error, expired QR code, or unenrolled student.
- `401 UNAUTHORIZED`: Missing or invalid credentials / expired token.
- `403 FORBIDDEN`: Insufficient role permissions.
- `404 NOT FOUND`: Target entity not found.
- `409 CONFLICT`: Duplicate check-in attempt for the same session.
- `500 INTERNAL SERVER ERROR`: Unexpected server exception.
