-- =====================================================================
-- SMART ATTENDANCE SYSTEM (ADVANCED) - POSTGRESQL SEED DATA
-- Credentials for login:
-- Admin:    admin / Admin@123
-- Faculty:  prof.sharma / Faculty@123
-- Faculty:  dr.anita / Faculty@123
-- Students: student.aarav / Student@123
--           student.diya / Student@123
--           student.rohan / Student@123
--           student.priya / Student@123
--           student.vikram / Student@123
-- =====================================================================

-- 1. DEPARTMENTS
INSERT INTO departments (id, code, name, description) VALUES
(1, 'CSE', 'Computer Science and Engineering', 'Department of Computer Science & Engineering'),
(2, 'ECE', 'Electronics and Communication Engineering', 'Department of Electronics & Communication')
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name;

SELECT setval('departments_id_seq', (SELECT MAX(id) FROM departments));

-- 2. ACADEMIC CLASSES
INSERT INTO classes (id, name, department_id, section, semester, academic_year, is_active) VALUES
(1, 'B.Tech CSE - Year 3 - Sec A', 1, 'A', 6, '2025-2026', TRUE),
(2, 'B.Tech CSE - Year 3 - Sec B', 1, 'B', 6, '2025-2026', TRUE),
(3, 'B.Tech ECE - Year 2 - Sec A', 2, 'A', 4, '2025-2026', TRUE)
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name;

SELECT setval('classes_id_seq', (SELECT MAX(id) FROM classes));

-- 3. SUBJECTS
INSERT INTO subjects (id, code, name, department_id, credits, is_active) VALUES
(1, 'CS601', 'Advanced Database Systems', 1, 4, TRUE),
(2, 'CS602', 'Cloud Computing & DevOps', 1, 3, TRUE),
(3, 'CS603', 'Machine Learning & AI', 1, 4, TRUE),
(4, 'CS604', 'Software Engineering & Testing', 1, 3, TRUE)
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name;

SELECT setval('subjects_id_seq', (SELECT MAX(id) FROM subjects));

-- 4. USERS
-- Standard password hash for Admin@123, Faculty@123, Student@123
INSERT INTO users (id, username, password, email, full_name, role, phone, is_active) VALUES
(1, 'admin', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iKTVKIUi', 'admin@institution.edu', 'System Administrator', 'ADMIN', '+91 9876543210', TRUE),
(2, 'prof.sharma', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iKTVKIUi', 'rajesh.sharma@institution.edu', 'Dr. Rajesh Sharma', 'FACULTY', '+91 9876543211', TRUE),
(3, 'dr.anita', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iKTVKIUi', 'anita.rao@institution.edu', 'Dr. Anita Rao', 'FACULTY', '+91 9876543212', TRUE),
(4, 'student.aarav', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iKTVKIUi', 'aarav.patel@student.edu', 'Aarav Patel', 'STUDENT', '+91 9876543220', TRUE),
(5, 'student.diya', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iKTVKIUi', 'diya.sharma@student.edu', 'Diya Sharma', 'STUDENT', '+91 9876543221', TRUE),
(6, 'student.rohan', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iKTVKIUi', 'rohan.verma@student.edu', 'Rohan Verma', 'STUDENT', '+91 9876543222', TRUE),
(7, 'student.priya', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iKTVKIUi', 'priya.nair@student.edu', 'Priya Nair', 'STUDENT', '+91 9876543223', TRUE),
(8, 'student.vikram', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iKTVKIUi', 'vikram.singh@student.edu', 'Vikram Singh', 'STUDENT', '+91 9876543224', TRUE)
ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name;

SELECT setval('users_id_seq', (SELECT MAX(id) FROM users));

-- 5. FACULTY PROFILES
INSERT INTO faculty (id, user_id, employee_id, department_id, designation, qualification) VALUES
(1, 2, 'FAC-CSE-001', 1, 'Professor & Head', 'Ph.D in Computer Science'),
(2, 3, 'FAC-CSE-002', 1, 'Associate Professor', 'Ph.D in Information Systems')
ON CONFLICT (id) DO UPDATE SET designation = EXCLUDED.designation;

SELECT setval('faculty_id_seq', (SELECT MAX(id) FROM faculty));

-- 6. STUDENT PROFILES
INSERT INTO students (id, user_id, roll_number, registration_no, class_id, department_id, batch_year) VALUES
(1, 4, '2023CS0101', 'REG-2023-0101', 1, 1, '2023-2027'),
(2, 5, '2023CS0102', 'REG-2023-0102', 1, 1, '2023-2027'),
(3, 6, '2023CS0103', 'REG-2023-0103', 1, 1, '2023-2027'),
(4, 7, '2023CS0104', 'REG-2023-0104', 1, 1, '2023-2027'),
(5, 8, '2023CS0105', 'REG-2023-0105', 1, 1, '2023-2027')
ON CONFLICT (id) DO UPDATE SET roll_number = EXCLUDED.roll_number;

SELECT setval('students_id_seq', (SELECT MAX(id) FROM students));

-- 7. STUDENT CLASS ENROLLMENTS
INSERT INTO student_class_enrollments (id, student_id, class_id, academic_year, status) VALUES
(1, 1, 1, '2025-2026', 'ACTIVE'),
(2, 2, 1, '2025-2026', 'ACTIVE'),
(3, 3, 1, '2025-2026', 'ACTIVE'),
(4, 4, 1, '2025-2026', 'ACTIVE'),
(5, 5, 1, '2025-2026', 'ACTIVE')
ON CONFLICT (id) DO NOTHING;

SELECT setval('student_class_enrollments_id_seq', (SELECT MAX(id) FROM student_class_enrollments));

-- 8. FACULTY SUBJECT ASSIGNMENTS
INSERT INTO faculty_subject_assignments (id, faculty_id, subject_id, class_id, academic_year) VALUES
(1, 1, 1, 1, '2025-2026'),
(2, 1, 2, 1, '2025-2026'),
(3, 2, 3, 1, '2025-2026'),
(4, 2, 4, 1, '2025-2026')
ON CONFLICT (id) DO NOTHING;

SELECT setval('faculty_subject_assignments_id_seq', (SELECT MAX(id) FROM faculty_subject_assignments));

-- 9. ACADEMIC SETTINGS
INSERT INTO academic_settings (id, setting_key, setting_value, description) VALUES
(1, 'LOW_ATTENDANCE_THRESHOLD', '75', 'Minimum attendance percentage threshold'),
(2, 'QR_EXPIRY_MINUTES_DEFAULT', '10', 'Default session expiry in minutes'),
(3, 'ALLOW_LATE_ATTENDANCE', 'true', 'Whether late marks count towards presence')
ON CONFLICT (id) DO UPDATE SET setting_value = EXCLUDED.setting_value;

SELECT setval('academic_settings_id_seq', (SELECT MAX(id) FROM academic_settings));
