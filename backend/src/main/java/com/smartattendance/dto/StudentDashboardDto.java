package com.smartattendance.dto;

import java.util.List;

public class StudentDashboardDto {
    private Long studentId;
    private String fullName;
    private String rollNumber;
    private String registrationNo;
    private Long classId;
    private String className;
    private String departmentName;
    private double overallPercentage;
    private long totalEligibleSessions;
    private long presentSessions;
    private long absentSessions;
    private long lateSessions;
    private double lowAttendanceThreshold;
    private List<SubjectAttendanceSummaryDto> subjectSummaries;
    private List<AttendanceRecordDto> recentAttendance;

    public StudentDashboardDto() {}

    public Long getStudentId() { return studentId; }
    public void setStudentId(Long studentId) { this.studentId = studentId; }

    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }

    public String getRollNumber() { return rollNumber; }
    public void setRollNumber(String rollNumber) { this.rollNumber = rollNumber; }

    public String getRegistrationNo() { return registrationNo; }
    public void setRegistrationNo(String registrationNo) { this.registrationNo = registrationNo; }

    public Long getClassId() { return classId; }
    public void setClassId(Long classId) { this.classId = classId; }

    public String getClassName() { return className; }
    public void setClassName(String className) { this.className = className; }

    public String getDepartmentName() { return departmentName; }
    public void setDepartmentName(String departmentName) { this.departmentName = departmentName; }

    public double getOverallPercentage() { return overallPercentage; }
    public void setOverallPercentage(double overallPercentage) { this.overallPercentage = overallPercentage; }

    public long getTotalEligibleSessions() { return totalEligibleSessions; }
    public void setTotalEligibleSessions(long totalEligibleSessions) { this.totalEligibleSessions = totalEligibleSessions; }

    public long getPresentSessions() { return presentSessions; }
    public void setPresentSessions(long presentSessions) { this.presentSessions = presentSessions; }

    public long getAbsentSessions() { return absentSessions; }
    public void setAbsentSessions(long absentSessions) { this.absentSessions = absentSessions; }

    public long getLateSessions() { return lateSessions; }
    public void setLateSessions(long lateSessions) { this.lateSessions = lateSessions; }

    public double getLowAttendanceThreshold() { return lowAttendanceThreshold; }
    public void setLowAttendanceThreshold(double lowAttendanceThreshold) { this.lowAttendanceThreshold = lowAttendanceThreshold; }

    public List<SubjectAttendanceSummaryDto> getSubjectSummaries() { return subjectSummaries; }
    public void setSubjectSummaries(List<SubjectAttendanceSummaryDto> subjectSummaries) { this.subjectSummaries = subjectSummaries; }

    public List<AttendanceRecordDto> getRecentAttendance() { return recentAttendance; }
    public void setRecentAttendance(List<AttendanceRecordDto> recentAttendance) { this.recentAttendance = recentAttendance; }
}
