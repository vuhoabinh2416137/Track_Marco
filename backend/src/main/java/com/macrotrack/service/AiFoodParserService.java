package com.macrotrack.service;

import com.macrotrack.model.Food;
import com.macrotrack.repository.FoodRepository;
import lombok.Builder;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Service
@RequiredArgsConstructor
@Slf4j
public class AiFoodParserService {

    private final FoodRepository foodRepository;

    @Getter
    @Builder
    public static class ParsedFoodItemDto {
        private String originalQuery;
        private String matchedFoodName;
        private Long foodId;
        private double quantity;
        private String unit;
        private double calories;
        private double proteinG;
        private double carbsG;
        private double fatG;
        private double confidence;
    }

    /**
     * Bóc tách câu nói hoặc văn bản tiếng Việt tự nhiên thành danh sách món ăn và macro
     * Ví dụ: "1 bát phở bò tái gầu 1 quả trứng trần và 1 ly cà phê sữa đá"
     */
    public List<ParsedFoodItemDto> parseNaturalLanguage(String prompt) {
        List<ParsedFoodItemDto> results = new ArrayList<>();
        if (prompt == null || prompt.trim().isEmpty()) {
            return results;
        }

        // Tách câu thành các phân đoạn bằng dấu phẩy, dấu chấm, từ "và", "với", "thêm", "+"
        String normalized = prompt.replaceAll("(?i)\\b(và|với|thêm|kèm|uống|ăn)\\b", ",");
        String[] segments = normalized.split("[,;\\n]+");

        Pattern quantityPattern = Pattern.compile("(\\d+(?:[.,]\\d+)?)\\s*(g|gram|kg|bát|tô|chén|dĩa|đĩa|quả|trái|ổ|hộp|ly|cốc|muỗng|scoop)?", Pattern.CASE_INSENSITIVE);

        for (String segment : segments) {
            String trimmed = segment.trim();
            if (trimmed.isEmpty()) continue;

            double qty = 1.0;
            String unit = "phần";

            Matcher matcher = quantityPattern.matcher(trimmed);
            String foodSearchTerm = trimmed;

            if (matcher.find()) {
                try {
                    String numStr = matcher.group(1).replace(',', '.');
                    qty = Double.parseDouble(numStr);
                    if (matcher.group(2) != null) {
                        unit = matcher.group(2).toLowerCase();
                    }
                    // Bỏ số và đơn vị ra để lấy tên món
                    foodSearchTerm = trimmed.substring(matcher.end()).trim();
                } catch (Exception ignored) {
                }
            }

            if (foodSearchTerm.isEmpty()) {
                foodSearchTerm = trimmed;
            }

            // Tìm kiếm trong database
            List<Food> matchedFoods = foodRepository.searchFoods(foodSearchTerm, PageRequest.of(0, 5));
            if (!matchedFoods.isEmpty()) {
                Food bestMatch = matchedFoods.get(0);
                double multiplier = qty;

                // Nếu người dùng nhập gram (ví dụ: 200g ức gà) và món ăn có servingSize = 100g
                if (("g".equals(unit) || "gram".equals(unit)) && bestMatch.getServingSize() > 0) {
                    multiplier = qty / bestMatch.getServingSize();
                }

                results.add(ParsedFoodItemDto.builder()
                        .originalQuery(trimmed)
                        .matchedFoodName(bestMatch.getName())
                        .foodId(bestMatch.getId())
                        .quantity(qty)
                        .unit(unit)
                        .calories(Math.round(bestMatch.getCalories() * multiplier * 10.0) / 10.0)
                        .proteinG(Math.round(bestMatch.getProteinG() * multiplier * 10.0) / 10.0)
                        .carbsG(Math.round(bestMatch.getCarbsG() * multiplier * 10.0) / 10.0)
                        .fatG(Math.round(bestMatch.getFatG() * multiplier * 10.0) / 10.0)
                        .confidence(0.95)
                        .build());
            } else {
                // Nếu chưa có trong DB, ước tính thông minh heuristic cơ bản
                results.add(ParsedFoodItemDto.builder()
                        .originalQuery(trimmed)
                        .matchedFoodName(foodSearchTerm)
                        .foodId(null)
                        .quantity(qty)
                        .unit(unit)
                        .calories(Math.round(250.0 * qty))
                        .proteinG(Math.round(10.0 * qty))
                        .carbsG(Math.round(30.0 * qty))
                        .fatG(Math.round(8.0 * qty))
                        .confidence(0.60)
                        .build());
            }
        }

        return results;
    }
}
