
import React, { useEffect, useState } from "react";

import {
  Card,
  Col,
  Modal,
  Row,
  Container,
  Form,
} from "react-bootstrap";

import {
  FaShoppingCart,
  FaSyncAlt,
  FaSearch,
  FaTimes,
  FaTrash,
  FaEye,
  FaArrowRight,
  FaCouch,
  FaHeart,
  FaWhatsapp,
  FaPlus,
  FaMinus,
} from "react-icons/fa";

import { useNavigate } from "react-router-dom";

// ==========================================================
// API
// ==========================================================

const API_URL = "http://localhost:9193/api/catalog";
const CART_API = "http://localhost:9193/api/cart";

const WHATSAPP_NUMBER = "254727569512";

// ==========================================================
// FRONTEND-ONLY PROMOTIONS
// ==========================================================
// Use the product ID as the key and its previous price as
// the value. The existing product.price is the current price.
//
// Example:
// Product ID 1: Was Ksh 45,000, current price Ksh 36,000
// Product ID 2: Was Ksh 25,000, current price Ksh 20,000
//
// Products not listed here retain their normal price.
// These promotional values are only stored in this frontend.

const PROMOTIONS = {
  // "1": 45000,
  // "2": 25000,
};

const formatKsh = (price) =>
  `Ksh ${Number(price || 0).toLocaleString("en-KE")}`;

const getPromotion = (product) => {
  const wasPrice = Number(PROMOTIONS[String(product.id)]);
  const nowPrice = Number(product.price);

  if (
    PROMOTIONS[String(product.id)] == null ||
    !Number.isFinite(wasPrice) ||
    !Number.isFinite(nowPrice) ||
    wasPrice <= nowPrice ||
    nowPrice < 0
  ) {
    return null;
  }

  return {
    wasPrice,
    nowPrice,
    savings: wasPrice - nowPrice,
    percentage: Math.round(
      ((wasPrice - nowPrice) / wasPrice) * 100
    ),
  };
};

// ==========================================================
// HOME COMPONENT
// ==========================================================

const Shopbetter = () => {
  const navigate = useNavigate();

  // ========================================================
  // PRODUCTS
  // ========================================================

  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);

  // ========================================================
  // CART
  // ========================================================

  const [cart, setCart] = useState([]);
  const [showCart, setShowCart] = useState(false);

  // ========================================================
  // PRODUCT MODAL
  // ========================================================

  const [showModal, setShowModal] = useState(false);
  const [activeProduct, setActiveProduct] = useState(null);

  // ========================================================
  // IMAGE ZOOM
  // ========================================================

  const [zoom, setZoom] = useState(1);

  const [position, setPosition] = useState({
    x: 0,
    y: 0,
  });

  const [startPos, setStartPos] = useState({
    x: 0,
    y: 0,
  });

  const [isDragging, setIsDragging] = useState(false);

  // ========================================================
  // FILTERS
  // ========================================================

  const [filterName, setFilterName] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [filterPrice, setFilterPrice] = useState("");

  // ========================================================
  // OTHER
  // ========================================================

  const [floatCards, setFloatCards] = useState(false);
  const [sessionId, setSessionId] = useState(null);

  // ========================================================
  // PAGINATION
  // ========================================================

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  // ========================================================
  // CREATE CUSTOMER CART SESSION
  // ========================================================

  useEffect(() => {
    let sid = localStorage.getItem("cart_session_id");

    if (!sid) {
      sid = crypto.randomUUID();
      localStorage.setItem("cart_session_id", sid);
    }

    setSessionId(sid);
  }, []);

  // ========================================================
  // LOAD PRODUCTS
  // ========================================================

  const loadProducts = () => {
    fetch(API_URL)
      .then((res) => {
        if (!res.ok) {
          throw new Error("Failed to load products");
        }

        return res.json();
      })
      .then((data) => {
        const formatted = data.map((item) => ({
          ...item,

          photo: item.photo
            ? `data:image/jpeg;base64,${item.photo}`
            : "/placeholder.jpg",

          categoryType: item.category,
        }));

        setProducts(formatted);
        setFilteredProducts(formatted);
      })
      .catch((err) => {
        console.error("Products fetch error:", err);
      });
  };

  // ========================================================
  // LOAD CART
  // ========================================================

  const loadCart = () => {
    if (!sessionId) {
      return;
    }

    fetch(`${CART_API}?sessionId=${sessionId}`)
      .then((res) => {
        if (!res.ok) {
          throw new Error("Failed to load cart");
        }

        return res.json();
      })
      .then((data) => {
        setCart(Array.isArray(data.items) ? data.items : []);
      })
      .catch((err) => {
        console.error("Cart fetch error:", err);
      });
  };

  // ========================================================
  // ADD PRODUCT TO CART
  // ========================================================

  const addToCart = (product) => {
    if (!sessionId) {
      return;
    }

    const payload = {
      catalogItemId: product.id,
    };

    fetch(`${CART_API}?sessionId=${sessionId}`, {
      method: "POST",

      headers: {
        "Content-Type": "application/json",
      },

      body: JSON.stringify(payload),
    })
      .then((res) => {
        if (!res.ok) {
          return res.text().then((text) => {
            throw new Error(
              `Add to cart failed: ${res.status} - ${text}`
            );
          });
        }

        return res.json();
      })
      .then(() => {
        loadCart();
      })
      .catch((err) => {
        console.error("Add to cart error:", err);
      });
  };

  // ========================================================
  // REMOVE FROM CART
  // ========================================================

  const removeFromCart = (id) => {
    if (!sessionId) {
      return;
    }

    fetch(`${CART_API}/${id}?sessionId=${sessionId}`, {
      method: "DELETE",
    })
      .then((res) => {
        if (!res.ok) {
          throw new Error("Remove failed");
        }

        loadCart();
      })
      .catch((err) => {
        console.error("Remove from cart error:", err);
      });
  };

  // ========================================================
  // CART SUBTOTAL
  // ========================================================

  const subtotal = cart.reduce(
    (sum, item) => sum + Number(item.priceAtAddition || 0),
    0
  );

  // ========================================================
  // INITIAL LOAD
  // ========================================================

  useEffect(() => {
    loadProducts();
    loadCart();

    const timer = setTimeout(() => {
      setFloatCards(true);
    }, 40000);

    return () => clearTimeout(timer);
  }, [sessionId]);

  // ========================================================
  // FILTER PRODUCTS
  // ========================================================

  useEffect(() => {
    let temp = [...products];

    if (filterName.trim()) {
      temp = temp.filter((product) =>
        String(product.name || "")
          .toLowerCase()
          .includes(filterName.toLowerCase())
      );
    }

    if (filterCategory) {
      temp = temp.filter(
        (product) =>
          String(
            product.categoryType || product.category || ""
          ).toLowerCase() === filterCategory.toLowerCase()
      );
    }

    if (filterPrice) {
      const maxPrice = Number(filterPrice);

      if (!Number.isNaN(maxPrice)) {
        temp = temp.filter(
          (product) => Number(product.price || 0) <= maxPrice
        );
      }
    }

    setFilteredProducts(temp);
    setCurrentPage(1);
  }, [filterName, filterCategory, filterPrice, products]);

  // ========================================================
  // UNIQUE CATEGORIES
  // ========================================================

  const categories = [
    ...new Set(
      products
        .map((product) => product.categoryType)
        .filter(Boolean)
    ),
  ];

  // ========================================================
  // PAGINATION
  // ========================================================

  const totalPages = Math.ceil(
    filteredProducts.length / itemsPerPage
  );

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;

  const currentProducts = filteredProducts.slice(
    indexOfFirstItem,
    indexOfLastItem
  );

  // ========================================================
  // CLEAR FILTERS
  // ========================================================

  const clearFilters = () => {
    setFilterName("");
    setFilterCategory("");
    setFilterPrice("");
    setCurrentPage(1);
  };

  // ========================================================
  // WHATSAPP ORDER
  // ========================================================

  const orderViaWhatsApp = (product) => {
    const productName = product.name || "Product";

    const productPrice = Number(
      product.price || 0
    ).toLocaleString();

    const promotion = getPromotion(product);

    const priceMessage = promotion
      ? `Was Price: ${formatKsh(promotion.wasPrice)}
Now Price: ${formatKsh(promotion.nowPrice)}
Discount: ${promotion.percentage}% OFF
You Save: ${formatKsh(promotion.savings)}`
      : `Price: Ksh ${productPrice}`;

    const productCategory =
      product.categoryType || product.category || "Not specified";

    const productDescription =
      product.description || "No description available";

    const message = `Hello Whitewise Interior Furniture 👋

I want this:

🛋️ Item: ${productName}
🏷️ Category: ${productCategory}
💰 ${priceMessage}
📝 Description: ${productDescription}

Please let me know how I can proceed with the order. Thank you.`;

    const encodedMessage = encodeURIComponent(message);

    const whatsappUrl =
      `https://wa.me/${WHATSAPP_NUMBER}?text=${encodedMessage}`;

    window.open(whatsappUrl, "_blank");
  };

  // ========================================================
  // OPEN PRODUCT MODAL
  // ========================================================

  const openModal = (product) => {
    setActiveProduct(product);
    setZoom(1);

    setPosition({
      x: 0,
      y: 0,
    });

    setShowModal(true);
  };

  // ========================================================
  // IMAGE WHEEL ZOOM
  // ========================================================

  const handleWheel = (e) => {
    e.preventDefault();

    let newZoom = zoom + (e.deltaY < 0 ? 0.1 : -0.1);

    newZoom = Math.max(1, Math.min(5, newZoom));

    setZoom(newZoom);

    if (newZoom === 1) {
      setPosition({
        x: 0,
        y: 0,
      });
    }
  };

  // ========================================================
  // IMAGE DRAG START
  // ========================================================

  const handleMouseDown = (e) => {
    if (zoom <= 1) {
      return;
    }

    setIsDragging(true);

    setStartPos({
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    });
  };

  // ========================================================
  // IMAGE DRAGGING
  // ========================================================

  const handleMouseMove = (e) => {
    if (!isDragging) {
      return;
    }

    setPosition({
      x: e.clientX - startPos.x,
      y: e.clientY - startPos.y,
    });
  };

  // ========================================================
  // IMAGE DRAG END
  // ========================================================

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // ========================================================
  // RESET IMAGE ZOOM
  // ========================================================

  const resetZoom = () => {
    setZoom(1);

    setPosition({
      x: 0,
      y: 0,
    });
  };

  // ========================================================
  // SCROLL TO PRODUCTS
  // ========================================================

  const scrollToProducts = () => {
    const section = document.getElementById("product-section");

    if (section) {
      section.scrollIntoView({
        behavior: "smooth",
      });
    }
  };

  // ========================================================
  // BACKGROUND PRODUCT CARD
  // ========================================================

  const BackgroundProduct = ({ product }) => {
    return (
      <div className="background-product">
        <img
          src={product.photo || "/placeholder.jpg"}
          alt=""
          draggable="false"
          onError={(e) => {
            e.currentTarget.src = "/placeholder.jpg";
          }}
        />

        <div className="background-product-info">
          <strong>{product.name || "Furniture"}</strong>

          <span>
            Ksh {Number(product.price || 0).toLocaleString()}
          </span>
        </div>
      </div>
    );
  };

  // ========================================================
  // RENDER
  // ========================================================

  return (
    <>
      <style>{`
        * {
          box-sizing: border-box;
        }

        body {
          margin: 0;
          font-family: "Inter", "Segoe UI", Arial, sans-serif;
          background: #f7f5f1;
          color: #28231d;
        }

        .whitewise-home {
          min-height: 100vh;
          background: #f7f5f1;
          overflow: hidden;
        }

        /* HERO */

        .hero-section {
          min-height: 610px;
          position: relative;
          overflow: hidden;
          display: flex;
          align-items: center;
          background: linear-gradient(110deg, #252019, #5b4b38);
        }

        .hero-overlay {
          position: absolute;
          inset: 0;
          background: radial-gradient(
            circle at 80% 20%,
            rgba(255,255,255,0.15),
            transparent 30%
          );
        }

        .hero-content {
          position: relative;
          z-index: 5;
          width: 100%;
          padding: 90px 7%;
          color: white;
        }

        .hero-badge {
          display: inline-block;
          padding: 9px 17px;
          border-radius: 30px;
          background: rgba(255,255,255,0.10);
          border: 1px solid rgba(255,255,255,0.25);
          letter-spacing: 2px;
          font-size: 12px;
          font-weight: 700;
        }

        .hero-title {
          max-width: 850px;
          font-size: clamp(45px, 7vw, 85px);
          line-height: 1;
          letter-spacing: -3px;
          margin: 22px 0;
          font-weight: 800;
        }

        .hero-title span {
          color: #d2aa68;
          display: block;
        }

        .hero-description {
          max-width: 620px;
          color: rgba(255,255,255,0.78);
          font-size: 18px;
          line-height: 1.8;
        }

        .hero-buttons {
          display: flex;
          gap: 12px;
          flex-wrap: wrap;
          margin-top: 30px;
        }

        .hero-primary,
        .hero-secondary {
          border: none;
          padding: 14px 23px;
          border-radius: 8px;
          cursor: pointer;
          font-weight: 700;
          display: inline-flex;
          align-items: center;
          gap: 10px;
          transition: 0.3s;
        }

        .hero-primary {
          background: #cba462;
          color: white;
        }

        .hero-secondary {
          background: rgba(255,255,255,0.10);
          color: white;
          border: 1px solid rgba(255,255,255,0.30);
        }

        .hero-primary:hover,
        .hero-secondary:hover {
          transform: translateY(-3px);
        }

        /* PRODUCT BACKGROUND ANIMATION */

        .animated-products-background {
          position: absolute;
          inset: 0;
          z-index: 1;
          overflow: hidden;
          pointer-events: none;
          opacity: 0.23;
        }

        .product-track {
          position: absolute;
          display: flex;
          align-items: center;
          width: max-content;
          gap: 25px;
          left: 0;
          will-change: transform;
        }

        .product-track-left {
          top: 70px;
          animation: moveProductsRight 38s linear infinite;
        }

        .product-track-right {
          bottom: 60px;
          animation: moveProductsLeft 45s linear infinite;
        }

        .background-product {
          width: 210px;
          height: 155px;
          flex-shrink: 0;
          position: relative;
          overflow: hidden;
          border-radius: 16px;
          background: rgba(255,255,255,0.15);
          border: 1px solid rgba(255,255,255,0.20);
          box-shadow: 0 15px 40px rgba(0,0,0,0.15);
          backdrop-filter: blur(5px);
        }

        .background-product img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
        }

        .background-product-info {
          position: absolute;
          left: 0;
          right: 0;
          bottom: 0;
          padding: 12px;
          background: linear-gradient(transparent, rgba(0,0,0,0.80));
          color: white;
        }

        .background-product-info strong {
          display: block;
          font-size: 12px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .background-product-info span {
          display: block;
          margin-top: 3px;
          font-size: 11px;
          color: #e1c083;
        }

        @keyframes moveProductsRight {
          0% { transform: translateX(-35%); }
          100% { transform: translateX(5%); }
        }

        @keyframes moveProductsLeft {
          0% { transform: translateX(5%); }
          100% { transform: translateX(-35%); }
        }

        /* WELCOME */

        .welcome-section {
          padding: 90px 20px 60px;
          background: white;
          text-align: center;
        }

        .section-label {
          color: #a77d3d;
          font-size: 12px;
          letter-spacing: 3px;
          font-weight: 800;
        }

        .welcome-title {
          font-size: clamp(36px, 5vw, 60px);
          line-height: 1.1;
          font-weight: 800;
          margin: 15px 0 20px;
        }

        .welcome-title span {
          color: #ad8242;
        }

        .welcome-text {
          max-width: 700px;
          margin: auto;
          color: #777;
          line-height: 1.8;
        }

        /* COLLECTION */

        .collection-section {
          position: relative;
          padding: 80px 0;
          background: #f7f5f1;
        }

        .collection-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          gap: 25px;
          margin-bottom: 35px;
        }

        .collection-title {
          margin: 8px 0;
          font-size: clamp(34px, 5vw, 54px);
          font-weight: 800;
          letter-spacing: -2px;
        }

        .collection-subtitle {
          color: #888;
          margin: 0;
        }

        .collection-actions {
          display: flex;
          gap: 10px;
        }

        .outline-action,
        .cart-action {
          min-height: 45px;
          border-radius: 8px;
          padding: 0 16px;
          border: 1px solid #ded5c7;
          background: white;
          cursor: pointer;
          font-weight: 700;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .cart-action {
          background: #29241e;
          color: white;
          border-color: #29241e;
        }

        .cart-count {
          min-width: 21px;
          height: 21px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
          background: #caa05b;
          font-size: 11px;
        }

        /* FILTERS */

        .filter-bar {
          padding: 18px;
          margin-bottom: 30px;
          background: white;
          border: 1px solid #e9e1d6;
          border-radius: 13px;
          box-shadow: 0 8px 30px rgba(50,40,30,0.04);
        }

        .filter-control {
          position: relative;
        }

        .filter-control svg {
          position: absolute;
          left: 14px;
          top: 50%;
          transform: translateY(-50%);
          color: #aa8b60;
          z-index: 3;
        }

        .filter-control input {
          min-height: 47px;
          padding-left: 40px;
          border-radius: 8px;
          border-color: #e1d8ca;
        }

        .filter-control select {
          min-height: 47px;
          border-radius: 8px;
          border-color: #e1d8ca;
        }

        .clear-filter {
          width: 100%;
          min-height: 47px;
          border: none;
          border-radius: 8px;
          background: #eee8de;
          color: #6f5735;
          font-weight: 700;
          cursor: pointer;
        }

        /* PRODUCT CARDS */

        .product-card {
          height: 100%;
          border: 1px solid #e7dfd4 !important;
          border-radius: 15px !important;
          overflow: hidden;
          background: white !important;
          box-shadow: 0 8px 25px rgba(45,35,25,0.05);
          transition: 0.35s ease;
        }

        .product-card:hover {
          transform: translateY(-7px);
          box-shadow: 0 20px 45px rgba(45,35,25,0.12);
        }

        .product-image-wrapper {
          position: relative;
          height: 280px;
          overflow: hidden;
          background: #eee8df;
        }

        .product-image {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: 0.5s ease;
        }

        .product-card:hover .product-image {
          transform: scale(1.05);
        }

        .category-badge {
          position: absolute;
          top: 14px;
          left: 14px;
          padding: 7px 11px;
          border-radius: 30px;
          background: rgba(35,30,25,0.85);
          color: white;
          font-size: 10px;
          text-transform: uppercase;
          letter-spacing: 1px;
          font-weight: 700;
        }

        .favorite-button {
          position: absolute;
          right: 14px;
          top: 14px;
          width: 40px;
          height: 40px;
          border: none;
          border-radius: 50%;
          background: rgba(255,255,255,0.95);
          color: #777;
          cursor: pointer;
        }

        .favorite-button:hover {
          color: #b58443;
        }

        .quick-view {
          position: absolute;
          right: 14px;
          bottom: 14px;
          width: 42px;
          height: 42px;
          border: none;
          border-radius: 50%;
          background: white;
          color: #332c23;
          cursor: pointer;
        }

        .quick-view:hover {
          background: #29241e;
          color: white;
        }

        .product-body {
          padding: 22px;
        }

        .collection-tag {
          color: #a67b3c;
          font-size: 9px;
          letter-spacing: 2px;
          font-weight: 800;
          margin-bottom: 8px;
        }

        .product-name {
          margin: 0 0 9px;
          font-size: 19px;
          font-weight: 800;
        }

        .product-description {
          min-height: 50px;
          color: #888;
          font-size: 13px;
          line-height: 1.6;
        }

        .product-footer {
          border-top: 1px solid #eee8df;
          padding-top: 15px;
        }

        .price-label {
          display: block;
          color: #aaa;
          font-size: 10px;
          text-transform: uppercase;
          letter-spacing: 1px;
        }

        .price {
          color: #29251f;
          font-size: 21px;
          font-weight: 800;
          margin-bottom: 13px;
        }

        /* WAS PRICE / NOW PRICE */

        .promotion-prices {
          min-height: 102px;
          margin-bottom: 13px;
        }

        .promotion-top-row {
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          gap: 10px;
          margin-bottom: 5px;
        }

        .was-price {
          color: #888;
          font-size: 14px;
          text-decoration: line-through;
          text-decoration-thickness: 1px;
        }

        .discount-badge {
          display: inline-block;
          padding: 4px 8px;
          border-radius: 5px;
          background: #fff0f0;
          color: #bd2626;
          font-size: 10px;
          font-weight: 800;
          letter-spacing: 0.4px;
        }

        .now-price-row {
          display: flex;
          flex-wrap: wrap;
          align-items: baseline;
          gap: 9px;
        }

        .now-price {
          color: #168b45;
          font-size: 23px;
          font-weight: 800;
          letter-spacing: -0.5px;
        }

        .now-label {
          color: #168b45;
          font-size: 10px;
          font-weight: 800;
          letter-spacing: 1px;
        }

        .savings-text {
          margin-top: 3px;
          color: #168b45;
          font-size: 12px;
          font-weight: 600;
        }

        .product-buttons {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 8px;
        }

        .buy-button,
        .add-button {
          min-height: 43px;
          border: none;
          border-radius: 7px;
          cursor: pointer;
          font-weight: 700;
          font-size: 11px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 7px;
        }

        .buy-button {
          background: #168b45;
          color: white;
        }

        .add-button {
          background: #29241e;
          color: white;
        }

        .buy-button:hover,
        .add-button:hover {
          transform: translateY(-2px);
        }

        /* EMPTY PRODUCTS */

        .empty-products {
          text-align: center;
          background: white;
          padding: 70px 25px;
          border-radius: 15px;
        }

        .empty-products svg {
          font-size: 45px;
          color: #c3a273;
          margin-bottom: 15px;
        }

        .empty-products h4 {
          font-weight: 800;
        }

        .empty-products p {
          color: #888;
        }

        /* PAGINATION */

        .pagination-wrapper {
          display: flex;
          justify-content: center;
          gap: 7px;
          margin-top: 40px;
        }

        .page-button {
          width: 38px;
          height: 38px;
          border: 1px solid #ddd3c5;
          background: white;
          border-radius: 7px;
          cursor: pointer;
          font-weight: 700;
        }

        .page-button.active {
          background: #29241e;
          color: white;
          border-color: #29241e;
        }

        /* BRAND SECTION */

        .brand-section {
          position: relative;
          overflow: hidden;
          padding: 100px 0;
          background: #29241e;
          color: white;
        }

        .brand-title {
          max-width: 800px;
          font-size: clamp(45px, 7vw, 78px);
          line-height: 0.98;
          letter-spacing: -3px;
          font-weight: 800;
          margin: 15px 0 25px;
        }

        .brand-title span {
          display: block;
          color: #d0a45f;
        }

        .brand-text {
          max-width: 650px;
          color: rgba(255,255,255,0.70);
          line-height: 1.8;
        }

        .brand-button {
          margin-top: 25px;
          border: none;
          border-radius: 8px;
          padding: 14px 22px;
          background: #cba05b;
          color: white;
          font-weight: 700;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          gap: 10px;
        }

        /* CART */

        .cart-overlay {
          position: fixed;
          inset: 0;
          z-index: 9998;
          background: rgba(0,0,0,0.45);
          backdrop-filter: blur(3px);
        }

        .cart-panel {
          position: fixed;
          top: 0;
          right: 0;
          z-index: 9999;
          width: min(420px,100%);
          height: 100vh;
          background: white;
          display: flex;
          flex-direction: column;
          box-shadow: -20px 0 50px rgba(0,0,0,0.15);
        }

        .cart-header {
          padding: 20px;
          border-bottom: 1px solid #eee8df;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .cart-header h4 {
          margin: 0;
          font-weight: 800;
        }

        .close-cart {
          width: 38px;
          height: 38px;
          border: none;
          border-radius: 50%;
          background: #f1ede6;
          cursor: pointer;
        }

        .cart-body {
          flex: 1;
          overflow-y: auto;
          padding: 20px;
        }

        .cart-item {
          display: flex;
          gap: 12px;
          padding: 14px 0;
          border-bottom: 1px solid #eee8df;
        }

        .cart-item-image {
          width: 72px;
          height: 72px;
          border-radius: 8px;
          object-fit: cover;
          background: #eee8df;
          flex-shrink: 0;
        }

        .cart-item-info {
          flex: 1;
        }

        .cart-item-name {
          font-weight: 800;
          font-size: 14px;
          margin-bottom: 5px;
        }

        .cart-item-price {
          color: #a57b3d;
          font-weight: 700;
          font-size: 13px;
        }

        .remove-cart-item {
          border: none;
          background: transparent;
          color: #aaa;
          cursor: pointer;
        }

        .cart-empty {
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-direction: column;
          text-align: center;
          color: #999;
        }

        .cart-empty svg {
          font-size: 42px;
          color: #c5a777;
          margin-bottom: 15px;
        }

        .cart-footer {
          padding: 20px;
          border-top: 1px solid #eee8df;
        }

        .subtotal-row {
          display: flex;
          justify-content: space-between;
          margin-bottom: 15px;
        }

        .subtotal-value {
          font-size: 21px;
          font-weight: 800;
        }

        /* MODAL / IMAGE ZOOM */

        .product-modal .modal-content {
          border: none;
          border-radius: 15px;
          overflow: hidden;
        }

        .zoom-container {
          height: 65vh;
          min-height: 400px;
          overflow: hidden;
          background: #eee9e0;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: grab;
        }

        .zoom-container:active {
          cursor: grabbing;
        }

        .zoom-image {
          max-width: 100%;
          max-height: 100%;
          object-fit: contain;
          user-select: none;
        }

        .zoom-controls {
          padding: 14px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          border-top: 1px solid #eee8df;
        }

        .zoom-button {
          width: 40px;
          height: 40px;
          border: 1px solid #ddd3c5;
          background: white;
          border-radius: 7px;
          cursor: pointer;
        }

        .zoom-percent {
          min-width: 65px;
          text-align: center;
          font-weight: 700;
        }

        /* FLOATING BUTTONS */

        .floating-actions {
          position: fixed;
          right: 20px;
          bottom: 20px;
          z-index: 1000;
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .floating-action {
          width: 53px;
          height: 53px;
          border: none;
          border-radius: 50%;
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 21px;
          cursor: pointer;
          box-shadow: 0 10px 30px rgba(0,0,0,0.20);
          transition: 0.3s;
        }

        .floating-action:hover {
          transform: translateY(-4px) scale(1.05);
        }

        .floating-whatsapp {
          background: #168b45;
        }

        .floating-cart {
          background: #29241e;
        }

        /* RESPONSIVE */

        @media (max-width: 900px) {
          .collection-header {
            flex-direction: column;
            align-items: flex-start;
          }

          .product-track-left {
            top: 100px;
          }

          .product-track-right {
            bottom: 100px;
          }

          .background-product {
            width: 170px;
            height: 130px;
          }
        }

        @media (max-width: 600px) {
          .hero-content {
            padding: 70px 20px;
          }

          .hero-title {
            font-size: 44px;
          }

          .hero-buttons {
            flex-direction: column;
            align-items: stretch;
          }

          .hero-primary,
          .hero-secondary {
            width: 100%;
          }

          .collection-section {
            padding: 60px 10px;
          }

          .product-buttons {
            grid-template-columns: 1fr;
          }

          .background-product {
            width: 145px;
            height: 110px;
          }

          .animated-products-background {
            opacity: 0.16;
          }

          .floating-actions {
            right: 12px;
            bottom: 12px;
          }

          .now-price {
            font-size: 21px;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .product-track {
            animation: none !important;
          }

          .product-card,
          .product-image,
          .floating-action {
            transition: none !important;
          }
        }
      `}</style>

      <div className="whitewise-home">
        {/* COLLECTION */}

        <section
          className="collection-section"
          id="product-section"
        >
          <Container>
            <div className="collection-header">
              <div>
                <p className="collection-subtitle">
                  Find pieces that match your style, comfort and space.
                </p>
              </div>

              <div className="collection-actions">
                <button
                  className="outline-action"
                  onClick={loadProducts}
                >
                  <FaSyncAlt />
                  Refresh
                </button>

                <button
                  className="cart-action"
                  onClick={() => setShowCart(true)}
                >
                  <FaShoppingCart />
                  Cart

                  <span className="cart-count">
                    {cart.length}
                  </span>
                </button>
              </div>
            </div>

            {/* FILTERS */}

            <div className="filter-bar">
              <Row className="g-3">
                <Col md={5}>
                  <div className="filter-control">
                    <FaSearch />

                    <Form.Control
                      type="text"
                      placeholder="Search furniture..."
                      value={filterName}
                      onChange={(e) => setFilterName(e.target.value)}
                    />
                  </div>
                </Col>

                <Col md={3}>
                  <div className="filter-control">
                    <Form.Select
                      value={filterCategory}
                      onChange={(e) =>
                        setFilterCategory(e.target.value)
                      }
                    >
                      <option value="">All Categories</option>

                      {categories.map((category, index) => (
                        <option key={index} value={category}>
                          {category}
                        </option>
                      ))}
                    </Form.Select>
                  </div>
                </Col>

                <Col md={2}>
                  <div className="filter-control">
                    <Form.Control
                      type="number"
                      placeholder="Max price"
                      value={filterPrice}
                      onChange={(e) => setFilterPrice(e.target.value)}
                    />
                  </div>
                </Col>

                <Col md={2}>
                  <button
                    className="clear-filter"
                    onClick={clearFilters}
                  >
                    Clear Filters
                  </button>
                </Col>
              </Row>
            </div>

            {/* PRODUCT COUNT */}

            <div
              style={{
                color: "#888",
                fontSize: "14px",
                marginBottom: "25px",
              }}
            >
              Showing <strong>{currentProducts.length}</strong> of{" "}
              <strong>{filteredProducts.length}</strong> products
            </div>

            {/* PRODUCTS */}

            {currentProducts.length > 0 ? (
              <Row className="g-4">
                {currentProducts.map((product) => {
                  const category =
                    product.categoryType ||
                    product.category ||
                    "Furniture";

                  const description =
                    product.description ||
                    "Beautifully designed furniture for modern living.";

                  const promotion = getPromotion(product);

                  return (
                    <Col
                      key={product.id}
                      lg={4}
                      md={6}
                      sm={12}
                    >
                      <Card className="product-card">
                        {/* PRODUCT IMAGE */}

                        <div className="product-image-wrapper">
                          <img
                            src={product.photo || "/placeholder.jpg"}
                            alt={product.name || "Furniture"}
                            className="product-image"
                            onError={(e) => {
                              e.currentTarget.src = "/placeholder.jpg";
                            }}
                          />

                          <div className="category-badge">
                            {category}
                          </div>

                          <button
                            className="favorite-button"
                            onClick={(e) => e.stopPropagation()}
                            title="Add to favorites"
                          >
                            <FaHeart />
                          </button>

                          <button
                            className="quick-view"
                            onClick={() => openModal(product)}
                            title="Quick view"
                          >
                            <FaEye />
                          </button>
                        </div>

                        {/* PRODUCT INFORMATION */}

                        <div className="product-body">
                          <div className="collection-tag">
                            WHITEWISE COLLECTION
                          </div>

                          <h3 className="product-name">
                            {product.name || "Furniture Product"}
                          </h3>

                          <p className="product-description">
                            {description.length > 95
                              ? `${description.substring(0, 95)}...`
                              : description}
                          </p>

                          <div className="product-footer">
                            {promotion ? (
                              <div className="promotion-prices">
                                <div className="promotion-top-row">
                                  <span className="was-price">
                                    {formatKsh(promotion.wasPrice)}
                                  </span>

                                  <span className="discount-badge">
                                    {promotion.percentage}% OFF
                                  </span>
                                </div>

                                <div className="now-price-row">
                                  <span className="now-price">
                                    {formatKsh(promotion.nowPrice)}
                                  </span>

                                  <span className="now-label">
                                    NOW
                                  </span>
                                </div>

                                <div className="savings-text">
                                  You save {formatKsh(promotion.savings)}
                                </div>
                              </div>
                            ) : (
                              <>
                                <span className="price-label">
                                  Starting from
                                </span>

                                <div className="price">
                                  {formatKsh(product.price)}
                                </div>
                              </>
                            )}

                            <div className="product-buttons">
                              <button
                                className="buy-button"
                                onClick={() =>
                                  orderViaWhatsApp(product)
                                }
                                title="Order via WhatsApp"
                              >
                                <FaWhatsapp />
                                Order
                              </button>

                              <button
                                className="add-button"
                                onClick={() => addToCart(product)}
                                title="Add to cart"
                              >
                                <FaShoppingCart />
                                Add to Cart
                              </button>
                            </div>
                          </div>
                        </div>
                      </Card>
                    </Col>
                  );
                })}
              </Row>
            ) : (
              <div className="empty-products">
                <FaCouch />

                <h4>No furniture found</h4>

                <p>
                  Try changing your search or clearing the filters.
                </p>

                <button
                  className="add-button"
                  style={{
                    display: "inline-flex",
                    padding: "0 20px",
                  }}
                  onClick={clearFilters}
                >
                  Clear Filters
                </button>
              </div>
            )}

            {/* PAGINATION */}

            {totalPages > 1 && (
              <div className="pagination-wrapper">
                <button
                  className="page-button"
                  disabled={currentPage === 1}
                  onClick={() =>
                    setCurrentPage(Math.max(1, currentPage - 1))
                  }
                >
                  ‹
                </button>

                {Array.from(
                  { length: totalPages },
                  (_, index) => index + 1
                ).map((page) => (
                  <button
                    key={page}
                    className={`page-button ${
                      currentPage === page ? "active" : ""
                    }`}
                    onClick={() => setCurrentPage(page)}
                  >
                    {page}
                  </button>
                ))}

                <button
                  className="page-button"
                  disabled={currentPage === totalPages}
                  onClick={() =>
                    setCurrentPage(
                      Math.min(totalPages, currentPage + 1)
                    )
                  }
                >
                  ›
                </button>
              </div>
            )}
          </Container>
        </section>

        {/* BRAND SECTION */}

        <section className="brand-section">
          <Container>
            <div className="section-label">
              WHITEWISE INTERIOR FURNITURE
            </div>

            <h2 className="brand-title">
              Your Space.
              <span>Your Style.</span>
            </h2>

            <p className="brand-text">
              Furniture is more than something you place inside your
              home. It is part of the atmosphere, comfort and personality
              of your space.
            </p>

            <button
              className="brand-button"
              onClick={() => navigate("/about-us")}
            >
              Explore More
              <FaArrowRight />
            </button>
          </Container>
        </section>

        {/* CART */}

        {showCart && (
          <>
            <div
              className="cart-overlay"
              onClick={() => setShowCart(false)}
            />

            <aside className="cart-panel">
              <div className="cart-header">
                <h4>Your Cart</h4>

                <button
                  className="close-cart"
                  onClick={() => setShowCart(false)}
                >
                  <FaTimes />
                </button>
              </div>

              <div className="cart-body">
                {cart.length === 0 ? (
                  <div className="cart-empty">
                    <FaShoppingCart />

                    <h5>Your cart is empty</h5>

                    <p>
                      Add furniture to your cart to see it here.
                    </p>
                  </div>
                ) : (
                  cart.map((item) => (
                    <div className="cart-item" key={item.id}>
                      {item.photoBase64 ? (
                        <img
                          src={`data:image/jpeg;base64,${item.photoBase64}`}
                          alt={item.name || "Furniture"}
                          className="cart-item-image"
                        />
                      ) : (
                        <div
                          className="cart-item-image"
                          style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          <FaCouch />
                        </div>
                      )}

                      <div className="cart-item-info">
                        <div className="cart-item-name">
                          {item.name || "Furniture Product"}
                        </div>

                        <div className="cart-item-price">
                          {formatKsh(item.priceAtAddition)}
                        </div>
                      </div>

                      <button
                        className="remove-cart-item"
                        onClick={() => removeFromCart(item.id)}
                        title="Remove item"
                      >
                        <FaTrash />
                      </button>
                    </div>
                  ))
                )}
              </div>

              {cart.length > 0 && (
                <div className="cart-footer">
                  <div className="subtotal-row">
                    <span>Subtotal</span>

                    <span className="subtotal-value">
                      {formatKsh(subtotal)}
                    </span>
                  </div>

                  <button
                    className="add-button"
                    style={{
                      width: "100%",
                      minHeight: "48px",
                    }}
                    onClick={() => navigate("/cart")}
                  >
                    Proceed to Cart
                    <FaArrowRight />
                  </button>
                </div>
              )}
            </aside>
          </>
        )}

        {/* PRODUCT IMAGE MODAL */}

        <Modal
          show={showModal}
          onHide={() => setShowModal(false)}
          centered
          size="xl"
          className="product-modal"
        >
          <Modal.Header closeButton>
            <Modal.Title>
              {activeProduct?.name || "Product Preview"}
            </Modal.Title>
          </Modal.Header>

          <Modal.Body className="p-0">
            {activeProduct && (
              <>
                <div
                  className="zoom-container"
                  onWheel={handleWheel}
                  onMouseDown={handleMouseDown}
                  onMouseMove={handleMouseMove}
                  onMouseUp={handleMouseUp}
                  onMouseLeave={handleMouseUp}
                >
                  <img
                    src={
                      activeProduct.photo || "/placeholder.jpg"
                    }
                    alt={activeProduct.name || "Furniture"}
                    className="zoom-image"
                    draggable={false}
                    style={{
                      transform: `
                        translate(
                          ${position.x}px,
                          ${position.y}px
                        )
                        scale(${zoom})
                      `,
                    }}
                  />
                </div>

                <div className="zoom-controls">
                  <button
                    className="zoom-button"
                    onClick={() => {
                      const newZoom = Math.max(1, zoom - 0.2);

                      setZoom(newZoom);

                      if (newZoom === 1) {
                        setPosition({ x: 0, y: 0 });
                      }
                    }}
                  >
                    <FaMinus />
                  </button>

                  <span className="zoom-percent">
                    {Math.round(zoom * 100)}%
                  </span>

                  <button
                    className="zoom-button"
                    onClick={() =>
                      setZoom(Math.min(5, zoom + 0.2))
                    }
                  >
                    <FaPlus />
                  </button>

                  <button
                    className="zoom-button"
                    onClick={resetZoom}
                  >
                    <FaSyncAlt />
                  </button>
                </div>
              </>
            )}
          </Modal.Body>
        </Modal>

        {/* FLOATING WHATSAPP + CART */}

        <div
          className="floating-actions"
          style={{
            opacity: floatCards ? 1 : 0,
            pointerEvents: floatCards ? "auto" : "none",
            transition: "opacity 0.5s ease",
          }}
        >
          <button
            className="floating-action floating-whatsapp"
            onClick={() => {
              const message = `Hello Whitewise Interior Furniture 👋

I would like to make an inquiry about your furniture and interior design services.

Thank you.`;

              const url =
                `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
                  message
                )}`;

              window.open(url, "_blank");
            }}
            title="Contact Whitewise on WhatsApp"
          >
            <FaWhatsapp />
          </button>

          <button
            className="floating-action floating-cart"
            onClick={() => setShowCart(true)}
            title="Open shopping cart"
          >
            <FaShoppingCart />
          </button>
        </div>
      </div>
    </>
  );
};

export default Shopbetter;
