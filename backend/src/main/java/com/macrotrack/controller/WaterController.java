package com.macrotrack.controller;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.macrotrack.model.WaterLog;
import com.macrotrack.service.WaterService;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;

@RestController
@RequestMapping("/api/v1/water")
@RequiredArgsConstructor
public class WaterController {

    private final WaterService waterService;

    @Data
    public static class AddWaterRequest {
        @JsonFormat(pattern = "yyyy-MM-dd")
        @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
        private LocalDate date;
        private int amountMl;
    }

    @GetMapping
    public ResponseEntity<WaterService.WaterStatusDto> getWaterStatus(
            @RequestParam(value = "date", required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        LocalDate targetDate = date != null ? date : LocalDate.now();
        return ResponseEntity.ok(waterService.getWaterStatus(targetDate));
    }

    @PostMapping
    public ResponseEntity<WaterLog> addWater(@RequestBody AddWaterRequest request) {
        LocalDate targetDate = request.getDate() != null ? request.getDate() : LocalDate.now();
        int amount = request.getAmountMl() > 0 ? request.getAmountMl() : 250;
        return ResponseEntity.ok(waterService.addWater(targetDate, amount));
    }
}
