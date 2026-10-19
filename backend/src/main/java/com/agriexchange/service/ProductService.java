package com.agriexchange.service;

import com.agriexchange.dto.ProductRequest;
import com.agriexchange.model.Category;
import com.agriexchange.model.Product;
import com.agriexchange.model.User;
import com.agriexchange.repository.CategoryRepository;
import com.agriexchange.repository.ProductRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
public class ProductService {

    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;

    public ProductService(ProductRepository productRepository, CategoryRepository categoryRepository) {
        this.productRepository = productRepository;
        this.categoryRepository = categoryRepository;
    }

    public List<Product> getAllActiveProducts() {
        return productRepository.findByStatusAndAvailableQuantityTonsGreaterThanOrderByCreatedAtDesc("AVAILABLE", 0.0);
    }

    public List<Product> searchProducts(String byproductType, String state, Double maxPrice, Double maxMoisture) {
        return productRepository.searchProducts(byproductType, state, maxPrice, maxMoisture);
    }

    public Optional<Product> getProductById(Long id) {
        return productRepository.findById(id);
    }

    public List<Product> getProductsByFarmer(User farmer) {
        return productRepository.findByFarmerOrderByCreatedAtDesc(farmer);
    }

    @Transactional
    public Product createProduct(ProductRequest req, User farmer) {
        if (req == null) {
            throw new IllegalArgumentException("Product request payload cannot be null");
        }
        if (req.getTitle() == null || req.getTitle().trim().isEmpty()) {
            throw new IllegalArgumentException("Product title cannot be empty");
        }
        if (req.getQuantityTons() == null || req.getQuantityTons() <= 0) {
            throw new IllegalArgumentException("Quantity in tons must be greater than zero");
        }
        if (req.getPricePerTon() == null || req.getPricePerTon() <= 0) {
            throw new IllegalArgumentException("Price per ton must be greater than zero");
        }

        Category category = null;
        if (req.getCategoryId() != null) {
            category = categoryRepository.findById(req.getCategoryId()).orElse(null);
        }
        if (category == null) {
            category = categoryRepository.findAll().stream().findFirst().orElse(null);
        }

        Product product = new Product();
        product.setFarmer(farmer);
        product.setCategory(category);
        product.setTitle(req.getTitle().trim());
        product.setByproductType(req.getByproductType() != null && !req.getByproductType().trim().isEmpty() 
                ? req.getByproductType().trim() : "agricultural_residue");
        product.setDescription(req.getDescription() != null && !req.getDescription().trim().isEmpty() 
                ? req.getDescription().trim() : "Quality agricultural by-product ready for industrial collection.");
        product.setQuantityTons(req.getQuantityTons());
        product.setAvailableQuantityTons(req.getQuantityTons());
        product.setMoistureContentPercent(req.getMoistureContentPercent() != null 
                ? req.getMoistureContentPercent() : 12.0);
        product.setOrganicMatterPercent(req.getOrganicMatterPercent() != null 
                ? req.getOrganicMatterPercent() : 82.0);
        product.setPricePerTon(req.getPricePerTon());
        product.setEstimatedMarketPrice(req.getEstimatedMarketPrice() != null 
                ? req.getEstimatedMarketPrice() : req.getPricePerTon());
        product.setPackagingType(req.getPackagingType() != null && !req.getPackagingType().trim().isEmpty() 
                ? req.getPackagingType().trim() : "Baled (Round/Square)");
        product.setStorageType(req.getStorageType() != null && !req.getStorageType().trim().isEmpty() 
                ? req.getStorageType().trim() : "Covered Dry Shed");
        product.setHarvestSeason(req.getHarvestSeason() != null && !req.getHarvestSeason().trim().isEmpty() 
                ? req.getHarvestSeason().trim() : "Kharif");
        product.setState(req.getState() != null && !req.getState().trim().isEmpty() 
                ? req.getState().trim() : (farmer != null && farmer.getState() != null ? farmer.getState() : "Punjab"));
        product.setDistrict(req.getDistrict() != null && !req.getDistrict().trim().isEmpty() 
                ? req.getDistrict().trim() : (farmer != null && farmer.getDistrict() != null ? farmer.getDistrict() : "Ludhiana"));
        product.setPincode(req.getPincode() != null && !req.getPincode().trim().isEmpty() 
                ? req.getPincode().trim() : (farmer != null && farmer.getPincode() != null ? farmer.getPincode() : "141114"));
        product.setImageUrl(req.getImageUrl() != null && !req.getImageUrl().trim().isEmpty() 
                ? req.getImageUrl().trim() : "https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=800&q=80");
        product.setStatus("AVAILABLE");

        return productRepository.save(product);
    }

    @Transactional
    public Product updateProduct(Long productId, ProductRequest req, User farmer) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new IllegalArgumentException("Product not found"));

        if (!product.getFarmer().getId().equals(farmer.getId()) && !farmer.getRole().name().equals("ROLE_ADMIN")) {
            throw new SecurityException("Unauthorized to update this product listing");
        }

        if (req.getTitle() != null) product.setTitle(req.getTitle());
        if (req.getDescription() != null) product.setDescription(req.getDescription());
        if (req.getPricePerTon() != null) product.setPricePerTon(req.getPricePerTon());
        if (req.getMoistureContentPercent() != null) product.setMoistureContentPercent(req.getMoistureContentPercent());
        if (req.getQuantityTons() != null) {
            product.setQuantityTons(req.getQuantityTons());
            product.setAvailableQuantityTons(req.getQuantityTons());
        }
        if (req.getImageUrl() != null) product.setImageUrl(req.getImageUrl());

        return productRepository.save(product);
    }

    @Transactional
    public void deleteProduct(Long productId, User farmer) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new IllegalArgumentException("Product not found"));

        if (!product.getFarmer().getId().equals(farmer.getId()) && !farmer.getRole().name().equals("ROLE_ADMIN")) {
            throw new SecurityException("Unauthorized to delete this product listing");
        }

        product.setStatus("INACTIVE");
        productRepository.save(product);
    }

    public List<Category> getAllCategories() {
        return categoryRepository.findAll();
    }
}
