package com.dailycodework.interior_design.service;

import com.dailycodework.interior_design.model.Inventory;
import com.dailycodework.interior_design.repository.InventoryRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class InventoryService {

    private final InventoryRepository repository;

    public InventoryService(InventoryRepository repository) {
        this.repository = repository;
    }

    public List<Inventory> getAll() {
        return repository.findAll();
    }

    public Inventory getById(Long id) {
        return repository.findById(id).orElse(null);
    }

    public Inventory save(Inventory inv) {
        return repository.save(inv);
    }

    public Inventory update(Long id, Inventory inv) {
        inv.setId(id);
        return repository.save(inv);
    }

    public void delete(Long id) {
        repository.deleteById(id);
    }
}
