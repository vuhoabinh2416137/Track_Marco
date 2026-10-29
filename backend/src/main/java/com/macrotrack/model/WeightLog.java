package com.macrotrack.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;

@Entity
@Table(name = "weight_logs", uniqueConstraints = {
        @UniqueConstraint(columnNames = {"logDate"})
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class WeightLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private LocalDate logDate;

    @Column(nullable = false)
    private double scaleWeight; // Cân nặng bàn cân sáng nay (kg)

    @Column(nullable = false)
    private double trendWeight; // Cân nặng xu hướng sau lọc EMA (kg)

    private String notes;
}
