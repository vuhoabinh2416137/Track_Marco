package com.macrotrack.controller;

import com.macrotrack.model.Food;
import com.macrotrack.service.FoodService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/foods")
@RequiredArgsConstructor
public class FoodController {

    private final FoodService foodService;

    @GetMapping("/search")
    public ResponseEntity<List<Food>> searchFoods(@RequestParam(value = "q", required = false) String query) {
        return ResponseEntity.ok(foodService.searchFoods(query));
    }

    @GetMapping("/barcode/{barcode}")
    public ResponseEntity<Food> getByBarcode(@PathVariable String barcode) {
        return foodService.getByBarcode(barcode)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<Food> createCustomFood(@RequestBody Food food) {
        return ResponseEntity.ok(foodService.createCustomFood(food));
    }
}
