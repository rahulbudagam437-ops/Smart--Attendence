package com.smartattendance.service;

import com.smartattendance.dto.AuthRequest;
import com.smartattendance.dto.AuthResponse;
import com.smartattendance.entity.Faculty;
import com.smartattendance.entity.Role;
import com.smartattendance.entity.Student;
import com.smartattendance.entity.User;
import com.smartattendance.exception.BadRequestException;
import com.smartattendance.repository.FacultyRepository;
import com.smartattendance.repository.StudentRepository;
import com.smartattendance.repository.UserRepository;
import com.smartattendance.security.JwtTokenProvider;
import com.smartattendance.security.SecurityUtils;
import com.smartattendance.security.UserPrincipal;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Service
public class AuthService {

    private final AuthenticationManager authenticationManager;
    private final JwtTokenProvider tokenProvider;
    private final UserRepository userRepository;
    private final StudentRepository studentRepository;
    private final FacultyRepository facultyRepository;

    public AuthService(AuthenticationManager authenticationManager,
                       JwtTokenProvider tokenProvider,
                       UserRepository userRepository,
                       StudentRepository studentRepository,
                       FacultyRepository facultyRepository) {
        this.authenticationManager = authenticationManager;
        this.tokenProvider = tokenProvider;
        this.userRepository = userRepository;
        this.studentRepository = studentRepository;
        this.facultyRepository = facultyRepository;
    }

    @Transactional(readOnly = true)
    public AuthResponse login(AuthRequest request) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getUsername(), request.getPassword())
        );

        SecurityContextHolder.getContext().setAuthentication(authentication);
        UserPrincipal userPrincipal = (UserPrincipal) authentication.getPrincipal();

        User user = userRepository.findById(userPrincipal.getId())
                .orElseThrow(() -> new BadRequestException("User record could not be loaded"));

        if (!Boolean.TRUE.equals(user.getIsActive())) {
            throw new BadRequestException("This account has been deactivated. Please contact administrator.");
        }

        String token = tokenProvider.generateToken(userPrincipal);
        return populateAuthResponse(user, token);
    }

    @Transactional(readOnly = true)
    public AuthResponse getCurrentUser() {
        UserPrincipal currentUser = SecurityUtils.getCurrentUser();
        User user = userRepository.findById(currentUser.getId())
                .orElseThrow(() -> new BadRequestException("Current user not found"));

        return populateAuthResponse(user, null);
    }

    private AuthResponse populateAuthResponse(User user, String token) {
        AuthResponse response = new AuthResponse();
        response.setToken(token);
        response.setId(user.getId());
        response.setUsername(user.getUsername());
        response.setEmail(user.getEmail());
        response.setFullName(user.getFullName());
        response.setRole(user.getRole());

        if (user.getRole() == Role.STUDENT) {
            Optional<Student> studentOpt = studentRepository.findByUserId(user.getId());
            if (studentOpt.isPresent()) {
                Student s = studentOpt.get();
                response.setProfileId(s.getId());
                response.setRollNumber(s.getRollNumber());
                if (s.getAcademicClass() != null) {
                    response.setClassId(s.getAcademicClass().getId());
                    response.setClassName(s.getAcademicClass().getName());
                }
            }
        } else if (user.getRole() == Role.FACULTY) {
            Optional<Faculty> facultyOpt = facultyRepository.findByUserId(user.getId());
            if (facultyOpt.isPresent()) {
                Faculty f = facultyOpt.get();
                response.setProfileId(f.getId());
                response.setEmployeeId(f.getEmployeeId());
            }
        }

        return response;
    }
}
