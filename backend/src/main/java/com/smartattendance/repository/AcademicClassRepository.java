package com.smartattendance.repository;

import com.smartattendance.entity.AcademicClass;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AcademicClassRepository extends JpaRepository<AcademicClass, Long> {
    List<AcademicClass> findByDepartmentId(Long departmentId);
    List<AcademicClass> findByIsActiveTrue();
}
