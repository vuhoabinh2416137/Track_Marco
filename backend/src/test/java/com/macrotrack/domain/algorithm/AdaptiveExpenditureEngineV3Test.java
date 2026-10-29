package com.macrotrack.domain.algorithm;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.util.ArrayList;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

class AdaptiveExpenditureEngineV3Test {

    private AdaptiveExpenditureEngineV3 engine;

    @BeforeEach
    void setUp() {
        engine = new AdaptiveExpenditureEngineV3();
    }

    @Test
    @DisplayName("Phân loại ngày: Nhận diện chính xác Blank, Partial và Valid")
    void testDayClassification() {
        assertEquals(AdaptiveExpenditureEngineV3.DayStatus.BLANK, engine.classifyDay(0, 0));
        assertEquals(AdaptiveExpenditureEngineV3.DayStatus.PARTIAL, engine.classifyDay(350, 1));
        assertEquals(AdaptiveExpenditureEngineV3.DayStatus.VALID, engine.classifyDay(2100, 3));
    }

    @Test
    @DisplayName("Loại bỏ ngày Partial: Ngăn chặn hiện tượng 'Crash Calo' khi người dùng quên log")
    void testPreventCalorieCrashOnPartialDays() {
        double currentTdee = 2400.0;
        double startTrendWeight = 80.0;
        double endTrendWeight = 79.5; // Giảm 0.5kg trong 14 ngày

        List<AdaptiveExpenditureEngineV3.DailyIntakeRecord> records = new ArrayList<>();
        // Giả lập 10 ngày ăn chuẩn 2200 kcal
        for (int i = 0; i < 10; i++) {
            records.add(new AdaptiveExpenditureEngineV3.DailyIntakeRecord(2200.0, AdaptiveExpenditureEngineV3.DayStatus.VALID));
        }
        // Giả lập 2 ngày chỉ log ăn sáng 300 kcal rồi quên (PARTIAL)
        records.add(new AdaptiveExpenditureEngineV3.DailyIntakeRecord(300.0, AdaptiveExpenditureEngineV3.DayStatus.PARTIAL));
        records.add(new AdaptiveExpenditureEngineV3.DailyIntakeRecord(250.0, AdaptiveExpenditureEngineV3.DayStatus.PARTIAL));
        // 2 ngày bỏ trống (BLANK)
        records.add(new AdaptiveExpenditureEngineV3.DailyIntakeRecord(0.0, AdaptiveExpenditureEngineV3.DayStatus.BLANK));
        records.add(new AdaptiveExpenditureEngineV3.DailyIntakeRecord(0.0, AdaptiveExpenditureEngineV3.DayStatus.BLANK));

        double newTdee = engine.calculateExpenditure(records, startTrendWeight, endTrendWeight, 14, currentTdee);

        // Nếu không lọc ngày Partial, trung bình calo sẽ bị kéo tụt xuống ~1870, TDEE sập
        // Với engine V3, ngày Partial bị loại bỏ, lượng ăn chuẩn ~2200, TDEE duy trì quanh mức sinh học hợp lý (~2400)
        assertTrue(newTdee >= 2350.0 && newTdee <= 2500.0, "TDEE phải được bảo vệ khỏi sụt giảm, thực tế: " + newTdee);
    }

    @Test
    @DisplayName("Bảo vệ Calorie Floor: Không bao giờ đề xuất calo dưới ngưỡng an toàn sinh học")
    void testCalorieFloorProtection() {
        double lowTdee = 1600.0;
        // Người dùng nam 70kg muốn giảm cân cấp tốc 1.5% thể trọng/tuần (quá gắt)
        var result = engine.calculateMacroTargets(lowTdee, "CUT", 70.0, 0.015, true);

        // Với nam, mức sàn tối thiểu là 1500 kcal
        assertTrue(result.targetCalories() >= 1500);
        assertTrue(result.isFloorProtected());
        assertTrue(result.targetProteinG() > 0);
        assertTrue(result.targetCarbsG() > 0);
        assertTrue(result.targetFatG() > 0);
    }
}
