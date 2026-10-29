package com.macrotrack.service;

import com.macrotrack.domain.algorithm.AdaptiveExpenditureEngineV3;
import com.macrotrack.domain.algorithm.IrregularWeightTrendEngine;
import com.macrotrack.model.MealLog;
import com.macrotrack.model.UserProfile;
import com.macrotrack.model.WeightLog;
import com.macrotrack.repository.MealLogRepository;
import com.macrotrack.repository.UserProfileRepository;
import com.macrotrack.repository.WeightLogRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.*;

@Service
@RequiredArgsConstructor
@Slf4j
public class WeightService {

    private final WeightLogRepository weightLogRepository;
    private final UserProfileRepository userProfileRepository;
    private final MealLogRepository mealLogRepository;
    private final IrregularWeightTrendEngine weightTrendEngine;
    private final AdaptiveExpenditureEngineV3 expenditureEngine;

    public List<WeightLog> getAllWeightLogs() {
        return weightLogRepository.findAllByOrderByLogDateAsc();
    }

    public Optional<WeightLog> getWeightByDate(LocalDate date) {
        return weightLogRepository.findByLogDate(date);
    }

    @Transactional
    public WeightLog logWeight(LocalDate logDate, double scaleWeight, String notes) {
        // Tìm ngày cân gần nhất trước ngày này để tính toán bước nhảy delta_t
        Optional<WeightLog> previousLogOpt = weightLogRepository.findTopByLogDateLessThanOrderByLogDateDesc(logDate);

        double calculatedTrend;
        if (previousLogOpt.isPresent()) {
            WeightLog prev = previousLogOpt.get();
            long daysSinceLast = ChronoUnit.DAYS.between(prev.getLogDate(), logDate);
            calculatedTrend = weightTrendEngine.calculateTrendWeight(scaleWeight, prev.getTrendWeight(), daysSinceLast);
        } else {
            // Ngày đầu tiên
            calculatedTrend = weightTrendEngine.initialTrendWeight(scaleWeight);
        }

        WeightLog logEntry = weightLogRepository.findByLogDate(logDate)
                .orElse(WeightLog.builder().logDate(logDate).build());

        logEntry.setScaleWeight(Math.round(scaleWeight * 100.0) / 100.0);
        logEntry.setTrendWeight(calculatedTrend);
        logEntry.setNotes(notes);

        WeightLog savedLog = weightLogRepository.save(logEntry);

        // Cập nhật Profile cân nặng hiện tại
        userProfileRepository.findFirstByOrderByIdAsc().ifPresent(profile -> {
            profile.setCurrentWeightKg(calculatedTrend);

            // Tự động kích hoạt tính toán lại TDEE thích ứng nếu có dữ liệu 14 ngày
            updateAdaptiveExpenditure(profile, logDate);
            userProfileRepository.save(profile);
        });

        return savedLog;
    }

    private void updateAdaptiveExpenditure(UserProfile profile, LocalDate currentDate) {
        LocalDate startDate = currentDate.minusDays(14);
        List<WeightLog> windowWeights = weightLogRepository.findAllByLogDateBetweenOrderByLogDateAsc(startDate, currentDate);
        if (windowWeights.size() < 2) {
            return;
        }

        double startTrend = windowWeights.get(0).getTrendWeight();
        double endTrend = windowWeights.get(windowWeights.size() - 1).getTrendWeight();

        // Thu thập nhật ký ăn uống trong 14 ngày
        List<MealLog> meals = mealLogRepository.findByLogDateBetweenOrderByLogDateAsc(startDate, currentDate);
        Map<LocalDate, List<MealLog>> mealsByDate = new HashMap<>();
        for (MealLog m : meals) {
            mealsByDate.computeIfAbsent(m.getLogDate(), k -> new ArrayList<>()).add(m);
        }

        List<AdaptiveExpenditureEngineV3.DailyIntakeRecord> records = new ArrayList<>();
        for (int i = 0; i < 14; i++) {
            LocalDate d = startDate.plusDays(i);
            List<MealLog> dayMeals = mealsByDate.getOrDefault(d, Collections.emptyList());
            double dayCals = dayMeals.stream().mapToDouble(MealLog::getCalories).sum();
            var status = expenditureEngine.classifyDay(dayCals, dayMeals.size());
            records.add(new AdaptiveExpenditureEngineV3.DailyIntakeRecord(dayCals, status));
        }

        double newTdee = expenditureEngine.calculateExpenditure(
                records, startTrend, endTrend, 14, profile.getEstimatedTdee()
        );

        profile.setEstimatedTdee(newTdee);

        // Chỉ cập nhật lại phân bổ macro nếu không bật chế độ chỉnh tay (Custom Macro)
        if (!profile.isCustomMacro()) {
            boolean isMale = "MALE".equalsIgnoreCase(profile.getGender());
            var targets = expenditureEngine.calculateMacroTargets(
                    newTdee, profile.getGoalType(), profile.getCurrentWeightKg(), profile.getWeeklyGoalRate(), isMale
            );
            profile.setTargetCalories(targets.targetCalories());
            profile.setTargetProteinG(targets.targetProteinG());
            profile.setTargetCarbsG(targets.targetCarbsG());
            profile.setTargetFatG(targets.targetFatG());
        } else if (profile.getProteinRatioPerKg() != null && profile.getProteinRatioPerKg() > 0) {
            // Nếu tự chỉnh macro nhưng chọn cố định tỉ lệ Đạm theo cân nặng (g/kg)
            int newProtein = (int) Math.round(profile.getCurrentWeightKg() * profile.getProteinRatioPerKg());
            profile.setTargetProteinG(newProtein);
            int newCals = (newProtein * 4) + (profile.getTargetCarbsG() * 4) + (profile.getTargetFatG() * 9);
            profile.setTargetCalories(newCals);
        }
    }
}
