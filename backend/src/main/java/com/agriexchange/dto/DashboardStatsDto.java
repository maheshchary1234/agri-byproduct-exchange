package com.agriexchange.dto;

import java.util.Map;

public class DashboardStatsDto {
    private long totalUsers;
    private long totalFarmers;
    private long totalBuyers;
    private long totalProductsListed;
    private Double totalBiomassListedTons;
    private Double totalDeliveredBiomassTons;
    private Double grossMerchandiseValue;
    private Double estimatedCarbonOffsetTons;
    private Map<String, Long> productsByType;
    private Map<String, Long> ordersByStatus;

    public DashboardStatsDto() {}

    public long getTotalUsers() { return totalUsers; }
    public void setTotalUsers(long totalUsers) { this.totalUsers = totalUsers; }

    public long getTotalFarmers() { return totalFarmers; }
    public void setTotalFarmers(long totalFarmers) { this.totalFarmers = totalFarmers; }

    public long getTotalBuyers() { return totalBuyers; }
    public void setTotalBuyers(long totalBuyers) { this.totalBuyers = totalBuyers; }

    public long getTotalProductsListed() { return totalProductsListed; }
    public void setTotalProductsListed(long totalProductsListed) { this.totalProductsListed = totalProductsListed; }

    public Double getTotalBiomassListedTons() { return totalBiomassListedTons; }
    public void setTotalBiomassListedTons(Double totalBiomassListedTons) { this.totalBiomassListedTons = totalBiomassListedTons; }

    public Double getTotalDeliveredBiomassTons() { return totalDeliveredBiomassTons; }
    public void setTotalDeliveredBiomassTons(Double totalDeliveredBiomassTons) { this.totalDeliveredBiomassTons = totalDeliveredBiomassTons; }

    public Double getGrossMerchandiseValue() { return grossMerchandiseValue; }
    public void setGrossMerchandiseValue(Double grossMerchandiseValue) { this.grossMerchandiseValue = grossMerchandiseValue; }

    public Double getEstimatedCarbonOffsetTons() { return estimatedCarbonOffsetTons; }
    public void setEstimatedCarbonOffsetTons(Double estimatedCarbonOffsetTons) { this.estimatedCarbonOffsetTons = estimatedCarbonOffsetTons; }

    public Map<String, Long> getProductsByType() { return productsByType; }
    public void setProductsByType(Map<String, Long> productsByType) { this.productsByType = productsByType; }

    public Map<String, Long> getOrdersByStatus() { return ordersByStatus; }
    public void setOrdersByStatus(Map<String, Long> ordersByStatus) { this.ordersByStatus = ordersByStatus; }
}
