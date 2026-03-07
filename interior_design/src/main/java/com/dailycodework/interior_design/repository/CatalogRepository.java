package com.dailycodework.interior_design.repository;

import com.dailycodework.interior_design.model.CatalogItem;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CatalogRepository extends JpaRepository<CatalogItem, Long> {}
