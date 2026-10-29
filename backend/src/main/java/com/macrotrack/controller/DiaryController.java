package com.macrotrack.controller;

import com.macrotrack.model.MealLog;
import com.macrotrack.service.DiaryService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;

@RestController
@RequestMapping("/api/v1/diary")
@RequiredArgsConstructor
public class DiaryController {

    private final DiaryService diaryService;

    @GetMapping("/summary")
    public ResponseEntity<DiaryService.DailySummaryDto> getDailySummary(
            @RequestParam(value = "date", required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        LocalDate targetDate = date != null ? date : LocalDate.now();
        return ResponseEntity.ok(diaryService.getDailySummary(targetDate));
    }

    @PostMapping("/meals")
    public ResponseEntity<MealLog> logMeal(@RequestBody MealLog mealLog) {
        return ResponseEntity.ok(diaryService.logMeal(mealLog));
    }

    @PutMapping("/meals/{id}")
    public ResponseEntity<MealLog> updateMeal(@PathVariable Long id, @RequestBody MealLog mealLog) {
        return ResponseEntity.ok(diaryService.updateMeal(id, mealLog));
    }

    @DeleteMapping("/meals/{id}")
    public ResponseEntity<Void> deleteMeal(@PathVariable Long id) {
        diaryService.deleteMeal(id);
        return ResponseEntity.noContent().build();
    }
}
