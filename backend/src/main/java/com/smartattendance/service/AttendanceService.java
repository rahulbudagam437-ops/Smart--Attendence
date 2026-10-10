package com.smartattendance.service;

import com.smartattendance.dto.*;
import com.smartattendance.entity.*;
import com.smartattendance.exception.BadRequestException;
import com.smartattendance.exception.ConflictException;
import com.smartattendance.exception.ResourceNotFoundException;
import com.smartattendance.exception.UnauthorizedException;
import com.smartattendance.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class AttendanceService {

    private final AttendanceSessionRepository sessionRepository;
    private final AttendanceRecordRepository recordRepository;
    private final AttendanceAuditLogRepository auditLogRepository;
    private final FacultyRepository facultyRepository;
    private final StudentRepository studentRepository;
    private final AcademicClassRepository classRepository;
    private final SubjectRepository subjectRepository;
    private final UserRepository userRepository;
    private final FacultySubjectAssignmentRepository assignmentRepository;
    private final SecureRandom secureRandom = new SecureRandom();

    public AttendanceService(AttendanceSessionRepository sessionRepository,
                             AttendanceRecordRepository recordRepository,
                             AttendanceAuditLogRepository auditLogRepository,
                             FacultyRepository facultyRepository,
                             StudentRepository studentRepository,
                             AcademicClassRepository classRepository,
                             SubjectRepository subjectRepository,
                             UserRepository userRepository,
                             FacultySubjectAssignmentRepository assignmentRepository) {
        this.sessionRepository = sessionRepository;
        this.recordRepository = recordRepository;
        this.auditLogRepository = auditLogRepository;
        this.facultyRepository = facultyRepository;
        this.studentRepository = studentRepository;
        this.classRepository = classRepository;
        this.subjectRepository = subjectRepository;
        this.userRepository = userRepository;
        this.assignmentRepository = assignmentRepository;
    }

    @Transactional
    public SessionResponseDto createSession(Long facultyUserId, SessionCreateRequest request) {
        Faculty faculty = facultyRepository.findByUserId(facultyUserId)
                .orElseThrow(() -> new ResourceNotFoundException("Faculty profile not found for user: " + facultyUserId));

        AcademicClass academicClass = classRepository.findById(request.getClassId())
                .orElseThrow(() -> new ResourceNotFoundException("Class not found with ID: " + request.getClassId()));

        Subject subject = subjectRepository.findById(request.getSubjectId())
                .orElseThrow(() -> new ResourceNotFoundException("Subject not found with ID: " + request.getSubjectId()));

        // Check faculty is assigned to this class and subject
        boolean isAssigned = assignmentRepository.existsByFacultyIdAndSubjectIdAndAcademicClassId(
                faculty.getId(), subject.getId(), academicClass.getId());
        if (!isAssigned) {
            throw new BadRequestException("Faculty is not assigned to teach " + subject.getName() + " in " + academicClass.getName());
        }

        // Generate session code and unpredictable cryptographically secure token
        String sessionCode = "SESS-" + System.currentTimeMillis() + "-" + String.format("%04X", secureRandom.nextInt(0x10000));
        byte[] randomBytes = new byte[24];
        secureRandom.nextBytes(randomBytes);
        String sessionToken = UUID.randomUUID() + "-" + HexFormat.of().formatHex(randomBytes);

        int expiryMin = (request.getExpiryMinutes() != null && request.getExpiryMinutes() > 0) ? request.getExpiryMinutes() : 10;
        LocalDateTime expiresAt = LocalDateTime.now().plusMinutes(expiryMin);

        AttendanceSession session = new AttendanceSession(
                sessionCode,
                sessionToken,
                faculty,
                subject,
                academicClass,
                request.getSessionDate(),
                request.getStartTime(),
                request.getEndTime(),
                expiresAt,
                request.getTopic(),
                request.getAllowLate()
        );

        session = sessionRepository.save(session);
        return mapToSessionResponseDto(session);
    }

    @Transactional(readOnly = true)
    public SessionResponseDto getSession(Long sessionId) {
        AttendanceSession session = sessionRepository.findById(sessionId)
                .orElseThrow(() -> new ResourceNotFoundException("Session not found with ID: " + sessionId));

        // Auto-detect expiry if active
        if (session.getStatus() == SessionStatus.ACTIVE && session.isExpired()) {
            session.setStatus(SessionStatus.EXPIRED);
            sessionRepository.save(session);
        }

        return mapToSessionResponseDto(session);
    }

    @Transactional
    public SessionResponseDto closeSession(Long userId, Long sessionId) {
        AttendanceSession session = sessionRepository.findById(sessionId)
                .orElseThrow(() -> new ResourceNotFoundException("Session not found with ID: " + sessionId));

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + userId));

        if (user.getRole() != Role.ADMIN && !session.getFaculty().getUser().getId().equals(userId)) {
            throw new UnauthorizedException("Only the faculty in charge or an administrator can close this session");
        }

        session.setStatus(SessionStatus.CLOSED);
        session = sessionRepository.save(session);

        // Finalize absences: Enrolled students who haven't marked attendance get recorded as ABSENT
        List<Student> enrolledStudents = studentRepository.findByAcademicClassId(session.getAcademicClass().getId());
        for (Student student : enrolledStudents) {
            boolean hasRecord = recordRepository.existsBySessionIdAndStudentId(session.getId(), student.getId());
            if (!hasRecord) {
                AttendanceRecord absentRecord = new AttendanceRecord(
                        session,
                        student,
                        AttendanceStatus.ABSENT,
                        MarkingMethod.MANUAL_FACULTY,
                        null,
                        null,
                        "Automatic finalized absence upon session closure"
                );
                recordRepository.save(absentRecord);
            }
        }

        return mapToSessionResponseDto(session);
    }

    @Transactional
    public AttendanceRecordDto scanAttendance(Long studentUserId, ScanAttendanceRequest request) {
        Student student = studentRepository.findByUserId(studentUserId)
                .orElseThrow(() -> new ResourceNotFoundException("Student profile not found for user: " + studentUserId));

        if (!Boolean.TRUE.equals(student.getUser().getIsActive())) {
            throw new BadRequestException("Student account is inactive");
        }

        AttendanceSession session = sessionRepository.findBySessionToken(request.getSessionToken())
                .orElseThrow(() -> new BadRequestException("Invalid or unrecognized QR attendance token"));

        // Validate session status
        if (session.getStatus() == SessionStatus.CLOSED) {
            throw new BadRequestException("This attendance session is closed");
        }
        if (session.getStatus() == SessionStatus.CANCELLED) {
            throw new BadRequestException("This attendance session has been cancelled");
        }

        // Validate expiry
        if (session.isExpired()) {
            session.setStatus(SessionStatus.EXPIRED);
            sessionRepository.save(session);
            throw new BadRequestException("This attendance QR code has expired. Please contact your faculty.");
        }

        // Validate student belongs to permitted class
        if (!student.getAcademicClass().getId().equals(session.getAcademicClass().getId())) {
            throw new BadRequestException("Access denied: You are not enrolled in " + session.getAcademicClass().getName());
        }

        // Check duplicate attendance
        if (recordRepository.existsBySessionIdAndStudentId(session.getId(), student.getId())) {
            throw new ConflictException("Attendance already marked for this session");
        }

        AttendanceStatus status = AttendanceStatus.PRESENT;
        AttendanceRecord record = new AttendanceRecord(
                session,
                student,
                status,
                MarkingMethod.QR_SCAN,
                request.getIpAddress(),
                request.getDeviceInfo(),
                "Verified via dynamic QR code scan"
        );

        record = recordRepository.save(record);
        return mapToRecordDto(record);
    }

    @Transactional
    public AttendanceRecordDto manualMarkAttendance(Long modifierUserId, ManualAttendanceRequest request) {
        User modifier = userRepository.findById(modifierUserId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + modifierUserId));

        AttendanceSession session = sessionRepository.findById(request.getSessionId())
                .orElseThrow(() -> new ResourceNotFoundException("Session not found: " + request.getSessionId()));

        Student student = studentRepository.findById(request.getStudentId())
                .orElseThrow(() -> new ResourceNotFoundException("Student not found: " + request.getStudentId()));

        Optional<AttendanceRecord> existingOpt = recordRepository.findBySessionIdAndStudentId(session.getId(), student.getId());
        AttendanceRecord record;

        if (existingOpt.isPresent()) {
            record = existingOpt.get();
            String oldStatus = record.getStatus().name();
            String newStatus = request.getStatus().name();

            record.setStatus(request.getStatus());
            record.setRemarks(request.getReason());
            record = recordRepository.save(record);

            // Create mandatory audit log
            AttendanceAuditLog auditLog = new AttendanceAuditLog(
                    record,
                    modifier,
                    oldStatus,
                    newStatus,
                    request.getReason()
            );
            auditLogRepository.save(auditLog);

        } else {
            MarkingMethod method = modifier.getRole() == Role.ADMIN ? MarkingMethod.MANUAL_ADMIN : MarkingMethod.MANUAL_FACULTY;
            record = new AttendanceRecord(
                    session,
                    student,
                    request.getStatus(),
                    method,
                    null,
                    null,
                    "Manual entry: " + request.getReason()
            );
            record = recordRepository.save(record);

            AttendanceAuditLog auditLog = new AttendanceAuditLog(
                    record,
                    modifier,
                    "UNRECORDED",
                    request.getStatus().name(),
                    "Manual initial entry: " + request.getReason()
            );
            auditLogRepository.save(auditLog);
        }

        return mapToRecordDto(record);
    }

    @Transactional(readOnly = true)
    public List<Map<String, Object>> getSessionAttendanceRoster(Long sessionId) {
        AttendanceSession session = sessionRepository.findById(sessionId)
                .orElseThrow(() -> new ResourceNotFoundException("Session not found: " + sessionId));

        List<Student> students = studentRepository.findByAcademicClassId(session.getAcademicClass().getId());
        Map<Long, AttendanceRecord> recordMap = recordRepository.findBySessionId(sessionId).stream()
                .collect(Collectors.toMap(r -> r.getStudent().getId(), r -> r));

        List<Map<String, Object>> roster = new ArrayList<>();
        for (Student s : students) {
            Map<String, Object> item = new HashMap<>();
            item.put("studentId", s.getId());
            item.put("fullName", s.getUser().getFullName());
            item.put("rollNumber", s.getRollNumber());
            item.put("registrationNo", s.getRegistrationNo());

            AttendanceRecord record = recordMap.get(s.getId());
            if (record != null) {
                item.put("recordId", record.getId());
                item.put("status", record.getStatus().name());
                item.put("markedAt", record.getMarkedAt());
                item.put("method", record.getMethod().name());
                item.put("remarks", record.getRemarks());
            } else {
                item.put("recordId", null);
                item.put("status", session.getStatus() == SessionStatus.ACTIVE ? "PENDING" : "ABSENT");
                item.put("markedAt", null);
                item.put("method", null);
                item.put("remarks", null);
            }
            roster.add(item);
        }

        return roster;
    }

    @Transactional(readOnly = true)
    public List<AttendanceAuditLog> getAuditLogsForRecord(Long recordId) {
        return auditLogRepository.findByAttendanceRecordIdOrderByModifiedAtDesc(recordId);
    }

    public SessionResponseDto mapToSessionResponseDto(AttendanceSession s) {
        SessionResponseDto dto = new SessionResponseDto();
        dto.setId(s.getId());
        dto.setSessionCode(s.getSessionCode());
        dto.setSessionToken(s.getSessionToken());
        dto.setFacultyId(s.getFaculty().getId());
        dto.setFacultyName(s.getFaculty().getUser().getFullName());
        dto.setClassId(s.getAcademicClass().getId());
        dto.setClassName(s.getAcademicClass().getName());
        dto.setSubjectId(s.getSubject().getId());
        dto.setSubjectCode(s.getSubject().getCode());
        dto.setSubjectName(s.getSubject().getName());
        dto.setSessionDate(s.getSessionDate());
        dto.setStartTime(s.getStartTime());
        dto.setEndTime(s.getEndTime());
        dto.setExpiresAt(s.getExpiresAt());
        dto.setStatus(s.getStatus());
        dto.setTopic(s.getTopic());
        dto.setAllowLate(s.getAllowLate());

        dto.setTotalStudents(studentRepository.findByAcademicClassId(s.getAcademicClass().getId()).size());
        dto.setPresentCount(recordRepository.countBySessionIdAndStatus(s.getId(), AttendanceStatus.PRESENT));
        dto.setAbsentCount(recordRepository.countBySessionIdAndStatus(s.getId(), AttendanceStatus.ABSENT));
        dto.setLateCount(recordRepository.countBySessionIdAndStatus(s.getId(), AttendanceStatus.LATE));
        return dto;
    }

    public AttendanceRecordDto mapToRecordDto(AttendanceRecord r) {
        AttendanceRecordDto dto = new AttendanceRecordDto();
        dto.setId(r.getId());
        dto.setSessionId(r.getSession().getId());
        dto.setSessionCode(r.getSession().getSessionCode());
        dto.setStudentId(r.getStudent().getId());
        dto.setStudentName(r.getStudent().getUser().getFullName());
        dto.setRollNumber(r.getStudent().getRollNumber());
        dto.setRegistrationNo(r.getStudent().getRegistrationNo());
        dto.setClassId(r.getSession().getAcademicClass().getId());
        dto.setClassName(r.getSession().getAcademicClass().getName());
        dto.setSubjectId(r.getSession().getSubject().getId());
        dto.setSubjectName(r.getSession().getSubject().getName());
        dto.setStatus(r.getStatus());
        dto.setMarkedAt(r.getMarkedAt());
        dto.setMethod(r.getMethod());
        dto.setIpAddress(r.getIpAddress());
        dto.setDeviceInfo(r.getDeviceInfo());
        dto.setRemarks(r.getRemarks());
        return dto;
    }
}
