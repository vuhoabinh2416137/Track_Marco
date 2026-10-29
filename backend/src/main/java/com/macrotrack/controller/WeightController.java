package com.macrotrack.controller;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.macrotrack.model.WeightLog;
import com.macrotrack.service.WeightService;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/v1/weights")
@RequiredArgsConstructor
public class WeightController {

    private final WeightService weightService;

    @Data
    public static class LogWeightRequest {
        @JsonFormat(pattern = "yyyy-MM-dd")
        @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
        private LocalDate date;
        private double weight;
        private String notes;
    }

    @GetMapping
    public ResponseEntity<List<WeightLog>> getAllWeightLogs() {
        return ResponseEntity.ok(weightService.getAllWeightLogs());
    }

    @GetMapping("/{date}")
    public ResponseEntity<WeightLog> getWeightByDate(
            @PathVariable @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        return weightService.getWeightByDate(date)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<WeightLog> logWeight(@RequestBody LogWeightRequest request) {
        LocalDate logDate = request.getDate() != null ? request.getDate() : LocalDate.now();
        WeightLog saved = weightService.logWeight(logDate, request.getWeight(), request.getNotes());
        return ResponseEntity.ok(saved);
    }
}
