package com.smartattendance.controller;

import com.smartattendance.dto.*;
import com.smartattendance.service.AdminService;
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
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('ADMIN')")
@Tag(name = "Administration", description = "Endpoints for administrator management of users, academic structures, and system setup")
public class AdminController {

    private final AdminService adminService;

    public AdminController(AdminService adminService) {
        this.adminService = adminService;
    }

    @GetMapping("/dashboard")
    @Operation(summary = "Get admin dashboard overview")
    public ResponseEntity<ApiResponse<AdminDashboardDto>> getDashboard() {
        return ResponseEntity.ok(ApiResponse.success("Admin dashboard retrieved", adminService.getAdminDashboard()));
    }

    @GetMapping("/users")
    @Operation(summary = "List all registered users")
    public ResponseEntity<ApiResponse<List<UserDto>>> getAllUsers() {
        return ResponseEntity.ok(ApiResponse.success("Users retrieved", adminService.getAllUsers()));
    }

    @PostMapping("/users")
    @Operation(summary = "Create user account with associated profile")
    public ResponseEntity<ApiResponse<UserDto>> createUser(@Valid @RequestBody CreateUserRequest request) {
        UserDto created = adminService.createUser(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success("User created successfully", created));
    }

    @PatchMapping("/users/{id}/status")
    @Operation(summary = "Activate or deactivate user account")
    public ResponseEntity<ApiResponse<UserDto>> updateUserStatus(@PathVariable Long id, @Valid @RequestBody UpdateUserStatusRequest request) {
        UserDto updated = adminService.updateUserStatus(id, request.getIsActive());
        return ResponseEntity.ok(ApiResponse.success("User status updated successfully", updated));
    }

    @GetMapping("/classes")
    @Operation(summary = "List all classes")
    public ResponseEntity<ApiResponse<List<AcademicClassDto>>> getAllClasses() {
        return ResponseEntity.ok(ApiResponse.success("Classes retrieved", adminService.getAllClasses()));
    }

    @PostMapping("/classes")
    @Operation(summary = "Create new class")
    public ResponseEntity<ApiResponse<AcademicClassDto>> createClass(@Valid @RequestBody AcademicClassDto dto) {
        AcademicClassDto created = adminService.createClass(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success("Class created successfully", created));
    }

    @GetMapping("/subjects")
    @Operation(summary = "List all subjects")
    public ResponseEntity<ApiResponse<List<SubjectDto>>> getAllSubjects() {
        return ResponseEntity.ok(ApiResponse.success("Subjects retrieved", adminService.getAllSubjects()));
    }

    @PostMapping("/subjects")
    @Operation(summary = "Create new subject")
    public ResponseEntity<ApiResponse<SubjectDto>> createSubject(@Valid @RequestBody SubjectDto dto) {
        SubjectDto created = adminService.createSubject(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success("Subject created successfully", created));
    }

    @GetMapping("/departments")
    @Operation(summary = "List all departments")
    public ResponseEntity<ApiResponse<List<DepartmentDto>>> getAllDepartments() {
        return ResponseEntity.ok(ApiResponse.success("Departments retrieved", adminService.getAllDepartments()));
    }

    @PostMapping("/departments")
    @Operation(summary = "Create new department")
    public ResponseEntity<ApiResponse<DepartmentDto>> createDepartment(@Valid @RequestBody DepartmentDto dto) {
        DepartmentDto created = adminService.createDepartment(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success("Department created successfully", created));
    }

    @PostMapping("/assign")
    @Operation(summary = "Assign faculty to a subject and class")
    public ResponseEntity<ApiResponse<Void>> assignFaculty(@RequestBody Map<String, Object> payload) {
        Long facultyId = Long.valueOf(payload.get("facultyId").toString());
        Long subjectId = Long.valueOf(payload.get("subjectId").toString());
        Long classId = Long.valueOf(payload.get("classId").toString());
        String academicYear = payload.getOrDefault("academicYear", "2025-2026").toString();

        adminService.assignFaculty(facultyId, subjectId, classId, academicYear);
        return ResponseEntity.ok(ApiResponse.success("Faculty assignment created successfully"));
    }
}
