package com.smartattendance.controller;

import com.smartattendance.dto.*;
import com.smartattendance.entity.AttendanceAuditLog;
import com.smartattendance.security.SecurityUtils;
import com.smartattendance.service.AttendanceService;
import com.smartattendance.service.FacultyService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/faculty")
@PreAuthorize("hasAnyRole('FACULTY', 'ADMIN')")
@Tag(name = "Faculty", description = "Endpoints for faculty attendance sessions, QR codes, and manual modifications")
public class FacultyController {

    private final FacultyService facultyService;
    private final AttendanceService attendanceService;

    public FacultyController(FacultyService facultyService, AttendanceService attendanceService) {
        this.facultyService = facultyService;
        this.attendanceService = attendanceService;
    }

    @GetMapping("/dashboard")
    @Operation(summary = "Get faculty dashboard")
    public ResponseEntity<ApiResponse<FacultyDashboardDto>> getDashboard() {
        Long userId = SecurityUtils.getCurrentUserId();
        return ResponseEntity.ok(ApiResponse.success("Faculty dashboard retrieved", facultyService.getFacultyDashboard(userId)));
    }

    @GetMapping("/classes")
    @Operation(summary = "Get faculty assigned classes")
    public ResponseEntity<ApiResponse<List<AcademicClassDto>>> getClasses() {
        Long userId = SecurityUtils.getCurrentUserId();
        return ResponseEntity.ok(ApiResponse.success("Classes retrieved", facultyService.getAssignedClasses(userId)));
    }

    @GetMapping("/subjects")
    @Operation(summary = "Get faculty assigned subjects")
    public ResponseEntity<ApiResponse<List<SubjectDto>>> getSubjects() {
        Long userId = SecurityUtils.getCurrentUserId();
        return ResponseEntity.ok(ApiResponse.success("Subjects retrieved", facultyService.getAssignedSubjects(userId)));
    }

    @PostMapping("/sessions")
    @Operation(summary = "Create attendance session and generate dynamic QR token")
    public ResponseEntity<ApiResponse<SessionResponseDto>> createSession(@Valid @RequestBody SessionCreateRequest request) {
        Long userId = SecurityUtils.getCurrentUserId();
        SessionResponseDto session = attendanceService.createSession(userId, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success("Attendance session created successfully", session));
    }

    @GetMapping("/sessions")
    @Operation(summary = "Get all sessions conducted by this faculty")
    public ResponseEntity<ApiResponse<List<SessionResponseDto>>> getSessions() {
        Long userId = SecurityUtils.getCurrentUserId();
        return ResponseEntity.ok(ApiResponse.success("Sessions retrieved", facultyService.getFacultySessions(userId)));
    }

    @GetMapping("/sessions/{id}")
    @Operation(summary = "Get session details including real-time attendee counts")
    public ResponseEntity<ApiResponse<SessionResponseDto>> getSession(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success("Session retrieved", attendanceService.getSession(id)));
    }

    @PostMapping("/sessions/{id}/close")
    @Operation(summary = "Close attendance session and finalize unrecorded students as absent")
    public ResponseEntity<ApiResponse<SessionResponseDto>> closeSession(@PathVariable Long id) {
        Long userId = SecurityUtils.getCurrentUserId();
        SessionResponseDto closed = attendanceService.closeSession(userId, id);
        return ResponseEntity.ok(ApiResponse.success("Session closed and absences finalized", closed));
    }

    @GetMapping("/sessions/{id}/attendance")
    @Operation(summary = "Get attendance roster for a specific session")
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> getSessionAttendance(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success("Session roster retrieved", attendanceService.getSessionAttendanceRoster(id)));
    }

    @PutMapping("/attendance")
    @Operation(summary = "Manual attendance entry or correction with audit reason")
    public ResponseEntity<ApiResponse<AttendanceRecordDto>> manualMarkAttendance(@Valid @RequestBody ManualAttendanceRequest request) {
        Long userId = SecurityUtils.getCurrentUserId();
        AttendanceRecordDto record = attendanceService.manualMarkAttendance(userId, request);
        return ResponseEntity.ok(ApiResponse.success("Attendance updated successfully", record));
    }

    @GetMapping("/attendance/{recordId}/audit")
    @Operation(summary = "Get audit history for an attendance record")
    public ResponseEntity<ApiResponse<List<AttendanceAuditLog>>> getAuditLogs(@PathVariable Long recordId) {
        return ResponseEntity.ok(ApiResponse.success("Audit logs retrieved", attendanceService.getAuditLogsForRecord(recordId)));
    }
}
