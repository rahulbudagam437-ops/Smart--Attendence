package com.smartattendance.service;

import com.smartattendance.dto.AnalyticsOverviewDto;
import com.smartattendance.dto.LowAttendanceStudentDto;
import com.smartattendance.entity.*;
import com.smartattendance.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class AnalyticsService {

    private final AttendanceRecordRepository recordRepository;
    private final AttendanceSessionRepository sessionRepository;
    private final StudentRepository studentRepository;
    private final AcademicClassRepository classRepository;
    private final SubjectRepository subjectRepository;
    private final AcademicSettingRepository settingRepository;

    public AnalyticsService(AttendanceRecordRepository recordRepository,
                            AttendanceSessionRepository sessionRepository,
                            StudentRepository studentRepository,
                            AcademicClassRepository classRepository,
                            SubjectRepository subjectRepository,
                            AcademicSettingRepository settingRepository) {
        this.recordRepository = recordRepository;
        this.sessionRepository = sessionRepository;
        this.studentRepository = studentRepository;
        this.classRepository = classRepository;
        this.subjectRepository = subjectRepository;
        this.settingRepository = settingRepository;
    }

    @Transactional(readOnly = true)
    public AnalyticsOverviewDto getInstitutionOverview() {
        AnalyticsOverviewDto dto = new AnalyticsOverviewDto();
        List<AttendanceRecord> records = recordRepository.findAll();
        List<AttendanceSession> sessions = sessionRepository.findAll();

        long totalRecords = records.size();
        long present = records.stream().filter(r -> r.getStatus() == AttendanceStatus.PRESENT).count();
        long absent = records.stream().filter(r -> r.getStatus() == AttendanceStatus.ABSENT).count();
        long late = records.stream().filter(r -> r.getStatus() == AttendanceStatus.LATE).count();

        long attended = present + late;
        double overallPct = (totalRecords == 0) ? 0.0 : Math.round((attended * 100.0 / totalRecords) * 10.0) / 10.0;
        double presentPct = (totalRecords == 0) ? 0.0 : Math.round((present * 100.0 / totalRecords) * 10.0) / 10.0;
        double absentPct = (totalRecords == 0) ? 0.0 : Math.round((absent * 100.0 / totalRecords) * 10.0) / 10.0;
        double latePct = (totalRecords == 0) ? 0.0 : Math.round((late * 100.0 / totalRecords) * 10.0) / 10.0;

        dto.setOverallPercentage(overallPct);
        dto.setTotalSessionsFinalized(sessions.stream().filter(s -> s.getStatus() == SessionStatus.CLOSED).count());
        dto.setTotalRecordsLogged(totalRecords);
        dto.setPresentCount(present);
        dto.setAbsentCount(absent);
        dto.setLateCount(late);
        dto.setPresentPercentage(presentPct);
        dto.setAbsentPercentage(absentPct);
        dto.setLatePercentage(latePct);

        // Daily Trends
        Map<LocalDate, List<AttendanceRecord>> byDate = records.stream()
                .collect(Collectors.groupingBy(r -> r.getSession().getSessionDate()));

        List<Map<String, Object>> dailyTrends = new ArrayList<>();
        List<LocalDate> sortedDates = new ArrayList<>(byDate.keySet());
        Collections.sort(sortedDates);

        for (LocalDate date : sortedDates) {
            List<AttendanceRecord> dayRecords = byDate.get(date);
            long dPresent = dayRecords.stream().filter(r -> r.getStatus() == AttendanceStatus.PRESENT).count();
            long dAbsent = dayRecords.stream().filter(r -> r.getStatus() == AttendanceStatus.ABSENT).count();
            long dLate = dayRecords.stream().filter(r -> r.getStatus() == AttendanceStatus.LATE).count();
            long dTotal = dayRecords.size();
            double dPct = (dTotal == 0) ? 0.0 : Math.round(((dPresent + dLate) * 100.0 / dTotal) * 10.0) / 10.0;

            Map<String, Object> point = new HashMap<>();
            point.put("date", date.toString());
            point.put("present", dPresent);
            point.put("absent", dAbsent);
            point.put("late", dLate);
            point.put("total", dTotal);
            point.put("percentage", dPct);
            dailyTrends.add(point);
        }
        dto.setDailyTrends(dailyTrends);

        // Class Comparisons
        List<Map<String, Object>> classComparisons = new ArrayList<>();
        for (AcademicClass c : classRepository.findAll()) {
            List<AttendanceRecord> classRecords = records.stream()
                    .filter(r -> r.getSession().getAcademicClass().getId().equals(c.getId()))
                    .toList();
            long cTotal = classRecords.size();
            long cAttended = classRecords.stream().filter(r -> r.getStatus() == AttendanceStatus.PRESENT || r.getStatus() == AttendanceStatus.LATE).count();
            double cPct = (cTotal == 0) ? 0.0 : Math.round((cAttended * 100.0 / cTotal) * 10.0) / 10.0;

            Map<String, Object> map = new HashMap<>();
            map.put("classId", c.getId());
            map.put("className", c.getName());
            map.put("percentage", cPct);
            map.put("totalStudents", studentRepository.findByAcademicClassId(c.getId()).size());
            map.put("totalRecords", cTotal);
            classComparisons.add(map);
        }
        dto.setClassComparisons(classComparisons);

        // Subject Attendance
        List<Map<String, Object>> subjectAttendance = new ArrayList<>();
        for (Subject s : subjectRepository.findAll()) {
            List<AttendanceRecord> subjRecords = records.stream()
                    .filter(r -> r.getSession().getSubject().getId().equals(s.getId()))
                    .toList();
            long sTotal = subjRecords.size();
            long sAttended = subjRecords.stream().filter(r -> r.getStatus() == AttendanceStatus.PRESENT || r.getStatus() == AttendanceStatus.LATE).count();
            double sPct = (sTotal == 0) ? 0.0 : Math.round((sAttended * 100.0 / sTotal) * 10.0) / 10.0;

            Map<String, Object> map = new HashMap<>();
            map.put("subjectId", s.getId());
            map.put("subjectCode", s.getCode());
            map.put("subjectName", s.getName());
            map.put("percentage", sPct);
            map.put("totalSessions", subjRecords.stream().map(r -> r.getSession().getId()).distinct().count());
            subjectAttendance.add(map);
        }
        dto.setSubjectAttendance(subjectAttendance);

        // Low Attendance Students
        dto.setLowAttendanceStudents(getLowAttendanceStudents(75.0));

        return dto;
    }

    @Transactional(readOnly = true)
    public List<LowAttendanceStudentDto> getLowAttendanceStudents(Double thresholdValue) {
        double threshold = thresholdValue != null ? thresholdValue : 75.0;
        List<LowAttendanceStudentDto> result = new ArrayList<>();
        List<Student> students = studentRepository.findAll();

        for (Student student : students) {
            List<AttendanceRecord> studentRecords = recordRepository.findByStudentIdOrderByMarkedAtDesc(student.getId());
            long eligible = studentRecords.size();
            long attended = studentRecords.stream().filter(r -> r.getStatus() == AttendanceStatus.PRESENT || r.getStatus() == AttendanceStatus.LATE).count();
            double pct = (eligible == 0) ? 0.0 : Math.round((attended * 100.0 / eligible) * 10.0) / 10.0;

            if (eligible > 0 && pct < threshold) {
                result.add(new LowAttendanceStudentDto(
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

        result.sort(Comparator.comparingDouble(LowAttendanceStudentDto::getPercentage));
        return result;
    }
}
