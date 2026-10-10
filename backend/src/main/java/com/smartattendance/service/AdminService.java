package com.smartattendance.service;

import com.smartattendance.dto.*;
import com.smartattendance.entity.*;
import com.smartattendance.exception.BadRequestException;
import com.smartattendance.exception.ResourceNotFoundException;
import com.smartattendance.repository.*;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class AdminService {

    private final UserRepository userRepository;
    private final FacultyRepository facultyRepository;
    private final StudentRepository studentRepository;
    private final DepartmentRepository departmentRepository;
    private final AcademicClassRepository classRepository;
    private final SubjectRepository subjectRepository;
    private final StudentClassEnrollmentRepository enrollmentRepository;
    private final FacultySubjectAssignmentRepository assignmentRepository;
    private final AttendanceSessionRepository sessionRepository;
    private final AttendanceRecordRepository recordRepository;
    private final PasswordEncoder passwordEncoder;

    public AdminService(UserRepository userRepository,
                        FacultyRepository facultyRepository,
                        StudentRepository studentRepository,
                        DepartmentRepository departmentRepository,
                        AcademicClassRepository classRepository,
                        SubjectRepository subjectRepository,
                        StudentClassEnrollmentRepository enrollmentRepository,
                        FacultySubjectAssignmentRepository assignmentRepository,
                        AttendanceSessionRepository sessionRepository,
                        AttendanceRecordRepository recordRepository,
                        PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.facultyRepository = facultyRepository;
        this.studentRepository = studentRepository;
        this.departmentRepository = departmentRepository;
        this.classRepository = classRepository;
        this.subjectRepository = subjectRepository;
        this.enrollmentRepository = enrollmentRepository;
        this.assignmentRepository = assignmentRepository;
        this.sessionRepository = sessionRepository;
        this.recordRepository = recordRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Transactional(readOnly = true)
    public List<UserDto> getAllUsers() {
        return userRepository.findAll().stream().map(this::mapToUserDto).collect(Collectors.toList());
    }

    @Transactional
    public UserDto createUser(CreateUserRequest request) {
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new BadRequestException("Username already exists: " + request.getUsername());
        }
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new BadRequestException("Email already exists: " + request.getEmail());
        }

        User user = new User();
        user.setUsername(request.getUsername());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setEmail(request.getEmail());
        user.setFullName(request.getFullName());
        user.setRole(request.getRole());
        user.setPhone(request.getPhone());
        user.setIsActive(true);
        user = userRepository.save(user);

        if (request.getRole() == Role.FACULTY) {
            if (request.getDepartmentId() == null) {
                throw new BadRequestException("Department is required for faculty creation");
            }
            if (facultyRepository.existsByEmployeeId(request.getEmployeeId())) {
                throw new BadRequestException("Employee ID already exists: " + request.getEmployeeId());
            }
            Department dept = departmentRepository.findById(request.getDepartmentId())
                    .orElseThrow(() -> new ResourceNotFoundException("Department not found with ID: " + request.getDepartmentId()));

            Faculty faculty = new Faculty(user, request.getEmployeeId(), dept, request.getDesignation(), request.getQualification());
            facultyRepository.save(faculty);

        } else if (request.getRole() == Role.STUDENT) {
            if (request.getClassId() == null) {
                throw new BadRequestException("Class is required for student creation");
            }
            if (studentRepository.existsByRollNumber(request.getRollNumber())) {
                throw new BadRequestException("Roll Number already exists: " + request.getRollNumber());
            }
            AcademicClass academicClass = classRepository.findById(request.getClassId())
                    .orElseThrow(() -> new ResourceNotFoundException("Class not found with ID: " + request.getClassId()));

            Department dept = academicClass.getDepartment();
            Student student = new Student(user, request.getRollNumber(), request.getRegistrationNo(), academicClass, dept, request.getBatchYear());
            student = studentRepository.save(student);

            StudentClassEnrollment enrollment = new StudentClassEnrollment(student, academicClass, academicClass.getAcademicYear());
            enrollmentRepository.save(enrollment);
        }

        return mapToUserDto(user);
    }

    @Transactional
    public UserDto updateUserStatus(Long userId, Boolean isActive) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with ID: " + userId));

        user.setIsActive(isActive);
        user = userRepository.save(user);
        return mapToUserDto(user);
    }

    @Transactional(readOnly = true)
    public List<AcademicClassDto> getAllClasses() {
        return classRepository.findAll().stream().map(c -> {
            AcademicClassDto dto = new AcademicClassDto();
            dto.setId(c.getId());
            dto.setName(c.getName());
            dto.setDepartmentId(c.getDepartment().getId());
            dto.setDepartmentName(c.getDepartment().getName());
            dto.setSection(c.getSection());
            dto.setSemester(c.getSemester());
            dto.setAcademicYear(c.getAcademicYear());
            dto.setIsActive(c.getIsActive());
            dto.setStudentCount(studentRepository.findByAcademicClassId(c.getId()).size());
            return dto;
        }).collect(Collectors.toList());
    }

    @Transactional
    public AcademicClassDto createClass(AcademicClassDto dto) {
        Department dept = departmentRepository.findById(dto.getDepartmentId())
                .orElseThrow(() -> new ResourceNotFoundException("Department not found with ID: " + dto.getDepartmentId()));

        AcademicClass academicClass = new AcademicClass(dto.getName(), dept, dto.getSection(), dto.getSemester(), dto.getAcademicYear());
        academicClass = classRepository.save(academicClass);

        dto.setId(academicClass.getId());
        dto.setDepartmentName(dept.getName());
        return dto;
    }

    @Transactional(readOnly = true)
    public List<SubjectDto> getAllSubjects() {
        return subjectRepository.findAll().stream().map(s -> {
            SubjectDto dto = new SubjectDto();
            dto.setId(s.getId());
            dto.setCode(s.getCode());
            dto.setName(s.getName());
            dto.setDepartmentId(s.getDepartment().getId());
            dto.setDepartmentName(s.getDepartment().getName());
            dto.setCredits(s.getCredits());
            dto.setIsActive(s.getIsActive());
            return dto;
        }).collect(Collectors.toList());
    }

    @Transactional
    public SubjectDto createSubject(SubjectDto dto) {
        if (subjectRepository.existsByCode(dto.getCode())) {
            throw new BadRequestException("Subject code already exists: " + dto.getCode());
        }
        Department dept = departmentRepository.findById(dto.getDepartmentId())
                .orElseThrow(() -> new ResourceNotFoundException("Department not found with ID: " + dto.getDepartmentId()));

        Subject subject = new Subject(dto.getCode(), dto.getName(), dept, dto.getCredits());
        subject = subjectRepository.save(subject);

        dto.setId(subject.getId());
        dto.setDepartmentName(dept.getName());
        return dto;
    }

    @Transactional(readOnly = true)
    public List<DepartmentDto> getAllDepartments() {
        return departmentRepository.findAll().stream().map(d ->
                new DepartmentDto(d.getId(), d.getCode(), d.getName(), d.getDescription())
        ).collect(Collectors.toList());
    }

    @Transactional
    public DepartmentDto createDepartment(DepartmentDto dto) {
        if (departmentRepository.existsByCode(dto.getCode())) {
            throw new BadRequestException("Department code already exists: " + dto.getCode());
        }
        Department department = new Department(dto.getCode(), dto.getName(), dto.getDescription());
        department = departmentRepository.save(department);
        dto.setId(department.getId());
        return dto;
    }

    @Transactional
    public void assignFaculty(Long facultyId, Long subjectId, Long classId, String academicYear) {
        Faculty faculty = facultyRepository.findById(facultyId)
                .orElseThrow(() -> new ResourceNotFoundException("Faculty not found with ID: " + facultyId));
        Subject subject = subjectRepository.findById(subjectId)
                .orElseThrow(() -> new ResourceNotFoundException("Subject not found with ID: " + subjectId));
        AcademicClass academicClass = classRepository.findById(classId)
                .orElseThrow(() -> new ResourceNotFoundException("Class not found with ID: " + classId));

        if (assignmentRepository.existsByFacultyIdAndSubjectIdAndAcademicClassId(facultyId, subjectId, classId)) {
            throw new BadRequestException("Assignment already exists for this faculty, subject, and class");
        }

        FacultySubjectAssignment assignment = new FacultySubjectAssignment(faculty, subject, academicClass, academicYear);
        assignmentRepository.save(assignment);
    }

    @Transactional(readOnly = true)
    public AdminDashboardDto getAdminDashboard() {
        AdminDashboardDto dashboard = new AdminDashboardDto();
        dashboard.setTotalStudents(studentRepository.count());
        dashboard.setTotalFaculty(facultyRepository.count());
        dashboard.setTotalClasses(classRepository.count());
        dashboard.setTotalSubjects(subjectRepository.count());

        List<AttendanceSession> sessions = sessionRepository.findAll();
        dashboard.setTotalSessionsConducted(sessions.size());

        List<AttendanceRecord> records = recordRepository.findAll();
        long presentCount = records.stream().filter(r -> r.getStatus() == AttendanceStatus.PRESENT || r.getStatus() == AttendanceStatus.LATE).count();
        double overallPercentage = records.isEmpty() ? 0.0 : Math.round((presentCount * 100.0 / records.size()) * 10.0) / 10.0;
        dashboard.setOverallAttendancePercentage(overallPercentage);

        // Low attendance students (below 75%)
        List<LowAttendanceStudentDto> lowAttendance = new ArrayList<>();
        List<Student> allStudents = studentRepository.findAll();
        for (Student student : allStudents) {
            List<AttendanceRecord> studentRecords = recordRepository.findByStudentIdOrderByMarkedAtDesc(student.getId());
            long eligible = studentRecords.size();
            long attended = studentRecords.stream().filter(r -> r.getStatus() == AttendanceStatus.PRESENT || r.getStatus() == AttendanceStatus.LATE).count();
            double pct = eligible == 0 ? 0.0 : Math.round((attended * 100.0 / eligible) * 10.0) / 10.0;

            if (eligible > 0 && pct < 75.0) {
                lowAttendance.add(new LowAttendanceStudentDto(
                        student.getId(),
                        student.getUser().getFullName(),
                        student.getRollNumber(),
                        student.getAcademicClass().getId(),
                        student.getAcademicClass().getName(),
                        eligible,
                        attended,
                        pct
                ));
            }
        }
        dashboard.setLowAttendanceStudents(lowAttendance);

        // Class-wise attendance breakdown
        List<Map<String, Object>> classBreakdown = new ArrayList<>();
        for (AcademicClass c : classRepository.findAll()) {
            List<AttendanceRecord> classRecords = records.stream()
                    .filter(r -> r.getSession().getAcademicClass().getId().equals(c.getId()))
                    .toList();
            long classEligible = classRecords.size();
            long classAttended = classRecords.stream().filter(r -> r.getStatus() == AttendanceStatus.PRESENT || r.getStatus() == AttendanceStatus.LATE).count();
            double classPct = classEligible == 0 ? 0.0 : Math.round((classAttended * 100.0 / classEligible) * 10.0) / 10.0;

            Map<String, Object> map = new HashMap<>();
            map.put("classId", c.getId());
            map.put("className", c.getName());
            map.put("attendancePercentage", classPct);
            map.put("totalRecords", classEligible);
            classBreakdown.add(map);
        }
        dashboard.setClassWiseAttendance(classBreakdown);

        return dashboard;
    }

    private UserDto mapToUserDto(User user) {
        UserDto dto = new UserDto();
        dto.setId(user.getId());
        dto.setUsername(user.getUsername());
        dto.setEmail(user.getEmail());
        dto.setFullName(user.getFullName());
        dto.setRole(user.getRole());
        dto.setPhone(user.getPhone());
        dto.setIsActive(user.getIsActive());
        dto.setCreatedAt(user.getCreatedAt());

        if (user.getRole() == Role.FACULTY) {
            facultyRepository.findByUserId(user.getId()).ifPresent(f -> {
                dto.setEmployeeId(f.getEmployeeId());
                dto.setDesignation(f.getDesignation());
                dto.setDepartmentId(f.getDepartment().getId());
                dto.setDepartmentName(f.getDepartment().getName());
            });
        } else if (user.getRole() == Role.STUDENT) {
            studentRepository.findByUserId(user.getId()).ifPresent(s -> {
                dto.setRollNumber(s.getRollNumber());
                dto.setRegistrationNo(s.getRegistrationNo());
                if (s.getAcademicClass() != null) {
                    dto.setClassId(s.getAcademicClass().getId());
                    dto.setClassName(s.getAcademicClass().getName());
                }
                if (s.getDepartment() != null) {
                    dto.setDepartmentId(s.getDepartment().getId());
                    dto.setDepartmentName(s.getDepartment().getName());
                }
            });
        }

        return dto;
    }
}
