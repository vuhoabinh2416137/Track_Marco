package com.macrotrack.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "water_logs", indexes = {
        @Index(name = "idx_water_date", columnList = "logDate")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class WaterLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private LocalDate logDate;

    @Column(nullable = false)
    private int amountMl; // số ml nạp vào (ví dụ: 250)

    private LocalDateTime loggedAt;
}
