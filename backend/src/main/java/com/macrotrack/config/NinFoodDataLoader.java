package com.macrotrack.config;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.macrotrack.domain.algorithm.AdaptiveExpenditureEngineV3;
import com.macrotrack.model.Food;
import com.macrotrack.model.UserProfile;
import com.macrotrack.repository.FoodRepository;
import com.macrotrack.repository.UserProfileRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Component;

import java.io.InputStream;
import java.time.LocalDate;
import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
public class NinFoodDataLoader implements CommandLineRunner {

    private final FoodRepository foodRepository;
    private final UserProfileRepository userProfileRepository;
    private final com.macrotrack.repository.WeightLogRepository weightLogRepository;
    private final AdaptiveExpenditureEngineV3 expenditureEngine;
    private final ObjectMapper objectMapper;

    @Override
    public void run(String... args) throws Exception {
        // 1. Khởi tạo UserProfile mặc định nếu chưa tồn tại
        if (userProfileRepository.count() == 0) {
            log.info("Khởi tạo hồ sơ người dùng cá nhân (Single-User Profile)...");
            double initialWeight = 53.0;
            double initialTdee = 1850.0;
            var targets = expenditureEngine.calculateMacroTargets(
                    initialTdee, "MAINTAIN", initialWeight, 0.005, true
            );

            UserProfile profile = UserProfile.builder()
                    .name("Người Dùng")
                    .gender("MALE")
                    .heightCm(173.0)
                    .currentWeightKg(initialWeight)
                    .targetWeightKg(53.0)
                    .goalType("MAINTAIN")
                    .weeklyGoalRate(0.005)
                    .estimatedTdee(initialTdee)
                    .targetCalories(targets.targetCalories())
                    .targetProteinG(targets.targetProteinG())
                    .targetCarbsG(targets.targetCarbsG())
                    .targetFatG(targets.targetFatG())
                    .waterTargetMl(2000)
                    .fastingProtocol("16_8")
                    .showFastingWidget(true)
                    .showWaterWidget(true)
                    .updatedAt(LocalDate.now())
                    .build();

            userProfileRepository.save(profile);
            log.info("Hồ sơ khởi tạo thành công với cân nặng: 53kg, Calo: {} kcal, Protein: {}g",
                    profile.getTargetCalories(), profile.getTargetProteinG());
        } else {
            // Cập nhật hồ sơ hiện tại về cân nặng thực tế 53kg của người dùng
            userProfileRepository.findFirstByOrderByIdAsc().ifPresent(profile -> {
                if (profile.getCurrentWeightKg() != 53.0) {
                    profile.setCurrentWeightKg(53.0);
                    if (profile.getTargetWeightKg() == 68.0) {
                        profile.setTargetWeightKg(53.0);
                        profile.setGoalType("MAINTAIN");
                    }
                    double tdee = 1850.0;
                    profile.setEstimatedTdee(tdee);
                    if (!profile.isCustomMacro()) {
                        var targets = expenditureEngine.calculateMacroTargets(
                                tdee, profile.getGoalType(), 53.0, 0.005, "MALE".equalsIgnoreCase(profile.getGender())
                        );
                        profile.setTargetCalories(targets.targetCalories());
                        profile.setTargetProteinG(targets.targetProteinG());
                        profile.setTargetCarbsG(targets.targetCarbsG());
                        profile.setTargetFatG(targets.targetFatG());
                    }
                    userProfileRepository.save(profile);
                    log.info("Đã đồng bộ cân nặng người dùng về 53.0 kg!");
                }
            });
        }

        // Tạo log cân nặng 53kg hôm nay nếu chưa có
        if (weightLogRepository.count() == 0 || weightLogRepository.findByLogDate(LocalDate.now()).isEmpty()) {
            weightLogRepository.save(com.macrotrack.model.WeightLog.builder()
                    .logDate(LocalDate.now())
                    .scaleWeight(53.0)
                    .trendWeight(53.0)
                    .notes("Cân nặng thực tế khởi đầu")
                    .build());
        }

        // 2. Nạp dữ liệu thực phẩm chuẩn Viện Dinh Dưỡng
        if (foodRepository.count() == 0) {
            log.info("Đang nạp bộ dữ liệu thực phẩm mẫu chuẩn Viện Dinh Dưỡng Quốc Gia...");
            ClassPathResource resource = new ClassPathResource("data/nin_foods.json");
            if (resource.exists()) {
                try (InputStream inputStream = resource.getInputStream()) {
                    List<Food> foods = objectMapper.readValue(inputStream, new TypeReference<List<Food>>() {});
                    foods.forEach(f -> {
                        if (f.getSource() == null) {
                            f.setSource("NIN_VIETNAM");
                        }
                    });
                    foodRepository.saveAll(foods);
                    log.info("Đã nạp thành công {} món ăn chuẩn vào hệ thống!", foods.size());
                }
            }
        }
    }
}
