package com.agriexchange.controller;

import com.agriexchange.config.JwtUtils;
import com.agriexchange.model.*;
import com.agriexchange.repository.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
public class OrderDispatchControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private JwtUtils jwtUtils;

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private CategoryRepository categoryRepository;

    private User farmerGurpreet;
    private User farmerPatil;
    private User buyerMehta;
    private Product testProduct;
    private Order testOrder;

    private String farmerGurpreetToken;
    private String farmerPatilToken;

    @BeforeEach
    void setup() {
        farmerGurpreet = userRepository.findByEmail("farmer.gurpreet@agriexchange.org").orElseThrow();
        farmerPatil = userRepository.findByEmail("farmer.patil@agriexchange.org").orElseThrow();
        buyerMehta = userRepository.findByEmail("buyer.bioenergy@biopower.com").orElseThrow();
        Category cat = categoryRepository.findAll().get(0);

        farmerGurpreetToken = jwtUtils.generateToken(farmerGurpreet.getEmail(), farmerGurpreet.getRole().name(), farmerGurpreet.getId());
        farmerPatilToken = jwtUtils.generateToken(farmerPatil.getEmail(), farmerPatil.getRole().name(), farmerPatil.getId());

        testProduct = new Product();
        testProduct.setFarmer(farmerGurpreet);
        testProduct.setCategory(cat);
        testProduct.setTitle("Controller Test Biomass Lot");
        testProduct.setByproductType("rice_straw");
        testProduct.setQuantityTons(80.0);
        testProduct.setAvailableQuantityTons(80.0);
        testProduct.setMoistureContentPercent(11.5);
        testProduct.setPricePerTon(2600.0);
        testProduct.setState("Punjab");
        testProduct.setDistrict("Ludhiana");
        testProduct.setStatus("AVAILABLE");
        testProduct = productRepository.save(testProduct);

        testOrder = new Order();
        testOrder.setOrderNumber("ORD-CTRL-" + System.currentTimeMillis() % 100000);
        testOrder.setBuyer(buyerMehta);
        testOrder.setFarmer(farmerGurpreet);
        testOrder.setProduct(testProduct);
        testOrder.setQuantityTons(20.0);
        testOrder.setPricePerTon(2600.0);
        testOrder.setSubtotalAmount(52000.0);
        testOrder.setTotalAmount(54600.0);
        testOrder.setDeliveryAddress("EcoTech Yard Gate 1");
        testOrder.setOrderStatus("APPROVED"); // Approved and ready to dispatch
        testOrder.setPaymentStatus("ESCROW_HELD");
        testOrder = orderRepository.save(testOrder);
    }

    @Test
    @DisplayName("PATCH /api/orders/{id}/dispatch - Success with Authenticated Farmer")
    void testDispatchOrderSuccess() throws Exception {
        mockMvc.perform(patch("/api/orders/" + testOrder.getOrderNumber() + "/dispatch")
                .header("Authorization", "Bearer " + farmerGurpreetToken)
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.orderStatus", is("DISPATCHED")))
                .andExpect(jsonPath("$.dispatchedAt", notNullValue()))
                .andExpect(jsonPath("$.orderNumber", is(testOrder.getOrderNumber())));

        // Verify product inventory was reduced by 20 MT (80 -> 60 MT)
        Product updatedProduct = productRepository.findById(testProduct.getId()).orElseThrow();
        org.junit.jupiter.api.Assertions.assertEquals(60.0, updatedProduct.getAvailableQuantityTons(), 0.001);
    }

    @Test
    @DisplayName("PATCH /api/orders/{id}/dispatch - Duplicate Dispatch Fails with 400")
    void testDuplicateDispatchFails() throws Exception {
        // First dispatch
        mockMvc.perform(patch("/api/orders/" + testOrder.getOrderNumber() + "/dispatch")
                .header("Authorization", "Bearer " + farmerGurpreetToken))
                .andExpect(status().isOk());

        // Duplicate dispatch
        mockMvc.perform(patch("/api/orders/" + testOrder.getOrderNumber() + "/dispatch")
                .header("Authorization", "Bearer " + farmerGurpreetToken))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error", containsString("Duplicate dispatch rejected")));
    }

    @Test
    @DisplayName("PATCH /api/orders/{id}/dispatch - Unauthorized Farmer Fails with 403")
    void testUnauthorizedFarmerDispatchFails() throws Exception {
        mockMvc.perform(patch("/api/orders/" + testOrder.getOrderNumber() + "/dispatch")
                .header("Authorization", "Bearer " + farmerPatilToken))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.error", containsString("Unauthorized")));
    }

    @Test
    @DisplayName("PATCH /api/orders/{id}/status with DISPATCHED status delegates to dispatchOrder")
    void testStatusDispatchRoute() throws Exception {
        mockMvc.perform(patch("/api/orders/" + testOrder.getOrderNumber() + "/status")
                .header("Authorization", "Bearer " + farmerGurpreetToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"status\":\"DISPATCHED\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.orderStatus", is("DISPATCHED")))
                .andExpect(jsonPath("$.dispatchedAt", notNullValue()));
    }

    @Test
    @DisplayName("PATCH /api/orders/{id}/accept - Success with Authenticated Farmer")
    void testAcceptOrderSuccess() throws Exception {
        Order pendingOrder = new Order();
        pendingOrder.setOrderNumber("ORD-PENDING-" + System.currentTimeMillis() % 100000);
        pendingOrder.setBuyer(buyerMehta);
        pendingOrder.setFarmer(farmerGurpreet);
        pendingOrder.setProduct(testProduct);
        pendingOrder.setQuantityTons(10.0);
        pendingOrder.setPricePerTon(2600.0);
        pendingOrder.setSubtotalAmount(26000.0);
        pendingOrder.setTotalAmount(27300.0);
        pendingOrder.setDeliveryAddress("EcoTech Gate 2");
        pendingOrder.setOrderStatus("PENDING");
        pendingOrder = orderRepository.save(pendingOrder);

        mockMvc.perform(patch("/api/orders/" + pendingOrder.getOrderNumber() + "/accept")
                .header("Authorization", "Bearer " + farmerGurpreetToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.orderStatus", is("APPROVED")))
                .andExpect(jsonPath("$.orderNumber", is(pendingOrder.getOrderNumber())));
    }

    @Test
    @DisplayName("PATCH /api/orders/{id}/reject - Success with Authenticated Farmer")
    void testRejectOrderSuccess() throws Exception {
        Order pendingOrder = new Order();
        pendingOrder.setOrderNumber("ORD-REJ-" + System.currentTimeMillis() % 100000);
        pendingOrder.setBuyer(buyerMehta);
        pendingOrder.setFarmer(farmerGurpreet);
        pendingOrder.setProduct(testProduct);
        pendingOrder.setQuantityTons(10.0);
        pendingOrder.setPricePerTon(2600.0);
        pendingOrder.setSubtotalAmount(26000.0);
        pendingOrder.setTotalAmount(27300.0);
        pendingOrder.setDeliveryAddress("EcoTech Gate 2");
        pendingOrder.setOrderStatus("PENDING");
        pendingOrder = orderRepository.save(pendingOrder);

        mockMvc.perform(patch("/api/orders/" + pendingOrder.getOrderNumber() + "/reject")
                .header("Authorization", "Bearer " + farmerGurpreetToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.orderStatus", is("REJECTED")))
                .andExpect(jsonPath("$.paymentStatus", is("REFUNDED")));
    }

    @Test
    @DisplayName("PATCH /api/orders/{id}/accept - Unauthorized Farmer Fails with 403")
    void testUnauthorizedFarmerAcceptFails() throws Exception {
        Order pendingOrder = new Order();
        pendingOrder.setOrderNumber("ORD-UNAUTH-" + System.currentTimeMillis() % 100000);
        pendingOrder.setBuyer(buyerMehta);
        pendingOrder.setFarmer(farmerGurpreet);
        pendingOrder.setProduct(testProduct);
        pendingOrder.setQuantityTons(10.0);
        pendingOrder.setPricePerTon(2600.0);
        pendingOrder.setSubtotalAmount(26000.0);
        pendingOrder.setTotalAmount(27300.0);
        pendingOrder.setDeliveryAddress("EcoTech Gate 2");
        pendingOrder.setOrderStatus("PENDING");
        pendingOrder = orderRepository.save(pendingOrder);

        mockMvc.perform(patch("/api/orders/" + pendingOrder.getOrderNumber() + "/accept")
                .header("Authorization", "Bearer " + farmerPatilToken))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.error", containsString("Unauthorized")));
    }
}
