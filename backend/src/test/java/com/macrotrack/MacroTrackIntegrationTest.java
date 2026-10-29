package com.macrotrack;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.macrotrack.model.MealLog;
import com.macrotrack.model.WeightLog;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDate;
import java.util.Map;

import static org.hamcrest.Matchers.hasSize;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
class MacroTrackIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    @DisplayName("API Profile: Lấy thông tin hồ sơ người dùng cá nhân mặc định")
    void testGetProfile() throws Exception {
        mockMvc.perform(get("/api/v1/profile"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("Người Dùng"))
                .andExpect(jsonPath("$.goalType").value("CUT"))
                .andExpect(jsonPath("$.targetCalories").isNumber());
    }

    @Test
    @DisplayName("API Foods: Tìm kiếm món ăn phở bò có sẵn từ Viện Dinh Dưỡng")
    void testSearchFoods() throws Exception {
        mockMvc.perform(get("/api/v1/foods/search").param("q", "phở"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$[0].name").exists());
    }

    @Test
    @DisplayName("API Diary: Log bữa ăn và kiểm tra tổng hợp calo trong ngày")
    void testLogMealAndDailySummary() throws Exception {
        MealLog meal = MealLog.builder()
                .logDate(LocalDate.now())
                .mealType("BREAKFAST")
                .foodName("Bát phở bò tái")
                .servings(1.0)
                .calories(480.0)
                .proteinG(28.0)
                .carbsG(60.0)
                .fatG(12.0)
                .build();

        mockMvc.perform(post("/api/v1/diary/meals")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(meal)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").exists())
                .andExpect(jsonPath("$.calories").value(480.0));

        mockMvc.perform(get("/api/v1/diary/summary"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalCalories").value(480.0))
                .andExpect(jsonPath("$.totalProteinG").value(28.0));
    }

    @Test
    @DisplayName("API Weight: Log cân nặng sáng nay và tự động tính trend weight")
    void testLogWeight() throws Exception {
        Map<String, Object> req = Map.of(
                "date", LocalDate.now().toString(),
                "weight", 71.8,
                "notes", "Cân sau khi thức dậy"
        );

        mockMvc.perform(post("/api/v1/weights")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.scaleWeight").value(71.8))
                .andExpect(jsonPath("$.trendWeight").isNumber());
    }

    @Test
    @DisplayName("API AI Parser: Bóc tách câu nói tiếng Việt tự nhiên")
    void testAiFoodParser() throws Exception {
        Map<String, String> req = Map.of("text", "1 tô phở bò tái gầu và 1 hộp sữa chua");

        mockMvc.perform(post("/api/v1/ai-parser/parse")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(2)));
    }
}
