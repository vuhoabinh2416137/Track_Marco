package com.macrotrack.domain.algorithm;

import org.springframework.stereotype.Component;

import java.util.List;

/**
 * Bộ não tính toán TDEE thích ứng động (Dynamic Expenditure Engine V3).
 * Dựa trên nguyên lý bảo toàn năng lượng khép kín (Closed-Loop Energy Balance):
 *
 * TDEE = Năng lượng Nạp vào (Intake) - Biến thiên Năng lượng Dự trữ (Storage Delta)
 *
 * Tích hợp cơ chế phân loại ngày (Day Classification) để triệt tiêu hoàn toàn
 * hiện tượng "crash calo" khi người dùng chỉ log 1-2 bữa rồi quên.
 */
@Component
public class AdaptiveExpenditureEngineV3 {

    public static final double KCAL_PER_KG_STORAGE = 7700.0; // Năng lượng tương đương 1kg mỡ/mô cơ thể
    public static final double TDEE_SMOOTHING_BETA = 0.08;   // Hệ số làm mịn EMA của TDEE (độ trễ ổn định ~12 ngày)

    public enum DayStatus {
        VALID,   // Log đầy đủ (>= 3 bữa hoặc tổng calo >= 800 kcal)
        PARTIAL, // Log dở dang (< 800 kcal) -> BẮT BUỘC LOẠI BỎ KHỎI MẪU SỐ
        BLANK    // Không log gì -> BỎ QUA AN TOÀN
    }

    public record DailyIntakeRecord(double totalCalories, DayStatus status) {}

    public record MacroTargetResult(
            int targetCalories,
            int targetProteinG,
            int targetCarbsG,
            int targetFatG,
            double estimatedTdee,
            boolean isFloorProtected
    ) {}

    /**
     * Phân loại trạng thái ngày dựa trên số lượng calo và số bữa
     */
    public DayStatus classifyDay(double totalCalories, int mealCount) {
        if (totalCalories <= 0 && mealCount == 0) {
            return DayStatus.BLANK;
        }
        // Nếu tổng calo quá thấp (< 800) nhưng có log, đây là ngày dở dang (Partial Day)
        if (totalCalories < 800.0 || mealCount < 2) {
            return DayStatus.PARTIAL;
        }
        return DayStatus.VALID;
    }

    /**
     * Tính toán TDEE thích ứng
     *
     * @param intakeRecords     Danh sách bản ghi calo các ngày trong cửa sổ quan sát (ví dụ 14 ngày)
     * @param startTrendWeight  Cân nặng xu hướng ngày đầu cửa sổ (kg)
     * @param endTrendWeight    Cân nặng xu hướng ngày cuối cửa sổ (kg)
     * @param totalDaysInWindow Độ dài cửa sổ quan sát (thường là 14 ngày)
     * @param currentTdee       TDEE hiện tại trước khi cập nhật
     * @return TDEE mới được làm mịn (kcal)
     */
    public double calculateExpenditure(List<DailyIntakeRecord> intakeRecords,
                                       double startTrendWeight,
                                       double endTrendWeight,
                                       int totalDaysInWindow,
                                       double currentTdee) {
        if (intakeRecords == null || intakeRecords.isEmpty() || totalDaysInWindow <= 0) {
            return currentTdee;
        }

        // 1. Chỉ lấy các ngày HỢP LỆ (Lọc bỏ hoàn toàn ngày Partial để chống crash calo)
        List<DailyIntakeRecord> validDays = intakeRecords.stream()
                .filter(r -> r.status() == DayStatus.VALID)
                .toList();

        // Cần tối thiểu 3 ngày log hoàn chỉnh để có đủ độ tin cậy thống kê
        if (validDays.size() < 3) {
            return currentTdee;
        }

        double totalValidIntake = validDays.stream().mapToDouble(DailyIntakeRecord::totalCalories).sum();
        double meanDailyIntake = totalValidIntake / validDays.size();

        // 2. Tính tốc độ biến thiên năng lượng dự trữ trung bình mỗi ngày
        double deltaWeightKg = endTrendWeight - startTrendWeight;
        double dailyStorageDeltaKcal = (deltaWeightKg * KCAL_PER_KG_STORAGE) / totalDaysInWindow;

        // 3. TDEE thô = Lượng ăn trung bình - Biến thiên dự trữ
        double rawTdee = meanDailyIntake - dailyStorageDeltaKcal;

        // Giới hạn an toàn sinh lý con người (1200 - 5500 kcal)
        rawTdee = Math.max(1200.0, Math.min(5500.0, rawTdee));

        // 4. Làm mịn bằng EMA để TDEE không nhảy giật cục giữa các tuần
        double smoothedTdee = (TDEE_SMOOTHING_BETA * rawTdee) + ((1.0 - TDEE_SMOOTHING_BETA) * currentTdee);
        return Math.round(smoothedTdee * 10.0) / 10.0;
    }

    /**
     * Tính toán Mục tiêu Calo và Phân bổ Đa lượng (Macro Split) hàng ngày
     *
     * @param tdee              TDEE ước tính hiện tại
     * @param goalType          'CUT', 'MAINTAIN', 'BULK'
     * @param currentWeightKg   Cân nặng xu hướng hiện tại (kg)
     * @param weeklyGoalRate    Tỷ lệ tăng/giảm mong muốn (% thể trọng/tuần, ví dụ 0.005 = 0.5%/tuần)
     * @param isMale            Giới tính (nam/nữ) để áp dụng Calorie Floor
     * @return Kết quả mục tiêu Calo, Protein, Carbs, Fat
     */
    public MacroTargetResult calculateMacroTargets(double tdee,
                                                   String goalType,
                                                   double currentWeightKg,
                                                   double weeklyGoalRate,
                                                   boolean isMale) {
        double calorieFloor = isMale ? 1500.0 : 1200.0;
        double targetCalories = tdee;

        if ("CUT".equalsIgnoreCase(goalType)) {
            // Giảm cân: Thâm hụt calo mỗi ngày = (Trọng lượng * Tỷ lệ * 7700) / 7
            double dailyDeficit = (currentWeightKg * weeklyGoalRate * KCAL_PER_KG_STORAGE) / 7.0;
            // Giới hạn thâm hụt tối đa 25% TDEE để tránh mất cơ
            dailyDeficit = Math.min(dailyDeficit, tdee * 0.25);
            targetCalories = tdee - dailyDeficit;
        } else if ("BULK".equalsIgnoreCase(goalType)) {
            // Tăng cơ: Thặng dư calo mỗi ngày
            double dailySurplus = (currentWeightKg * weeklyGoalRate * KCAL_PER_KG_STORAGE) / 7.0;
            // Giới hạn thặng dư tối đa 15% TDEE để tránh tích mỡ thừa
            dailySurplus = Math.min(dailySurplus, tdee * 0.15);
            targetCalories = tdee + dailySurplus;
        }

        boolean isFloorProtected = false;
        if (targetCalories < calorieFloor) {
            targetCalories = calorieFloor;
            isFloorProtected = true;
        }

        int finalCalories = (int) Math.round(targetCalories);

        // Phân bổ Macro theo chuẩn khoa học dinh dưỡng thể hình:
        // 1. Protein: 2.0g / kg thể trọng (bảo toàn & phát triển cơ bắp)
        int proteinG = (int) Math.round(currentWeightKg * 2.0);
        int proteinKcal = proteinG * 4;

        // 2. Fat: 25% tổng năng lượng
        int fatKcal = (int) Math.round(finalCalories * 0.25);
        int fatG = (int) Math.round(fatKcal / 9.0);

        // 3. Carbs: Năng lượng còn lại
        int remainingKcal = finalCalories - (proteinKcal + (fatG * 9));
        int carbsG = Math.max(50, (int) Math.round(remainingKcal / 4.0));

        return new MacroTargetResult(finalCalories, proteinG, carbsG, fatG, tdee, isFloorProtected);
    }
}
