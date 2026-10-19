package com.agriexchange.controller;

import com.agriexchange.dto.PredictionRequest;
import com.agriexchange.dto.PredictionResponse;
import com.agriexchange.model.PricePredictionLog;
import com.agriexchange.model.User;
import com.agriexchange.service.PricePredictionService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/predictions")
@CrossOrigin(origins = "*")
public class PricePredictionController {

    private final PricePredictionService predictionService;

    public PricePredictionController(PricePredictionService predictionService) {
        this.predictionService = predictionService;
    }

    @PostMapping("/estimate")
    public ResponseEntity<PredictionResponse> estimatePrice(
            @RequestBody PredictionRequest request,
            @AuthenticationPrincipal User user) {
        PredictionResponse response = predictionService.predictPrice(request, user);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/history")
    public ResponseEntity<List<PricePredictionLog>> getPredictionHistory(@AuthenticationPrincipal User user) {
        if (user == null) {
            return ResponseEntity.status(401).build();
        }
        return ResponseEntity.ok(predictionService.getPredictionHistory(user));
    }

    @GetMapping("/catalog")
    public ResponseEntity<?> getByproductCatalog() {
        return ResponseEntity.ok(List.of(
            Map.of("type", "rice_straw", "name", "Paddy Rice Straw", "basePrice", 2400.0, "idealMoisture", 12.0),
            Map.of("type", "wheat_straw", "name", "Golden Wheat Straw", "basePrice", 3400.0, "idealMoisture", 10.0),
            Map.of("type", "sugarcane_bagasse", "name", "Sugarcane Bagasse", "basePrice", 2800.0, "idealMoisture", 18.0),
            Map.of("type", "corn_cob", "name", "De-shelled Corn Cobs", "basePrice", 3550.0, "idealMoisture", 11.0),
            Map.of("type", "cotton_stalk", "name", "Chipped Cotton Stalks", "basePrice", 3050.0, "idealMoisture", 12.0),
            Map.of("type", "coir_pith", "name", "Coconut Coir Pith", "basePrice", 5300.0, "idealMoisture", 15.0),
            Map.of("type", "mustard_husk", "name", "Mustard Stalks & Husk", "basePrice", 2950.0, "idealMoisture", 10.0),
            Map.of("type", "poultry_litter", "name", "Poultry Deep Litter", "basePrice", 1850.0, "idealMoisture", 20.0)
        ));
    }
}
