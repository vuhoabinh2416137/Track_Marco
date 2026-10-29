package com.macrotrack.repository;

import com.macrotrack.model.MealLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface MealLogRepository extends JpaRepository<MealLog, Long> {
    List<MealLog> findByLogDateOrderByLoggedAtAsc(LocalDate logDate);
    List<MealLog> findByLogDateBetweenOrderByLogDateAsc(LocalDate startDate, LocalDate endDate);
    void deleteById(Long id);
}
