package com.smartattendance.dto;

import java.util.List;

public class FacultyDashboardDto {
    private Long facultyId;
    private String fullName;
    private String employeeId;
    private String departmentName;
    private long totalAssignedClasses;
    private long totalAssignedSubjects;
    private long todaySessionsCount;
    private long totalStudentsReached;
    private long presentCountToday;
    private long absentCountToday;
    private List<SessionResponseDto> todaySessions;
    private List<SessionResponseDto> recentSessions;
    private List<AcademicClassDto> assignedClasses;
    private List<SubjectDto> assignedSubjects;

    public FacultyDashboardDto() {}

    public Long getFacultyId() { return facultyId; }
    public void setFacultyId(Long facultyId) { this.facultyId = facultyId; }

    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }

    public String getEmployeeId() { return employeeId; }
    public void setEmployeeId(String employeeId) { this.employeeId = employeeId; }

    public String getDepartmentName() { return departmentName; }
    public void setDepartmentName(String departmentName) { this.departmentName = departmentName; }

    public long getTotalAssignedClasses() { return totalAssignedClasses; }
    public void setTotalAssignedClasses(long totalAssignedClasses) { this.totalAssignedClasses = totalAssignedClasses; }

    public long getTotalAssignedSubjects() { return totalAssignedSubjects; }
    public void setTotalAssignedSubjects(long totalAssignedSubjects) { this.totalAssignedSubjects = totalAssignedSubjects; }

    public long getTodaySessionsCount() { return todaySessionsCount; }
    public void setTodaySessionsCount(long todaySessionsCount) { this.todaySessionsCount = todaySessionsCount; }

    public long getTotalStudentsReached() { return totalStudentsReached; }
    public void setTotalStudentsReached(long totalStudentsReached) { this.totalStudentsReached = totalStudentsReached; }

    public long getPresentCountToday() { return presentCountToday; }
    public void setPresentCountToday(long presentCountToday) { this.presentCountToday = presentCountToday; }

    public long getAbsentCountToday() { return absentCountToday; }
    public void setAbsentCountToday(long absentCountToday) { this.absentCountToday = absentCountToday; }

    public List<SessionResponseDto> getTodaySessions() { return todaySessions; }
    public void setTodaySessions(List<SessionResponseDto> todaySessions) { this.todaySessions = todaySessions; }

    public List<SessionResponseDto> getRecentSessions() { return recentSessions; }
    public void setRecentSessions(List<SessionResponseDto> recentSessions) { this.recentSessions = recentSessions; }

    public List<AcademicClassDto> getAssignedClasses() { return assignedClasses; }
    public void setAssignedClasses(List<AcademicClassDto> assignedClasses) { this.assignedClasses = assignedClasses; }

    public List<SubjectDto> getAssignedSubjects() { return assignedSubjects; }
    public void setAssignedSubjects(List<SubjectDto> assignedSubjects) { this.assignedSubjects = assignedSubjects; }
}
