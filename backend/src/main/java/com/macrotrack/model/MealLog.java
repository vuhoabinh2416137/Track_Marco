package com.macrotrack.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "meal_logs", indexes = {
        @Index(name = "idx_meal_date", columnList = "logDate")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MealLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private LocalDate logDate;

    @Column(nullable = false)
    private String mealType; // BREAKFAST, LUNCH, DINNER, SNACK

    @Column(nullable = false)
    private String foodName;

    private Long foodId; // null nếu là custom quick add

    private double servings; // số khẩu phần (mặc định 1.0)

    private double calories;

    private double proteinG;

    private double carbsG;

    private double fatG;

    private LocalDateTime loggedAt;
}
