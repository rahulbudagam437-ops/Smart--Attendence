package com.smartattendance.dto;

public class SubjectAttendanceSummaryDto {
    private Long subjectId;
    private String subjectCode;
    private String subjectName;
    private long totalSessions;
    private long attendedSessions;
    private long lateSessions;
    private long absentSessions;
    private double percentage;
    private boolean isBelowThreshold;

    public SubjectAttendanceSummaryDto() {}

    public Long getSubjectId() { return subjectId; }
    public void setSubjectId(Long subjectId) { this.subjectId = subjectId; }

    public String getSubjectCode() { return subjectCode; }
    public void setSubjectCode(String subjectCode) { this.subjectCode = subjectCode; }

    public String getSubjectName() { return subjectName; }
    public void setSubjectName(String subjectName) { this.subjectName = subjectName; }

    public long getTotalSessions() { return totalSessions; }
    public void setTotalSessions(long totalSessions) { this.totalSessions = totalSessions; }

    public long getAttendedSessions() { return attendedSessions; }
    public void setAttendedSessions(long attendedSessions) { this.attendedSessions = attendedSessions; }

    public long getLateSessions() { return lateSessions; }
    public void setLateSessions(long lateSessions) { this.lateSessions = lateSessions; }

    public long getAbsentSessions() { return absentSessions; }
    public void setAbsentSessions(long absentSessions) { this.absentSessions = absentSessions; }

    public double getPercentage() { return percentage; }
    public void setPercentage(double percentage) { this.percentage = percentage; }

    public boolean isBelowThreshold() { return isBelowThreshold; }
    public void setBelowThreshold(boolean belowThreshold) { isBelowThreshold = belowThreshold; }
}
