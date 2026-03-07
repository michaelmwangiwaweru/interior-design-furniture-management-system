package com.dailycodework.interior_design.controller;

import com.dailycodework.interior_design.dto.AddToCartRequest;
import com.dailycodework.interior_design.response.CartResponse;

import com.dailycodework.interior_design.service.CartService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/cart")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5173")
public class CartController {

    private final CartService cartService;

    @GetMapping
    public CartResponse getCart(@RequestParam String sessionId) {
        return cartService.getCart(sessionId);
    }

    @PostMapping
    public CartResponse addToCart(
            @RequestParam String sessionId,
            @RequestBody AddToCartRequest request
    ) {
        cartService.addToCart(sessionId, request.getCatalogItemId());
        return cartService.getCart(sessionId); // return updated cart
    }





    @DeleteMapping("/{id}")
    public void removeFromCart(
            @PathVariable Long id,
            @RequestParam String sessionId
    ) {
        cartService.removeFromCart(id, sessionId);
    }
}
