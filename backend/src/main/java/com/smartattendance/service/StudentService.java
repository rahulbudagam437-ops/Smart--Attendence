package com.smartattendance.service;

import com.smartattendance.dto.AttendanceRecordDto;
import com.smartattendance.dto.StudentDashboardDto;
import com.smartattendance.dto.SubjectAttendanceSummaryDto;
import com.smartattendance.entity.*;
import com.smartattendance.exception.ResourceNotFoundException;
import com.smartattendance.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class StudentService {

    private final StudentRepository studentRepository;
    private final AttendanceRecordRepository recordRepository;
    private final AttendanceSessionRepository sessionRepository;
    private final AcademicSettingRepository settingRepository;
    private final AttendanceService attendanceService;

    public StudentService(StudentRepository studentRepository,
                          AttendanceRecordRepository recordRepository,
                          AttendanceSessionRepository sessionRepository,
                          AcademicSettingRepository settingRepository,
                          AttendanceService attendanceService) {
        this.studentRepository = studentRepository;
        this.recordRepository = recordRepository;
        this.sessionRepository = sessionRepository;
        this.settingRepository = settingRepository;
        this.attendanceService = attendanceService;
    }

    @Transactional(readOnly = true)
    public StudentDashboardDto getStudentDashboard(Long userId) {
        Student student = studentRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Student profile not found for user: " + userId));

        double threshold = 75.0;
        Optional<AcademicSetting> threshSetting = settingRepository.findBySettingKey("LOW_ATTENDANCE_THRESHOLD");
        if (threshSetting.isPresent()) {
            try {
                threshold = Double.parseDouble(threshSetting.get().getSettingValue());
            } catch (NumberFormatException ignored) {}
        }

        StudentDashboardDto dto = new StudentDashboardDto();
        dto.setStudentId(student.getId());
        dto.setFullName(student.getUser().getFullName());
        dto.setRollNumber(student.getRollNumber());
        dto.setRegistrationNo(student.getRegistrationNo());
        dto.setClassId(student.getAcademicClass().getId());
        dto.setClassName(student.getAcademicClass().getName());
        dto.setDepartmentName(student.getDepartment().getName());
        dto.setLowAttendanceThreshold(threshold);

        List<AttendanceRecord> records = recordRepository.findByStudentIdOrderByMarkedAtDesc(student.getId());
        dto.setRecentAttendance(records.stream().limit(10).map(attendanceService::mapToRecordDto).collect(Collectors.toList()));

        long eligible = records.size();
        long present = records.stream().filter(r -> r.getStatus() == AttendanceStatus.PRESENT).count();
        long late = records.stream().filter(r -> r.getStatus() == AttendanceStatus.LATE).count();
        long absent = records.stream().filter(r -> r.getStatus() == AttendanceStatus.ABSENT).count();

        long attended = present + late;
        double overallPct = (eligible == 0) ? 0.0 : Math.round((attended * 100.0 / eligible) * 10.0) / 10.0;

        dto.setTotalEligibleSessions(eligible);
        dto.setPresentSessions(present);
        dto.setLateSessions(late);
        dto.setAbsentSessions(absent);
        dto.setOverallPercentage(overallPct);

        // Subject-wise summaries
        dto.setSubjectSummaries(computeSubjectSummaries(student, records, threshold));

        return dto;
    }

    @Transactional(readOnly = true)
    public List<AttendanceRecordDto> getStudentAttendanceHistory(Long userId) {
        Student student = studentRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Student profile not found for user: " + userId));

        return recordRepository.findByStudentIdOrderByMarkedAtDesc(student.getId()).stream()
                .map(attendanceService::mapToRecordDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<SubjectAttendanceSummaryDto> getStudentSubjectSummary(Long userId) {
        Student student = studentRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Student profile not found for user: " + userId));

        double threshold = 75.0;
        Optional<AcademicSetting> threshSetting = settingRepository.findBySettingKey("LOW_ATTENDANCE_THRESHOLD");
        if (threshSetting.isPresent()) {
            try {
                threshold = Double.parseDouble(threshSetting.get().getSettingValue());
            } catch (NumberFormatException ignored) {}
        }

        List<AttendanceRecord> records = recordRepository.findByStudentIdOrderByMarkedAtDesc(student.getId());
        return computeSubjectSummaries(student, records, threshold);
    }

    private List<SubjectAttendanceSummaryDto> computeSubjectSummaries(Student student, List<AttendanceRecord> records, double threshold) {
        Map<Long, List<AttendanceRecord>> bySubject = records.stream()
                .collect(Collectors.groupingBy(r -> r.getSession().getSubject().getId()));

        List<SubjectAttendanceSummaryDto> summaries = new ArrayList<>();
        for (Map.Entry<Long, List<AttendanceRecord>> entry : bySubject.entrySet()) {
            List<AttendanceRecord> subjectRecords = entry.getValue();
            if (subjectRecords.isEmpty()) continue;

            Subject subject = subjectRecords.get(0).getSession().getSubject();
            long total = subjectRecords.size();
            long attended = subjectRecords.stream().filter(r -> r.getStatus() == AttendanceStatus.PRESENT).count();
            long late = subjectRecords.stream().filter(r -> r.getStatus() == AttendanceStatus.LATE).count();
            long absent = subjectRecords.stream().filter(r -> r.getStatus() == AttendanceStatus.ABSENT).count();

            long totalAttended = attended + late;
            double pct = (total == 0) ? 0.0 : Math.round((totalAttended * 100.0 / total) * 10.0) / 10.0;

            SubjectAttendanceSummaryDto dto = new SubjectAttendanceSummaryDto();
            dto.setSubjectId(subject.getId());
            dto.setSubjectCode(subject.getCode());
            dto.setSubjectName(subject.getName());
            dto.setTotalSessions(total);
            dto.setAttendedSessions(attended);
            dto.setLateSessions(late);
            dto.setAbsentSessions(absent);
            dto.setPercentage(pct);
            dto.setBelowThreshold(pct < threshold);

            summaries.add(dto);
        }

        summaries.sort(Comparator.comparing(SubjectAttendanceSummaryDto::getSubjectCode));
        return summaries;
    }
}
