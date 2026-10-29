package com.macrotrack.repository;

import com.macrotrack.model.WaterLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface WaterLogRepository extends JpaRepository<WaterLog, Long> {
    List<WaterLog> findByLogDateOrderByLoggedAtAsc(LocalDate logDate);

    @Query("SELECT COALESCE(SUM(w.amountMl), 0) FROM WaterLog w WHERE w.logDate = :logDate")
    int getTotalWaterByDate(@Param("logDate") LocalDate logDate);
}
