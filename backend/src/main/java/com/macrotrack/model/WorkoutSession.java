package com.macrotrack.model;

import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "workout_sessions", indexes = {
        @Index(name = "idx_workout_date", columnList = "sessionDate")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class WorkoutSession {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private LocalDate sessionDate;

    @Column(nullable = false)
    private String name; // ví dụ: "Ngực & Tay Sau (Chest & Triceps)"

    private int durationMinutes;

    private String notes;

    @OneToMany(mappedBy = "workoutSession", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonManagedReference
    @Builder.Default
    private List<WorkoutSet> sets = new ArrayList<>();

    private LocalDateTime createdAt;
}
