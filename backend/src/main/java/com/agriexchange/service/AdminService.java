package com.agriexchange.service;

import com.agriexchange.dto.DashboardStatsDto;
import com.agriexchange.model.Order;
import com.agriexchange.model.Product;
import com.agriexchange.model.Role;
import com.agriexchange.model.User;
import com.agriexchange.repository.OrderRepository;
import com.agriexchange.repository.ProductRepository;
import com.agriexchange.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class AdminService {

    private final UserRepository userRepository;
    private final ProductRepository productRepository;
    private final OrderRepository orderRepository;

    public AdminService(UserRepository userRepository, ProductRepository productRepository, OrderRepository orderRepository) {
        this.userRepository = userRepository;
        this.productRepository = productRepository;
        this.orderRepository = orderRepository;
    }

    public DashboardStatsDto getPlatformStats() {
        DashboardStatsDto stats = new DashboardStatsDto();

        long usersCount = userRepository.count();
        long farmersCount = userRepository.countByRole(Role.ROLE_FARMER);
        long buyersCount = userRepository.countByRole(Role.ROLE_BUYER);
        long productsCount = productRepository.count();

        Double totalBiomassListed = productRepository.sumTotalBiomassTons();
        Double totalDelivered = orderRepository.sumTotalDeliveredBiomassTons();
        Double gmv = orderRepository.sumGrossMerchandiseValue();

        stats.setTotalUsers(usersCount);
        stats.setTotalFarmers(farmersCount);
        stats.setTotalBuyers(buyersCount);
        stats.setTotalProductsListed(productsCount);
        stats.setTotalBiomassListedTons(totalBiomassListed != null ? totalBiomassListed : 0.0);
        stats.setTotalDeliveredBiomassTons(totalDelivered != null ? totalDelivered : 0.0);
        stats.setGrossMerchandiseValue(gmv != null ? gmv : 0.0);

        // Carbon offset calculation: ~1.35 Metric Tons CO2 avoided per ton recycled agricultural biomass
        double deliveredTons = totalDelivered != null ? totalDelivered : 0.0;
        stats.setEstimatedCarbonOffsetTons(Math.round(deliveredTons * 1.35 * 100.0) / 100.0);

        // Breakdown by product type
        List<Product> products = productRepository.findAll();
        Map<String, Long> typeCounts = new HashMap<>();
        for (Product p : products) {
            typeCounts.put(p.getByproductType(), typeCounts.getOrDefault(p.getByproductType(), 0L) + 1);
        }
        stats.setProductsByType(typeCounts);

        // Breakdown by order status
        List<Order> orders = orderRepository.findAll();
        Map<String, Long> statusCounts = new HashMap<>();
        for (Order o : orders) {
            statusCounts.put(o.getOrderStatus(), statusCounts.getOrDefault(o.getOrderStatus(), 0L) + 1);
        }
        stats.setOrdersByStatus(statusCounts);

        return stats;
    }

    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    public User toggleUserVerification(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        user.setVerified(!user.isVerified());
        return userRepository.save(user);
    }
}
