package com.dailycodework.interior_design.controller;

import com.dailycodework.interior_design.dto.CheckoutRequest;
import com.dailycodework.interior_design.model.CustomerOrder;
import com.dailycodework.interior_design.model.OrderItem;
import com.dailycodework.interior_design.repository.OrderItemRepository;
import com.dailycodework.interior_design.repository.OrderRepository;
import com.dailycodework.interior_design.service.MpesaService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;
@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5173")
public class OrderItemController {

    private final OrderItemRepository orderItemRepository; // your renamed repo
    private final MpesaService mpesaService;

    @PostMapping("/checkout")
    public CustomerOrder checkout(@RequestBody CheckoutRequest request) {
        CustomerOrder order = CustomerOrder.builder()
                .firstName(request.getCustomer().getFirstName())
                .lastName(request.getCustomer().getLastName())
                .email(request.getCustomer().getEmail())
                .phone(request.getCustomer().getPhone())
                .address1(request.getCustomer().getAddress1())
                .address2(request.getCustomer().getAddress2())
                .county(request.getCustomer().getCounty())
                .subcounty(request.getCustomer().getSubcounty())
                .town(request.getCustomer().getTown())
                .city(request.getCustomer().getCity())
                .country(request.getCustomer().getCountry())
                .subtotal(request.getSubtotal())
                .paymentStatus("PENDING")
                .build();

        List<OrderItem> items = request.getCart().stream().map(item -> OrderItem.builder()
                .catalogItemId(item.getCatalogItemId())
                .name(item.getName())
                .priceAtAddition(item.getPriceAtAddition())
                .photoBase64(item.getPhotoBase64())
                .build()
        ).toList();

        order.setItems(items);

        // Use injected instance, not class name
        orderItemRepository.save(order);

        // Trigger Lipa Na Mpesa STK Push
        String checkoutRequestId = mpesaService.initiateSTKPush(order.getPhone(), order.getSubtotal(), order.getId());
        order.setMpesaCheckoutRequestId(checkoutRequestId);
        orderItemRepository.save(order);

        return order;
    }
}
