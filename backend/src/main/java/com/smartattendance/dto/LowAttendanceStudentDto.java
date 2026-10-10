package com.smartattendance.dto;

public class LowAttendanceStudentDto {
    private Long studentId;
    private String studentName;
    private String rollNumber;
    private Long classId;
    private String className;
    private long eligibleSessions;
    private long attendedSessions;
    private double percentage;

    public LowAttendanceStudentDto() {}

    public LowAttendanceStudentDto(Long studentId, String studentName, String rollNumber, Long classId,
                                  String className, long eligibleSessions, long attendedSessions, double percentage) {
        this.studentId = studentId;
        this.studentName = studentName;
        this.rollNumber = rollNumber;
        this.classId = classId;
        this.className = className;
        this.eligibleSessions = eligibleSessions;
        this.attendedSessions = attendedSessions;
        this.percentage = percentage;
    }

    public Long getStudentId() { return studentId; }
    public void setStudentId(Long studentId) { this.studentId = studentId; }

    public String getStudentName() { return studentName; }
    public void setStudentName(String studentName) { this.studentName = studentName; }

    public String getRollNumber() { return rollNumber; }
    public void setRollNumber(String rollNumber) { this.rollNumber = rollNumber; }

    public Long getClassId() { return classId; }
    public void setClassId(Long classId) { this.classId = classId; }

    public String getClassName() { return className; }
    public void setClassName(String className) { this.className = className; }

    public long getEligibleSessions() { return eligibleSessions; }
    public void setEligibleSessions(long eligibleSessions) { this.eligibleSessions = eligibleSessions; }

    public long getAttendedSessions() { return attendedSessions; }
    public void setAttendedSessions(long attendedSessions) { this.attendedSessions = attendedSessions; }

    public double getPercentage() { return percentage; }
    public void setPercentage(double percentage) { this.percentage = percentage; }
}
