package com.agriexchange.service;

import com.agriexchange.dto.OrderRequest;
import com.agriexchange.model.*;
import com.agriexchange.repository.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
public class OrderDispatchWorkflowTest {

    @Autowired
    private OrderService orderService;

    @Autowired
    private ProductService productService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private CategoryRepository categoryRepository;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private OrderRepository orderRepository;

    private User farmerGurpreet;
    private User farmerPatil;
    private User buyerMehta;
    private Category catCereal;

    @BeforeEach
    void setUp() {
        farmerGurpreet = userRepository.findByEmail("farmer.gurpreet@agriexchange.org")
                .orElseGet(() -> userRepository.save(new User(
                        "Gurpreet Singh", "farmer.gurpreet@agriexchange.org", "Pass123!",
                        Role.ROLE_FARMER, "+91 98141 23456", 28.5, "Kisan Samriddhi Farms",
                        "Village Samrala", "Ludhiana", "Punjab", "141114", true
                )));

        farmerPatil = userRepository.findByEmail("farmer.patil@agriexchange.org")
                .orElseGet(() -> userRepository.save(new User(
                        "Ramesh Patil", "farmer.patil@agriexchange.org", "Pass123!",
                        Role.ROLE_FARMER, "+91 98220 34567", 45.0, "Sahyadri Agro",
                        "Kolhapur Road", "Kolhapur", "Maharashtra", "416004", true
                )));

        buyerMehta = userRepository.findByEmail("buyer.bioenergy@biopower.com")
                .orElseGet(() -> userRepository.save(new User(
                        "Dr. Arvinder Mehta", "buyer.bioenergy@biopower.com", "Pass123!",
                        Role.ROLE_BUYER, "+91 98110 67890", "GreenTerra BioEnergy",
                        "Plot 45", "Greater Noida", "Uttar Pradesh", "201306", true
                )));

        catCereal = categoryRepository.findByCode("CEREAL_STRAW")
                .orElseGet(() -> categoryRepository.save(new Category(
                        "Cereal Straws", "CEREAL_STRAW", "Straw and stubble", 1.45
                )));
    }

    private Product createTestProduct(String title, double totalQty, double availableQty) {
        Product p = new Product();
        p.setFarmer(farmerGurpreet);
        p.setCategory(catCereal);
        p.setTitle(title);
        p.setByproductType("rice_straw");
        p.setDescription("Test crop residue lot for dispatch verification");
        p.setQuantityTons(totalQty);
        p.setAvailableQuantityTons(availableQty);
        p.setMoistureContentPercent(12.0);
        p.setOrganicMatterPercent(85.0);
        p.setPricePerTon(2500.0);
        p.setEstimatedMarketPrice(2450.0);
        p.setState("Punjab");
        p.setDistrict("Ludhiana");
        p.setPincode("141114");
        p.setStatus("AVAILABLE");
        return productRepository.save(p);
    }

    @Test
    @DisplayName("Test 1-8: Full Order Workflow - Placement, Approval, Dispatch, and Partial Stock Reduction")
    void testFullWorkflowPartialStock() {
        // Step 1: Create a product with 100 MT available
        Product product = createTestProduct("Workflow Test Lot - Partial Stock", 100.0, 100.0);
        Long productId = product.getId();

        // Step 2: Buyer places order for 30 MT
        OrderRequest req = new OrderRequest();
        req.setProductId(productId);
        req.setQuantityTons(30.0);
        req.setDeliveryAddress("Plant Gate 4, Greater Noida");
        req.setDeliveryDistrict("Greater Noida");
        req.setDeliveryState("Uttar Pradesh");
        req.setDeliveryPincode("201306");
        req.setTransportType("Platform 3PL");

        Order placedOrder = orderService.placeOrder(req, buyerMehta);
        assertNotNull(placedOrder.getId());
        assertEquals("PENDING", placedOrder.getOrderStatus());

        // Step 3: Farmer approves the order (PENDING -> APPROVED)
        Order approvedOrder = orderService.acceptOrder(placedOrder.getId(), farmerGurpreet);
        assertEquals("APPROVED", approvedOrder.getOrderStatus());

        // Step 4: Farmer clicks Confirm Dispatch (APPROVED -> DISPATCHED)
        Order dispatchedOrder = orderService.dispatchOrder(approvedOrder.getId(), farmerGurpreet);
        assertEquals("DISPATCHED", dispatchedOrder.getOrderStatus());
        assertNotNull(dispatchedOrder.getDispatchedAt(), "Dispatch timestamp must be recorded");

        // Step 5: Check product stock in database
        Product updatedProduct = productRepository.findById(productId).orElseThrow();
        assertEquals(70.0, updatedProduct.getAvailableQuantityTons(), 0.001, "Dispatched 30 MT should leave 70 MT");
        assertEquals("AVAILABLE", updatedProduct.getStatus(), "Product should still be AVAILABLE because 70 MT remains");

        // Step 6: Verify product is still visible in active marketplace listing
        List<Product> activeProducts = productService.getAllActiveProducts();
        assertTrue(activeProducts.stream().anyMatch(p -> p.getId().equals(productId)),
                "Product with 70 MT remaining must remain visible in marketplace");
    }

    @Test
    @DisplayName("Test 6 & 8: Sold-Out Synchronization - Marketplace Exclusion when stock hits 0 MT")
    void testDispatchSoldOutSynchronization() {
        // Product has exactly 25 MT available
        Product product = createTestProduct("Workflow Test Lot - Zero Stock", 25.0, 25.0);
        Long productId = product.getId();

        // Buyer orders all 25 MT
        OrderRequest req = new OrderRequest();
        req.setProductId(productId);
        req.setQuantityTons(25.0);
        req.setDeliveryAddress("Test Receiving Station");

        Order order = orderService.placeOrder(req, buyerMehta);
        orderService.acceptOrder(order.getId(), farmerGurpreet);

        // Confirm Dispatch for entire lot
        Order dispatched = orderService.dispatchOrder(order.getId(), farmerGurpreet);
        assertEquals("DISPATCHED", dispatched.getOrderStatus());

        // Product should be marked SOLD with 0 MT available
        Product updatedProduct = productRepository.findById(productId).orElseThrow();
        assertEquals(0.0, updatedProduct.getAvailableQuantityTons(), 0.001);
        assertEquals("SOLD", updatedProduct.getStatus());

        // Crucial Check: Product must disappear from buyer's active marketplace
        List<Product> activeMarketplace = productService.getAllActiveProducts();
        assertFalse(activeMarketplace.stream().anyMatch(p -> p.getId().equals(productId)),
                "Product with 0 MT must be excluded from available marketplace listings");

        // But product record and historical order still exist in database
        assertTrue(productRepository.findById(productId).isPresent(), "Product record must never be deleted");
        assertTrue(orderRepository.findById(dispatched.getId()).isPresent(), "Historical order must be preserved");
    }

    @Test
    @DisplayName("Test 11: Duplicate Dispatch Prevention - Stock Not Deducted Twice")
    void testPreventDuplicateDispatch() {
        Product product = createTestProduct("Duplicate Dispatch Test Lot", 50.0, 50.0);
        Long productId = product.getId();

        OrderRequest req = new OrderRequest();
        req.setProductId(productId);
        req.setQuantityTons(20.0);
        req.setDeliveryAddress("Receiving Yard B");

        Order order = orderService.placeOrder(req, buyerMehta);
        orderService.acceptOrder(order.getId(), farmerGurpreet);

        // First dispatch succeeds
        orderService.dispatchOrder(order.getId(), farmerGurpreet);
        Product afterFirstDispatch = productRepository.findById(productId).orElseThrow();
        assertEquals(30.0, afterFirstDispatch.getAvailableQuantityTons(), 0.001);

        // Second dispatch attempt MUST throw IllegalStateException
        IllegalStateException ex = assertThrows(IllegalStateException.class, () -> {
            orderService.dispatchOrder(order.getId(), farmerGurpreet);
        });
        assertTrue(ex.getMessage().contains("Duplicate dispatch rejected"),
                "Exception message must specify duplicate dispatch rejection");

        // Verify stock is still 30.0 MT (NOT deducted twice)
        Product afterSecondAttempt = productRepository.findById(productId).orElseThrow();
        assertEquals(30.0, afterSecondAttempt.getAvailableQuantityTons(), 0.001,
                "Stock must not be deducted twice on duplicate dispatch attempt");
    }

    @Test
    @DisplayName("Test 12: Insufficient Stock / Negative Inventory Prevention")
    void testPreventNegativeInventory() {
        // Product has only 10 MT
        Product product = createTestProduct("Low Stock Lot", 10.0, 10.0);
        Long productId = product.getId();

        OrderRequest req = new OrderRequest();
        req.setProductId(productId);
        req.setQuantityTons(10.0);
        req.setDeliveryAddress("Facility 1");

        Order order = orderService.placeOrder(req, buyerMehta);
        orderService.acceptOrder(order.getId(), farmerGurpreet);

        // Manually adjust stock to 5 MT to simulate concurrent drain
        product.setAvailableQuantityTons(5.0);
        productRepository.save(product);

        // Attempting to dispatch 10 MT when only 5 MT is available must fail
        IllegalStateException ex = assertThrows(IllegalStateException.class, () -> {
            orderService.dispatchOrder(order.getId(), farmerGurpreet);
        });
        assertTrue(ex.getMessage().contains("Insufficient inventory"),
                "Must reject dispatch when available inventory is insufficient");

        // Verify inventory never went negative
        Product verifyProduct = productRepository.findById(productId).orElseThrow();
        assertEquals(5.0, verifyProduct.getAvailableQuantityTons(), 0.001);
        assertTrue(verifyProduct.getAvailableQuantityTons() >= 0.0);
    }

    @Test
    @DisplayName("Authorization Check: Unowned Order or Product Dispatch Rejection")
    void testFarmerAuthorizationForDispatch() {
        Product product = createTestProduct("Security Test Lot", 50.0, 50.0);

        OrderRequest req = new OrderRequest();
        req.setProductId(product.getId());
        req.setQuantityTons(10.0);
        req.setDeliveryAddress("Facility 2");

        Order order = orderService.placeOrder(req, buyerMehta);
        orderService.acceptOrder(order.getId(), farmerGurpreet);

        // Farmer Patil attempts to dispatch Gurpreet's order
        SecurityException ex = assertThrows(SecurityException.class, () -> {
            orderService.dispatchOrder(order.getId(), farmerPatil);
        });
        assertTrue(ex.getMessage().contains("Unauthorized"), "Must block dispatch by unauthorized farmer");
    }

    @Test
    @DisplayName("Invalid Status Transition: Dispatching PENDING Order Rejection")
    void testRejectDispatchPendingOrder() {
        Product product = createTestProduct("Pending Dispatch Test Lot", 50.0, 50.0);

        OrderRequest req = new OrderRequest();
        req.setProductId(product.getId());
        req.setQuantityTons(10.0);
        req.setDeliveryAddress("Facility 3");

        Order order = orderService.placeOrder(req, buyerMehta);
        // Order is still PENDING (not approved)

        IllegalStateException ex = assertThrows(IllegalStateException.class, () -> {
            orderService.dispatchOrder(order.getId(), farmerGurpreet);
        });
        assertTrue(ex.getMessage().contains("Invalid status transition"),
                "Must enforce APPROVED status before dispatch");
    }
}
