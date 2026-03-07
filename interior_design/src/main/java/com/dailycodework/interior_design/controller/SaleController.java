package com.dailycodework.interior_design.controller;

import com.dailycodework.interior_design.model.Sale;
import com.dailycodework.interior_design.repository.SaleRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/sales")
@CrossOrigin(origins = "http://localhost:5173") // React dev server
public class SaleController {

    @Autowired
    private SaleRepository saleRepository;

    @GetMapping
    public List<Sale> getAllSales() {
        return saleRepository.findAll();
    }

    @PostMapping
    public Sale createSale(@RequestBody Sale sale) {
        return saleRepository.save(sale);
    }

    @PutMapping("/{id}")
    public Sale updateSale(@PathVariable Long id, @RequestBody Sale saleDetails) {
        Sale sale = saleRepository.findById(id).orElseThrow();

        sale.setReceiptNo(saleDetails.getReceiptNo()); // new
        sale.setPhoneNo(saleDetails.getPhoneNo());     // new
        sale.setCustomerName(saleDetails.getCustomerName());
        sale.setDate(saleDetails.getDate());
        sale.setItemSold(saleDetails.getItemSold());
        sale.setQuantity(saleDetails.getQuantity());
        sale.setUnitPrice(saleDetails.getUnitPrice());
        sale.setTotalPrice(saleDetails.getTotalPrice());
        sale.setPaymentStatus(saleDetails.getPaymentStatus());
        sale.setSalesPerson(saleDetails.getSalesPerson());
        sale.setDelivered(saleDetails.getDelivered());

        return saleRepository.save(sale);
    }

    @DeleteMapping("/{id}")
    public void deleteSale(@PathVariable Long id) {
        saleRepository.deleteById(id);
    }
}
