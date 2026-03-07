package com.dailycodework.interior_design.service;


import com.dailycodework.interior_design.model.CartItem;
import com.dailycodework.interior_design.model.CatalogItem;
import com.dailycodework.interior_design.repository.CartRepository;
import com.dailycodework.interior_design.repository.CatalogItemRepository;
import com.dailycodework.interior_design.response.CartItemResponse;
import com.dailycodework.interior_design.response.CartResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CartService {

    private final CartRepository cartRepository;
    private final CatalogItemRepository catalogItemRepository;

    public CartResponse getCart(String sessionId) {

        List<CartItemResponse> items = cartRepository
                .findBySessionId(sessionId)
                .stream()
                .map(this::mapToResponse)
                .toList();

        CartResponse response = new CartResponse();
        response.setItems(items);
        return response;
    }

    public void addToCart(String sessionId, Long catalogItemId) {

        CatalogItem product = catalogItemRepository.findById(catalogItemId)
                .orElseThrow(() -> new RuntimeException("Product not found"));

        CartItem item = CartItem.builder()
                .sessionId(sessionId)
                .catalogItemId(product.getId())
                .name(product.getName())
                .priceAtAddition(product.getPrice())
                .photo(product.getPhoto()) // ✅ Base64 STRING
                .build();

        cartRepository.save(item);
    }

    public void removeFromCart(Long cartItemId, String sessionId) {

        CartItem item = cartRepository.findById(cartItemId)
                .orElseThrow(() -> new RuntimeException("Cart item not found"));

        if (!item.getSessionId().equals(sessionId)) {
            throw new RuntimeException("Unauthorized cart access");
        }

        cartRepository.delete(item);
    }

    private CartItemResponse mapToResponse(CartItem item) {

        CartItemResponse res = new CartItemResponse();
        res.setId(item.getId());
        res.setName(item.getName());
        res.setPriceAtAddition(item.getPriceAtAddition());

        // React expects photoBase64
        res.setPhotoBase64(item.getPhoto());

        return res;
    }
}
