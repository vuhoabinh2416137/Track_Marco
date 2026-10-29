package com.macrotrack.controller;

import com.macrotrack.model.FastingSession;
import com.macrotrack.service.FastingService;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/fasting")
@RequiredArgsConstructor
public class FastingController {

    private final FastingService fastingService;

    @Data
    public static class StartFastingRequest {
        private String protocol; // 14_10, 16_8, 18_6, 20_4
        private Integer customHours;
    }

    @GetMapping("/current")
    public ResponseEntity<FastingService.FastingStatusDto> getCurrentStatus() {
        return ResponseEntity.ok(fastingService.getCurrentStatus());
    }

    @PostMapping("/start")
    public ResponseEntity<FastingSession> startFasting(@RequestBody(required = false) StartFastingRequest request) {
        String protocol = request != null && request.getProtocol() != null ? request.getProtocol() : "16_8";
        Integer customHours = request != null ? request.getCustomHours() : null;
        return ResponseEntity.ok(fastingService.startFasting(protocol, customHours));
    }

    @PostMapping("/stop")
    public ResponseEntity<FastingSession> stopFasting() {
        return ResponseEntity.ok(fastingService.stopFasting());
    }

    @GetMapping("/recent")
    public ResponseEntity<List<FastingSession>> getRecentSessions() {
        return ResponseEntity.ok(fastingService.getRecentSessions());
    }
}
