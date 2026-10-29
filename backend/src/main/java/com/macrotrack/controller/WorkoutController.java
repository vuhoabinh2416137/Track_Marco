package com.macrotrack.controller;

import com.macrotrack.model.WorkoutSession;
import com.macrotrack.model.WorkoutSet;
import com.macrotrack.service.WorkoutService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/v1/workouts")
@RequiredArgsConstructor
public class WorkoutController {

    private final WorkoutService workoutService;

    @GetMapping
    public ResponseEntity<List<WorkoutSession>> getWorkouts(
            @RequestParam(value = "date", required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        if (date != null) {
            return ResponseEntity.ok(workoutService.getWorkoutsByDate(date));
        }
        return ResponseEntity.ok(workoutService.getRecentWorkouts());
    }

    @PostMapping
    public ResponseEntity<WorkoutSession> createSession(@RequestBody WorkoutSession session) {
        return ResponseEntity.ok(workoutService.createWorkoutSession(session));
    }

    @PostMapping("/{sessionId}/sets")
    public ResponseEntity<WorkoutSession> addSet(
            @PathVariable Long sessionId,
            @RequestBody WorkoutSet set) {
        return ResponseEntity.ok(workoutService.addSet(sessionId, set));
    }

    @DeleteMapping("/{sessionId}")
    public ResponseEntity<Void> deleteSession(@PathVariable Long sessionId) {
        workoutService.deleteSession(sessionId);
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/sets/{setId}")
    public ResponseEntity<WorkoutSet> updateSet(
            @PathVariable Long setId,
            @RequestBody WorkoutSet set) {
        return ResponseEntity.ok(workoutService.updateSet(setId, set));
    }

    @DeleteMapping("/sets/{setId}")
    public ResponseEntity<Void> deleteSet(@PathVariable Long setId) {
        workoutService.deleteSet(setId);
        return ResponseEntity.noContent().build();
    }
}
