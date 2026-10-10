package com.smartattendance.repository;

import com.smartattendance.entity.AttendanceSession;
import com.smartattendance.entity.SessionStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface AttendanceSessionRepository extends JpaRepository<AttendanceSession, Long> {
    Optional<AttendanceSession> findBySessionToken(String sessionToken);
    Optional<AttendanceSession> findBySessionCode(String sessionCode);
    List<AttendanceSession> findByFacultyIdOrderByCreatedAtDesc(Long facultyId);
    List<AttendanceSession> findByAcademicClassIdOrderBySessionDateDesc(Long classId);
    List<AttendanceSession> findByFacultyIdAndSessionDate(Long facultyId, LocalDate date);
    List<AttendanceSession> findByAcademicClassIdAndSubjectId(Long classId, Long subjectId);
    long countByFacultyId(Long facultyId);
    long countByStatus(SessionStatus status);

    @Query("SELECT s FROM AttendanceSession s WHERE (:classId IS NULL OR s.academicClass.id = :classId) " +
           "AND (:subjectId IS NULL OR s.subject.id = :subjectId) " +
           "AND (:startDate IS NULL OR s.sessionDate >= :startDate) " +
           "AND (:endDate IS NULL OR s.sessionDate <= :endDate) " +
           "ORDER BY s.sessionDate DESC, s.startTime DESC")
    List<AttendanceSession> filterSessions(@Param("classId") Long classId,
                                           @Param("subjectId") Long subjectId,
                                           @Param("startDate") LocalDate startDate,
                                           @Param("endDate") LocalDate endDate);
}
