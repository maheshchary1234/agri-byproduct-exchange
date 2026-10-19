package com.agriexchange.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "products")
public class Product {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "farmer_id", nullable = false)
    private User farmer;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "category_id", nullable = false)
    private Category category;

    @Column(nullable = false, length = 200)
    private String title;

    @Column(name = "byproduct_type", nullable = false, length = 100)
    private String byproductType;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "quantity_tons", nullable = false)
    private Double quantityTons;

    @Column(name = "available_quantity_tons", nullable = false)
    private Double availableQuantityTons;

    @Column(name = "moisture_content_percent", nullable = false)
    private Double moistureContentPercent;

    @Column(name = "organic_matter_percent")
    private Double organicMatterPercent = 80.0;

    @Column(name = "price_per_ton", nullable = false)
    private Double pricePerTon;

    @Column(name = "estimated_market_price")
    private Double estimatedMarketPrice;

    @Column(name = "packaging_type")
    private String packagingType;

    @Column(name = "storage_type")
    private String storageType;

    @Column(name = "harvest_season")
    private String harvestSeason;

    @Column(nullable = false, length = 100)
    private String state;

    @Column(nullable = false, length = 100)
    private String district;

    private String pincode;

    @Column(name = "image_url", length = 500)
    private String imageUrl;

    @Column(nullable = false, length = 50)
    private String status = "AVAILABLE"; // AVAILABLE, UNDER_NEGOTIATION, SOLD, INACTIVE

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "updated_at")
    private LocalDateTime updatedAt = LocalDateTime.now();

    public Product() {}

    @PreUpdate
    public void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public User getFarmer() { return farmer; }
    public void setFarmer(User farmer) { this.farmer = farmer; }

    public Category getCategory() { return category; }
    public void setCategory(Category category) { this.category = category; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getByproductType() { return byproductType; }
    public void setByproductType(String byproductType) { this.byproductType = byproductType; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public Double getQuantityTons() { return quantityTons; }
    public void setQuantityTons(Double quantityTons) { this.quantityTons = quantityTons; }

    public Double getAvailableQuantityTons() { return availableQuantityTons; }
    public void setAvailableQuantityTons(Double availableQuantityTons) { this.availableQuantityTons = availableQuantityTons; }

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

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
