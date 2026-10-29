package com.macrotrack.service;

import com.macrotrack.model.UserProfile;
import com.macrotrack.model.WaterLog;
import com.macrotrack.repository.WaterLogRepository;
import lombok.Builder;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class WaterService {

    private final WaterLogRepository waterLogRepository;
    private final ProfileService profileService;

    @Getter
    @Builder
    public static class WaterStatusDto {
        private LocalDate date;
        private int totalMl;
        private int targetMl;
        private double progressPercent;
        private List<WaterLog> logs;
    }

    public WaterStatusDto getWaterStatus(LocalDate date) {
        UserProfile profile = profileService.getProfile();
        int totalMl = waterLogRepository.getTotalWaterByDate(date);
        int targetMl = profile.getWaterTargetMl() > 0 ? profile.getWaterTargetMl() : 2500;
        double progress = Math.min(100.0, Math.round(((double) totalMl / targetMl) * 1000.0) / 10.0);
        List<WaterLog> logs = waterLogRepository.findByLogDateOrderByLoggedAtAsc(date);

        return WaterStatusDto.builder()
                .date(date)
                .totalMl(totalMl)
                .targetMl(targetMl)
                .progressPercent(progress)
                .logs(logs)
                .build();
    }

    @Transactional
    public WaterLog addWater(LocalDate date, int amountMl) {
        WaterLog log = WaterLog.builder()
                .logDate(date != null ? date : LocalDate.now())
                .amountMl(amountMl > 0 ? amountMl : 250)
                .loggedAt(LocalDateTime.now())
                .build();
        return waterLogRepository.save(log);
    }
}
