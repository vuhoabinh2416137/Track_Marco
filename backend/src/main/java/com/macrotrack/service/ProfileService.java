package com.macrotrack.service;

import com.macrotrack.domain.algorithm.AdaptiveExpenditureEngineV3;
import com.macrotrack.model.UserProfile;
import com.macrotrack.repository.UserProfileRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;

@Service
@RequiredArgsConstructor
public class ProfileService {

    private final UserProfileRepository userProfileRepository;
    private final AdaptiveExpenditureEngineV3 expenditureEngine;

    public UserProfile getProfile() {
        return userProfileRepository.findFirstByOrderByIdAsc()
                .orElseThrow(() -> new IllegalStateException("Hồ sơ người dùng chưa được khởi tạo!"));
    }

    @Transactional
    public UserProfile updateProfile(UserProfile updateRequest) {
        UserProfile profile = getProfile();

        if (updateRequest.getName() != null) profile.setName(updateRequest.getName());
        if (updateRequest.getGender() != null) profile.setGender(updateRequest.getGender());
        if (updateRequest.getHeightCm() > 0) profile.setHeightCm(updateRequest.getHeightCm());
        if (updateRequest.getCurrentWeightKg() > 0) profile.setCurrentWeightKg(updateRequest.getCurrentWeightKg());
        if (updateRequest.getTargetWeightKg() > 0) profile.setTargetWeightKg(updateRequest.getTargetWeightKg());
        if (updateRequest.getGoalType() != null) profile.setGoalType(updateRequest.getGoalType());
        if (updateRequest.getWeeklyGoalRate() > 0) profile.setWeeklyGoalRate(updateRequest.getWeeklyGoalRate());
        if (updateRequest.getWaterTargetMl() > 0) profile.setWaterTargetMl(updateRequest.getWaterTargetMl());
        if (updateRequest.getFastingProtocol() != null) profile.setFastingProtocol(updateRequest.getFastingProtocol());
        profile.setShowFastingWidget(updateRequest.isShowFastingWidget());
        profile.setShowWaterWidget(updateRequest.isShowWaterWidget());
        profile.setCustomMacro(updateRequest.isCustomMacro());
        if (updateRequest.getProteinRatioPerKg() != null && updateRequest.getProteinRatioPerKg() > 0) {
            profile.setProteinRatioPerKg(updateRequest.getProteinRatioPerKg());
        }

        if (updateRequest.isCustomMacro() && updateRequest.getTargetProteinG() > 0 
                && updateRequest.getTargetCarbsG() > 0 && updateRequest.getTargetFatG() > 0) {
            // Chế độ tự chỉnh Macro theo ý muốn
            profile.setTargetProteinG(updateRequest.getTargetProteinG());
            profile.setTargetCarbsG(updateRequest.getTargetCarbsG());
            profile.setTargetFatG(updateRequest.getTargetFatG());
            int calsFromMacros = (updateRequest.getTargetProteinG() * 4) + (updateRequest.getTargetCarbsG() * 4) + (updateRequest.getTargetFatG() * 9);
            profile.setTargetCalories(updateRequest.getTargetCalories() > 0 ? updateRequest.getTargetCalories() : calsFromMacros);
        } else {
            // Chế độ tự động tính toán theo TDEE và mục tiêu thể hình
            boolean isMale = "MALE".equalsIgnoreCase(profile.getGender());
            var targets = expenditureEngine.calculateMacroTargets(
                    profile.getEstimatedTdee(),
                    profile.getGoalType(),
                    profile.getCurrentWeightKg(),
                    profile.getWeeklyGoalRate(),
                    isMale
            );

            profile.setTargetCalories(targets.targetCalories());
            profile.setTargetProteinG(targets.targetProteinG());
            profile.setTargetCarbsG(targets.targetCarbsG());
            profile.setTargetFatG(targets.targetFatG());
        }

        profile.setUpdatedAt(LocalDate.now());

        return userProfileRepository.save(profile);
    }
}
