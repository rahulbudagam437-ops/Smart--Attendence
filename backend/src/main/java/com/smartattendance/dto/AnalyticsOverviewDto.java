package com.smartattendance.dto;

import java.util.List;
import java.util.Map;

public class AnalyticsOverviewDto {
    private double overallPercentage;
    private long totalSessionsFinalized;
    private long totalRecordsLogged;
    private long presentCount;
    private long absentCount;
    private long lateCount;
    private double presentPercentage;
    private double absentPercentage;
    private double latePercentage;
    private List<Map<String, Object>> dailyTrends;
    private List<Map<String, Object>> classComparisons;
    private List<Map<String, Object>> subjectAttendance;
    private List<LowAttendanceStudentDto> lowAttendanceStudents;

    public AnalyticsOverviewDto() {}

    public double getOverallPercentage() { return overallPercentage; }
    public void setOverallPercentage(double overallPercentage) { this.overallPercentage = overallPercentage; }

    public long getTotalSessionsFinalized() { return totalSessionsFinalized; }
    public void setTotalSessionsFinalized(long totalSessionsFinalized) { this.totalSessionsFinalized = totalSessionsFinalized; }

    public long getTotalRecordsLogged() { return totalRecordsLogged; }
    public void setTotalRecordsLogged(long totalRecordsLogged) { this.totalRecordsLogged = totalRecordsLogged; }

    public long getPresentCount() { return presentCount; }
    public void setPresentCount(long presentCount) { this.presentCount = presentCount; }

    public long getAbsentCount() { return absentCount; }
    public void setAbsentCount(long absentCount) { this.absentCount = absentCount; }

    public long getLateCount() { return lateCount; }
    public void setLateCount(long lateCount) { this.lateCount = lateCount; }

    public double getPresentPercentage() { return presentPercentage; }
    public void setPresentPercentage(double presentPercentage) { this.presentPercentage = presentPercentage; }

    public double getAbsentPercentage() { return absentPercentage; }
    public void setAbsentPercentage(double absentPercentage) { this.absentPercentage = absentPercentage; }

    public double getLatePercentage() { return latePercentage; }
    public void setLatePercentage(double latePercentage) { this.latePercentage = latePercentage; }

    public List<Map<String, Object>> getDailyTrends() { return dailyTrends; }
    public void setDailyTrends(List<Map<String, Object>> dailyTrends) { this.dailyTrends = dailyTrends; }

    public List<Map<String, Object>> getClassComparisons() { return classComparisons; }
    public void setClassComparisons(List<Map<String, Object>> classComparisons) { this.classComparisons = classComparisons; }

    public List<Map<String, Object>> getSubjectAttendance() { return subjectAttendance; }
    public void setSubjectAttendance(List<Map<String, Object>> subjectAttendance) { this.subjectAttendance = subjectAttendance; }

    public List<LowAttendanceStudentDto> getLowAttendanceStudents() { return lowAttendanceStudents; }
    public void setLowAttendanceStudents(List<LowAttendanceStudentDto> lowAttendanceStudents) { this.lowAttendanceStudents = lowAttendanceStudents; }
}
