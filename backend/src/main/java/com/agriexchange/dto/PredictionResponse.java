package com.agriexchange.dto;

import java.util.Map;

public class PredictionResponse {
    private String status;
    private Double predictedPricePerTon;
    private String currency = "INR";
    private Map<String, Object> confidenceInterval;
    private Map<String, Object> qualityAnalysis;
    private Map<String, Object> recommendedPricing;
    private String seasonalCommentary;
    private String modelVersion;

    public PredictionResponse() {}

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public Double getPredictedPricePerTon() { return predictedPricePerTon; }
    public void setPredictedPricePerTon(Double predictedPricePerTon) { this.predictedPricePerTon = predictedPricePerTon; }

    public String getCurrency() { return currency; }
    public void setCurrency(String currency) { this.currency = currency; }

    public Map<String, Object> getConfidenceInterval() { return confidenceInterval; }
    public void setConfidenceInterval(Map<String, Object> confidenceInterval) { this.confidenceInterval = confidenceInterval; }

    public Map<String, Object> getQualityAnalysis() { return qualityAnalysis; }
    public void setQualityAnalysis(Map<String, Object> qualityAnalysis) { this.qualityAnalysis = qualityAnalysis; }

    public Map<String, Object> getRecommendedPricing() { return recommendedPricing; }
    public void setRecommendedPricing(Map<String, Object> recommendedPricing) { this.recommendedPricing = recommendedPricing; }

    public String getSeasonalCommentary() { return seasonalCommentary; }
    public void setSeasonalCommentary(String seasonalCommentary) { this.seasonalCommentary = seasonalCommentary; }

    public String getModelVersion() { return modelVersion; }
    public void setModelVersion(String modelVersion) { this.modelVersion = modelVersion; }
}
