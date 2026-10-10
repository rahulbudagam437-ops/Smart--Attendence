package com.smartattendance.repository;

import com.smartattendance.entity.AttendanceRecord;
import com.smartattendance.entity.AttendanceStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface AttendanceRecordRepository extends JpaRepository<AttendanceRecord, Long> {
    List<AttendanceRecord> findBySessionId(Long sessionId);
    List<AttendanceRecord> findBySessionIdOrderByMarkedAtDesc(Long sessionId);
    List<AttendanceRecord> findByStudentIdOrderByMarkedAtDesc(Long studentId);
    Optional<AttendanceRecord> findBySessionIdAndStudentId(Long sessionId, Long studentId);
    boolean existsBySessionIdAndStudentId(Long sessionId, Long studentId);
    long countBySessionId(Long sessionId);
    long countBySessionIdAndStatus(Long sessionId, AttendanceStatus status);
    long countByStudentIdAndStatus(Long studentId, AttendanceStatus status);

    @Query("SELECT r FROM AttendanceRecord r WHERE r.student.id = :studentId AND r.session.subject.id = :subjectId")
    List<AttendanceRecord> findByStudentIdAndSubjectId(@Param("studentId") Long studentId, @Param("subjectId") Long subjectId);

    @Query("SELECT r FROM AttendanceRecord r WHERE (:classId IS NULL OR r.session.academicClass.id = :classId) " +
           "AND (:subjectId IS NULL OR r.session.subject.id = :subjectId) " +
           "AND (:startDate IS NULL OR r.session.sessionDate >= :startDate) " +
           "AND (:endDate IS NULL OR r.session.sessionDate <= :endDate) " +
           "AND (:status IS NULL OR r.status = :status) " +
           "ORDER BY r.session.sessionDate DESC, r.markedAt DESC")
    List<AttendanceRecord> filterRecords(@Param("classId") Long classId,
                                         @Param("subjectId") Long subjectId,
                                         @Param("startDate") LocalDate startDate,
                                         @Param("endDate") LocalDate endDate,
                                         @Param("status") AttendanceStatus status);

    @Query("SELECT COUNT(r) FROM AttendanceRecord r WHERE r.student.id = :studentId AND (r.status = 'PRESENT' OR (r.status = 'LATE' AND :countLateAsPresent = true))")
    long countStudentAttendedSessions(@Param("studentId") Long studentId, @Param("countLateAsPresent") boolean countLateAsPresent);
}
