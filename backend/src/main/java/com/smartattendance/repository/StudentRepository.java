package com.smartattendance.repository;

import com.smartattendance.entity.Student;
import com.smartattendance.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface StudentRepository extends JpaRepository<Student, Long> {
    Optional<Student> findByUser(User user);
    Optional<Student> findByUserId(Long userId);
    Optional<Student> findByRollNumber(String rollNumber);
    Optional<Student> findByRegistrationNo(String registrationNo);
    boolean existsByRollNumber(String rollNumber);
    boolean existsByRegistrationNo(String registrationNo);
    List<Student> findByAcademicClassId(Long classId);
    List<Student> findByDepartmentId(Long departmentId);
}
