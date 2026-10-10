package com.smartattendance.controller;

import com.smartattendance.dto.*;
import com.smartattendance.security.SecurityUtils;
import com.smartattendance.service.AttendanceService;
import com.smartattendance.service.StudentService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/student")
@PreAuthorize("hasAnyRole('STUDENT', 'ADMIN')")
@Tag(name = "Student", description = "Endpoints for students to view personal attendance, trends, and scan QR tokens")
public class StudentController {

    private final StudentService studentService;
    private final AttendanceService attendanceService;

    public StudentController(StudentService studentService, AttendanceService attendanceService) {
        this.studentService = studentService;
        this.attendanceService = attendanceService;
    }

    @GetMapping("/dashboard")
    @Operation(summary = "Get student dashboard")
    public ResponseEntity<ApiResponse<StudentDashboardDto>> getDashboard() {
        Long userId = SecurityUtils.getCurrentUserId();
        return ResponseEntity.ok(ApiResponse.success("Student dashboard retrieved", studentService.getStudentDashboard(userId)));
    }

    @GetMapping("/attendance")
    @Operation(summary = "Get student full attendance history")
    public ResponseEntity<ApiResponse<List<AttendanceRecordDto>>> getAttendanceHistory() {
        Long userId = SecurityUtils.getCurrentUserId();
        return ResponseEntity.ok(ApiResponse.success("Attendance history retrieved", studentService.getStudentAttendanceHistory(userId)));
    }

    @GetMapping("/attendance/summary")
    @Operation(summary = "Get subject-wise attendance percentage breakdown")
    public ResponseEntity<ApiResponse<List<SubjectAttendanceSummaryDto>>> getSubjectSummary() {
        Long userId = SecurityUtils.getCurrentUserId();
        return ResponseEntity.ok(ApiResponse.success("Subject summary retrieved", studentService.getStudentSubjectSummary(userId)));
    }

    @PostMapping("/attendance/scan")
    @Operation(summary = "Submit scanned QR token to mark attendance")
    public ResponseEntity<ApiResponse<AttendanceRecordDto>> scanAttendance(
            @Valid @RequestBody ScanAttendanceRequest request,
            HttpServletRequest servletRequest) {
        Long userId = SecurityUtils.getCurrentUserId();

        if (request.getIpAddress() == null || request.getIpAddress().isBlank()) {
            request.setIpAddress(servletRequest.getRemoteAddr());
        }
        if (request.getDeviceInfo() == null || request.getDeviceInfo().isBlank()) {
            request.setDeviceInfo(servletRequest.getHeader("User-Agent"));
        }

        AttendanceRecordDto record = attendanceService.scanAttendance(userId, request);
        return ResponseEntity.ok(ApiResponse.success("Attendance verified and marked successfully!", record));
    }
}
