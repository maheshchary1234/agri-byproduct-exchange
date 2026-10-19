package com.agriexchange.service;

import com.agriexchange.dto.OrderRequest;
import com.agriexchange.model.Order;
import com.agriexchange.model.Product;
import com.agriexchange.model.Transaction;
import com.agriexchange.model.User;
import com.agriexchange.repository.OrderRepository;
import com.agriexchange.repository.ProductRepository;
import com.agriexchange.repository.TransactionRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
public class OrderService {

    private final OrderRepository orderRepository;
    private final ProductRepository productRepository;
    private final TransactionRepository transactionRepository;

    public OrderService(OrderRepository orderRepository, ProductRepository productRepository, TransactionRepository transactionRepository) {
        this.orderRepository = orderRepository;
        this.productRepository = productRepository;
        this.transactionRepository = transactionRepository;
    }

    @Transactional
    public Order placeOrder(OrderRequest req, User buyer) {
        if (req == null) {
            throw new IllegalArgumentException("Order request payload cannot be null");
        }
        if (req.getProductId() == null) {
            throw new IllegalArgumentException("Product ID cannot be null");
        }
        if (req.getQuantityTons() == null || req.getQuantityTons() <= 0) {
            throw new IllegalArgumentException("Requested quantity must be greater than zero");
        }

        Product product = productRepository.findById(req.getProductId())
                .orElseThrow(() -> new IllegalArgumentException("Product not found"));

        if (!"AVAILABLE".equalsIgnoreCase(product.getStatus()) || product.getAvailableQuantityTons() < req.getQuantityTons()) {
            throw new IllegalStateException("Insufficient inventory. Available: " + product.getAvailableQuantityTons() + " MT");
        }

        double subtotal = Math.round(req.getQuantityTons() * product.getPricePerTon() * 100.0) / 100.0;
        double logisticsFee = Math.round(req.getQuantityTons() * 150.0 * 100.0) / 100.0; // Flat estimate
        double tax = Math.round(subtotal * 0.05 * 100.0) / 100.0; // 5% GST on agri biomass
        double total = Math.round((subtotal + logisticsFee + tax) * 100.0) / 100.0;

        Order order = new Order();
        order.setOrderNumber("ORD-" + System.currentTimeMillis() % 1000000 + "-" + UUID.randomUUID().toString().substring(0, 4).toUpperCase());
        order.setBuyer(buyer);
        order.setFarmer(product.getFarmer());
        order.setProduct(product);
        order.setQuantityTons(req.getQuantityTons());
        order.setPricePerTon(product.getPricePerTon());
        order.setSubtotalAmount(subtotal);
        order.setLogisticsFee(logisticsFee);
        order.setTaxAmount(tax);
        order.setTotalAmount(total);
        order.setDeliveryAddress(req.getDeliveryAddress());
        order.setDeliveryDistrict(req.getDeliveryDistrict());
        order.setDeliveryState(req.getDeliveryState());
        order.setDeliveryPincode(req.getDeliveryPincode());
        order.setTransportType(req.getTransportType() != null ? req.getTransportType() : "Platform 3PL Logistics");
        order.setOrderStatus("PENDING"); // Stays pending until farmer accepts
        order.setPaymentStatus("ESCROW_HELD");

        // Decrement available inventory for reservation
        double remaining = product.getAvailableQuantityTons() - req.getQuantityTons();
        product.setAvailableQuantityTons(remaining);
        if (remaining <= 0) {
            product.setStatus("SOLD");
        }
        productRepository.save(product);

        Order savedOrder = orderRepository.save(order);

        // Record Escrow Transaction
        Transaction txn = new Transaction();
        txn.setTransactionCode("TXN-ESC-" + UUID.randomUUID().toString().substring(0, 10).toUpperCase());
        txn.setOrder(savedOrder);
        txn.setPayer(buyer);
        txn.setPayee(product.getFarmer());
        txn.setAmount(total);
        txn.setCurrency("INR");
        txn.setPaymentGateway("RAZORPAY_ESCROW");
        txn.setGatewayReference("pay_mock_" + System.currentTimeMillis());
        txn.setStatus("SUCCESS");
        txn.setEscrowReleaseStatus("HELD");
        transactionRepository.save(txn);

        return savedOrder;
    }

    @Transactional
    public Order acceptOrder(String identifier, User farmer) {
        Order order = getOrderByIdOrNumber(identifier);
        if (!farmer.getRole().name().equals("ROLE_ADMIN") && !order.getFarmer().getId().equals(farmer.getId())) {
            throw new SecurityException("Unauthorized: You can only accept orders addressed to your farm.");
        }
        if (!"PENDING".equalsIgnoreCase(order.getOrderStatus())) {
            throw new IllegalStateException("Invalid status transition: Order is not PENDING (current status: " + order.getOrderStatus() + ")");
        }
        order.setOrderStatus("APPROVED");
        return orderRepository.save(order);
    }

    @Transactional
    public Order acceptOrder(Long orderId, User farmer) {
        return acceptOrder(String.valueOf(orderId), farmer);
    }

    @Transactional
    public Order rejectOrder(String identifier, User farmer) {
        Order order = getOrderByIdOrNumber(identifier);
        if (!farmer.getRole().name().equals("ROLE_ADMIN") && !order.getFarmer().getId().equals(farmer.getId())) {
            throw new SecurityException("Unauthorized: You can only reject orders addressed to your farm.");
        }
        if (!"PENDING".equalsIgnoreCase(order.getOrderStatus())) {
            throw new IllegalStateException("Invalid status transition: Order is not PENDING (current status: " + order.getOrderStatus() + ")");
        }
        order.setOrderStatus("REJECTED");
        order.setPaymentStatus("REFUNDED");

        // Restore inventory
        Product p = order.getProduct();
        if (p != null) {
            p.setAvailableQuantityTons(p.getAvailableQuantityTons() + order.getQuantityTons());
            p.setStatus("AVAILABLE");
            productRepository.save(p);
        }
        return orderRepository.save(order);
    }

    @Transactional
    public Order rejectOrder(Long orderId, User farmer) {
        return rejectOrder(String.valueOf(orderId), farmer);
    }

    public List<Order> getFarmerSalesHistory(User farmer) {
        return orderRepository.findByFarmerAndOrderStatusInOrderByCreatedAtDesc(
                farmer, List.of("DELIVERED", "COMPLETED", "APPROVED", "CONFIRMED", "DISPATCHED")
        );
    }

    public java.util.Map<String, Object> getFarmerAnalytics(User farmer) {
        List<Order> allOrders = orderRepository.findByFarmerOrderByCreatedAtDesc(farmer);

        int totalCompletedSales = 0;
        double totalGrossSales = 0.0;
        double totalNetRevenue = 0.0;
        double totalBiomassQuantitySoldTons = 0.0;
        int pendingOrdersCount = 0;

        java.time.format.DateTimeFormatter monthFmt = java.time.format.DateTimeFormatter.ofPattern("yyyy-MM");
        java.time.format.DateTimeFormatter labelFmt = java.time.format.DateTimeFormatter.ofPattern("MMM yyyy");
        java.time.YearMonth currentYearMonth = java.time.YearMonth.now();

        java.util.Map<String, java.util.Map<String, Object>> monthlyMap = new java.util.LinkedHashMap<>();
        for (int i = 11; i >= 0; i--) {
            java.time.YearMonth ym = currentYearMonth.minusMonths(i);
            String key = ym.format(monthFmt);
            java.util.Map<String, Object> mData = new java.util.HashMap<>();
            mData.put("monthKey", key);
            mData.put("label", ym.format(labelFmt));
            mData.put("revenue", 0.0);
            mData.put("gross", 0.0);
            mData.put("quantityTons", 0.0);
            mData.put("salesCount", 0);
            monthlyMap.put(key, mData);
        }

        java.util.Map<String, java.util.Map<String, Object>> bestSellersMap = new java.util.HashMap<>();

        for (Order o : allOrders) {
            if ("PENDING".equalsIgnoreCase(o.getOrderStatus())) {
                pendingOrdersCount++;
            } else if ("DELIVERED".equalsIgnoreCase(o.getOrderStatus())) {
                totalCompletedSales++;
                double gross = o.getTotalAmount() != null ? o.getTotalAmount() : 0.0;
                double net = o.getSubtotalAmount() != null ? o.getSubtotalAmount() : (gross * 0.95);
                double qty = o.getQuantityTons() != null ? o.getQuantityTons() : 0.0;

                totalGrossSales += gross;
                totalNetRevenue += net;
                totalBiomassQuantitySoldTons += qty;

                // Month aggregation
                if (o.getCreatedAt() != null) {
                    String ymKey = o.getCreatedAt().format(monthFmt);
                    if (monthlyMap.containsKey(ymKey)) {
                        java.util.Map<String, Object> m = monthlyMap.get(ymKey);
                        m.put("revenue", Math.round(((double) m.get("revenue") + net) * 100.0) / 100.0);
                        m.put("gross", Math.round(((double) m.get("gross") + gross) * 100.0) / 100.0);
                        m.put("quantityTons", Math.round(((double) m.get("quantityTons") + qty) * 10.0) / 10.0);
                        m.put("salesCount", (int) m.get("salesCount") + 1);
                    }
                }

                // Best seller aggregation
                String prodTitle = o.getProduct() != null ? o.getProduct().getTitle() : "Biomass";
                String byproductType = o.getProduct() != null ? o.getProduct().getByproductType() : "biomass";
                bestSellersMap.computeIfAbsent(prodTitle, k -> {
                    java.util.Map<String, Object> b = new java.util.HashMap<>();
                    b.put("productTitle", prodTitle);
                    b.put("byproductType", byproductType);
                    b.put("quantityTons", 0.0);
                    b.put("revenue", 0.0);
                    b.put("salesCount", 0);
                    return b;
                });
                java.util.Map<String, Object> bs = bestSellersMap.get(prodTitle);
                bs.put("quantityTons", Math.round(((double) bs.get("quantityTons") + qty) * 10.0) / 10.0);
                bs.put("revenue", Math.round(((double) bs.get("revenue") + net) * 100.0) / 100.0);
                bs.put("salesCount", (int) bs.get("salesCount") + 1);
            }
        }

        java.util.List<java.util.Map<String, Object>> bestSellingList = new java.util.ArrayList<>(bestSellersMap.values());
        bestSellingList.sort((a, b) -> Double.compare((double) b.get("quantityTons"), (double) a.get("quantityTons")));

        java.util.Map<String, Object> result = new java.util.HashMap<>();
        result.put("totalCompletedSales", totalCompletedSales);
        result.put("totalGrossRevenue", Math.round(totalGrossSales * 100.0) / 100.0);
        result.put("totalNetRevenue", Math.round(totalNetRevenue * 100.0) / 100.0);
        result.put("totalQuantityTonsSold", Math.round(totalBiomassQuantitySoldTons * 10.0) / 10.0);
        result.put("pendingOrdersCount", pendingOrdersCount);
        result.put("monthlyRevenue", new java.util.ArrayList<>(monthlyMap.values()));
        result.put("bestSellingProducts", bestSellingList);

        return result;
    }

    public List<Order> getOrdersForUser(User user) {
        if (user.getRole().name().equals("ROLE_FARMER")) {
            return orderRepository.findByFarmerOrderByCreatedAtDesc(user);
        } else if (user.getRole().name().equals("ROLE_BUYER")) {
            return orderRepository.findByBuyerOrderByCreatedAtDesc(user);
        } else {
            return orderRepository.findAll();
        }
    }

    public Order getOrderByIdOrNumber(String identifier) {
        if (identifier == null || identifier.trim().isEmpty()) {
            throw new IllegalArgumentException("Order identifier cannot be empty");
        }
        String clean = identifier.trim();

        // 1. Exact match by orderNumber
        Optional<Order> byOrderNumber = orderRepository.findByOrderNumber(clean);
        if (byOrderNumber.isPresent()) {
            return byOrderNumber.get();
        }

        // 2. Case-insensitive match by orderNumber
        Optional<Order> byOrderNumberCi = orderRepository.findByOrderNumberIgnoreCase(clean);
        if (byOrderNumberCi.isPresent()) {
            return byOrderNumberCi.get();
        }

        // 3. Match numeric primary key ID directly
        try {
            Long numericId = Long.parseLong(clean);
            Optional<Order> byId = orderRepository.findById(numericId);
            if (byId.isPresent()) {
                return byId.get();
            }
        } catch (NumberFormatException ignored) {}

        // 4. Handle prefixed identifiers such as #ORD-1, ORD-1, #1
        String normalized = clean;
        if (normalized.startsWith("#")) normalized = normalized.substring(1);
        if (normalized.toUpperCase().startsWith("ORD-")) {
            String remainder = normalized.substring(4);
            try {
                Long numericId = Long.parseLong(remainder);
                Optional<Order> byId = orderRepository.findById(numericId);
                if (byId.isPresent()) {
                    return byId.get();
                }
            } catch (NumberFormatException ignored) {}

            Optional<Order> byNorm = orderRepository.findByOrderNumberIgnoreCase(normalized);
            if (byNorm.isPresent()) {
                return byNorm.get();
            }
        }

        throw new IllegalArgumentException("Order not found with identifier: " + identifier);
    }

    public Order getOrderById(Long id) {
        if (id == null) {
            throw new IllegalArgumentException("Order ID cannot be null");
        }
        return orderRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Order not found with ID: " + id));
    }

    @Transactional
    public Order updateOrderStatus(String identifier, String newStatus, User user) {
        Order order = getOrderByIdOrNumber(identifier);

        // Permission check: Farmer, Buyer or Admin can update their respective status
        if (!user.getRole().name().equals("ROLE_ADMIN") &&
            !order.getFarmer().getId().equals(user.getId()) &&
            !order.getBuyer().getId().equals(user.getId())) {
            throw new SecurityException("Unauthorized: You can only update orders associated with your account.");
        }

        order.setOrderStatus(newStatus);

        // When delivered or completed, release escrow funds to farmer
        if ("DELIVERED".equalsIgnoreCase(newStatus) || "COMPLETED".equalsIgnoreCase(newStatus)) {
            order.setPaymentStatus("RELEASED_TO_FARMER");
        } else if ("CANCELLED".equalsIgnoreCase(newStatus) || "REJECTED".equalsIgnoreCase(newStatus)) {
            order.setPaymentStatus("REFUNDED");
            // Restore inventory
            Product p = order.getProduct();
            if (p != null) {
                p.setAvailableQuantityTons(p.getAvailableQuantityTons() + order.getQuantityTons());
                p.setStatus("AVAILABLE");
                productRepository.save(p);
            }
        }

        return orderRepository.save(order);
    }

    @Transactional
    public Order updateOrderStatus(Long orderId, String newStatus, User user) {
        return updateOrderStatus(String.valueOf(orderId), newStatus, user);
    }
}
