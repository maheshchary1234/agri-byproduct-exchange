package com.agriexchange.controller;

import com.agriexchange.dto.InquiryRequest;
import com.agriexchange.model.Inquiry;
import com.agriexchange.model.Product;
import com.agriexchange.model.User;
import com.agriexchange.repository.InquiryRepository;
import com.agriexchange.repository.ProductRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/inquiries")
@CrossOrigin(origins = "*")
public class InquiryController {

    private final InquiryRepository inquiryRepository;
    private final ProductRepository productRepository;

    public InquiryController(InquiryRepository inquiryRepository, ProductRepository productRepository) {
        this.inquiryRepository = inquiryRepository;
        this.productRepository = productRepository;
    }

    @PostMapping
    public ResponseEntity<?> sendInquiry(@RequestBody InquiryRequest req, @AuthenticationPrincipal User buyer) {
        if (buyer == null) {
            return ResponseEntity.status(401).build();
        }
        Product product = productRepository.findById(req.getProductId())
                .orElseThrow(() -> new IllegalArgumentException("Product not found"));

        Inquiry inquiry = new Inquiry();
        inquiry.setProduct(product);
        inquiry.setBuyer(buyer);
        inquiry.setFarmer(product.getFarmer());
        inquiry.setOfferedPricePerTon(req.getOfferedPricePerTon());
        inquiry.setRequestedQuantityTons(req.getRequestedQuantityTons());
        inquiry.setMessage(req.getMessage());
        inquiry.setStatus("PENDING");

        return ResponseEntity.ok(inquiryRepository.save(inquiry));
    }

    @GetMapping
    public ResponseEntity<List<Inquiry>> getMyInquiries(@AuthenticationPrincipal User user) {
        if (user == null) {
            return ResponseEntity.status(401).build();
        }
        if (user.getRole().name().equals("ROLE_FARMER")) {
            return ResponseEntity.ok(inquiryRepository.findByFarmerOrderByCreatedAtDesc(user));
        } else if (user.getRole().name().equals("ROLE_BUYER")) {
            return ResponseEntity.ok(inquiryRepository.findByBuyerOrderByCreatedAtDesc(user));
        } else {
            return ResponseEntity.ok(inquiryRepository.findAll());
        }
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<?> updateStatus(@PathVariable Long id, @RequestBody Map<String, String> payload) {
        return inquiryRepository.findById(id).map(inq -> {
            String status = payload.get("status");
            if (status != null) {
                inq.setStatus(status);
                inquiryRepository.save(inq);
            }
            return ResponseEntity.ok(inq);
        }).orElse(ResponseEntity.notFound().build());
    }
}
