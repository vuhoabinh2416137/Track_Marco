package com.macrotrack.domain.algorithm;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class IrregularWeightTrendEngineTest {

    private IrregularWeightTrendEngine engine;

    @BeforeEach
    void setUp() {
        engine = new IrregularWeightTrendEngine();
    }

    @Test
    @DisplayName("Ngày đầu tiên khởi tạo trend weight bằng đúng scale weight")
    void testInitialTrendWeight() {
        double scaleWeight = 75.45;
        double trend = engine.initialTrendWeight(scaleWeight);
        assertEquals(75.45, trend, 0.01);
    }

    @Test
    @DisplayName("Cân đều đặn mỗi ngày (daysSinceLast = 1): Làm mịn biến động nước đột ngột")
    void testConsecutiveDaysSmoothing() {
        double lastTrend = 75.0;
        // Ngày hôm sau ăn mặn bị tích nước lên 76.5 kg (+1.5kg thô)
        double spikeWeight = 76.5;
        double newTrend = engine.calculateTrendWeight(spikeWeight, lastTrend, 1);

        // Alpha danh nghĩa ~0.0952 -> newTrend ≈ 0.0952 * 76.5 + 0.9048 * 75.0 ≈ 75.14 kg
        // Cân nặng xu hướng chỉ tăng nhẹ 0.14kg, khử hoàn toàn nhiễu tích nước!
        assertTrue(newTrend > 75.0 && newTrend < 75.3);
        assertEquals(75.14, newTrend, 0.05);
    }

    @Test
    @DisplayName("Bỏ lỡ nhiều ngày (daysSinceLast = 5): Alpha hiệu dụng tăng theo hàm số mũ")
    void testIrregularSamplingGapDays() {
        double lastTrend = 75.0;
        double newWeight = 73.0; // Sau 5 ngày cân thấy giảm còn 73kg

        double trend1Day = engine.calculateTrendWeight(newWeight, lastTrend, 1);
        double trend5Days = engine.calculateTrendWeight(newWeight, lastTrend, 5);

        // Khi cách 5 ngày, điểm cân mới phải có trọng số cao hơn nhiều so với chỉ cách 1 ngày
        assertTrue(trend5Days < trend1Day);
        // Trend sau 5 ngày phải phản ánh mức giảm nhiều hơn mà không làm trễ pha
        assertTrue(trend5Days <= 74.3);
    }
}
