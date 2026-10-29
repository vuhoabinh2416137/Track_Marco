package com.macrotrack.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "fasting_sessions")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FastingSession {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String protocol; // 14_10, 16_8, 18_6, 20_4, CUSTOM

    @Column(nullable = false)
    private LocalDateTime startTime;

    @Column(nullable = false)
    private LocalDateTime targetEndTime;

    private LocalDateTime actualEndTime;

    @Column(nullable = false)
    private String status; // ACTIVE, COMPLETED, CANCELLED
}
