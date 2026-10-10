package com.smartattendance.controller;

import com.smartattendance.dto.ApiResponse;
import com.smartattendance.dto.AttendanceRecordDto;
import com.smartattendance.dto.ReportFilterDto;
import com.smartattendance.entity.AttendanceStatus;
import com.smartattendance.service.ReportService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/reports")
@PreAuthorize("hasAnyRole('ADMIN', 'FACULTY')")
@Tag(name = "Reports", description = "Endpoints for filtering attendance data and downloading CSV exports")
public class ReportController {

    private final ReportService reportService;

    public ReportController(ReportService reportService) {
        this.reportService = reportService;
    }

    @GetMapping("/attendance")
    @Operation(summary = "Filter attendance records across classes, subjects, dates, and status")
    public ResponseEntity<ApiResponse<List<AttendanceRecordDto>>> getAttendanceReport(
            @RequestParam(required = false) Long classId,
            @RequestParam(required = false) Long subjectId,
            @RequestParam(required = false) Long studentId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            @RequestParam(required = false) AttendanceStatus status) {

        ReportFilterDto filter = new ReportFilterDto();
        filter.setClassId(classId);
        filter.setSubjectId(subjectId);
        filter.setStudentId(studentId);
        filter.setStartDate(startDate);
        filter.setEndDate(endDate);
        filter.setStatus(status);

        List<AttendanceRecordDto> results = reportService.getFilteredAttendance(filter);
        return ResponseEntity.ok(ApiResponse.success("Attendance report generated", results));
    }

    @GetMapping(value = "/attendance/export", produces = "text/csv")
    @Operation(summary = "Export filtered attendance records as a downloadable CSV")
    public ResponseEntity<String> exportAttendanceCsv(
            @RequestParam(required = false) Long classId,
            @RequestParam(required = false) Long subjectId,
            @RequestParam(required = false) Long studentId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            @RequestParam(required = false) AttendanceStatus status) {

        ReportFilterDto filter = new ReportFilterDto();
        filter.setClassId(classId);
        filter.setSubjectId(subjectId);
        filter.setStudentId(studentId);
        filter.setStartDate(startDate);
        filter.setEndDate(endDate);
        filter.setStatus(status);

        String csvContent = reportService.exportAttendanceCsv(filter);
        String filename = "attendance_report_" + LocalDate.now() + ".csv";

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + filename + "\"")
                .contentType(MediaType.parseMediaType("text/csv"))
                .body(csvContent);
    }
}
