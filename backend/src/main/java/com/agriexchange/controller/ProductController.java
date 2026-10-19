package com.agriexchange.controller;

import com.agriexchange.dto.ProductRequest;
import com.agriexchange.model.Category;
import com.agriexchange.model.Product;
import com.agriexchange.model.User;
import com.agriexchange.service.ProductService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/products")
@CrossOrigin(origins = "*")
public class ProductController {

    private final ProductService productService;

    public ProductController(ProductService productService) {
        this.productService = productService;
    }

    private static final org.slf4j.Logger log = org.slf4j.LoggerFactory.getLogger(ProductController.class);

    @GetMapping
    public ResponseEntity<List<Product>> getAllProducts() {
        return ResponseEntity.ok(productService.getAllActiveProducts());
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getProductById(@PathVariable Long id) {
        Optional<Product> productOpt = productService.getProductById(id);
        if (productOpt.isPresent()) {
            return ResponseEntity.ok(productOpt.get());
        }
        return ResponseEntity.status(404).body(Map.of("error", "Product not found with ID: " + id));
    }

    @GetMapping("/public")
    public ResponseEntity<List<Product>> getAllActiveProducts() {
        return ResponseEntity.ok(productService.getAllActiveProducts());
    }

    @GetMapping("/public/{id}")
    public ResponseEntity<?> getPublicProductById(@PathVariable Long id) {
        Optional<Product> productOpt = productService.getProductById(id);
        if (productOpt.isPresent()) {
            return ResponseEntity.ok(productOpt.get());
        }
        return ResponseEntity.status(404).body(Map.of("error", "Product not found with ID: " + id));
    }

    @GetMapping("/public/categories")
    public ResponseEntity<List<Category>> getCategories() {
        return ResponseEntity.ok(productService.getAllCategories());
    }

    @GetMapping("/public/search")
    public ResponseEntity<List<Product>> searchProducts(
            @RequestParam(required = false) String byproductType,
            @RequestParam(required = false) String state,
            @RequestParam(required = false) Double maxPrice,
            @RequestParam(required = false) Double maxMoisture) {
        return ResponseEntity.ok(productService.searchProducts(byproductType, state, maxPrice, maxMoisture));
    }

    @GetMapping("/my-listings")
    public ResponseEntity<?> getMyListings(@AuthenticationPrincipal User user) {
        if (user == null) {
            return ResponseEntity.status(401).body(Map.of("error", "Unauthorized: Please log in as a farmer to view your listings."));
        }
        return ResponseEntity.ok(productService.getProductsByFarmer(user));
    }

    @PostMapping
    public ResponseEntity<?> createProduct(@RequestBody ProductRequest request, @AuthenticationPrincipal User user) {
        if (user == null) {
            return ResponseEntity.status(401).body(Map.of("error", "Unauthorized: Please log in to publish agricultural by-products."));
        }
        if (!user.getRole().name().equals("ROLE_FARMER") && !user.getRole().name().equals("ROLE_ADMIN")) {
            return ResponseEntity.status(403).body(Map.of("error", "Forbidden: Only registered farmers or administrators can create product listings."));
        }
        try {
            Product created = productService.createProduct(request, user);
            log.info("Product created successfully: ID={}, Title='{}', Farmer={}", created.getId(), created.getTitle(), user.getEmail());
            return ResponseEntity.status(201).body(created);
        } catch (IllegalArgumentException ex) {
            log.warn("Product creation rejected: {}", ex.getMessage());
            return ResponseEntity.badRequest().body(Map.of("error", ex.getMessage()));
        } catch (Exception ex) {
            log.error("Unexpected error creating product", ex);
            return ResponseEntity.status(500).body(Map.of("error", "Failed to create product lot: " + ex.getMessage()));
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateProduct(@PathVariable Long id, @RequestBody ProductRequest request, @AuthenticationPrincipal User user) {
        if (user == null) {
            return ResponseEntity.status(401).build();
        }
        try {
            Product updated = productService.updateProduct(id, request, user);
            return ResponseEntity.ok(updated);
        } catch (SecurityException ex) {
            return ResponseEntity.status(403).body(Map.of("error", ex.getMessage()));
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.badRequest().body(Map.of("error", ex.getMessage()));
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteProduct(@PathVariable Long id, @AuthenticationPrincipal User user) {
        if (user == null) {
            return ResponseEntity.status(401).build();
        }
        try {
            productService.deleteProduct(id, user);
            return ResponseEntity.ok(Map.of("message", "Product delisted successfully"));
        } catch (SecurityException ex) {
            return ResponseEntity.status(403).body(Map.of("error", ex.getMessage()));
        }
    }
}
