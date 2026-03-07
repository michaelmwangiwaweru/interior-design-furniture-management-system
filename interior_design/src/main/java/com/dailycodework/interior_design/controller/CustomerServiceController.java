package com.dailycodework.interior_design.controller;

import com.dailycodework.interior_design.model.CustomerService;
import com.dailycodework.interior_design.repository.CustomerServiceRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@CrossOrigin(origins = "http://localhost:5173") // React frontend
@RestController
@RequestMapping("/api/customer-services")
public class CustomerServiceController {

    @Autowired
    private CustomerServiceRepository repository;

    // Get all services
    @GetMapping
    public List<CustomerService> getAllServices() {
        return repository.findAll();
    }

    // Get single service
    @GetMapping("/{id}")
    public CustomerService getServiceById(@PathVariable Long id) {
        return repository.findById(id).orElseThrow(() -> new RuntimeException("Service not found with id " + id));
    }

    // Add new service
    @PostMapping
    public CustomerService createService(@RequestBody CustomerService service) {
        return repository.save(service);
    }

    // Update service
    @PutMapping("/{id}")
    public CustomerService updateService(@PathVariable Long id, @RequestBody CustomerService serviceDetails) {
        CustomerService service = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Service not found with id " + id));

        service.setCustomerName(serviceDetails.getCustomerName());
        service.setContact(serviceDetails.getContact());
        service.setDate(serviceDetails.getDate());
        service.setTime(serviceDetails.getTime());
        service.setInquiry(serviceDetails.getInquiry());
        service.setFeedback(serviceDetails.getFeedback());

        return repository.save(service);
    }

    // Delete service
    @DeleteMapping("/{id}")
    public void deleteService(@PathVariable Long id) {
        repository.deleteById(id);
    }
}
