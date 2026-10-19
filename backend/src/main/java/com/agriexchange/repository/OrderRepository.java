package com.agriexchange.repository;

import com.agriexchange.model.Order;
import com.agriexchange.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {
    List<Order> findByBuyerOrderByCreatedAtDesc(User buyer);
    List<Order> findByFarmerOrderByCreatedAtDesc(User farmer);
    List<Order> findByFarmerAndOrderStatusInOrderByCreatedAtDesc(User farmer, List<String> statuses);
    Optional<Order> findByOrderNumber(String orderNumber);
    Optional<Order> findByOrderNumberIgnoreCase(String orderNumber);

    @Query("SELECT COALESCE(SUM(o.totalAmount), 0) FROM Order o WHERE o.orderStatus != 'CANCELLED'")
    Double sumGrossMerchandiseValue();

    @Query("SELECT COALESCE(SUM(o.quantityTons), 0) FROM Order o WHERE o.orderStatus = 'DELIVERED'")
    Double sumTotalDeliveredBiomassTons();
}
