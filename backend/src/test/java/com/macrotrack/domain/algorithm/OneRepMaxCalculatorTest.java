package com.macrotrack.domain.algorithm;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertEquals;

class OneRepMaxCalculatorTest {

    private final OneRepMaxCalculator calculator = new OneRepMaxCalculator();

    @Test
    @DisplayName("1 rep thì 1RM bằng chính mức tạ")
    void testSingleRep() {
        assertEquals(100.0, calculator.calculate1RM(100.0, 1), 0.01);
    }

    @Test
    @DisplayName("Đẩy 100kg x 10 reps theo công thức Epley -> 1RM = 100 * (1 + 10/30) = 133.3kg")
    void testEpleyFormula() {
        assertEquals(133.3, calculator.calculate1RM(100.0, 10), 0.1);
    }
}
