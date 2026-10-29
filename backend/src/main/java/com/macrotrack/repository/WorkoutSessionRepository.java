package com.macrotrack.repository;

import com.macrotrack.model.WorkoutSession;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface WorkoutSessionRepository extends JpaRepository<WorkoutSession, Long> {
    List<WorkoutSession> findBySessionDateOrderByCreatedAtDesc(LocalDate sessionDate);
    List<WorkoutSession> findTop20ByOrderBySessionDateDescCreatedAtDesc();
}
