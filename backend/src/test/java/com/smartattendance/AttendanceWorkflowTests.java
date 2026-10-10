package com.smartattendance;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.smartattendance.dto.AuthRequest;
import com.smartattendance.dto.ManualAttendanceRequest;
import com.smartattendance.dto.ScanAttendanceRequest;
import com.smartattendance.dto.SessionCreateRequest;
import com.smartattendance.entity.AttendanceStatus;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import java.time.LocalDate;
import java.time.LocalTime;

import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
public class AttendanceWorkflowTests {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    private String obtainToken(String username, String password) throws Exception {
        AuthRequest authRequest = new AuthRequest(username, password);
        MvcResult result = mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(authRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.token").isNotEmpty())
                .andReturn();

        String responseBody = result.getResponse().getContentAsString();
        return objectMapper.readTree(responseBody).get("data").get("token").asText();
    }

    @Test
    @DisplayName("1. Login Success - Admin, Faculty, Student")
    public void testLoginSuccess() throws Exception {
        // Admin
        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new AuthRequest("admin", "Admin@123"))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.role").value("ADMIN"));

        // Faculty
        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new AuthRequest("prof.sharma", "Faculty@123"))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.role").value("FACULTY"));

        // Student
        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new AuthRequest("student.aarav", "Student@123"))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.role").value("STUDENT"))
                .andExpect(jsonPath("$.data.rollNumber").value("2023CS0101"));
    }

    @Test
    @DisplayName("2. Login Failure with Invalid Password")
    public void testLoginFailure() throws Exception {
        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new AuthRequest("admin", "WrongPassword!"))))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.success").value(false));
    }

    @Test
    @DisplayName("3. Role-Based Access Control - Student cannot access Admin endpoints")
    public void testStudentCannotAccessAdmin() throws Exception {
        String studentToken = obtainToken("student.aarav", "Student@123");

        mockMvc.perform(get("/api/admin/users")
                        .header("Authorization", "Bearer " + studentToken))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("4. Role-Based Access Control - Student can access Student dashboard")
    public void testStudentCanAccessStudentDashboard() throws Exception {
        String studentToken = obtainToken("student.aarav", "Student@123");

        mockMvc.perform(get("/api/student/dashboard")
                        .header("Authorization", "Bearer " + studentToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.rollNumber").value("2023CS0101"))
                .andExpect(jsonPath("$.data.overallPercentage").isNumber());
    }

    @Test
    @DisplayName("5. Faculty Creates Attendance Session and Generates QR Token")
    public void testFacultyCreateSession() throws Exception {
        String facultyToken = obtainToken("prof.sharma", "Faculty@123");

        SessionCreateRequest request = new SessionCreateRequest();
        request.setClassId(1L);
        request.setSubjectId(1L); // CS601 assigned to prof.sharma
        request.setSessionDate(LocalDate.now());
        request.setStartTime(LocalTime.of(10, 0));
        request.setEndTime(LocalTime.of(11, 0));
        request.setExpiryMinutes(15);
        request.setTopic("Relational Algebra Operations");
        request.setAllowLate(true);

        MvcResult result = mockMvc.perform(post("/api/faculty/sessions")
                        .header("Authorization", "Bearer " + facultyToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.sessionToken").isNotEmpty())
                .andExpect(jsonPath("$.data.status").value("ACTIVE"))
                .andReturn();

        String body = result.getResponse().getContentAsString();
        String sessionToken = objectMapper.readTree(body).get("data").get("sessionToken").asText();

        // Student scans this valid session token
        String studentToken = obtainToken("student.aarav", "Student@123");
        ScanAttendanceRequest scanRequest = new ScanAttendanceRequest(sessionToken);

        mockMvc.perform(post("/api/student/attendance/scan")
                        .header("Authorization", "Bearer " + studentToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(scanRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.status").value("PRESENT"));

        // 6. Duplicate Scan Rejection Test!
        mockMvc.perform(post("/api/student/attendance/scan")
                        .header("Authorization", "Bearer " + studentToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(scanRequest)))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.message", containsString("already marked")));
    }

    @Test
    @DisplayName("7. Invalid Token Rejection")
    public void testInvalidTokenRejection() throws Exception {
        String studentToken = obtainToken("student.diya", "Student@123");
        ScanAttendanceRequest scanRequest = new ScanAttendanceRequest("completely-bogus-token-xyz");

        mockMvc.perform(post("/api/student/attendance/scan")
                        .header("Authorization", "Bearer " + studentToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(scanRequest)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success").value(false));
    }

    @Test
    @DisplayName("8. Expired Token Rejection")
    public void testExpiredSessionToken() throws Exception {
        // Tok-001 belongs to SESS-001 which is in the past and CLOSED
        String studentToken = obtainToken("student.diya", "Student@123");
        ScanAttendanceRequest scanRequest = new ScanAttendanceRequest("tok-001");

        mockMvc.perform(post("/api/student/attendance/scan")
                        .header("Authorization", "Bearer " + studentToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(scanRequest)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success").value(false));
    }

    @Test
    @DisplayName("9. Reports and CSV Export")
    public void testReportsAndCsvExport() throws Exception {
        String facultyToken = obtainToken("prof.sharma", "Faculty@123");

        // JSON report
        mockMvc.perform(get("/api/reports/attendance?classId=1")
                        .header("Authorization", "Bearer " + facultyToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data").isArray());

        // CSV export
        mockMvc.perform(get("/api/reports/attendance/export?classId=1")
                        .header("Authorization", "Bearer " + facultyToken))
                .andExpect(status().isOk())
                .andExpect(header().string("Content-Type", containsString("text/csv")))
                .andExpect(content().string(containsString("Record ID,Session Code,Date,Class,Subject")));
    }

    @Test
    @DisplayName("10. Analytics Overview Calculation Verification")
    public void testAnalyticsOverview() throws Exception {
        String adminToken = obtainToken("admin", "Admin@123");

        mockMvc.perform(get("/api/analytics/overview")
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.overallPercentage").isNumber())
                .andExpect(jsonPath("$.data.totalSessionsFinalized").isNumber())
                .andExpect(jsonPath("$.data.dailyTrends").isArray())
                .andExpect(jsonPath("$.data.classComparisons").isArray());
    }

    @Test
    @DisplayName("11. Manual Attendance Modification with Mandatory Audit Reason")
    public void testManualAttendanceCorrection() throws Exception {
        String facultyToken = obtainToken("prof.sharma", "Faculty@123");

        ManualAttendanceRequest request = new ManualAttendanceRequest();
        request.setSessionId(1L);
        request.setStudentId(3L);
        request.setStatus(AttendanceStatus.PRESENT);
        request.setReason("Correction verified by faculty following medical submission");

        mockMvc.perform(put("/api/faculty/attendance")
                        .header("Authorization", "Bearer " + facultyToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.status").value("PRESENT"));
    }
}
