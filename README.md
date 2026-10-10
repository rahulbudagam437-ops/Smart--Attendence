# Smart Attendance System (Advanced)
### College Major Project • Full-Stack Web Application

A full-stack, enterprise-grade **Smart Attendance System** engineered for colleges, universities, and academic institutions. Features cryptographically dynamic QR code attendance sessions, real-time classroom check-in telemetry, role-based dashboards (Admin, Faculty, Student), audit logging for manual corrections, printable reports, CSV exports, and analytics visualizations.

---

## 1. Technology Stack

- **Frontend**:
  - **React 18** & **Vite 5** for blazing fast single-page client rendering.
  - **React Router v6** for protected, role-based client routing.
  - **Axios** with JWT request & 401 response interceptors.
  - **Recharts** for institutional, class-wise, and subject attendance analytics.
  - **qrcode.react** (`QRCodeSVG`) for high-resolution dynamic QR code broadcasting.
  - **html5-qrcode** for real-time mobile & browser camera video scanning.
  - **Lucide React** for modern academic icons.
  - Custom responsive CSS with academic navy-blue and indigo palette.

- **Backend**:
  - **Java 17 / 23** LTS.
  - **Spring Boot 3.3.4** (Spring Web, Spring Data JPA, Spring Security 6, Bean Validation).
  - **Stateless JWT Authentication** with HMAC-SHA256 (`io.jsonwebtoken 0.12.6`).
  - **BCrypt Password Hashing** (10 salt rounds).
  - **Centralized Exception Handling** & standard `ApiResponse<T>` envelope.
  - **Swagger / OpenAPI 3.0** interactive documentation at `/swagger-ui.html`.

- **Database**:
  - **MySQL 8.x** relational schema with strict foreign keys, composite unique constraints, indexing, and referential integrity.
  - **H2 in-memory DB (MySQL Mode)** included as default local dev profile for instant evaluation without external database configuration.

---

## 2. Project Directory Structure

```
TT PROJECT/
├── backend/
│   ├── src/
│   │   ├── main/
│   │   │   ├── java/com/smartattendance/
│   │   │   │   ├── config/              # SecurityConfig, CorsConfig, OpenApiConfig, DataInitializer
│   │   │   │   ├── controller/          # Auth, Admin, Faculty, Student, Report, Analytics controllers
│   │   │   │   ├── dto/                 # Request & Response Data Transfer Objects
│   │   │   │   ├── entity/              # 12 Relational JPA Entities & Enums
│   │   │   │   ├── exception/           # GlobalExceptionHandler & custom exceptions
│   │   │   │   ├── repository/          # 12 Spring Data JPA Repositories
│   │   │   │   ├── security/            # JwtTokenProvider, JwtAuthenticationFilter, UserPrincipal
│   │   │   │   ├── service/             # Business logic & attendance calculation services
│   │   │   │   └── SmartAttendanceApplication.java
│   │   │   └── resources/
│   │   │       ├── application.properties
│   │   │       ├── application-dev.properties
│   │   │       └── application-mysql.properties
│   │   └── test/
│   │       └── java/com/smartattendance/
│   │           └── AttendanceWorkflowTests.java  # 10 comprehensive integration tests
│   └── pom.xml
│
├── frontend/
│   ├── src/
│   │   ├── components/                  # Navbar, Sidebar, Modal, Toast, LoadingSpinner, StatCard
│   │   ├── context/                     # AuthContext (JWT management & session state)
│   │   ├── layouts/                     # DashboardLayout with responsive sidebar & topbar
│   │   ├── pages/
│   │   │   ├── admin/                   # AdminDashboard, UserManagement, AcademicSetup, Reports, Analytics
│   │   │   ├── faculty/                 # FacultyDashboard, CreateSession, LiveSessionQR, ManualAttendance
│   │   │   ├── student/                 # StudentDashboard, QRScanner, History, Subjects, Profile
│   │   │   ├── Login.jsx                # Login page with 1-click college demonstration quick-fill
│   │   │   ├── Unauthorized.jsx
│   │   │   └── NotFound.jsx
│   │   ├── services/                    # Axios API client & endpoints
│   │   ├── App.jsx                      # Protected route definitions
│   │   ├── index.css                    # Professional academic styling
│   │   └── main.jsx
│   ├── package.json
│   ├── vite.config.js
│   └── index.html
│
├── database/
│   ├── schema.sql                       # Production MySQL 8.x DDL with constraints & indexes
│   └── seed.sql                         # Demonstration seed script with fictional academic data
│
├── docs/
│   └── API_DOCUMENTATION.md             # REST API specifications and contract documentation
└── README.md
```

---

## 3. Demonstration Credentials

All demo accounts are pre-populated on application startup with fictional, non-personal records:

| Role | Username | Password | Full Name & Details |
| :--- | :--- | :--- | :--- |
| **ADMIN** | `admin` | `Admin@123` | System Administrator |
| **FACULTY** | `prof.sharma` | `Faculty@123` | Dr. Rajesh Sharma (Head of CSE) |
| **FACULTY** | `dr.anita` | `Faculty@123` | Dr. Anita Rao (Associate Professor) |
| **STUDENT** | `student.aarav` | `Student@123` | Aarav Patel (Roll: 2023CS0101 • 100% attendance) |
| **STUDENT** | `student.diya` | `Student@123` | Diya Sharma (Roll: 2023CS0102 • 100% attendance) |
| **STUDENT** | `student.rohan` | `Student@123` | Rohan Verma (Roll: 2023CS0103 • 71% attendance) |
| **STUDENT** | `student.priya` | `Student@123` | Priya Nair (Roll: 2023CS0104 • 85% attendance) |
| **STUDENT** | `student.vikram` | `Student@123` | Vikram Singh (Roll: 2023CS0105 • **28% Low Attendance Flagged**) |

*Note: The login page includes 1-click demo buttons to automatically populate credentials for immediate testing.*

---

## 4. How to Run Locally

### Option A: Rapid Demonstration Mode (Recommended for instant testing)
The application defaults to the `dev` profile using an in-memory database with MySQL compatibility mode. It initializes all tables, entities, relationships, historical sessions, and demonstration accounts automatically upon launch without requiring MySQL server setup.

1. **Start the Backend**:
   ```bash
   cd backend
   mvn spring-boot:run
   ```
   *(Or using the installed local Maven)*:
   ```cmd
   C:\Users\rahul\.m2\maven\bin\mvn.cmd spring-boot:run
   ```
   The backend will start at `http://localhost:8080`.
   - API Docs: `http://localhost:8080/swagger-ui.html`
   - In-memory DB Console: `http://localhost:8080/h2-console` (JDBC URL: `jdbc:h2:mem:smart_attendance`, user: `sa`, password: blank)

2. **Start the Frontend**:
   Open a separate terminal window:
   ```bash
   cd frontend
   npm run dev
   ```
   The frontend will be available at `http://localhost:5173`.

---

### Option B: MySQL 8.x Production Setup

1. **Start MySQL 8.x** on your computer.
2. **Execute the Database Scripts**:
   ```bash
   mysql -u root -p < database/schema.sql
   mysql -u root -p < database/seed.sql
   ```
3. **Configure Environment Variables** (or edit `backend/src/main/resources/application-mysql.properties`):
   ```bash
   export DB_HOST=localhost
   export DB_PORT=3306
   export DB_NAME=smart_attendance
   export DB_USER=root
   export DB_PASSWORD=your_mysql_password
   export JWT_SECRET=4c8a9f6e3d2b1a0f9e8d7c6b5a4f3e2d1c0b9a8f7e6d5c4b3a2f1e0d9c8b7a6f
   ```
4. **Run Spring Boot with MySQL Profile**:
   ```bash
   cd backend
   mvn spring-boot:run -Dspring-boot.run.profiles=mysql
   ```
5. **Run Frontend**:
   ```bash
   cd frontend
   npm run dev
   ```

---

## 5. QR Code Attendance Workflow

1. **Session Creation**:
   - Faculty selects assigned class (e.g., *B.Tech CSE - Year 3 - Sec A*) and subject (e.g., *CS601 - Advanced Database Systems*).
   - Faculty sets lecture topic, scheduled hours, and QR expiration timer (e.g., 10 minutes).
2. **Cryptographic Token Broadcast**:
   - The server creates an `AttendanceSession` record with an unpredictable UUID + secure random hex token.
   - The faculty screen displays the dynamic QR code along with a live, real-time seconds countdown timer.
3. **Student Camera Check-In**:
   - Student logs in and navigates to **Scan Attendance QR**.
   - Student grants browser camera permission, centers the projected QR code in the viewfinder, or pastes the token if camera access is restricted.
4. **Server-Side Validation**:
   - The backend validates that the session token exists and is in `ACTIVE` status.
   - The backend verifies that `LocalDateTime.now()` is before `session.expiresAt`.
   - The backend checks that the authenticated student is officially enrolled in the class.
   - The backend checks composite unique constraints to guarantee that duplicate check-ins are rejected.
5. **Session Closure & Absence Finalization**:
   - When the session expires or faculty clicks **Close Session**, all unscanned enrolled students in the roster are automatically finalized as **ABSENT**.

---

## 6. Calculation Formulas & Business Rules

### Attendance Percentage Formula
$$\text{Attendance Percentage} = \left(\frac{\text{Sessions Attended}}{\text{Eligible Finalized Sessions}}\right) \times 100$$

- **Eligible Sessions**: Finalized (`CLOSED`) sessions for the student's enrolled class. Cancelled sessions are strictly excluded.
- **Sessions Attended**: Total sessions marked as `PRESENT` or `LATE` (when late attendance is recognized by policy).
- **Zero Denominator Protection**: If eligible sessions equal zero, the system returns `0.0%` without producing `NaN` or `Infinity`.
- **Institutional Threshold**: Configured at **75%**. Any student below 75% is flagged on Admin and Faculty dashboards, and shown a high-priority warning banner on the student portal.

---

## 7. Automated Testing & Verification

The backend includes a comprehensive JUnit 5 integration test suite in `AttendanceWorkflowTests.java`:
- Login authentication (success and bad credentials).
- Role-based route protection (`ROLE_ADMIN`, `ROLE_FACULTY`, `ROLE_STUDENT`).
- Student isolation (students cannot view other students' records or modify data).
- Session generation and unpredictable token creation.
- Successful QR check-in flow.
- Duplicate attendance rejection (409 Conflict).
- Invalid token rejection (400 Bad Request).
- Expired session rejection (400 Bad Request).
- Institution-wide reports and CSV stream export.
- Statistical calculation verification.
- Manual attendance correction with audit history logging.

Run tests:
```bash
cd backend
mvn test
```
*(All 10 integration tests execute and pass out-of-the-box).*

---

## 8. License & Academic Disclaimer
Built for college major project demonstrations and educational software evaluations. All student and faculty data in the seed script are fictional.
