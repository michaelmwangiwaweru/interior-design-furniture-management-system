package com.dailycodework.interior_design.service;

import com.dailycodework.interior_design.model.FinishedProduct;
import com.dailycodework.interior_design.repository.FinishedProductRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class FinishedProductService {

    @Autowired
    private FinishedProductRepository repository;

    public FinishedProduct save(FinishedProduct product) {
        return repository.save(product);
    }

    public List<FinishedProduct> getAll() {
        return repository.findAll();
    }

    public Optional<FinishedProduct> getById(Long id) {
        return repository.findById(id);
    }

    public void delete(Long id) {
        repository.deleteById(id);
    }
}
