package com.macrotrack.repository;

import com.macrotrack.model.Food;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface FoodRepository extends JpaRepository<Food, Long> {
    Optional<Food> findByBarcode(String barcode);

    @Query("SELECT f FROM Food f WHERE LOWER(f.name) LIKE LOWER(CONCAT('%', :query, '%')) OR LOWER(f.brand) LIKE LOWER(CONCAT('%', :query, '%')) ORDER BY f.isVerified DESC, f.name ASC")
    List<Food> searchFoods(@Param("query") String query, Pageable pageable);

    List<Food> findTop20ByOrderByIsVerifiedDescNameAsc();
}
