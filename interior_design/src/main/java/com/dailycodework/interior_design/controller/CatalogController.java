// src/main/java/com/dailycodework/interior_design/controller/CatalogController.java
package com.dailycodework.interior_design.controller;

import com.dailycodework.interior_design.model.CatalogItem;
import com.dailycodework.interior_design.repository.CatalogRepository;
import org.apache.commons.codec.binary.Base64;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/api/catalog")
@CrossOrigin(origins = "http://localhost:5173")
public class CatalogController {

    @Autowired
    private CatalogRepository repository;

    @GetMapping
    public List<CatalogItem> getAll() {
        return repository.findAll();
    }

    @PostMapping
    public ResponseEntity<?> create(
            @RequestParam("name") String name,
            @RequestParam("description") String description,
            @RequestParam("price") String priceStr,
            @RequestParam("category") String category,
            @RequestParam(value = "photo", required = false) MultipartFile photo) {

        try {
            CatalogItem item = buildItem(name, description, priceStr, category, photo);
            return new ResponseEntity<>(repository.save(item), HttpStatus.CREATED);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body("Error: " + e.getMessage());
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> update(
            @PathVariable Long id,
            @RequestParam("name") String name,
            @RequestParam("description") String description,
            @RequestParam("price") String priceStr,
            @RequestParam("category") String category,
            @RequestParam(value = "photo", required = false) MultipartFile photo) {

        return repository.findById(id)
                .map(existing -> {
                    try {
                        updateItem(existing, name, description, priceStr, category, photo);
                        return ResponseEntity.ok(repository.save(existing));
                    } catch (Exception e) {
                        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                                .body("Error: " + e.getMessage());
                    }
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        if (repository.existsById(id)) {
            repository.deleteById(id);
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.notFound().build();
    }

    // ──────────────────────────────────────────────────────────────
    // Helper methods – safe & clean
    // ──────────────────────────────────────────────────────────────

    private CatalogItem buildItem(String name, String description, String priceStr,
                                  String category, MultipartFile photo) throws IOException {

        validateRequired(name, "Name");
        validateRequired(description, "Description");
        validateRequired(category, "Category");

        Double price = parsePrice(priceStr);

        CatalogItem item = new CatalogItem();
        item.setName(name.trim());
        item.setDescription(description.trim());
        item.setPrice(price);
        item.setCategory(category.trim());

        if (photo != null && !photo.isEmpty()) {
            String base64 = Base64.encodeBase64String(photo.getBytes());
            item.setPhoto(base64);
        }
        return item;
    }

    private void updateItem(CatalogItem existing, String name, String description,
                            String priceStr, String category, MultipartFile photo) throws IOException {

        validateRequired(name, "Name");
        validateRequired(description, "Description");
        validateRequired(category, "Category");

        Double price = parsePrice(priceStr);

        existing.setName(name.trim());
        existing.setDescription(description.trim());
        existing.setPrice(price);
        existing.setCategory(category.trim());

        if (photo != null && !photo.isEmpty()) {
            String base64 = Base64.encodeBase64String(photo.getBytes());
            existing.setPhoto(base64);
        }
        // keep old photo if no new one
    }

    private Double parsePrice(String priceStr) {
        if (priceStr == null || priceStr.trim().isEmpty()) {
            throw new IllegalArgumentException("Price is required and must be a valid number");
        }
        try {
            return Double.parseDouble(priceStr.trim());
        } catch (NumberFormatException e) {
            throw new IllegalArgumentException("Invalid price format: " + priceStr);
        }
    }

    private void validateRequired(String value, String fieldName) {
        if (value == null || value.trim().isEmpty()) {
            throw new IllegalArgumentException(fieldName + " is required");
        }
    }
}