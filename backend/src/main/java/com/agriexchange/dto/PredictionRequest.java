package com.agriexchange.dto;

public class PredictionRequest {
    private String byproductType;
    private Double moistureContentPercent;
    private Double organicMatterPercent = 82.0;
    private Double quantityTons = 20.0;
    private String state = "Punjab";
    private String season = "Kharif";
    private Double transportDistanceKm = 50.0;

    public PredictionRequest() {}

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
}
