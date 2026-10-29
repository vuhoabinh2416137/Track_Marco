package com.macrotrack.repository;

import com.macrotrack.model.FastingSession;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface FastingSessionRepository extends JpaRepository<FastingSession, Long> {
    Optional<FastingSession> findTopByStatusOrderByStartTimeDesc(String status);
    List<FastingSession> findTop10ByOrderByStartTimeDesc();
}
