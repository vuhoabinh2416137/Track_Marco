package com.macrotrack.domain.algorithm;

import org.springframework.stereotype.Component;

/**
 * Công thức tính toán sức mạnh tối đa 1RM (One-Rep Max) cho các bài tập tạ.
 * Dùng công thức Epley chuẩn hóa:
 *
 * 1RM = Weight * (1 + Reps / 30) (với Reps > 1)
 */
@Component
public class OneRepMaxCalculator {

    public double calculate1RM(double weightKg, int reps) {
        if (weightKg <= 0 || reps <= 0) {
            return 0.0;
        }
        if (reps == 1) {
            return Math.round(weightKg * 10.0) / 10.0;
        }
        // Giới hạn reps <= 30 để đảm bảo tính chính xác
        int effectiveReps = Math.min(30, reps);
        double oneRm = weightKg * (1.0 + (effectiveReps / 30.0));
        return Math.round(oneRm * 10.0) / 10.0;
    }
}
