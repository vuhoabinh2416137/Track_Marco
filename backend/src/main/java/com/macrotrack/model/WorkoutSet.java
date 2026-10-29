package com.macrotrack.model;

import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "workout_sets")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class WorkoutSet {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "workout_session_id", nullable = false)
    @JsonBackReference
    private WorkoutSession workoutSession;

    @Column(nullable = false)
    private String exerciseName; // ví dụ: "Barbell Bench Press"

    private String targetMuscle; // CHEST, BACK, LEGS, SHOULDERS, ARMS, CORE

    private int setOrder; // Hiệp 1, 2, 3...

    private double weightKg; // Mức tạ (kg)

    private int reps; // Số lần lặp lại

    private double rpe; // Tỷ lệ gắng sức (RPE 6 - 10)

    private double estimated1RM; // Tự động tính theo công thức Epley
}
