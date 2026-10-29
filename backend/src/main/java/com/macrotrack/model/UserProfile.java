package com.macrotrack.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;

@Entity
@Table(name = "user_profile")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserProfile {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private String gender; // MALE, FEMALE

    private double heightCm;

    private double currentWeightKg;

    private double targetWeightKg;

    @Column(nullable = false)
    private String goalType; // CUT, MAINTAIN, BULK

    private double weeklyGoalRate; // ví dụ: 0.005 = 0.5% cân nặng/tuần

    private double estimatedTdee;

    private int targetCalories;

    private int targetProteinG;

    private int targetCarbsG;

    private int targetFatG;

    private boolean customMacro; // True nếu người dùng tự cấu hình macro thủ công

    private Double proteinRatioPerKg; // Tỉ lệ đạm theo cân nặng (g/kg), ví dụ: 2.0 g/kg

    private int waterTargetMl; // Mặc định 2500ml

    private String fastingProtocol; // 16_8, 18_6, 14_10

    private boolean showFastingWidget;

    private boolean showWaterWidget;

    private LocalDate updatedAt;
}
