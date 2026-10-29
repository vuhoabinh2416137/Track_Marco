package com.macrotrack.domain.algorithm;

import org.springframework.stereotype.Component;

/**
 * Thuật toán làm mịn xu hướng cân nặng (Weight Trend) theo mô hình MacroFactor.
 * Áp dụng Exponential Moving Average (EMA) với bước thời gian bất quy tắc (Irregular Sampling),
 * giúp xử lý chính xác khi người dùng bỏ lỡ 1 hoặc nhiều ngày cân mà không làm trễ pha xu hướng thực tế.
 */
@Component
public class IrregularWeightTrendEngine {

    // Chu kỳ quan sát N = 20 ngày -> Alpha danh nghĩa = 2 / (20 + 1) ≈ 0.095238
    public static final double NOMINAL_ALPHA = 0.095238;

    /**
     * Tính toán cân nặng xu hướng mới (Trend Weight)
     *
     * @param currentRawWeight Cân nặng thực tế trên cân sáng nay (kg)
     * @param lastTrendWeight  Cân nặng xu hướng của lần cân hợp lệ gần nhất (kg)
     * @param daysSinceLast    Số ngày đã trôi qua kể từ lần cân trước (>= 1)
     * @return Cân nặng xu hướng mới (kg)
     */
    public double calculateTrendWeight(double currentRawWeight, double lastTrendWeight, long daysSinceLast) {
        if (daysSinceLast <= 0) {
            daysSinceLast = 1;
        }

        // Tính Alpha hiệu dụng: alpha_eff = 1 - (1 - alpha_nominal)^delta_t
        // Đảm bảo nếu người dùng cách 3-5 ngày mới cân, giá trị mới có trọng số tăng tương ứng theo hàm mũ
        double effectiveAlpha = 1.0 - Math.pow(1.0 - NOMINAL_ALPHA, (double) daysSinceLast);
        effectiveAlpha = Math.min(1.0, Math.max(0.01, effectiveAlpha));

        double trend = (effectiveAlpha * currentRawWeight) + ((1.0 - effectiveAlpha) * lastTrendWeight);
        return Math.round(trend * 100.0) / 100.0;
    }

    /**
     * Khởi tạo điểm bắt đầu cho người dùng mới (Ngày đầu tiên)
     */
    public double initialTrendWeight(double firstScaleWeight) {
        return Math.round(firstScaleWeight * 100.0) / 100.0;
    }
}
