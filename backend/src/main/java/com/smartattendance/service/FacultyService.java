package com.smartattendance.service;

import com.smartattendance.dto.*;
import com.smartattendance.entity.*;
import com.smartattendance.exception.ResourceNotFoundException;
import com.smartattendance.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class FacultyService {

    private final FacultyRepository facultyRepository;
    private final FacultySubjectAssignmentRepository assignmentRepository;
    private final AttendanceSessionRepository sessionRepository;
    private final AttendanceRecordRepository recordRepository;
    private final StudentRepository studentRepository;

    public FacultyService(FacultyRepository facultyRepository,
                          FacultySubjectAssignmentRepository assignmentRepository,
                          AttendanceSessionRepository sessionRepository,
                          AttendanceRecordRepository recordRepository,
                          StudentRepository studentRepository) {
        this.facultyRepository = facultyRepository;
        this.assignmentRepository = assignmentRepository;
        this.sessionRepository = sessionRepository;
        this.recordRepository = recordRepository;
        this.studentRepository = studentRepository;
    }

    @Transactional(readOnly = true)
    public FacultyDashboardDto getFacultyDashboard(Long userId) {
        Faculty faculty = facultyRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Faculty profile not found for user: " + userId));

        FacultyDashboardDto dto = new FacultyDashboardDto();
        dto.setFacultyId(faculty.getId());
        dto.setFullName(faculty.getUser().getFullName());
        dto.setEmployeeId(faculty.getEmployeeId());
        dto.setDepartmentName(faculty.getDepartment().getName());

        List<FacultySubjectAssignment> assignments = assignmentRepository.findByFacultyIdAndIsActiveTrue(faculty.getId());
        Set<Long> uniqueClassIds = assignments.stream().map(a -> a.getAcademicClass().getId()).collect(Collectors.toSet());
        Set<Long> uniqueSubjectIds = assignments.stream().map(a -> a.getSubject().getId()).collect(Collectors.toSet());

        dto.setTotalAssignedClasses(uniqueClassIds.size());
        dto.setTotalAssignedSubjects(uniqueSubjectIds.size());

        List<AttendanceSession> facultySessions = sessionRepository.findByFacultyIdOrderByCreatedAtDesc(faculty.getId());
        dto.setRecentSessions(facultySessions.stream().limit(5).map(this::mapToSessionResponseDto).collect(Collectors.toList()));

        LocalDate today = LocalDate.now();
        List<AttendanceSession> todaySessions = facultySessions.stream()
                .filter(s -> s.getSessionDate().equals(today))
                .toList();
        dto.setTodaySessionsCount(todaySessions.size());
        dto.setTodaySessions(todaySessions.stream().map(this::mapToSessionResponseDto).collect(Collectors.toList()));

        long todayPresent = 0;
        long todayAbsent = 0;
        for (AttendanceSession sess : todaySessions) {
            todayPresent += recordRepository.countBySessionIdAndStatus(sess.getId(), AttendanceStatus.PRESENT);
            todayAbsent += recordRepository.countBySessionIdAndStatus(sess.getId(), AttendanceStatus.ABSENT);
        }
        dto.setPresentCountToday(todayPresent);
        dto.setAbsentCountToday(todayAbsent);

        dto.setAssignedClasses(assignments.stream().map(a -> {
            AcademicClass c = a.getAcademicClass();
            AcademicClassDto cd = new AcademicClassDto();
            cd.setId(c.getId());
            cd.setName(c.getName());
            cd.setSection(c.getSection());
            cd.setSemester(c.getSemester());
            cd.setDepartmentName(c.getDepartment().getName());
            cd.setStudentCount(studentRepository.findByAcademicClassId(c.getId()).size());
            return cd;
        }).distinct().collect(Collectors.toList()));

        dto.setAssignedSubjects(assignments.stream().map(a -> {
            Subject s = a.getSubject();
            SubjectDto sd = new SubjectDto();
            sd.setId(s.getId());
            sd.setCode(s.getCode());
            sd.setName(s.getName());
            sd.setCredits(s.getCredits());
            return sd;
        }).distinct().collect(Collectors.toList()));

        return dto;
    }

    @Transactional(readOnly = true)
    public List<AcademicClassDto> getAssignedClasses(Long userId) {
        Faculty faculty = facultyRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Faculty profile not found for user: " + userId));

        return assignmentRepository.findByFacultyIdAndIsActiveTrue(faculty.getId()).stream()
                .map(FacultySubjectAssignment::getAcademicClass)
                .distinct()
                .map(c -> {
                    AcademicClassDto dto = new AcademicClassDto();
                    dto.setId(c.getId());
                    dto.setName(c.getName());
                    dto.setSection(c.getSection());
                    dto.setSemester(c.getSemester());
                    dto.setAcademicYear(c.getAcademicYear());
                    dto.setDepartmentName(c.getDepartment().getName());
                    dto.setStudentCount(studentRepository.findByAcademicClassId(c.getId()).size());
                    return dto;
                }).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<SubjectDto> getAssignedSubjects(Long userId) {
        Faculty faculty = facultyRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Faculty profile not found for user: " + userId));

        return assignmentRepository.findByFacultyIdAndIsActiveTrue(faculty.getId()).stream()
                .map(FacultySubjectAssignment::getSubject)
                .distinct()
                .map(s -> {
                    SubjectDto dto = new SubjectDto();
                    dto.setId(s.getId());
                    dto.setCode(s.getCode());
                    dto.setName(s.getName());
                    dto.setCredits(s.getCredits());
                    return dto;
                }).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<SessionResponseDto> getFacultySessions(Long userId) {
        Faculty faculty = facultyRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Faculty profile not found for user: " + userId));

        return sessionRepository.findByFacultyIdOrderByCreatedAtDesc(faculty.getId()).stream()
                .map(this::mapToSessionResponseDto)
                .collect(Collectors.toList());
    }

    private SessionResponseDto mapToSessionResponseDto(AttendanceSession s) {
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
}
