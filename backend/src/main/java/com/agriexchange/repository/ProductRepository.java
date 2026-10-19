package com.agriexchange.repository;

import com.agriexchange.model.Product;
import com.agriexchange.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long> {
    List<Product> findByFarmer(User farmer);
    List<Product> findByFarmerOrderByCreatedAtDesc(User farmer);
    List<Product> findByStatus(String status);
    List<Product> findByStatusOrderByCreatedAtDesc(String status);
    List<Product> findByByproductType(String byproductType);
    List<Product> findByState(String state);

    @Query("SELECT p FROM Product p WHERE " +
           "(:byproductType IS NULL OR :byproductType = '' OR :byproductType = 'ALL' OR p.byproductType = :byproductType) AND " +
           "(:state IS NULL OR :state = '' OR :state = 'ALL' OR p.state = :state) AND " +
           "(:maxPrice IS NULL OR p.pricePerTon <= :maxPrice) AND " +
           "(:maxMoisture IS NULL OR p.moistureContentPercent <= :maxMoisture) AND " +
           "(p.status = 'AVAILABLE') ORDER BY p.createdAt DESC")
    List<Product> searchProducts(@Param("byproductType") String byproductType,
                                @Param("state") String state,
                                @Param("maxPrice") Double maxPrice,
                                @Param("maxMoisture") Double maxMoisture);

    @Query("SELECT COALESCE(SUM(p.quantityTons), 0) FROM Product p")
    Double sumTotalBiomassTons();
}
