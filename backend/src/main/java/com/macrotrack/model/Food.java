package com.macrotrack.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "foods", indexes = {
        @Index(name = "idx_food_name", columnList = "name"),
        @Index(name = "idx_food_barcode", columnList = "barcode")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Food {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true)
    private String barcode;

    @Column(nullable = false)
    private String name;

    private String brand;

    private double servingSize; // ví dụ: 100

    private String servingUnit; // g, ml, bát, cái

    private double calories; // kcal

    private double proteinG;

    private double carbsG;

    private double fatG;

    private double fiberG;

    private double sugarG;

    private double sodiumMg;

    private String source; // NIN_VIETNAM, OPEN_FOOD_FACTS, CUSTOM

    private boolean isVerified;
}
