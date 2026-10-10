package com.smartattendance.config;

import com.smartattendance.entity.*;
import com.smartattendance.repository.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;

@Component
public class DataInitializer implements CommandLineRunner {

    private static final Logger logger = LoggerFactory.getLogger(DataInitializer.class);

    private final UserRepository userRepository;
    private final DepartmentRepository departmentRepository;
    private final AcademicClassRepository classRepository;
    private final SubjectRepository subjectRepository;
    private final FacultyRepository facultyRepository;
    private final StudentRepository studentRepository;
    private final StudentClassEnrollmentRepository enrollmentRepository;
    private final FacultySubjectAssignmentRepository assignmentRepository;
    private final AttendanceSessionRepository sessionRepository;
    private final AttendanceRecordRepository recordRepository;
    private final AttendanceAuditLogRepository auditLogRepository;
    private final AcademicSettingRepository settingRepository;
    private final PasswordEncoder passwordEncoder;

    public DataInitializer(UserRepository userRepository,
                           DepartmentRepository departmentRepository,
                           AcademicClassRepository classRepository,
                           SubjectRepository subjectRepository,
                           FacultyRepository facultyRepository,
                           StudentRepository studentRepository,
                           StudentClassEnrollmentRepository enrollmentRepository,
                           FacultySubjectAssignmentRepository assignmentRepository,
                           AttendanceSessionRepository sessionRepository,
                           AttendanceRecordRepository recordRepository,
                           AttendanceAuditLogRepository auditLogRepository,
                           AcademicSettingRepository settingRepository,
                           PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.departmentRepository = departmentRepository;
        this.classRepository = classRepository;
        this.subjectRepository = subjectRepository;
        this.facultyRepository = facultyRepository;
        this.studentRepository = studentRepository;
        this.enrollmentRepository = enrollmentRepository;
        this.assignmentRepository = assignmentRepository;
        this.sessionRepository = sessionRepository;
        this.recordRepository = recordRepository;
        this.auditLogRepository = auditLogRepository;
        this.settingRepository = settingRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    @Transactional
    public void run(String... args) {
        if (userRepository.count() > 0) {
            logger.info("Database already initialized. Skipping seed data insertion.");
            return;
        }

        logger.info("Initializing Smart Attendance System default demonstration data...");

        // 1. Settings
        settingRepository.save(new AcademicSetting("LOW_ATTENDANCE_THRESHOLD", "75", "Minimum attendance percentage threshold"));
        settingRepository.save(new AcademicSetting("QR_EXPIRY_MINUTES_DEFAULT", "10", "Default session expiry in minutes"));
        settingRepository.save(new AcademicSetting("ALLOW_LATE_ATTENDANCE", "true", "Whether late marks count towards presence"));

        // 2. Departments
        Department cse = departmentRepository.save(new Department("CSE", "Computer Science and Engineering", "Department of Computer Science & Engineering"));
        Department ece = departmentRepository.save(new Department("ECE", "Electronics and Communication Engineering", "Department of Electronics & Communication"));

        // 3. Classes
        AcademicClass classA = classRepository.save(new AcademicClass("B.Tech CSE - Year 3 - Sec A", cse, "A", 6, "2025-2026"));
        AcademicClass classB = classRepository.save(new AcademicClass("B.Tech CSE - Year 3 - Sec B", cse, "B", 6, "2025-2026"));
        AcademicClass classEce = classRepository.save(new AcademicClass("B.Tech ECE - Year 2 - Sec A", ece, "A", 4, "2025-2026"));

        // 4. Subjects
        Subject dbms = subjectRepository.save(new Subject("CS601", "Advanced Database Systems", cse, 4));
        Subject cloud = subjectRepository.save(new Subject("CS602", "Cloud Computing & DevOps", cse, 3));
        Subject ai = subjectRepository.save(new Subject("CS603", "Machine Learning & AI", cse, 4));
        Subject se = subjectRepository.save(new Subject("CS604", "Software Engineering & Testing", cse, 3));

        // 5. Users
        String encAdminPass = passwordEncoder.encode("Admin@123");
        String encFacultyPass = passwordEncoder.encode("Faculty@123");
        String encStudentPass = passwordEncoder.encode("Student@123");

        // Admin User
        User adminUser = userRepository.save(new User("admin", encAdminPass, "admin@institution.edu", "System Administrator", Role.ADMIN, "+91 9876543210"));

        // Faculty Users & Profiles
        User fac1User = userRepository.save(new User("prof.sharma", encFacultyPass, "rajesh.sharma@institution.edu", "Dr. Rajesh Sharma", Role.FACULTY, "+91 9876543211"));
        Faculty fac1 = facultyRepository.save(new Faculty(fac1User, "FAC-CSE-001", cse, "Professor & Head", "Ph.D in Computer Science"));

        User fac2User = userRepository.save(new User("dr.anita", encFacultyPass, "anita.rao@institution.edu", "Dr. Anita Rao", Role.FACULTY, "+91 9876543212"));
        Faculty fac2 = facultyRepository.save(new Faculty(fac2User, "FAC-CSE-002", cse, "Associate Professor", "Ph.D in Information Systems"));

        // Faculty Assignments
        assignmentRepository.save(new FacultySubjectAssignment(fac1, dbms, classA, "2025-2026"));
        assignmentRepository.save(new FacultySubjectAssignment(fac1, ai, classA, "2025-2026"));
        assignmentRepository.save(new FacultySubjectAssignment(fac2, cloud, classA, "2025-2026"));
        assignmentRepository.save(new FacultySubjectAssignment(fac2, se, classA, "2025-2026"));

        // Student Users & Profiles
        User stu1User = userRepository.save(new User("student.aarav", encStudentPass, "aarav.patel@student.edu", "Aarav Patel", Role.STUDENT, "+91 9876543220"));
        Student stu1 = studentRepository.save(new Student(stu1User, "2023CS0101", "REG-2023-0101", classA, cse, "2023-2027"));
        enrollmentRepository.save(new StudentClassEnrollment(stu1, classA, "2025-2026"));

        User stu2User = userRepository.save(new User("student.diya", encStudentPass, "diya.sharma@student.edu", "Diya Sharma", Role.STUDENT, "+91 9876543221"));
        Student stu2 = studentRepository.save(new Student(stu2User, "2023CS0102", "REG-2023-0102", classA, cse, "2023-2027"));
        enrollmentRepository.save(new StudentClassEnrollment(stu2, classA, "2025-2026"));

        User stu3User = userRepository.save(new User("student.rohan", encStudentPass, "rohan.verma@student.edu", "Rohan Verma", Role.STUDENT, "+91 9876543222"));
        Student stu3 = studentRepository.save(new Student(stu3User, "2023CS0103", "REG-2023-0103", classA, cse, "2023-2027"));
        enrollmentRepository.save(new StudentClassEnrollment(stu3, classA, "2025-2026"));

        User stu4User = userRepository.save(new User("student.priya", encStudentPass, "priya.nair@student.edu", "Priya Nair", Role.STUDENT, "+91 9876543223"));
        Student stu4 = studentRepository.save(new Student(stu4User, "2023CS0104", "REG-2023-0104", classA, cse, "2023-2027"));
        enrollmentRepository.save(new StudentClassEnrollment(stu4, classA, "2025-2026"));

        User stu5User = userRepository.save(new User("student.vikram", encStudentPass, "vikram.singh@student.edu", "Vikram Singh", Role.STUDENT, "+91 9876543224"));
        Student stu5 = studentRepository.save(new Student(stu5User, "2023CS0105", "REG-2023-0105", classA, cse, "2023-2027"));
        enrollmentRepository.save(new StudentClassEnrollment(stu5, classA, "2025-2026"));

        List<Student> students = List.of(stu1, stu2, stu3, stu4, stu5);

        // 6. Historical Attendance Sessions (Closed)
        LocalDate d1 = LocalDate.now().minusDays(7);
        LocalDate d2 = LocalDate.now().minusDays(6);
        LocalDate d3 = LocalDate.now().minusDays(5);
        LocalDate d4 = LocalDate.now().minusDays(4);
        LocalDate d5 = LocalDate.now().minusDays(3);
        LocalDate d6 = LocalDate.now().minusDays(2);
        LocalDate d7 = LocalDate.now().minusDays(1);

        AttendanceSession sess1 = createClosedSession("SESS-001", "tok-001", fac1, dbms, classA, d1, "Indexing & B-Trees in RDBMS");
        AttendanceSession sess2 = createClosedSession("SESS-002", "tok-002", fac1, dbms, classA, d2, "Query Optimization & Cost Analysis");
        AttendanceSession sess3 = createClosedSession("SESS-003", "tok-003", fac2, cloud, classA, d3, "Docker Container Architecture");
        AttendanceSession sess4 = createClosedSession("SESS-004", "tok-004", fac2, cloud, classA, d4, "Kubernetes Pods & Services");
        AttendanceSession sess5 = createClosedSession("SESS-005", "tok-005", fac1, ai, classA, d5, "Supervised Learning & Gradient Descent");
        AttendanceSession sess6 = createClosedSession("SESS-006", "tok-006", fac1, ai, classA, d6, "Convolutional Neural Networks");
        AttendanceSession sess7 = createClosedSession("SESS-007", "tok-007", fac2, se, classA, d7, "Agile Scrum & Sprint Planning");

        // Populate Records for Session 1 to 7
        // Stu1: 100% Present
        // Stu2: 100% Present
        // Stu3: ~71% Present
        // Stu4: ~85% Present
        // Stu5: ~28% Present (Low Attendance < 75%)
        List<AttendanceSession> closedSessions = List.of(sess1, sess2, sess3, sess4, sess5, sess6, sess7);

        for (int i = 0; i < closedSessions.size(); i++) {
            AttendanceSession sess = closedSessions.get(i);
            LocalDateTime markedTime = sess.getSessionDate().atTime(9, 5 + i);

            // Stu1 always PRESENT
            recordRepository.save(new AttendanceRecord(sess, stu1, AttendanceStatus.PRESENT, MarkingMethod.QR_SCAN, "192.168.1.10", "Android Chrome", "Verified"));

            // Stu2 always PRESENT
            recordRepository.save(new AttendanceRecord(sess, stu2, AttendanceStatus.PRESENT, MarkingMethod.QR_SCAN, "192.168.1.11", "iOS Safari", "Verified"));

            // Stu3 absent in session 2 and 5
            AttendanceStatus s3Status = (i == 1 || i == 4) ? AttendanceStatus.ABSENT : AttendanceStatus.PRESENT;
            recordRepository.save(new AttendanceRecord(sess, stu3, s3Status, s3Status == AttendanceStatus.PRESENT ? MarkingMethod.QR_SCAN : MarkingMethod.MANUAL_FACULTY, "192.168.1.12", "Android Chrome", null));

            // Stu4 absent in session 3
            AttendanceStatus s4Status = (i == 2) ? AttendanceStatus.ABSENT : AttendanceStatus.PRESENT;
            recordRepository.save(new AttendanceRecord(sess, stu4, s4Status, s4Status == AttendanceStatus.PRESENT ? MarkingMethod.QR_SCAN : MarkingMethod.MANUAL_FACULTY, "192.168.1.13", "Windows Chrome", null));

            // Stu5 only present in session 4 and 7 (Late in 4)
            AttendanceStatus s5Status;
            if (i == 3) s5Status = AttendanceStatus.LATE;
            else if (i == 6) s5Status = AttendanceStatus.PRESENT;
            else s5Status = AttendanceStatus.ABSENT;

            AttendanceRecord r5 = recordRepository.save(new AttendanceRecord(sess, stu5, s5Status, MarkingMethod.MANUAL_FACULTY, "192.168.1.14", "Android Chrome", null));

            if (i == 3) {
                // Add Audit Log
                auditLogRepository.save(new AttendanceAuditLog(r5, fac2User, "ABSENT", "LATE", "Student arrived late due to bus breakdown; approved by HOD"));
            }
        }

        // 7. Active Demonstration Session for Today!
        AttendanceSession liveSession = new AttendanceSession(
                "SESS-LIVE-TODAY",
                "DEMO-ACTIVE-TOKEN-2026",
                fac1,
                dbms,
                classA,
                LocalDate.now(),
                LocalTime.now().minusMinutes(5),
                LocalTime.now().plusMinutes(55),
                LocalDateTime.now().plusHours(2), // Active for testing
                "Transactions & ACID Properties in Distributed Databases",
                true
        );
        liveSession.setStatus(SessionStatus.ACTIVE);
        sessionRepository.save(liveSession);

        logger.info("Smart Attendance System default demonstration data successfully initialized!");
    }

    private AttendanceSession createClosedSession(String code, String token, Faculty faculty, Subject subject,
                                                  AcademicClass academicClass, LocalDate date, String topic) {
        AttendanceSession s = new AttendanceSession(
                code,
                token,
                faculty,
                subject,
                academicClass,
                date,
                LocalTime.of(9, 0),
                LocalTime.of(10, 0),
                date.atTime(10, 0),
                topic,
                true
        );
        s.setStatus(SessionStatus.CLOSED);
        return sessionRepository.save(s);
    }
}
