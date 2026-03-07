package com.dailycodework.interior_design.controller;

import com.dailycodework.interior_design.model.Inventory;
import com.dailycodework.interior_design.service.InventoryService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/inventory")
@CrossOrigin(origins = "http://localhost:5173")
public class InventoryController {

    private final InventoryService service;

    public InventoryController(InventoryService service) {
        this.service = service;
    }

    @GetMapping
    public List<Inventory> getAll() {
        return service.getAll();
    }

    @PostMapping
    public Inventory create(@RequestBody Inventory inv) {
        return service.save(inv);
    }

    @GetMapping("/{id}")
    public Inventory getById(@PathVariable Long id) {
        return service.getById(id);
    }

    @PutMapping("/{id}")
    public Inventory update(@PathVariable Long id, @RequestBody Inventory inv) {
        return service.update(id, inv);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        service.delete(id);
    }
}
