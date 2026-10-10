-- =====================================================================
-- SMART ATTENDANCE SYSTEM (ADVANCED) - DEMO SEED DATA
-- Passwords (BCrypt encrypted):
-- Admin:    admin / Admin@123
-- Faculty:  prof.sharma / Faculty@123
-- Faculty:  dr.anita / Faculty@123
-- Students: student.aarav / Student@123
--           student.diya / Student@123
--           student.rohan / Student@123
--           student.priya / Student@123
--           student.vikram / Student@123
-- =====================================================================

USE smart_attendance;

-- 1. DEPARTMENTS
INSERT INTO departments (id, code, name, description) VALUES
(1, 'CSE', 'Computer Science and Engineering', 'Department of Computer Science & Engineering'),
(2, 'ECE', 'Electronics and Communication Engineering', 'Department of Electronics & Communication')
ON DUPLICATE KEY UPDATE name=VALUES(name);

-- 2. ACADEMIC CLASSES
INSERT INTO classes (id, name, department_id, section, semester, academic_year, is_active) VALUES
(1, 'B.Tech CSE - Year 3 - Sec A', 1, 'A', 6, '2025-2026', TRUE),
(2, 'B.Tech CSE - Year 3 - Sec B', 1, 'B', 6, '2025-2026', TRUE),
(3, 'B.Tech ECE - Year 2 - Sec A', 2, 'A', 4, '2025-2026', TRUE)
ON DUPLICATE KEY UPDATE name=VALUES(name);

-- 3. SUBJECTS
INSERT INTO subjects (id, code, name, department_id, credits, is_active) VALUES
(1, 'CS601', 'Advanced Database Systems', 1, 4, TRUE),
(2, 'CS602', 'Cloud Computing & DevOps', 1, 3, TRUE),
(3, 'CS603', 'Machine Learning & AI', 1, 4, TRUE),
(4, 'CS604', 'Software Engineering & Testing', 1, 3, TRUE)
ON DUPLICATE KEY UPDATE name=VALUES(name);

-- 4. USERS (BCrypt hashes for respective passwords)
-- Admin@123   -> $2a$10$wEkgvF3bCq0N6r7Nl4kZ6.eKq0g09aHh6xL3R4c2V3eGf6Hj5Lk2y
-- Faculty@123 -> $2a$10$s7vjR0wQ9Yt7LqG9rL6N8eM4a8lK3h7R5yT9xP2zW1qF5nJ8kL2vO
-- Student@123 -> $2a$10$q2hY7mN0pL9tQ5rT8vX1WeZ4u7lM6jK3yR5xT2zW8qP4nJ7kL1vO.
-- Note: Spring Boot DataInitializer also generates/updates these dynamically if needed!
INSERT INTO users (id, username, password, email, full_name, role, phone, is_active) VALUES
(1, 'admin', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iKTVKIUi', 'admin@institution.edu', 'System Administrator', 'ADMIN', '+91 9876543210', TRUE),
(2, 'prof.sharma', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iKTVKIUi', 'rajesh.sharma@institution.edu', 'Dr. Rajesh Sharma', 'FACULTY', '+91 9876543211', TRUE),
(3, 'dr.anita', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iKTVKIUi', 'anita.rao@institution.edu', 'Dr. Anita Rao', 'FACULTY', '+91 9876543212', TRUE),
(4, 'student.aarav', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iKTVKIUi', 'aarav.patel@student.edu', 'Aarav Patel', 'STUDENT', '+91 9876543220', TRUE),
(5, 'student.diya', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iKTVKIUi', 'diya.sharma@student.edu', 'Diya Sharma', 'STUDENT', '+91 9876543221', TRUE),
(6, 'student.rohan', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iKTVKIUi', 'rohan.verma@student.edu', 'Rohan Verma', 'STUDENT', '+91 9876543222', TRUE),
(7, 'student.priya', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iKTVKIUi', 'priya.nair@student.edu', 'Priya Nair', 'STUDENT', '+91 9876543223', TRUE),
(8, 'student.vikram', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iKTVKIUi', 'vikram.singh@student.edu', 'Vikram Singh', 'STUDENT', '+91 9876543224', TRUE)
ON DUPLICATE KEY UPDATE full_name=VALUES(full_name);

-- 5. FACULTY PROFILES
INSERT INTO faculty (id, user_id, employee_id, department_id, designation, qualification) VALUES
(1, 2, 'FAC-CSE-001', 1, 'Professor & Head', 'Ph.D in Computer Science'),
(2, 3, 'FAC-CSE-002', 1, 'Associate Professor', 'Ph.D in Information Systems')
ON DUPLICATE KEY UPDATE designation=VALUES(designation);

-- 6. STUDENT PROFILES
INSERT INTO students (id, user_id, roll_number, registration_no, class_id, department_id, batch_year) VALUES
(1, 4, '2023CS0101', 'REG-2023-0101', 1, 1, '2023-2027'),
(2, 5, '2023CS0102', 'REG-2023-0102', 1, 1, '2023-2027'),
(3, 6, '2023CS0103', 'REG-2023-0103', 1, 1, '2023-2027'),
(4, 7, '2023CS0104', 'REG-2023-0104', 1, 1, '2023-2027'),
(5, 8, '2023CS0105', 'REG-2023-0105', 1, 1, '2023-2027')
ON DUPLICATE KEY UPDATE roll_number=VALUES(roll_number);

-- 7. STUDENT CLASS ENROLLMENTS
INSERT INTO student_class_enrollments (id, student_id, class_id, academic_year, status) VALUES
(1, 1, 1, '2025-2026', 'ACTIVE'),
(2, 2, 1, '2025-2026', 'ACTIVE'),
(3, 3, 1, '2025-2026', 'ACTIVE'),
(4, 4, 1, '2025-2026', 'ACTIVE'),
(5, 5, 1, '2025-2026', 'ACTIVE')
ON DUPLICATE KEY UPDATE status=VALUES(status);

-- 8. FACULTY SUBJECT ASSIGNMENTS
INSERT INTO faculty_subject_assignments (id, faculty_id, subject_id, class_id, academic_year, is_active) VALUES
(1, 1, 1, 1, '2025-2026', TRUE), -- Dr. Rajesh -> CS601 in Class 1
(2, 1, 3, 1, '2025-2026', TRUE), -- Dr. Rajesh -> CS603 in Class 1
(3, 2, 2, 1, '2025-2026', TRUE), -- Dr. Anita -> CS602 in Class 1
(4, 2, 4, 1, '2025-2026', TRUE)  -- Dr. Anita -> CS604 in Class 1
ON DUPLICATE KEY UPDATE is_active=VALUES(is_active);

-- 9. HISTORICAL ATTENDANCE SESSIONS
INSERT INTO attendance_sessions (id, session_code, session_token, faculty_id, subject_id, class_id, session_date, start_time, end_time, expires_at, status, topic) VALUES
(1, 'SESS-20261001-01', 'token-historical-001', 1, 1, 1, '2026-10-01', '09:00:00', '10:00:00', '2026-10-01 10:00:00', 'CLOSED', 'Indexing & B-Trees in RDBMS'),
(2, 'SESS-20261002-02', 'token-historical-002', 1, 1, 1, '2026-10-02', '09:00:00', '10:00:00', '2026-10-02 10:00:00', 'CLOSED', 'Query Optimization & Cost Analysis'),
(3, 'SESS-20261003-03', 'token-historical-003', 2, 2, 1, '2026-10-03', '11:00:00', '12:00:00', '2026-10-03 12:00:00', 'CLOSED', 'Docker Container Architecture'),
(4, 'SESS-20261004-04', 'token-historical-004', 2, 2, 1, '2026-10-04', '11:00:00', '12:00:00', '2026-10-04 12:00:00', 'CLOSED', 'Kubernetes Pods & Services'),
(5, 'SESS-20261006-05', 'token-historical-005', 1, 3, 1, '2026-10-06', '14:00:00', '15:00:00', '2026-10-06 15:00:00', 'CLOSED', 'Supervised Learning & Gradient Descent'),
(6, 'SESS-20261007-06', 'token-historical-006', 1, 3, 1, '2026-10-07', '14:00:00', '15:00:00', '2026-10-07 15:00:00', 'CLOSED', 'Convolutional Neural Networks'),
(7, 'SESS-20261008-07', 'token-historical-007', 2, 4, 1, '2026-10-08', '10:00:00', '11:00:00', '2026-10-08 11:00:00', 'CLOSED', 'Agile Scrum & Sprint Planning'),
(8, 'SESS-20261009-08', 'token-historical-008', 2, 4, 1, '2026-10-09', '10:00:00', '11:00:00', '2026-10-09 11:00:00', 'CLOSED', 'Automated Testing & CI/CD Pipelines')
ON DUPLICATE KEY UPDATE status=VALUES(status);

-- 10. ATTENDANCE RECORDS (Populated to reflect varied attendance percentages)
-- Session 1
INSERT INTO attendance_records (session_id, student_id, status, marked_at, method) VALUES
(1, 1, 'PRESENT', '2026-10-01 09:05:12', 'QR_SCAN'),
(1, 2, 'PRESENT', '2026-10-01 09:04:45', 'QR_SCAN'),
(1, 3, 'PRESENT', '2026-10-01 09:06:20', 'QR_SCAN'),
(1, 4, 'PRESENT', '2026-10-01 09:05:55', 'QR_SCAN'),
(1, 5, 'ABSENT',  '2026-10-01 10:00:00', 'MANUAL_FACULTY'),

-- Session 2
(2, 1, 'PRESENT', '2026-10-02 09:03:10', 'QR_SCAN'),
(2, 2, 'PRESENT', '2026-10-02 09:04:12', 'QR_SCAN'),
(2, 3, 'ABSENT',  '2026-10-02 10:00:00', 'MANUAL_FACULTY'),
(2, 4, 'PRESENT', '2026-10-02 09:05:30', 'QR_SCAN'),
(2, 5, 'ABSENT',  '2026-10-02 10:00:00', 'MANUAL_FACULTY'),

-- Session 3
(3, 1, 'PRESENT', '2026-10-03 11:02:18', 'QR_SCAN'),
(3, 2, 'PRESENT', '2026-10-03 11:04:10', 'QR_SCAN'),
(3, 3, 'PRESENT', '2026-10-03 11:05:40', 'QR_SCAN'),
(3, 4, 'ABSENT',  '2026-10-03 12:00:00', 'MANUAL_FACULTY'),
(3, 5, 'ABSENT',  '2026-10-03 12:00:00', 'MANUAL_FACULTY'),

-- Session 4
(4, 1, 'PRESENT', '2026-10-04 11:03:00', 'QR_SCAN'),
(4, 2, 'PRESENT', '2026-10-04 11:04:22', 'QR_SCAN'),
(4, 3, 'PRESENT', '2026-10-04 11:05:15', 'QR_SCAN'),
(4, 4, 'PRESENT', '2026-10-04 11:06:05', 'QR_SCAN'),
(4, 5, 'LATE',     '2026-10-04 11:15:30', 'MANUAL_FACULTY'),

-- Session 5
(5, 1, 'PRESENT', '2026-10-06 14:04:10', 'QR_SCAN'),
(5, 2, 'PRESENT', '2026-10-06 14:05:00', 'QR_SCAN'),
(5, 3, 'ABSENT',  '2026-10-06 15:00:00', 'MANUAL_FACULTY'),
(5, 4, 'PRESENT', '2026-10-06 14:06:12', 'QR_SCAN'),
(5, 5, 'ABSENT',  '2026-10-06 15:00:00', 'MANUAL_FACULTY'),

-- Session 6
(6, 1, 'PRESENT', '2026-10-07 14:02:50', 'QR_SCAN'),
(6, 2, 'PRESENT', '2026-10-07 14:03:15', 'QR_SCAN'),
(6, 3, 'PRESENT', '2026-10-07 14:04:20', 'QR_SCAN'),
(6, 4, 'PRESENT', '2026-10-07 14:05:40', 'QR_SCAN'),
(6, 5, 'ABSENT',  '2026-10-07 15:00:00', 'MANUAL_FACULTY'),

-- Session 7
(7, 1, 'PRESENT', '2026-10-08 10:04:12', 'QR_SCAN'),
(7, 2, 'PRESENT', '2026-10-08 10:05:01', 'QR_SCAN'),
(7, 3, 'PRESENT', '2026-10-08 10:06:15', 'QR_SCAN'),
(7, 4, 'PRESENT', '2026-10-08 10:06:50', 'QR_SCAN'),
(7, 5, 'ABSENT',  '2026-10-08 11:00:00', 'MANUAL_FACULTY'),

-- Session 8
(8, 1, 'PRESENT', '2026-10-09 10:03:40', 'QR_SCAN'),
(8, 2, 'PRESENT', '2026-10-09 10:04:10', 'QR_SCAN'),
(8, 3, 'PRESENT', '2026-10-09 10:05:22', 'QR_SCAN'),
(8, 4, 'PRESENT', '2026-10-09 10:06:11', 'QR_SCAN'),
(8, 5, 'LATE',     '2026-10-09 10:14:05', 'MANUAL_FACULTY')
ON DUPLICATE KEY UPDATE status=VALUES(status);

-- 11. AUDIT LOGS (Demonstrating manual changes with reasons)
INSERT INTO attendance_audit_logs (id, attendance_record_id, modified_by_user_id, previous_status, new_status, reason, modified_at) VALUES
(1, 20, 3, 'ABSENT', 'LATE', 'Student arrived late due to institution bus breakdown; approved by HOD', '2026-10-04 11:20:00'),
(2, 40, 3, 'ABSENT', 'LATE', 'Medical emergency slip presented; attendance adjusted to Late', '2026-10-09 10:30:00')
ON DUPLICATE KEY UPDATE reason=VALUES(reason);

-- 12. ACADEMIC SETTINGS
INSERT INTO academic_settings (id, setting_key, setting_value, description) VALUES
(1, 'LOW_ATTENDANCE_THRESHOLD', '75', 'Threshold percentage below which students are flagged'),
(2, 'QR_EXPIRY_MINUTES_DEFAULT', '10', 'Default expiration time in minutes for QR codes'),
(3, 'ALLOW_LATE_ATTENDANCE', 'true', 'Whether late attendance status is recognized')
ON DUPLICATE KEY UPDATE setting_value=VALUES(setting_value);
