package com.agriexchange.repository;

import com.agriexchange.model.PricePredictionLog;
import com.agriexchange.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PricePredictionLogRepository extends JpaRepository<PricePredictionLog, Long> {
    List<PricePredictionLog> findByUserOrderByCreatedAtDesc(User user);
    List<PricePredictionLog> findTop20ByOrderByCreatedAtDesc();
}
