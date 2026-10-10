package com.smartattendance.repository;

import com.smartattendance.entity.FacultySubjectAssignment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface FacultySubjectAssignmentRepository extends JpaRepository<FacultySubjectAssignment, Long> {
    List<FacultySubjectAssignment> findByFacultyId(Long facultyId);
    List<FacultySubjectAssignment> findByFacultyIdAndIsActiveTrue(Long facultyId);
    List<FacultySubjectAssignment> findByAcademicClassId(Long classId);
    List<FacultySubjectAssignment> findBySubjectId(Long subjectId);
    boolean existsByFacultyIdAndSubjectIdAndAcademicClassId(Long facultyId, Long subjectId, Long classId);
    Optional<FacultySubjectAssignment> findByFacultyIdAndSubjectIdAndAcademicClassId(Long facultyId, Long subjectId, Long classId);
}
