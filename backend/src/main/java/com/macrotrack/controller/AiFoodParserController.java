package com.macrotrack.controller;

import com.macrotrack.service.AiFoodParserService;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/ai-parser")
@RequiredArgsConstructor
public class AiFoodParserController {

    private final AiFoodParserService aiFoodParserService;

    @Data
    public static class ParseRequest {
        private String text;
    }

    @PostMapping("/parse")
    public ResponseEntity<List<AiFoodParserService.ParsedFoodItemDto>> parseText(@RequestBody ParseRequest request) {
        String text = request != null ? request.getText() : "";
        return ResponseEntity.ok(aiFoodParserService.parseNaturalLanguage(text));
    }
}
