package com.agriexchange.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "price_predictions")
public class PricePredictionLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;

    @Column(name = "byproduct_type", nullable = false, length = 100)
    private String byproductType;

    @Column(name = "moisture_content_percent", nullable = false)
    private Double moistureContentPercent;

    @Column(name = "organic_matter_percent")
    private Double organicMatterPercent;

    @Column(name = "quantity_tons", nullable = false)
    private Double quantityTons;

    @Column(nullable = false, length = 100)
    private String state;

    @Column(nullable = false, length = 50)
    private String season;

    @Column(name = "transport_distance_km")
    private Double transportDistanceKm;

    @Column(name = "predicted_price_per_ton", nullable = false)
    private Double predictedPricePerTon;

    @Column(name = "confidence_lower_bound")
    private Double confidenceLowerBound;

    @Column(name = "confidence_upper_bound")
    private Double confidenceUpperBound;

    @Column(name = "model_version")
    private String modelVersion = "xgboost-agri-v1.2";

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    public PricePredictionLog() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }

    public String getByproductType() { return byproductType; }
    public void setByproductType(String byproductType) { this.byproductType = byproductType; }

    public Double getMoistureContentPercent() { return moistureContentPercent; }
    public void setMoistureContentPercent(Double moistureContentPercent) { this.moistureContentPercent = moistureContentPercent; }

    public Double getOrganicMatterPercent() { return organicMatterPercent; }
    public void setOrganicMatterPercent(Double organicMatterPercent) { this.organicMatterPercent = organicMatterPercent; }

    public Double getQuantityTons() { return quantityTons; }
    public void setQuantityTons(Double quantityTons) { this.quantityTons = quantityTons; }

    public String getState() { return state; }
    public void setState(String state) { this.state = state; }

    public String getSeason() { return season; }
    public void setSeason(String season) { this.season = season; }

    public Double getTransportDistanceKm() { return transportDistanceKm; }
    public void setTransportDistanceKm(Double transportDistanceKm) { this.transportDistanceKm = transportDistanceKm; }

    public Double getPredictedPricePerTon() { return predictedPricePerTon; }
    public void setPredictedPricePerTon(Double predictedPricePerTon) { this.predictedPricePerTon = predictedPricePerTon; }

    public Double getConfidenceLowerBound() { return confidenceLowerBound; }
    public void setConfidenceLowerBound(Double confidenceLowerBound) { this.confidenceLowerBound = confidenceLowerBound; }

    public Double getConfidenceUpperBound() { return confidenceUpperBound; }
    public void setConfidenceUpperBound(Double confidenceUpperBound) { this.confidenceUpperBound = confidenceUpperBound; }

    public String getModelVersion() { return modelVersion; }
    public void setModelVersion(String modelVersion) { this.modelVersion = modelVersion; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
