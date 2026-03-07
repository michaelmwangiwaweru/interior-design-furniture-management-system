package com.dailycodework.interior_design.controller;

import com.dailycodework.interior_design.model.FinishedProduct;
import com.dailycodework.interior_design.service.FinishedProductService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.*;

import java.util.List;

@RestController
@RequestMapping("/api/finished-products")
@CrossOrigin(origins = "http://localhost:3000")
public class FinishedProductController {

    @Autowired
    private FinishedProductService service;

    private final Path uploadDir = Paths.get("uploads");

    @GetMapping
    public List<FinishedProduct> getAll() {
        return service.getAll();
    }

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public FinishedProduct addProduct(
            @RequestParam("date") String date,
            @RequestParam("dateOut") String dateOut,
            @RequestParam("productName") String productName,
            @RequestParam("sizeOrDesign") String sizeOrDesign,
            @RequestParam("quantityIn") Integer quantityIn,
            @RequestParam("quantityOut") Integer quantityOut,
            @RequestParam("balance") Integer balance,
            @RequestParam("fromWorkshopName") String fromWorkshopName,
            @RequestParam("showroomName") String showroomName,
            @RequestParam("approvedBy") String approvedBy,
            @RequestParam(value = "photo", required = false) MultipartFile photo
    ) throws IOException {
        FinishedProduct product = new FinishedProduct();
        product.setDate(date);
        product.setDateOut(dateOut);
        product.setProductName(productName);
        product.setSizeOrDesign(sizeOrDesign);
        product.setQuantityIn(quantityIn);
        product.setQuantityOut(quantityOut);
        product.setBalance(balance);
        product.setFromWorkshopName(fromWorkshopName);
        product.setShowroomName(showroomName);
        product.setApprovedBy(approvedBy);

        if (photo != null && !photo.isEmpty()) {
            if (!Files.exists(uploadDir)) Files.createDirectories(uploadDir);
            String fileName = System.currentTimeMillis() + "_" + photo.getOriginalFilename();
            Files.copy(photo.getInputStream(), uploadDir.resolve(fileName), StandardCopyOption.REPLACE_EXISTING);
            product.setPhoto(fileName);
        }

        return service.save(product);
    }

    @PutMapping(value = "/{id}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public FinishedProduct updateProduct(
            @PathVariable Long id,
            @RequestParam("date") String date,
            @RequestParam("dateOut") String dateOut,
            @RequestParam("productName") String productName,
            @RequestParam("sizeOrDesign") String sizeOrDesign,
            @RequestParam("quantityIn") Integer quantityIn,
            @RequestParam("quantityOut") Integer quantityOut,
            @RequestParam("balance") Integer balance,
            @RequestParam("fromWorkshopName") String fromWorkshopName,
            @RequestParam("showroomName") String showroomName,
            @RequestParam("approvedBy") String approvedBy,
            @RequestParam(value = "photo", required = false) MultipartFile photo
    ) throws IOException {
        FinishedProduct product = service.getById(id).orElseThrow();
        product.setDate(date);
        product.setDateOut(dateOut);
        product.setProductName(productName);
        product.setSizeOrDesign(sizeOrDesign);
        product.setQuantityIn(quantityIn);
        product.setQuantityOut(quantityOut);
        product.setBalance(balance);
        product.setFromWorkshopName(fromWorkshopName);
        product.setShowroomName(showroomName);
        product.setApprovedBy(approvedBy);

        if (photo != null && !photo.isEmpty()) {
            if (!Files.exists(uploadDir)) Files.createDirectories(uploadDir);
            String fileName = System.currentTimeMillis() + "_" + photo.getOriginalFilename();
            Files.copy(photo.getInputStream(), uploadDir.resolve(fileName), StandardCopyOption.REPLACE_EXISTING);
            product.setPhoto(fileName);
        }

        return service.save(product);
    }

    @DeleteMapping("/{id}")
    public void deleteProduct(@PathVariable Long id) {
        service.delete(id);
    }
}
