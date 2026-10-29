package com.macrotrack.service;

import com.macrotrack.model.MealLog;
import com.macrotrack.model.UserProfile;
import com.macrotrack.repository.MealLogRepository;
import lombok.Builder;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DiaryService {

    private final MealLogRepository mealLogRepository;
    private final ProfileService profileService;

    @Getter
    @Builder
    public static class DailySummaryDto {
        private LocalDate date;
        private double totalCalories;
        private double totalProteinG;
        private double totalCarbsG;
        private double totalFatG;
        private int targetCalories;
        private int targetProteinG;
        private int targetCarbsG;
        private int targetFatG;
        private double remainingCalories;
        private Map<String, List<MealLog>> mealsByType;
    }

    public DailySummaryDto getDailySummary(LocalDate date) {
        UserProfile profile = profileService.getProfile();
        List<MealLog> meals = mealLogRepository.findByLogDateOrderByLoggedAtAsc(date);

        double totalCalories = Math.round(meals.stream().mapToDouble(MealLog::getCalories).sum() * 10.0) / 10.0;
        double totalProteinG = Math.round(meals.stream().mapToDouble(MealLog::getProteinG).sum() * 10.0) / 10.0;
        double totalCarbsG = Math.round(meals.stream().mapToDouble(MealLog::getCarbsG).sum() * 10.0) / 10.0;
        double totalFatG = Math.round(meals.stream().mapToDouble(MealLog::getFatG).sum() * 10.0) / 10.0;

        double remainingCalories = Math.round((profile.getTargetCalories() - totalCalories) * 10.0) / 10.0;

        Map<String, List<MealLog>> grouped = meals.stream()
                .collect(Collectors.groupingBy(MealLog::getMealType));

        return DailySummaryDto.builder()
                .date(date)
                .totalCalories(totalCalories)
                .totalProteinG(totalProteinG)
                .totalCarbsG(totalCarbsG)
                .totalFatG(totalFatG)
                .targetCalories(profile.getTargetCalories())
                .targetProteinG(profile.getTargetProteinG())
                .targetCarbsG(profile.getTargetCarbsG())
                .targetFatG(profile.getTargetFatG())
                .remainingCalories(remainingCalories)
                .mealsByType(grouped)
                .build();
    }

    @Transactional
    public MealLog logMeal(MealLog mealLog) {
        if (mealLog.getLogDate() == null) {
            mealLog.setLogDate(LocalDate.now());
        }
        if (mealLog.getLoggedAt() == null) {
            mealLog.setLoggedAt(LocalDateTime.now());
        }
        if (mealLog.getServings() <= 0) {
            mealLog.setServings(1.0);
        }
        return mealLogRepository.save(mealLog);
    }

    @Transactional
    public MealLog updateMeal(Long id, MealLog updated) {
        MealLog existing = mealLogRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy món ăn id: " + id));
        if (updated.getServings() > 0) existing.setServings(updated.getServings());
        if (updated.getCalories() >= 0) existing.setCalories(updated.getCalories());
        if (updated.getProteinG() >= 0) existing.setProteinG(updated.getProteinG());
        if (updated.getCarbsG() >= 0) existing.setCarbsG(updated.getCarbsG());
        if (updated.getFatG() >= 0) existing.setFatG(updated.getFatG());
        if (updated.getFoodName() != null && !updated.getFoodName().isBlank()) existing.setFoodName(updated.getFoodName());
        if (updated.getMealType() != null && !updated.getMealType().isBlank()) existing.setMealType(updated.getMealType());
        return mealLogRepository.save(existing);
    }

    @Transactional
    public void deleteMeal(Long id) {
        mealLogRepository.deleteById(id);
    }
}
