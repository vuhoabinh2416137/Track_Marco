package com.macrotrack.repository;

import com.macrotrack.model.WeightLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface WeightLogRepository extends JpaRepository<WeightLog, Long> {
    Optional<WeightLog> findByLogDate(LocalDate logDate);
    Optional<WeightLog> findTopByLogDateLessThanOrderByLogDateDesc(LocalDate logDate);
    Optional<WeightLog> findTopByOrderByLogDateDesc();
    List<WeightLog> findAllByOrderByLogDateAsc();
    List<WeightLog> findAllByLogDateBetweenOrderByLogDateAsc(LocalDate startDate, LocalDate endDate);
}
