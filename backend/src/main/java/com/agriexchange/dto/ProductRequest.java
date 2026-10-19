package com.agriexchange.dto;

public class ProductRequest {
    private String title;
    private String byproductType;
    private Long categoryId;
    private String description;
    private Double quantityTons;
    private Double moistureContentPercent;
    private Double organicMatterPercent;
    private Double pricePerTon;
    private Double estimatedMarketPrice;
    private String packagingType;
    private String storageType;
    private String harvestSeason;
    private String state;
    private String district;
    private String pincode;
    private String imageUrl;

    public ProductRequest() {}

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getByproductType() { return byproductType; }
    public void setByproductType(String byproductType) { this.byproductType = byproductType; }

    public Long getCategoryId() { return categoryId; }
    public void setCategoryId(Long categoryId) { this.categoryId = categoryId; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public Double getQuantityTons() { return quantityTons; }
    public void setQuantityTons(Double quantityTons) { this.quantityTons = quantityTons; }

    public Double getMoistureContentPercent() { return moistureContentPercent; }
    public void setMoistureContentPercent(Double moistureContentPercent) { this.moistureContentPercent = moistureContentPercent; }

    public Double getOrganicMatterPercent() { return organicMatterPercent; }
    public void setOrganicMatterPercent(Double organicMatterPercent) { this.organicMatterPercent = organicMatterPercent; }

    public Double getPricePerTon() { return pricePerTon; }
    public void setPricePerTon(Double pricePerTon) { this.pricePerTon = pricePerTon; }

    public Double getEstimatedMarketPrice() { return estimatedMarketPrice; }
    public void setEstimatedMarketPrice(Double estimatedMarketPrice) { this.estimatedMarketPrice = estimatedMarketPrice; }

    public String getPackagingType() { return packagingType; }
    public void setPackagingType(String packagingType) { this.packagingType = packagingType; }

    public String getStorageType() { return storageType; }
    public void setStorageType(String storageType) { this.storageType = storageType; }

    public String getHarvestSeason() { return harvestSeason; }
    public void setHarvestSeason(String harvestSeason) { this.harvestSeason = harvestSeason; }

    public String getState() { return state; }
    public void setState(String state) { this.state = state; }

    public String getDistrict() { return district; }
    public void setDistrict(String district) { this.district = district; }

    public String getPincode() { return pincode; }
    public void setPincode(String pincode) { this.pincode = pincode; }

    public String getImageUrl() { return imageUrl; }
    public void setImageUrl(String imageUrl) { this.imageUrl = imageUrl; }
}
