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
  FaMapMarkerAlt,
  FaTruck,
  FaUser,
  FaBars,
} from "react-icons/fa";
import { HiH2 } from "react-icons/hi2";

import { useNavigate } from "react-router-dom";

// ==========================================================
// API
// ==========================================================

const API_URL = "http://localhost:9193/api/catalog";
const CART_API = "http://localhost:9193/api/cart";

// Whitewise Interior Furniture WhatsApp number
const WHATSAPP_NUMBER = "254727569512";

// ==========================================================
// HOME COMPONENT – Bob’s-style layout (new file)
// ==========================================================

const Home = () => {
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
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
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
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

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
        if (!res.ok) throw new Error("Failed to load products");
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
    if (!sessionId) return;
    fetch(`${CART_API}?sessionId=${sessionId}`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load cart");
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
    if (!sessionId) return;
    const payload = { catalogItemId: product.id };
    fetch(`${CART_API}?sessionId=${sessionId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    })
      .then((res) => {
        if (!res.ok) {
          return res.text().then((text) => {
            throw new Error(`Add to cart failed: ${res.status} - ${text}`);
          });
        }
        return res.json();
      })
      .then(() => loadCart())
      .catch((err) => console.error("Add to cart error:", err));
  };

  // ========================================================
  // REMOVE FROM CART
  // ========================================================

  const removeFromCart = (id) => {
    if (!sessionId) return;
    fetch(`${CART_API}/${id}?sessionId=${sessionId}`, { method: "DELETE" })
      .then((res) => {
        if (!res.ok) throw new Error("Remove failed");
        loadCart();
      })
      .catch((err) => console.error("Remove from cart error:", err));
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
    const timer = setTimeout(() => setFloatCards(true), 40000);
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
          String(product.categoryType || product.category || "")
            .toLowerCase() === filterCategory.toLowerCase()
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
      products.map((product) => product.categoryType).filter(Boolean)
    ),
  ];

  // ========================================================
  // PAGINATION
  // ========================================================

  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
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
    const productPrice = Number(product.price || 0).toLocaleString();
    const productCategory =
      product.categoryType || product.category || "Not specified";
    const productDescription =
      product.description || "No description available";

    const message = `Hello Whitewise Interior Furniture 👋

I want this:

🛋️ Item: ${productName}
🏷️ Category: ${productCategory}
💰 Price: Ksh ${productPrice}
📝 Description: ${productDescription}

Please let me know how I can proceed with the order. Thank you.`;

    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodedMessage}`;
    window.open(whatsappUrl, "_blank");
  };

  // ========================================================
  // OPEN PRODUCT MODAL
  // ========================================================

  const openModal = (product) => {
    setActiveProduct(product);
    setZoom(1);
    setPosition({ x: 0, y: 0 });
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
    if (newZoom === 1) setPosition({ x: 0, y: 0 });
  };

  // ========================================================
  // IMAGE DRAG
  // ========================================================

  const handleMouseDown = (e) => {
    if (zoom <= 1) return;
    setIsDragging(true);
    setStartPos({ x: e.clientX - position.x, y: e.clientY - position.y });
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    setPosition({ x: e.clientX - startPos.x, y: e.clientY - startPos.y });
  };

  const handleMouseUp = () => setIsDragging(false);

  const resetZoom = () => {
    setZoom(1);
    setPosition({ x: 0, y: 0 });
  };

  // ========================================================
  // SCROLL TO PRODUCTS
  // ========================================================

  const scrollToProducts = () => {
    const section = document.getElementById("product-section");
    if (section) section.scrollIntoView({ behavior: "smooth" });
  };

  // ========================================================
  // RENDER
  // ========================================================

  return (
    <>
      <style>{`
        * { box-sizing: border-box; }

        body {
          margin: 0;
          font-family: "Inter", "Segoe UI", Arial, sans-serif;
          background: #f5f5f5;
          color: #222;
        }

        .bobs-home {
          min-height: 100vh;
          background: #fff;
        }

        /* ========== TOP UTILITY BAR ========== */
        .top-util {
          background: #fff;
          border-bottom: 1px solid #e8e8e8;
          font-size: 13px;
        }
        .top-util-inner {
          max-width: 1280px;
          margin: 0 auto;
          padding: 8px 20px;
          display: flex;
          justify-content: flex-end;
          gap: 22px;
          color: #444;
        }
        .top-util a {
          color: #444;
          text-decoration: none;
        }
        .top-util a:hover { color: #c41e3a; }

        /* ========== MAIN HEADER ========== */
        .main-header {
          background: #fff;
          border-bottom: 1px solid #e0e0e0;
          position: sticky;
          top: 0;
          z-index: 100;
        }
        .header-inner {
          max-width: 1280px;
          margin: 0 auto;
          padding: 14px 20px;
          display: flex;
          align-items: center;
          gap: 24px;
        }
        .logo {
          flex-shrink: 0;
          display: flex;
          align-items: center;
          gap: 8px;
          text-decoration: none;
          color: inherit;
        }
        .logo-badge {
          background: #c41e3a;
          color: #fff;
          font-size: 10px;
          font-weight: 800;
          letter-spacing: 1px;
          padding: 3px 6px;
          border-radius: 3px;
          text-transform: uppercase;
        }
        .logo-text {
          font-weight: 900;
          font-size: 22px;
          letter-spacing: -0.5px;
          color: #1a1a1a;
          line-height: 1;
        }
        .logo-text span {
          display: block;
          font-size: 11px;
          font-weight: 600;
          letter-spacing: 1.5px;
          color: #666;
          margin-top: 2px;
        }

        .header-search {
          flex: 1;
          max-width: 520px;
          position: relative;
        }
        .header-search input {
          width: 100%;
          height: 44px;
          border: 1px solid #ccc;
          border-radius: 4px;
          padding: 0 48px 0 16px;
          font-size: 15px;
          outline: none;
        }
        .header-search input:focus {
          border-color: #c41e3a;
        }
        .header-search button {
          position: absolute;
          right: 4px;
          top: 4px;
          width: 36px;
          height: 36px;
          border: none;
          background: transparent;
          color: #666;
          cursor: pointer;
          border-radius: 4px;
        }
        .header-search button:hover { color: #c41e3a; }

        .header-meta {
          display: flex;
          align-items: center;
          gap: 20px;
          flex-shrink: 0;
        }
        .meta-item {
          display: flex;
          flex-direction: column;
          font-size: 12px;
          color: #555;
          line-height: 1.3;
        }
        .meta-item strong {
          color: #1a1a1a;
          font-size: 13px;
        }
        .meta-item svg {
          margin-right: 4px;
          color: #c41e3a;
        }

        .header-icons {
          display: flex;
          align-items: center;
          gap: 6px;
        }
        .icon-btn {
          width: 40px;
          height: 40px;
          border: none;
          background: transparent;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #333;
          cursor: pointer;
          position: relative;
          font-size: 18px;
        }
        .icon-btn:hover {
          background: #f5f5f5;
          color: #c41e3a;
        }
        .cart-badge {
          position: absolute;
          top: 2px;
          right: 2px;
          min-width: 18px;
          height: 18px;
          background: #c41e3a;
          color: #fff;
          font-size: 11px;
          font-weight: 700;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .mobile-menu-btn {
          display: none;
          width: 40px;
          height: 40px;
          border: none;
          background: transparent;
          font-size: 22px;
          cursor: pointer;
        }

        /* ========== NAV ========== */
        .main-nav {
          background: #fff;
          border-bottom: 1px solid #e8e8e8;
        }
        .nav-inner {
          max-width: 1280px;
          margin: 0 auto;
          padding: 0 20px;
          display: flex;
          gap: 4px;
          overflow-x: auto;
        }
        .nav-link {
          padding: 14px 16px;
          font-size: 14px;
          font-weight: 600;
          color: #333;
          text-decoration: none;
          white-space: nowrap;
          border-bottom: 3px solid transparent;
          transition: 0.2s;
        }
        .nav-link:hover,
        .nav-link.active {
          color: #c41e3a;
          border-bottom-color: #c41e3a;
        }
        .nav-link.outlet {
          color: #c41e3a;
        }

        /* ========== HERO (Bob’s style) ========== */
        .hero-bobs {
          position: relative;
          min-height: 520px;
          background: #e8e0d5;
          overflow: hidden;
        }
        .hero-bobs-bg {
          position: absolute;
          inset: 0;
          background:
            linear-gradient(90deg, rgba(0,0,0,0.15) 0%, transparent 40%),
            url("https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=1600&q=80")
            center/cover no-repeat;
        }
        .hero-bobs-content {
          position: relative;
          z-index: 2;
          max-width: 1280px;
          margin: 0 auto;
          padding: 60px 20px;
          min-height: 520px;
          display: flex;
          align-items: center;
        }
        .hero-promo-card {
          background: #00a3a1;
          color: #fff;
          padding: 36px 40px;
          max-width: 420px;
          border-radius: 4px;
          box-shadow: 0 12px 40px rgba(0,0,0,0.18);
        }
        .hero-promo-card h1 {
          font-size: clamp(36px, 5vw, 52px);
          font-weight: 800;
          line-height: 1.05;
          margin: 0 0 12px;
          letter-spacing: -1px;
        }
        .hero-promo-card h1 span {
          display: block;
          text-decoration: underline;
          text-decoration-thickness: 4px;
          text-underline-offset: 6px;
        }
        .hero-promo-card p {
          font-size: 18px;
          margin: 0 0 24px;
          opacity: 0.95;
          line-height: 1.4;
        }
        .hero-promo-btn {
          display: inline-block;
          background: #fff;
          color: #00a3a1;
          font-weight: 700;
          font-size: 15px;
          padding: 14px 28px;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          transition: 0.2s;
        }
        .hero-promo-btn:hover {
          background: #f0f0f0;
          transform: translateY(-2px);
        }

        /* Orange CTA strip */
        .orange-strip {
          background: #f5a623;
          color: #fff;
          text-align: center;
          padding: 18px 20px;
          font-size: 22px;
          font-weight: 800;
          letter-spacing: -0.5px;
          cursor: pointer;
          transition: 0.2s;
        }
        .orange-strip:hover {
          background: #e09415;
        }
        .orange-strip span {
          margin-left: 8px;
        }

        /* ========== FINANCING BAR ========== */
        .finance-bar {
          background: linear-gradient(90deg, #e85d04 0%, #f48c06 50%, #e85d04 100%);
          color: #fff;
          padding: 28px 20px;
        }
        .finance-inner {
          max-width: 1280px;
          margin: 0 auto;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 30px;
          flex-wrap: wrap;
        }
        .finance-left {
          display: flex;
          align-items: center;
          gap: 18px;
        }
        .finance-mascot {
          width: 72px;
          height: 72px;
          background: #fff;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 36px;
          flex-shrink: 0;
        }
        .finance-title {
          font-size: 22px;
          font-weight: 800;
          margin: 0 0 4px;
        }
        .finance-options {
          display: flex;
          gap: 28px;
          flex-wrap: wrap;
        }
        .finance-opt {
          text-align: center;
        }
        .finance-opt .months {
          font-size: 28px;
          font-weight: 900;
          line-height: 1;
        }
        .finance-opt .label {
          font-size: 12px;
          opacity: 0.9;
        }
        .finance-opt .min {
          font-size: 11px;
          opacity: 0.8;
        }
        .finance-right {
          text-align: right;
        }
        .finance-right p {
          margin: 0 0 8px;
          font-size: 16px;
        }
        .finance-btn {
          background: #fff;
          color: #e85d04;
          border: none;
          padding: 10px 20px;
          font-weight: 700;
          border-radius: 4px;
          cursor: pointer;
        }

        /* ========== WELCOME / COLLECTION ========== */
        .welcome-section {
          padding: 50px 20px 30px;
          text-align: center;
          background: #fff;
        }
        .section-label {
          color: #c41e3a;
          font-size: 12px;
          letter-spacing: 2px;
          font-weight: 800;
          text-transform: uppercase;
        }
        .welcome-title {
          font-size: clamp(28px, 4vw, 42px);
          font-weight: 800;
          margin: 10px 0 12px;
          color: #1a1a1a;
        }
        .welcome-text {
          max-width: 640px;
          margin: 0 auto;
          color: #666;
          line-height: 1.7;
        }

        .collection-section {
          padding: 40px 0 80px;
          background: #f7f7f7;
        }
        .collection-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          gap: 20px;
          margin-bottom: 28px;
          flex-wrap: wrap;
        }
        .collection-title {
          font-size: clamp(28px, 4vw, 40px);
          font-weight: 800;
          margin: 6px 0;
          letter-spacing: -1px;
        }
        .collection-subtitle {
          color: #777;
          margin: 0;
        }
        .collection-actions {
          display: flex;
          gap: 10px;
        }
        .outline-action,
        .cart-action {
          min-height: 44px;
          border-radius: 4px;
          padding: 0 16px;
          border: 1px solid #ddd;
          background: #fff;
          cursor: pointer;
          font-weight: 700;
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 14px;
        }
        .cart-action {
          background: #1a1a1a;
          color: #fff;
          border-color: #1a1a1a;
        }
        .cart-count {
          min-width: 20px;
          height: 20px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
          background: #c41e3a;
          font-size: 11px;
        }

        /* Filters */
        .filter-bar {
          padding: 16px;
          margin-bottom: 24px;
          background: #fff;
          border: 1px solid #e5e5e5;
          border-radius: 6px;
        }
        .filter-control {
          position: relative;
        }
        .filter-control svg {
          position: absolute;
          left: 12px;
          top: 50%;
          transform: translateY(-50%);
          color: #999;
          z-index: 2;
        }
        .filter-control input,
        .filter-control select {
          min-height: 44px;
          border-radius: 4px;
          border: 1px solid #ddd;
          padding-left: 38px;
        }
        .filter-control select {
          padding-left: 12px;
        }
        .clear-filter {
          width: 100%;
          min-height: 44px;
          border: none;
          border-radius: 4px;
          background: #eee;
          color: #555;
          font-weight: 700;
          cursor: pointer;
        }

        /* Product cards */
        .product-card {
          height: 100%;
          border: 1px solid #e5e5e5 !important;
          border-radius: 8px !important;
          overflow: hidden;
          background: #fff !important;
          box-shadow: 0 2px 8px rgba(0,0,0,0.04);
          transition: 0.3s;
        }
        .product-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 12px 28px rgba(0,0,0,0.1);
        }
        .product-image-wrapper {
          position: relative;
          height: 260px;
          overflow: hidden;
          background: #f0f0f0;
        }
        .product-image {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: 0.4s;
        }
        .product-card:hover .product-image {
          transform: scale(1.04);
        }
        .category-badge {
          position: absolute;
          top: 12px;
          left: 12px;
          padding: 5px 10px;
          border-radius: 3px;
          background: rgba(0,0,0,0.75);
          color: #fff;
          font-size: 10px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          font-weight: 700;
        }
        .favorite-button {
          position: absolute;
          right: 12px;
          top: 12px;
          width: 36px;
          height: 36px;
          border: none;
          border-radius: 50%;
          background: rgba(255,255,255,0.95);
          color: #777;
          cursor: pointer;
        }
        .favorite-button:hover { color: #c41e3a; }
        .quick-view {
          position: absolute;
          right: 12px;
          bottom: 12px;
          width: 38px;
          height: 38px;
          border: none;
          border-radius: 50%;
          background: #fff;
          color: #333;
          cursor: pointer;
        }
        .quick-view:hover {
          background: #1a1a1a;
          color: #fff;
        }
        .product-body { padding: 18px; }
        .collection-tag {
          color: #c41e3a;
          font-size: 10px;
          letter-spacing: 1.5px;
          font-weight: 800;
          margin-bottom: 6px;
        }
        .product-name {
          margin: 0 0 8px;
          font-size: 17px;
          font-weight: 800;
        }
        .product-description {
          min-height: 44px;
          color: #777;
          font-size: 13px;
          line-height: 1.5;
        }
        .product-footer {
          border-top: 1px solid #eee;
          padding-top: 12px;
          margin-top: 8px;
        }
        .price-label {
          display: block;
          color: #999;
          font-size: 10px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        .price {
          color: #1a1a1a;
          font-size: 20px;
          font-weight: 800;
          margin-bottom: 12px;
        }
        .product-buttons {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 8px;
        }
        .buy-button,
        .add-button {
          min-height: 42px;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-weight: 700;
          font-size: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
        }
        .buy-button {
          background: #25d366;
          color: #fff;
        }
        .add-button {
          background: #1a1a1a;
          color: #fff;
        }
        .buy-button:hover,
        .add-button:hover {
          opacity: 0.9;
        }

        .empty-products {
          text-align: center;
          background: #fff;
          padding: 60px 20px;
          border-radius: 8px;
        }
        .empty-products svg {
          font-size: 42px;
          color: #c41e3a;
          margin-bottom: 12px;
        }

        .pagination-wrapper {
          display: flex;
          justify-content: center;
          gap: 6px;
          margin-top: 36px;
        }
        .page-button {
          width: 36px;
          height: 36px;
          border: 1px solid #ddd;
          background: #fff;
          border-radius: 4px;
          cursor: pointer;
          font-weight: 700;
        }
        .page-button.active {
          background: #1a1a1a;
          color: #fff;
          border-color: #1a1a1a;
        }

        /* Brand section */
        .brand-section {
          padding: 70px 20px;
          background: #1a1a1a;
          color: #fff;
          text-align: center;
        }
        .brand-title {
          font-size: clamp(32px, 5vw, 52px);
          font-weight: 800;
          margin: 12px 0 16px;
          letter-spacing: -1px;
        }
        .brand-title span {
          color: #f5a623;
        }
        .brand-text {
          max-width: 560px;
          margin: 0 auto 24px;
          color: rgba(255,255,255,0.7);
          line-height: 1.7;
        }
        .brand-button {
          border: none;
          border-radius: 4px;
          padding: 14px 24px;
          background: #c41e3a;
          color: #fff;
          font-weight: 700;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          gap: 8px;
        }

        /* Cart panel */
        .cart-overlay {
          position: fixed;
          inset: 0;
          z-index: 9998;
          background: rgba(0,0,0,0.4);
        }
        .cart-panel {
          position: fixed;
          top: 0;
          right: 0;
          z-index: 9999;
          width: min(400px, 100%);
          height: 100vh;
          background: #fff;
          display: flex;
          flex-direction: column;
          box-shadow: -12px 0 40px rgba(0,0,0,0.12);
        }
        .cart-header {
          padding: 18px 20px;
          border-bottom: 1px solid #eee;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .cart-header h4 { margin: 0; font-weight: 800; }
        .close-cart {
          width: 36px;
          height: 36px;
          border: none;
          border-radius: 50%;
          background: #f5f5f5;
          cursor: pointer;
        }
        .cart-body {
          flex: 1;
          overflow-y: auto;
          padding: 16px 20px;
        }
        .cart-item {
          display: flex;
          gap: 12px;
          padding: 12px 0;
          border-bottom: 1px solid #f0f0f0;
        }
        .cart-item-image {
          width: 68px;
          height: 68px;
          border-radius: 6px;
          object-fit: cover;
          background: #f0f0f0;
          flex-shrink: 0;
        }
        .cart-item-info { flex: 1; }
        .cart-item-name {
          font-weight: 700;
          font-size: 14px;
          margin-bottom: 4px;
        }
        .cart-item-price {
          color: #c41e3a;
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
          font-size: 40px;
          color: #ccc;
          margin-bottom: 12px;
        }
        .cart-footer {
          padding: 18px 20px;
          border-top: 1px solid #eee;
        }
        .subtotal-row {
          display: flex;
          justify-content: space-between;
          margin-bottom: 14px;
        }
        .subtotal-value {
          font-size: 20px;
          font-weight: 800;
        }

        /* Modal / zoom */
        .product-modal .modal-content {
          border: none;
          border-radius: 8px;
          overflow: hidden;
        }
        .zoom-container {
          height: 60vh;
          min-height: 360px;
          overflow: hidden;
          background: #f5f5f5;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: grab;
        }
        .zoom-container:active { cursor: grabbing; }
        .zoom-image {
          max-width: 100%;
          max-height: 100%;
          object-fit: contain;
          user-select: none;
        }
        .zoom-controls {
          padding: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          border-top: 1px solid #eee;
        }
        .zoom-button {
          width: 38px;
          height: 38px;
          border: 1px solid #ddd;
          background: #fff;
          border-radius: 4px;
          cursor: pointer;
        }
        .zoom-percent {
          min-width: 60px;
          text-align: center;
          font-weight: 700;
        }

        /* Floating */
        .floating-actions {
          position: fixed;
          right: 18px;
          bottom: 18px;
          z-index: 1000;
          display: flex;
          flex-direction: column;
          gap: 10px;
        }
        .floating-action {
          width: 52px;
          height: 52px;
          border: none;
          border-radius: 50%;
          color: #fff;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 22px;
          cursor: pointer;
          box-shadow: 0 8px 24px rgba(0,0,0,0.2);
          transition: 0.25s;
        }
        .floating-action:hover {
          transform: translateY(-3px) scale(1.05);
        }
        .floating-whatsapp { background: #25d366; }
        .floating-cart { background: #1a1a1a; }

        /* Responsive */
        @media (max-width: 900px) {
          .header-meta { display: none; }
          .header-search { max-width: none; }
          .mobile-menu-btn { display: flex; align-items: center; justify-content: center; }
          .main-nav { display: none; }
          .main-nav.open { display: block; }
          .nav-inner { flex-direction: column; padding: 8px 0; }
          .hero-bobs { min-height: 420px; }
          .hero-promo-card { max-width: 100%; padding: 28px 24px; }
          .finance-inner { justify-content: center; text-align: center; }
          .finance-left { flex-direction: column; }
          .finance-right { text-align: center; width: 100%; }
        }
        @media (max-width: 600px) {
          .header-inner { flex-wrap: wrap; gap: 12px; }
          .logo { order: 1; }
          .header-icons { order: 2; margin-left: auto; }
          .header-search { order: 3; width: 100%; max-width: none; }
          .product-buttons { grid-template-columns: 1fr; }
          .orange-strip { font-size: 18px; }
        }

        @media (prefers-reduced-motion: reduce) {
          .product-card, .product-image, .floating-action {
            transition: none !important;
          }
        }
      `}</style>

      <div className="bobs-home">
        {/* ========== TOP UTILITY ========== */}
        <div className="top-util">
          <div className="top-util-inner">
            <a href="/Shopbetter">shop</a>
            <a href="#orders">Orders</a>
            <a href="#financing"></a>
            <a href="#help">Help</a>
          </div>
        </div>

        {/* ========== MAIN HEADER ========== */}
        <header className="main-header">
          <div className="header-inner">
            <button
              className="mobile-menu-btn"
              onClick={() => setMobileNavOpen(!mobileNavOpen)}
              aria-label="Menu"
            >
              <FaBars />
            </button>

            <a href="/" className="logo" onClick={(e) => { e.preventDefault(); navigate("/"); }}>
              <div>
                <div className="logo-badge">Whitewise</div>
                <div className="logo-text">
                  INTERIOR
                  <span>FURNITURE</span>
                </div>
              </div>
            </a>

            <div className="header-search">
              <input
                type="text"
                placeholder="Search all products  Whitewise"
                value={filterName}
                onChange={(e) => setFilterName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") scrollToProducts();
                }}
              />
              <button onClick={scrollToProducts} aria-label="Search">
                <FaSearch />
              </button>
            </div>

            <div className="header-meta">
              <div className="meta-item">
                <span>
                  <FaMapMarkerAlt /> Nearest showroom
                </span>/
                <strong>Find a furniture product</strong>
              </div>
              <div className="meta-item">
                <span>
                  <FaTruck /> Deliver to
                </span>
                <strong>Enter zip code/address</strong>
              </div>
            </div>

            <div className="header-icons">
              <button className="icon-btn" title="Account">
                <FaUser />
              </button>
              <button className="icon-btn" title="Favorites">
                <FaHeart />
              </button>
              <button
                className="icon-btn"
                title="Cart"
                onClick={() => setShowCart(true)}
              >
                <FaShoppingCart />
                {cart.length > 0 && (
                  <span className="cart-badge">{cart.length}</span>
                )}
              </button>
            </div>
          </div>
        </header>

        {/* ========== NAV ========== */}
        <nav className={`main-nav ${mobileNavOpen ? "open" : ""}`}>
          <div className="nav-inner">
            <a
              href="#product-section"
              className="nav-link"
              onClick={(e) => {
                e.preventDefault();
                scrollToProducts();
                setMobileNavOpen(false);
              }}
            >
              Furniture
            </a>
            {categories.slice(0, 6).map((cat) => (
              <a
                key={cat}
                href="#product-section"
                className="nav-link"
                onClick={(e) => {
                  e.preventDefault();
                  setFilterCategory(cat);
                  scrollToProducts();
                  setMobileNavOpen(false);
                }}
              >
                {cat}
              </a>
            ))}
            <a
              href="#product-section"
              className="nav-link outlet"
              onClick={(e) => {
                e.preventDefault();
                scrollToProducts();
                setMobileNavOpen(false);
              }}
            >
              New Arrivals
            </a>
            <a
              href="/about-us"
              className="nav-link"
              onClick={(e) => {
                e.preventDefault();
                navigate("/about-us");
              }}
            >
              Inspiration
            </a>
          </div>
        </nav>

        {/* ========== HERO ========== */}
        <section className="hero-bobs">
          <div className="hero-bobs-bg" />
          <div className="hero-bobs-content">
            <div className="hero-promo-card">
              <h2>
                Furniture
                <span>that fits</span>
              </h2>
              <p>Fits your space, style, &amp; budget!</p>
              <button className="hero-promo-btn" onClick={scrollToProducts}>
                Shop bedrooms for small spaces
              </button>
            </div>
          </div>
        </section>

        {/* Orange strip */}
        <div className="orange-strip" onClick={scrollToProducts}>
          Shop small spaces <span>›</span>
        </div>

        {/* ========== FINANCING ========== */}
        <section className="finance-bar" id="financing">
          <div className="finance-inner">
            <div className="finance-left">
              <div className="finance-mascot">🛋️</div>
              <div>
                <div className="finance-title">
                  
                </div>
                <div className="finance-options">
                  <div className="finance-opt">
                    <div className="months"></div>
                    <div className="label">*</div>
                    <div className="min"></div>
                  </div>
                  <div className="finance-opt">
                    <div className="months"></div>
                    <div className="label"></div>
                    <div className="min"></div>
                  </div>
                  <div className="finance-opt">
                    <div className="months"></div>
                    <div className="label"></div>
                    <div className="min"></div>
                  </div>
                  <div className="finance-opt">
                    <div className="months"></div>
                    <div className="label"></div>
                    <div className="min"></div>
                  </div>
                </div>
              </div>
            </div>
            <div className="finance-right">
              <p>Or pay with convenient installments</p>
              <button
                className="finance-btn"
                onClick={() => {
                  const message = `Hello Whitewise Interior Furniture 👋\n\nI would like to know more about your flexible financing options.\n\nThank you.`;
                  window.open(
                    `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`,
                    "_blank"
                  );
                }}
              >
                Learn more
              </button>
            </div>
          </div>
        </section>

        {/* ========== WELCOME ========== */}
        <section className="welcome-section">
          <div className="section-label">Quality • Style • Comfort</div>
          
         
        </section>

        {/* ========== COLLECTION ========== */}
        <section className="collection-section" id="product-section">
          <Container>
            <div className="collection-header">
              <div>
                <div className="section-label">Our Collection</div>
                <h2 className="collection-title">Discover Our Furniture</h2>
                <p className="collection-subtitle">
                  Find pieces that match your style, comfort and space.
                </p>
              </div>
              <div className="collection-actions">
                <button className="outline-action" onClick={loadProducts}>
                  <FaSyncAlt /> Refresh
                </button>
                <button
                  className="cart-action"
                  onClick={() => setShowCart(true)}
                >
                  <FaShoppingCart /> Cart
                  <span className="cart-count">{cart.length}</span>
                </button>
              </div>
            </div>

            {/* Filters */}
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
                      onChange={(e) => setFilterCategory(e.target.value)}
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
                  <button className="clear-filter" onClick={clearFilters}>
                    Clear Filters
                  </button>
                </Col>
              </Row>
            </div>

            <div
              style={{
                color: "#888",
                fontSize: "14px",
                marginBottom: "20px",
              }}
            >
              Showing <strong>{currentProducts.length}</strong> of{" "}
              <strong>{filteredProducts.length}</strong> products
            </div>

            {/* Products */}
            {currentProducts.length > 0 ? (
              <Row className="g-4">
                {currentProducts.map((product) => {
                  const category =
                    product.categoryType || product.category || "Furniture";
                  const description =
                    product.description ||
                    "Beautifully designed furniture for modern living.";

                  return (
                    <Col key={product.id} lg={4} md={6} sm={12}>
                      <Card className="product-card">
                        <div className="product-image-wrapper">
                          <img
                            src={product.photo || "/placeholder.jpg"}
                            alt={product.name || "Furniture"}
                            className="product-image"
                            onError={(e) => {
                              e.currentTarget.src = "/placeholder.jpg";
                            }}
                          />
                          <div className="category-badge">{category}</div>
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
                            <span className="price-label">Starting from</span>
                            <div className="price">
                              Ksh{" "}
                              {Number(product.price || 0).toLocaleString()}
                            </div>
                            <div className="product-buttons">
                              <button
                                className="buy-button"
                                onClick={() => orderViaWhatsApp(product)}
                                title="Order via WhatsApp"
                              >
                                <FaWhatsapp /> Order
                              </button>
                              <button
                                className="add-button"
                                onClick={() => addToCart(product)}
                                title="Add to cart"
                              >
                                <FaShoppingCart /> Add to Cart
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
                <p>Try changing your search or clearing the filters.</p>
                <button
                  className="add-button"
                  style={{ display: "inline-flex", padding: "0 20px" }}
                  onClick={clearFilters}
                >
                  Clear Filters
                </button>
              </div>
            )}

            {/* Pagination */}
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
                {Array.from({ length: totalPages }, (_, index) => index + 1).map(
                  (page) => (
                    <button
                      key={page}
                      className={`page-button ${
                        currentPage === page ? "active" : ""
                      }`}
                      onClick={() => setCurrentPage(page)}
                    >
                      {page}
                    </button>
                  )
                )}
                <button
                  className="page-button"
                  disabled={currentPage === totalPages}
                  onClick={() =>
                    setCurrentPage(Math.min(totalPages, currentPage + 1))
                  }
                >
                  ›
                </button>
              </div>
            )}
          </Container>
        </section>

        {/* ========== BRAND ========== */}
        <section className="brand-section">
          <div className="section-label" style={{ color: "#f5a623" }}>
            Whitewise Interior Furniture
          </div>
          <h2 className="brand-title">
            Your Space. <span>Your Style.</span>
          </h2>
          <p className="brand-text">
            Furniture is more than something you place inside your home. It is
            part of the atmosphere, comfort and personality of your space.
          </p>
          <button
            className="brand-button"
            onClick={() => navigate("/about-us")}
          >
            Explore More <FaArrowRight />
          </button>
        </section>

        {/* ========== CART ========== */}
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
                    <p>Add furniture to your cart to see it here.</p>
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
                          Ksh{" "}
                          {Number(item.priceAtAddition || 0).toLocaleString()}
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
                      Ksh {subtotal.toLocaleString()}
                    </span>
                  </div>
                  <button
                    className="add-button"
                    style={{ width: "100%", minHeight: "46px" }}
                    onClick={() => navigate("/cart")}
                  >
                    Proceed to Cart <FaArrowRight />
                  </button>
                </div>
              )}
            </aside>
          </>
        )}

        {/* ========== PRODUCT MODAL ========== */}
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
                    src={activeProduct.photo || "/placeholder.jpg"}
                    alt={activeProduct.name || "Furniture"}
                    className="zoom-image"
                    draggable={false}
                    style={{
                      transform: `translate(${position.x}px, ${position.y}px) scale(${zoom})`,
                    }}
                  />
                </div>
                <div className="zoom-controls">
                  <button
                    className="zoom-button"
                    onClick={() => {
                      const newZoom = Math.max(1, zoom - 0.2);
                      setZoom(newZoom);
                      if (newZoom === 1) setPosition({ x: 0, y: 0 });
                    }}
                  >
                    <FaMinus />
                  </button>
                  <span className="zoom-percent">
                    {Math.round(zoom * 100)}%
                  </span>
                  <button
                    className="zoom-button"
                    onClick={() => setZoom(Math.min(5, zoom + 0.2))}
                  >
                    <FaPlus />
                  </button>
                  <button className="zoom-button" onClick={resetZoom}>
                    <FaSyncAlt />
                  </button>
                </div>
              </>
            )}
          </Modal.Body>
        </Modal>

        {/* ========== FLOATING ========== */}
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
              window.open(
                `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`,
                "_blank"
              );
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

export default Home;
