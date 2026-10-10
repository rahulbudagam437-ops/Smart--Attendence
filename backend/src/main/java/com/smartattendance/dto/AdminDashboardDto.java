package com.smartattendance.dto;

import java.util.List;
import java.util.Map;

public class AdminDashboardDto {
    private long totalStudents;
    private long totalFaculty;
    private long totalClasses;
    private long totalSubjects;
    private double overallAttendancePercentage;
    private long totalSessionsConducted;
    private List<LowAttendanceStudentDto> lowAttendanceStudents;
    private List<SessionResponseDto> recentSessions;
    private List<Map<String, Object>> classWiseAttendance;

    public AdminDashboardDto() {}

    public long getTotalStudents() { return totalStudents; }
    public void setTotalStudents(long totalStudents) { this.totalStudents = totalStudents; }

    public long getTotalFaculty() { return totalFaculty; }
    public void setTotalFaculty(long totalFaculty) { this.totalFaculty = totalFaculty; }

    public long getTotalClasses() { return totalClasses; }
    public void setTotalClasses(long totalClasses) { this.totalClasses = totalClasses; }

    public long getTotalSubjects() { return totalSubjects; }
    public void setTotalSubjects(long totalSubjects) { this.totalSubjects = totalSubjects; }

    public double getOverallAttendancePercentage() { return overallAttendancePercentage; }
    public void setOverallAttendancePercentage(double overallAttendancePercentage) { this.overallAttendancePercentage = overallAttendancePercentage; }

    public long getTotalSessionsConducted() { return totalSessionsConducted; }
    public void setTotalSessionsConducted(long totalSessionsConducted) { this.totalSessionsConducted = totalSessionsConducted; }

    public List<LowAttendanceStudentDto> getLowAttendanceStudents() { return lowAttendanceStudents; }
    public void setLowAttendanceStudents(List<LowAttendanceStudentDto> lowAttendanceStudents) { this.lowAttendanceStudents = lowAttendanceStudents; }

    public List<SessionResponseDto> getRecentSessions() { return recentSessions; }
    public void setRecentSessions(List<SessionResponseDto> recentSessions) { this.recentSessions = recentSessions; }

    public List<Map<String, Object>> getClassWiseAttendance() { return classWiseAttendance; }
    public void setClassWiseAttendance(List<Map<String, Object>> classWiseAttendance) { this.classWiseAttendance = classWiseAttendance; }
}
