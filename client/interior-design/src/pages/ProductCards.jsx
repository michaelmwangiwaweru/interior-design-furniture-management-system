// ProductCards.js (updated with sessionId handling)
import React, { useEffect, useState } from "react";
import { Card, Col, Button, Modal, Row, Container, Form } from "react-bootstrap";
import { FaShoppingCart, FaSyncAlt } from "react-icons/fa";

const API_URL = "http://localhost:9193/api/catalog";
const CART_API = "http://localhost:9193/api/cart";

const ProductCards = () => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [showCart, setShowCart] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [activeProduct, setActiveProduct] = useState(null);
  const [zoom, setZoom] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [filterName, setFilterName] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [filterPrice, setFilterPrice] = useState("");
  const [floatCards, setFloatCards] = useState(false);
  const [sessionId, setSessionId] = useState(null); // ← New: sessionId state

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  // Initialize sessionId from localStorage
  useEffect(() => {
    let sid = localStorage.getItem("cart_session_id");
    if (!sid) {
      sid = crypto.randomUUID();
      localStorage.setItem("cart_session_id", sid);
    }
    setSessionId(sid);
  }, []);

  const loadProducts = () => {
    fetch(API_URL)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load products");
        return res.json();
      })
      .then((data) => {
        const formatted = data.map((item) => ({
          ...item,
          photo: item.photo ? `data:image/jpeg;base64,${item.photo}` : "/placeholder.jpg",
          categoryType: item.category,
        }));
        setProducts(formatted);
        setFilteredProducts(formatted);
      })
      .catch((err) => console.error("Products fetch error:", err));
  };

  const loadCart = () => {
    if (!sessionId) return; // Wait for sessionId
    fetch(`${CART_API}?sessionId=${sessionId}`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load cart");
        return res.json();
      })
      .then((data) => setCart(Array.isArray(data.items) ? data.items : [])) // ← Adjusted for CartResponse
      .catch((err) => console.error("Cart fetch error:", err));
  };

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

  const removeFromCart = (id) => {
    if (!sessionId) return;
    fetch(`${CART_API}/${id}?sessionId=${sessionId}`, { method: "DELETE" })
      .then((res) => {
        if (!res.ok) throw new Error("Remove failed");
        loadCart();
      })
      .catch((err) => console.error("Remove from cart error:", err));
  };

  // Use priceAtAddition + proper path
  const subtotal = cart.reduce((sum, item) => {
    return sum + Number(item.priceAtAddition || 0);
  }, 0);

  useEffect(() => {
    loadProducts();
    loadCart();
    const timer = setTimeout(() => setFloatCards(true), 40000);
    return () => clearTimeout(timer);
  }, [sessionId]); // ← Depend on sessionId

  // Filters
  useEffect(() => {
    let temp = [...products];
    if (filterName.trim()) {
      temp = temp.filter((p) =>
        p.name.toLowerCase().includes(filterName.trim().toLowerCase())
      );
    }
    if (filterCategory) {
      temp = temp.filter(
        (p) => p.categoryType.toLowerCase() === filterCategory.toLowerCase()
      );
    }
    if (filterPrice) {
      const maxPrice = Number(filterPrice);
      if (!isNaN(maxPrice)) {
        temp = temp.filter((p) => Number(p.price) <= maxPrice);
      }
    }
    setFilteredProducts(temp);
    setCurrentPage(1);
  }, [filterName, filterCategory, filterPrice, products]);

  const openModal = (product) => {
    setActiveProduct(product);
    setZoom(1);
    setPosition({ x: 0, y: 0 });
    setShowModal(true);
  };

  const handleWheel = (e) => {
    e.preventDefault();
    let newZoom = zoom + (e.deltaY < 0 ? 0.1 : -0.1);
    newZoom = Math.max(1, Math.min(5, newZoom));
    setZoom(newZoom);
  };

  const handleMouseDown = (e) => {
    if (zoom <= 1) return;
    setIsDragging(true);
    setStartPos({ x: e.clientX - position.x, y: e.clientY - position.y });
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    setPosition({
      x: e.clientX - startPos.x,
      y: e.clientY - startPos.y,
    });
  };

  const handleMouseUp = () => setIsDragging(false);

  const categories = [...new Set(products.map((p) => p.categoryType))];

  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentProducts = filteredProducts.slice(indexOfFirstItem, indexOfLastItem);

  return (
    <Container className="mt-4">
      {/* Filters */}
      <Row className="mb-3">
        <Col md={3} className="mb-2">
          <Form.Control
            placeholder="Search by name"
            value={filterName}
            onChange={(e) => setFilterName(e.target.value)}
          />
        </Col>
        <Col md={3} className="mb-2">
          <Form.Select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
          >
            <option value="">All Categories</option>
            {categories.map((cat, idx) => (
              <option key={idx} value={cat}>
                {cat}
              </option>
            ))}
          </Form.Select>
        </Col>
        <Col md={3} className="mb-2">
          <Form.Control
            placeholder="Max price"
            type="number"
            value={filterPrice}
            onChange={(e) => setFilterPrice(e.target.value)}
          />
        </Col>
        <Col md={3} className="mb-2 d-flex justify-content-end">
          <Button
            variant="secondary"
            className="d-flex align-items-center"
            onClick={loadProducts}
          >
            <FaSyncAlt className="me-2" /> Refresh
          </Button>
        </Col>
      </Row>

      {/* Cart Icon */}
      <Row className="mb-3 justify-content-end">
        <Col md={3} className="d-flex justify-content-end">
          <div
            className="position-relative"
            onClick={() => setShowCart((prev) => !prev)}
            style={{ cursor: "pointer" }}
          >
            <FaShoppingCart size={28} />
            {cart.length > 0 && (
              <span className="badge bg-danger position-absolute top-0 start-100 translate-middle">
                {cart.length}
              </span>
            )}
          </div>
        </Col>
      </Row>

      <h3 className="mb-3">Products</h3>

      <Row>
        {currentProducts.map((product) => (
          <Col
            key={product.id}
            className={`mb-4 ${floatCards ? "float-card" : ""}`}
            xs={12}
            md={6}
            lg={4}
          >
            <Card className="h-100 shadow-sm border-0 rounded overflow-hidden product-card">
              <div
                style={{ overflow: "hidden", height: "300px", cursor: "zoom-in" }}
                onClick={() => openModal(product)}
              >
                <img
                  src={product.photo}
                  alt={product.name}
                  className="product-image"
                  style={{
                    width: "115%",
                    height: "350px",
                    objectFit: "cover",
                  }}
                />
              </div>
              <Card.Body className="d-flex flex-column">
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <Card.Title className="product-title mb-0 text-dark">
                    {product.name}
                  </Card.Title>
                  <Card.Subtitle className="text-success fw-bold mb-0">
                    Ksh {Number(product.price).toLocaleString()}
                  </Card.Subtitle>
                </div>
                <Card.Subtitle className="text-muted mb-2">
                  {product.categoryType}
                </Card.Subtitle>
                <Card.Text className="text-muted mb-3" style={{ fontSize: "0.9rem" }}>
                  {product.description?.substring(0, 80)}...
                </Card.Text>
                <div className="d-flex gap-2 mt-auto">
                  <Button variant="success" className="flex-fill btn-product">
                    Buy Today
                  </Button>
                  <Button
                    variant="outline-success"
                    className="flex-fill btn-product-outline"
                    onClick={() => addToCart(product)}
                  >
                    Add to Cart
                  </Button>
                </div>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>

      {/* Pagination */}
      {totalPages > 1 && (
        <nav>
          <ul className="pagination justify-content-center">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNumber) => (
              <li
                key={pageNumber}
                className={`page-item ${currentPage === pageNumber ? "active" : ""}`}
              >
                <button
                  className="page-link"
                  onClick={() => setCurrentPage(pageNumber)}
                >
                  {pageNumber}
                </button>
              </li>
            ))}
          </ul>
        </nav>
      )}

      {/* Floating Cart */}
      {showCart && cart.length > 0 && (
        <Card
          style={{
            position: "fixed",
            top: "120px",
            right: "20px",
            width: "320px",
            maxHeight: "70vh",
            overflowY: "auto",
            zIndex: 999,
          }}
          className="shadow"
        >
          <Card.Body>
            <Card.Title className="mb-3">
              Cart ({cart.length}) – Subtotal: Ksh {subtotal.toLocaleString()}
            </Card.Title>

            {cart.map((item) => (
              <Card key={item.id} className="mb-3 border-0 shadow-sm">
                <Row className="g-0 align-items-center">
                  <Col xs={4}>
                    <Card.Img
                      src={item.photoBase64 ? `data:image/jpeg;base64,${item.photoBase64}` : "/placeholder.jpg"}
                      style={{ height: "70px", objectFit: "cover", borderRadius: "4px" }}
                    />
                  </Col>
                  <Col xs={8}>
                    <Card.Body className="p-2">
                      <Card.Title style={{ fontSize: "0.95rem" }}>
                        {item.name || "Unknown"}
                      </Card.Title>
                      <Card.Subtitle
                        style={{ fontSize: "0.85rem" }}
                        className="text-success"
                      >
                        Ksh {Number(item.priceAtAddition || 0).toLocaleString()}
                      </Card.Subtitle>
                      <Button
                        variant="danger"
                        size="sm"
                        className="mt-1"
                        onClick={() => removeFromCart(item.id)}
                      >
                        Remove
                      </Button>
                    </Card.Body>
                  </Col>
                </Row>
              </Card>
            ))}
          </Card.Body>
        </Card>
      )}

      {/* Image Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg" centered>
        <Modal.Header closeButton>
          <Modal.Title>{activeProduct?.name}</Modal.Title>
        </Modal.Header>
        <Modal.Body
          style={{ overflow: "hidden", cursor: zoom > 1 ? "grab" : "default" }}
          onWheel={handleWheel}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        >
          <img
            src={activeProduct?.photo}
            alt="Full Product"
            style={{
              width: "100%",
              transform: `scale(${zoom}) translate(${position.x / zoom}px, ${position.y / zoom}px)`,
              transition: isDragging ? "none" : "transform 0.2s",
            }}
          />
        </Modal.Body>
      </Modal>

      {/* Your existing styles remain unchanged */}
      <style>{`
        .btn-product { background-color: #28a745; color: white; border-radius: 4px; transition: background-color 0.3s; }
        .btn-product:hover { background-color: #218838; color: white; }
        .btn-product-outline { border-radius: 4px; transition: background-color 0.3s, color 0.3s; }
        .btn-product-outline:hover { background-color: #28a745; color: white; }
        .product-title { color: #2c3e50; }

        .product-card { animation: heartbeat 1.5s infinite; }
        @keyframes heartbeat {
          0% { transform: scale(1); }
          14% { transform: scale(1.1); }
          28% { transform: scale(1); }
          42% { transform: scale(1.1); }
          70% { transform: scale(1); }
          100% { transform: scale(1); }
        }

        .float-card { animation: floatCircle 20s linear infinite; }
        @keyframes floatCircle {
          0% { transform: translate(0,0); }
          25% { transform: translate(20px, -20px); }
          50% { transform: translate(0, -40px); }
          75% { transform: translate(-20px, -20px); }
          100% { transform: translate(0,0); }
        }
      `}</style>
    </Container>
  );
};

export default ProductCards;