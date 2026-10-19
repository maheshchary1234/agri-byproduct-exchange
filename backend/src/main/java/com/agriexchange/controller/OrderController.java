package com.agriexchange.controller;

import com.agriexchange.dto.OrderRequest;
import com.agriexchange.model.Order;
import com.agriexchange.model.User;
import com.agriexchange.service.OrderService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/orders")
@CrossOrigin(origins = "*")
public class OrderController {

    private static final Logger log = LoggerFactory.getLogger(OrderController.class);
    private final OrderService orderService;

    public OrderController(OrderService orderService) {
        this.orderService = orderService;
    }

    @PostMapping
    public ResponseEntity<?> placeOrder(@RequestBody OrderRequest request, @AuthenticationPrincipal User buyer) {
        if (buyer == null) {
            return ResponseEntity.status(401).body(Map.of("error", "Unauthorized: Please log in as a Buyer to place orders."));
        }
        try {
            Order order = orderService.placeOrder(request, buyer);
            return ResponseEntity.ok(order);
        } catch (IllegalStateException | IllegalArgumentException ex) {
            log.warn("Order placement rejected: {}", ex.getMessage());
            return ResponseEntity.badRequest().body(Map.of("error", ex.getMessage()));
        } catch (Exception ex) {
            log.error("Unexpected error during order placement", ex);
            return ResponseEntity.status(500).body(Map.of("error", "Internal server error: " + ex.getMessage()));
        }
    }

    @GetMapping
    public ResponseEntity<?> getMyOrders(@AuthenticationPrincipal User user) {
        if (user == null) {
            return ResponseEntity.status(401).body(Map.of("error", "Unauthorized: Please log in to view your orders."));
        }
        return ResponseEntity.ok(orderService.getOrdersForUser(user));
    }

    @GetMapping("/farmer/sales-history")
    public ResponseEntity<?> getFarmerSalesHistory(@AuthenticationPrincipal User user) {
        if (user == null) {
            return ResponseEntity.status(401).body(Map.of("error", "Unauthorized: Please log in as a Farmer."));
        }
        return ResponseEntity.ok(orderService.getFarmerSalesHistory(user));
    }

    @GetMapping("/farmer/analytics")
    public ResponseEntity<?> getFarmerAnalytics(@AuthenticationPrincipal User user) {
        if (user == null) {
            return ResponseEntity.status(401).body(Map.of("error", "Unauthorized: Please log in as a Farmer."));
        }
        return ResponseEntity.ok(orderService.getFarmerAnalytics(user));
    }

    @GetMapping("/{identifier}")
    public ResponseEntity<?> getOrderByIdOrNumber(@PathVariable String identifier, @AuthenticationPrincipal User user) {
        if (user == null) {
            return ResponseEntity.status(401).body(Map.of("error", "Unauthorized: Please log in to view order details."));
        }
        try {
            Order order = orderService.getOrderByIdOrNumber(identifier);
            if (!user.getRole().name().equals("ROLE_ADMIN") &&
                !order.getFarmer().getId().equals(user.getId()) &&
                !order.getBuyer().getId().equals(user.getId())) {
                return ResponseEntity.status(403).body(Map.of("error", "Unauthorized: You can only view orders associated with your account."));
            }
            return ResponseEntity.ok(order);
        } catch (IllegalArgumentException ex) {
            log.info("Order lookup failed for identifier [{}]: {}", identifier, ex.getMessage());
            return ResponseEntity.status(404).body(Map.of("error", "Order not found with identifier: " + identifier));
        } catch (Exception ex) {
            log.error("Server error retrieving order [{}]: {}", identifier, ex.getMessage(), ex);
            return ResponseEntity.status(500).body(Map.of("error", "Database error occurred while retrieving order."));
        }
    }

    @GetMapping("/{identifier}/status")
    public ResponseEntity<?> getOrderStatusOnly(@PathVariable String identifier, @AuthenticationPrincipal User user) {
        return getOrderByIdOrNumber(identifier, user);
    }

    @PatchMapping({ "/{identifier}/accept", "/{identifier}/approve" })
    public ResponseEntity<?> acceptOrder(@PathVariable String identifier, @AuthenticationPrincipal User user) {
        if (user == null) {
            return ResponseEntity.status(401).body(Map.of("error", "Unauthorized: Please log in to approve orders."));
        }
        try {
            Order updated = orderService.acceptOrder(identifier, user);
            return ResponseEntity.ok(updated);
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.status(404).body(Map.of("error", ex.getMessage()));
        } catch (SecurityException ex) {
            return ResponseEntity.status(403).body(Map.of("error", ex.getMessage()));
        } catch (IllegalStateException ex) {
            return ResponseEntity.badRequest().body(Map.of("error", ex.getMessage()));
        } catch (Exception ex) {
            log.error("Error approving order [{}]: {}", identifier, ex.getMessage(), ex);
            return ResponseEntity.badRequest().body(Map.of("error", ex.getMessage()));
        }
    }

    @PatchMapping("/{identifier}/reject")
    public ResponseEntity<?> rejectOrder(@PathVariable String identifier, @AuthenticationPrincipal User user) {
        if (user == null) {
            return ResponseEntity.status(401).body(Map.of("error", "Unauthorized: Please log in to reject orders."));
        }
        try {
            Order updated = orderService.rejectOrder(identifier, user);
            return ResponseEntity.ok(updated);
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.status(404).body(Map.of("error", ex.getMessage()));
        } catch (SecurityException ex) {
            return ResponseEntity.status(403).body(Map.of("error", ex.getMessage()));
        } catch (IllegalStateException ex) {
            return ResponseEntity.badRequest().body(Map.of("error", ex.getMessage()));
        } catch (Exception ex) {
            log.error("Error rejecting order [{}]: {}", identifier, ex.getMessage(), ex);
            return ResponseEntity.badRequest().body(Map.of("error", ex.getMessage()));
        }
    }

    @PatchMapping("/{identifier}/dispatch")
    public ResponseEntity<?> dispatchOrder(@PathVariable String identifier, @AuthenticationPrincipal User user) {
        if (user == null) {
            return ResponseEntity.status(401).body(Map.of("error", "Unauthorized: Please log in to dispatch orders."));
        }
        try {
            Order updated = orderService.dispatchOrder(identifier, user);
            return ResponseEntity.ok(updated);
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.status(404).body(Map.of("error", ex.getMessage()));
        } catch (SecurityException ex) {
            return ResponseEntity.status(403).body(Map.of("error", ex.getMessage()));
        } catch (IllegalStateException ex) {
            return ResponseEntity.badRequest().body(Map.of("error", ex.getMessage()));
        } catch (Exception ex) {
            log.error("Error dispatching order [{}]: {}", identifier, ex.getMessage(), ex);
            return ResponseEntity.badRequest().body(Map.of("error", ex.getMessage()));
        }
    }

    @PatchMapping("/{identifier}/status")
    public ResponseEntity<?> updateOrderStatus(
            @PathVariable String identifier,
            @RequestBody Map<String, String> payload,
            @AuthenticationPrincipal User user) {
        if (user == null) {
            return ResponseEntity.status(401).body(Map.of("error", "Unauthorized: Please log in to update status."));
        }
        String newStatus = payload.get("status");
        if (newStatus == null || newStatus.trim().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Missing status field"));
        }
        try {
            if ("DISPATCHED".equalsIgnoreCase(newStatus.trim())) {
                Order updated = orderService.dispatchOrder(identifier, user);
                return ResponseEntity.ok(updated);
            }
            if ("APPROVED".equalsIgnoreCase(newStatus.trim())) {
                Order updated = orderService.acceptOrder(identifier, user);
                return ResponseEntity.ok(updated);
            }
            if ("REJECTED".equalsIgnoreCase(newStatus.trim())) {
                Order updated = orderService.rejectOrder(identifier, user);
                return ResponseEntity.ok(updated);
            }
            Order updated = orderService.updateOrderStatus(identifier, newStatus.trim(), user);
            return ResponseEntity.ok(updated);
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.status(404).body(Map.of("error", ex.getMessage()));
        } catch (SecurityException ex) {
            return ResponseEntity.status(403).body(Map.of("error", ex.getMessage()));
        } catch (IllegalStateException ex) {
            return ResponseEntity.badRequest().body(Map.of("error", ex.getMessage()));
        } catch (Exception ex) {
            log.error("Error updating status for order [{}]: {}", identifier, ex.getMessage(), ex);
            return ResponseEntity.badRequest().body(Map.of("error", ex.getMessage()));
        }
    }
}
