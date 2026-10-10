package com.smartattendance.dto;

import com.smartattendance.entity.AttendanceStatus;
import java.time.LocalDate;

public class ReportFilterDto {
    private Long classId;
    private Long subjectId;
    private Long studentId;
    private LocalDate startDate;
    private LocalDate endDate;
    private AttendanceStatus status;

    public ReportFilterDto() {}

    public Long getClassId() { return classId; }
    public void setClassId(Long classId) { this.classId = classId; }

    public Long getSubjectId() { return subjectId; }
    public void setSubjectId(Long subjectId) { this.subjectId = subjectId; }

    public Long getStudentId() { return studentId; }
    public void setStudentId(Long studentId) { this.studentId = studentId; }

    public LocalDate getStartDate() { return startDate; }
    public void setStartDate(LocalDate startDate) { this.startDate = startDate; }

    public LocalDate getEndDate() { return endDate; }
    public void setEndDate(LocalDate endDate) { this.endDate = endDate; }

    public AttendanceStatus getStatus() { return status; }
    public void setStatus(AttendanceStatus status) { this.status = status; }
}
