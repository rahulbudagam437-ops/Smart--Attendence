package com.smartattendance.repository;

import com.smartattendance.entity.EnrollmentStatus;
import com.smartattendance.entity.StudentClassEnrollment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface StudentClassEnrollmentRepository extends JpaRepository<StudentClassEnrollment, Long> {
    Optional<StudentClassEnrollment> findByStudentIdAndAcademicClassId(Long studentId, Long classId);
    boolean existsByStudentIdAndAcademicClassIdAndStatus(Long studentId, Long classId, EnrollmentStatus status);
    List<StudentClassEnrollment> findByAcademicClassIdAndStatus(Long classId, EnrollmentStatus status);
    List<StudentClassEnrollment> findByStudentId(Long studentId);
}
