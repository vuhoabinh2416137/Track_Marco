package com.macrotrack.service;

import com.macrotrack.model.Food;
import com.macrotrack.repository.FoodRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class FoodService {

    private final FoodRepository foodRepository;

    public List<Food> searchFoods(String query) {
        if (query == null || query.trim().isEmpty()) {
            return foodRepository.findTop20ByOrderByIsVerifiedDescNameAsc();
        }
        return foodRepository.searchFoods(query.trim(), PageRequest.of(0, 30));
    }

    public Optional<Food> getByBarcode(String barcode) {
        if (barcode == null || barcode.trim().isEmpty()) {
            return Optional.empty();
        }
        return foodRepository.findByBarcode(barcode.trim());
    }

    @Transactional
    public Food createCustomFood(Food food) {
        food.setSource("CUSTOM");
        food.setVerified(false);
        return foodRepository.save(food);
    }
}
