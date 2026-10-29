package com.macrotrack.service;

import com.macrotrack.domain.algorithm.OneRepMaxCalculator;
import com.macrotrack.model.WorkoutSession;
import com.macrotrack.model.WorkoutSet;
import com.macrotrack.repository.WorkoutSessionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class WorkoutService {

    private final WorkoutSessionRepository workoutSessionRepository;
    private final com.macrotrack.repository.WorkoutSetRepository workoutSetRepository;
    private final OneRepMaxCalculator oneRepMaxCalculator;

    public List<WorkoutSession> getWorkoutsByDate(LocalDate date) {
        return workoutSessionRepository.findBySessionDateOrderByCreatedAtDesc(date);
    }

    public List<WorkoutSession> getRecentWorkouts() {
        return workoutSessionRepository.findTop20ByOrderBySessionDateDescCreatedAtDesc();
    }

    @Transactional
    public WorkoutSession createWorkoutSession(WorkoutSession session) {
        if (session.getSessionDate() == null) {
            session.setSessionDate(LocalDate.now());
        }
        session.setCreatedAt(LocalDateTime.now());

        if (session.getSets() != null) {
            for (int i = 0; i < session.getSets().size(); i++) {
                WorkoutSet set = session.getSets().get(i);
                set.setWorkoutSession(session);
                set.setSetOrder(i + 1);
                double oneRm = oneRepMaxCalculator.calculate1RM(set.getWeightKg(), set.getReps());
                set.setEstimated1RM(oneRm);
            }
        }

        return workoutSessionRepository.save(session);
    }

    @Transactional
    public WorkoutSession addSet(Long sessionId, WorkoutSet set) {
        WorkoutSession session = workoutSessionRepository.findById(sessionId)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy buổi tập ID: " + sessionId));

        set.setWorkoutSession(session);
        set.setSetOrder(session.getSets().size() + 1);
        double oneRm = oneRepMaxCalculator.calculate1RM(set.getWeightKg(), set.getReps());
        set.setEstimated1RM(oneRm);

        session.getSets().add(set);
        return workoutSessionRepository.save(session);
    }

    @Transactional
    public void deleteSession(Long sessionId) {
        workoutSessionRepository.deleteById(sessionId);
    }

    @Transactional
    public WorkoutSet updateSet(Long setId, WorkoutSet updated) {
        WorkoutSet set = workoutSetRepository.findById(setId)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy bài tập ID: " + setId));

        if (updated.getExerciseName() != null && !updated.getExerciseName().trim().isEmpty()) {
            set.setExerciseName(updated.getExerciseName().trim());
        }
        if (updated.getWeightKg() > 0) {
            set.setWeightKg(updated.getWeightKg());
        }
        if (updated.getReps() > 0) {
            set.setReps(updated.getReps());
        }
        if (updated.getRpe() > 0) {
            set.setRpe(updated.getRpe());
        }
        if (updated.getTargetMuscle() != null) {
            set.setTargetMuscle(updated.getTargetMuscle());
        }

        double oneRm = oneRepMaxCalculator.calculate1RM(set.getWeightKg(), set.getReps());
        set.setEstimated1RM(oneRm);

        return workoutSetRepository.save(set);
    }

    @Transactional
    public void deleteSet(Long setId) {
        workoutSetRepository.deleteById(setId);
    }
}
