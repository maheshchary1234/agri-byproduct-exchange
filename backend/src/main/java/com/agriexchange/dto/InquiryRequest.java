package com.agriexchange.dto;

public class InquiryRequest {
    private Long productId;
    private Double offeredPricePerTon;
    private Double requestedQuantityTons;
    private String message;

    public InquiryRequest() {}

    public Long getProductId() { return productId; }
    public void setProductId(Long productId) { this.productId = productId; }

    public Double getOfferedPricePerTon() { return offeredPricePerTon; }
    public void setOfferedPricePerTon(Double offeredPricePerTon) { this.offeredPricePerTon = offeredPricePerTon; }

    public Double getRequestedQuantityTons() { return requestedQuantityTons; }
    public void setRequestedQuantityTons(Double requestedQuantityTons) { this.requestedQuantityTons = requestedQuantityTons; }

    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }
}
