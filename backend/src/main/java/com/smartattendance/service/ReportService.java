package com.smartattendance.service;

import com.smartattendance.dto.AttendanceRecordDto;
import com.smartattendance.dto.ReportFilterDto;
import com.smartattendance.entity.AttendanceRecord;
import com.smartattendance.repository.AttendanceRecordRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class ReportService {

    private final AttendanceRecordRepository recordRepository;
    private final AttendanceService attendanceService;

    public ReportService(AttendanceRecordRepository recordRepository, AttendanceService attendanceService) {
        this.recordRepository = recordRepository;
        this.attendanceService = attendanceService;
    }

    @Transactional(readOnly = true)
    public List<AttendanceRecordDto> getFilteredAttendance(ReportFilterDto filter) {
        List<AttendanceRecord> records = recordRepository.filterRecords(
                filter.getClassId(),
                filter.getSubjectId(),
                filter.getStartDate(),
                filter.getEndDate(),
                filter.getStatus()
        );

        if (filter.getStudentId() != null) {
            records = records.stream()
                    .filter(r -> r.getStudent().getId().equals(filter.getStudentId()))
                    .collect(Collectors.toList());
        }

        return records.stream().map(attendanceService::mapToRecordDto).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public String exportAttendanceCsv(ReportFilterDto filter) {
        List<AttendanceRecordDto> records = getFilteredAttendance(filter);
        DateTimeFormatter timeFormatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");

        StringBuilder sb = new StringBuilder();
        sb.append("Record ID,Session Code,Date,Class,Subject,Roll Number,Student Name,Status,Method,Marked At,Remarks\n");

        for (AttendanceRecordDto r : records) {
            sb.append(escapeCsv(r.getId() != null ? r.getId().toString() : "")).append(",");
            sb.append(escapeCsv(r.getSessionCode())).append(",");
            sb.append(escapeCsv(r.getMarkedAt() != null ? r.getMarkedAt().toLocalDate().toString() : "")).append(",");
            sb.append(escapeCsv(r.getClassName())).append(",");
            sb.append(escapeCsv(r.getSubjectName())).append(",");
            sb.append(escapeCsv(r.getRollNumber())).append(",");
            sb.append(escapeCsv(r.getStudentName())).append(",");
            sb.append(escapeCsv(r.getStatus() != null ? r.getStatus().name() : "")).append(",");
            sb.append(escapeCsv(r.getMethod() != null ? r.getMethod().name() : "")).append(",");
            sb.append(escapeCsv(r.getMarkedAt() != null ? r.getMarkedAt().format(timeFormatter) : "")).append(",");
            sb.append(escapeCsv(r.getRemarks())).append("\n");
        }

        return sb.toString();
    }

    private String escapeCsv(String value) {
        if (value == null) return "\"\"";
        String escaped = value.replace("\"", "\"\"");
        return "\"" + escaped + "\"";
    }
}
