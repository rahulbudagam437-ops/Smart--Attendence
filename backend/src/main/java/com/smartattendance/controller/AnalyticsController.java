package com.smartattendance.controller;

import com.smartattendance.dto.ApiResponse;
import com.smartattendance.dto.AnalyticsOverviewDto;
import com.smartattendance.dto.LowAttendanceStudentDto;
import com.smartattendance.service.AnalyticsService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/analytics")
@PreAuthorize("hasAnyRole('ADMIN', 'FACULTY', 'STUDENT')")
@Tag(name = "Analytics", description = "Endpoints for institutional, class-wise, and subject attendance analytics")
public class AnalyticsController {

    private final AnalyticsService analyticsService;

    public AnalyticsController(AnalyticsService analyticsService) {
        this.analyticsService = analyticsService;
    }

    @GetMapping("/overview")
    @Operation(summary = "Get high-level institutional attendance analytics and breakdown")
    public ResponseEntity<ApiResponse<AnalyticsOverviewDto>> getOverview() {
        return ResponseEntity.ok(ApiResponse.success("Analytics overview retrieved", analyticsService.getInstitutionOverview()));
    }

    @GetMapping("/low-attendance")
    @Operation(summary = "List students falling below the specified or default threshold percentage")
    public ResponseEntity<ApiResponse<List<LowAttendanceStudentDto>>> getLowAttendance(
            @RequestParam(required = false, defaultValue = "75.0") Double threshold) {
        return ResponseEntity.ok(ApiResponse.success("Low attendance students retrieved", analyticsService.getLowAttendanceStudents(threshold)));
    }
}
