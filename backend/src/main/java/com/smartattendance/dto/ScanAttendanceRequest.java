package com.smartattendance.dto;

import jakarta.validation.constraints.NotBlank;

public class ScanAttendanceRequest {

    @NotBlank(message = "Session token is required")
    private String sessionToken;

    private String deviceInfo;
    private String ipAddress;

    public ScanAttendanceRequest() {}

    public ScanAttendanceRequest(String sessionToken) {
        this.sessionToken = sessionToken;
    }

    public String getSessionToken() { return sessionToken; }
    public void setSessionToken(String sessionToken) { this.sessionToken = sessionToken; }

    public String getDeviceInfo() { return deviceInfo; }
    public void setDeviceInfo(String deviceInfo) { this.deviceInfo = deviceInfo; }

    public String getIpAddress() { return ipAddress; }
    public void setIpAddress(String ipAddress) { this.ipAddress = ipAddress; }
}
