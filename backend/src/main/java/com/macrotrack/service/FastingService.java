package com.macrotrack.service;

import com.macrotrack.model.FastingSession;
import com.macrotrack.repository.FastingSessionRepository;
import lombok.Builder;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class FastingService {

    private final FastingSessionRepository fastingSessionRepository;

    @Getter
    @Builder
    public static class FastingStatusDto {
        private boolean isActive;
        private FastingSession session;
        private long elapsedMinutes;
        private long targetMinutes;
        private long remainingMinutes;
        private double progressPercent;
        private String stage; // FED, BLOOD_SUGAR_NORMALIZING, KETOSIS, AUTOPHAGY
        private String stageDescription;
    }

    public FastingStatusDto getCurrentStatus() {
        Optional<FastingSession> activeOpt = fastingSessionRepository.findTopByStatusOrderByStartTimeDesc("ACTIVE");
        if (activeOpt.isEmpty()) {
            return FastingStatusDto.builder()
                    .isActive(false)
                    .stage("FED")
                    .stageDescription("Đang trong cửa sổ ăn uống")
                    .build();
        }

        FastingSession s = activeOpt.get();
        LocalDateTime now = LocalDateTime.now();
        long elapsedMins = Math.max(0, Duration.between(s.getStartTime(), now).toMinutes());
        long targetMins = Math.max(1, Duration.between(s.getStartTime(), s.getTargetEndTime()).toMinutes());
        long remainingMins = Math.max(0, Duration.between(now, s.getTargetEndTime()).toMinutes());
        double progress = Math.min(100.0, Math.round(((double) elapsedMins / targetMins) * 1000.0) / 10.0);

        // Phân loại giai đoạn sinh học nhịn ăn (YAZIO style)
        double elapsedHours = elapsedMins / 60.0;
        String stage;
        String desc;
        if (elapsedHours < 4.0) {
            stage = "FED";
            desc = "Giai đoạn no: Cơ thể đang tiêu hóa thức ăn và hấp thụ glucose.";
        } else if (elapsedHours < 12.0) {
            stage = "BLOOD_SUGAR_NORMALIZING";
            desc = "Ổn định đường huyết: Insulin giảm, bắt đầu tiêu hao glycogen dự trữ ở gan.";
        } else if (elapsedHours < 18.0) {
            stage = "KETOSIS";
            desc = "Đốt mỡ (Ketosis): Cơ thể chuyển hóa mỡ thừa thành ketone cung cấp năng lượng.";
        } else {
            stage = "AUTOPHAGY";
            desc = "Tự thực bào (Autophagy): Tế bào tái tạo, dọn dẹp tế bào cũ và giảm viêm mạnh mẽ.";
        }

        return FastingStatusDto.builder()
                .isActive(true)
                .session(s)
                .elapsedMinutes(elapsedMins)
                .targetMinutes(targetMins)
                .remainingMinutes(remainingMins)
                .progressPercent(progress)
                .stage(stage)
                .stageDescription(desc)
                .build();
    }

    @Transactional
    public FastingSession startFasting(String protocol, Integer customHours) {
        // Hủy bất kỳ session active nào trước đó
        fastingSessionRepository.findTopByStatusOrderByStartTimeDesc("ACTIVE")
                .ifPresent(prev -> {
                    prev.setStatus("CANCELLED");
                    prev.setActualEndTime(LocalDateTime.now());
                    fastingSessionRepository.save(prev);
                });

        int hours = 16;
        if ("14_10".equals(protocol)) hours = 14;
        else if ("16_8".equals(protocol)) hours = 16;
        else if ("18_6".equals(protocol)) hours = 18;
        else if ("20_4".equals(protocol)) hours = 20;
        else if (customHours != null && customHours > 0) hours = customHours;

        LocalDateTime now = LocalDateTime.now();
        FastingSession session = FastingSession.builder()
                .protocol(protocol != null ? protocol : "16_8")
                .startTime(now)
                .targetEndTime(now.plusHours(hours))
                .status("ACTIVE")
                .build();

        return fastingSessionRepository.save(session);
    }

    @Transactional
    public FastingSession stopFasting() {
        FastingSession s = fastingSessionRepository.findTopByStatusOrderByStartTimeDesc("ACTIVE")
                .orElseThrow(() -> new IllegalStateException("Không có phiên nhịn ăn nào đang diễn ra!"));
        s.setStatus("COMPLETED");
        s.setActualEndTime(LocalDateTime.now());
        return fastingSessionRepository.save(s);
    }

    public List<FastingSession> getRecentSessions() {
        return fastingSessionRepository.findTop10ByOrderByStartTimeDesc();
    }
}
