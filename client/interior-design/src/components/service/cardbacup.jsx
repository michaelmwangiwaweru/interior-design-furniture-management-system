import React, { useEffect, useState } from "react";
import { Card, Col, Button, Modal, Row, Container, Form } from "react-bootstrap";
import { FaShoppingCart, FaSyncAlt } from "react-icons/fa";

const API_URL = "http://localhost:9193/api/products";

const ProductCards = () => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);

  // CART STATES
  const [cart, setCart] = useState([]);
  const [showCart, setShowCart] = useState(false);

  // ZOOM MODAL STATES
  const [showModal, setShowModal] = useState(false);
  const [activeProduct, setActiveProduct] = useState(null);
  const [zoom, setZoom] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });

  // FILTER STATES
  const [filterName, setFilterName] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [filterPrice, setFilterPrice] = useState("");

  // ─────────────────────────────────────────────
  // Load Products
  // ─────────────────────────────────────────────
  const loadProducts = () => {
    fetch(API_URL)
      .then((res) => res.json())
      .then((data) => {
        setProducts(data);
        setFilteredProducts(data);
        // reset filters on refresh
        setFilterName("");
        setFilterCategory("");
        setFilterPrice("");
      })
      .catch((err) => console.error("Fetch Error:", err));
  };

  useEffect(() => {
    loadProducts();
  }, []);

  // ─────────────────────────────────────────────
  // CART: Load from localStorage
  // ─────────────────────────────────────────────
  useEffect(() => {
    const saved = localStorage.getItem("productCart");
    if (saved) setCart(JSON.parse(saved));
  }, []);

  useEffect(() => {
    localStorage.setItem("productCart", JSON.stringify(cart));
  }, [cart]);

  // ─────────────────────────────────────────────
  // FILTER PRODUCTS
  // ─────────────────────────────────────────────
  useEffect(() => {
    let temp = [...products];

    if (filterName.trim() !== "") {
      temp = temp.filter((p) =>
        p.name.toLowerCase().includes(filterName.trim().toLowerCase())
      );
    }

    if (filterCategory.trim() !== "") {
      temp = temp.filter((p) =>
        p.categoryType.toLowerCase() === filterCategory.toLowerCase()
      );
    }

    if (filterPrice.trim() !== "") {
      const maxPrice = Number(filterPrice);
      if (!isNaN(maxPrice)) {
        temp = temp.filter((p) => Number(p.price) <= maxPrice);
      }
    }

    setFilteredProducts(temp);
  }, [filterName, filterCategory, filterPrice, products]);

  // ─────────────────────────────────────────────
  // CART FUNCTIONS
  // ─────────────────────────────────────────────
  const addToCart = (product) => {
    setCart((prev) => {
      if (prev.find((item) => item.id === product.id)) return prev;
      return [...prev, product];
    });
  };

  const removeFromCart = (id) => setCart((prev) => prev.filter((item) => item.id !== id));

  const subtotal = cart.reduce((sum, item) => sum + Number(item.price), 0);

  // ─────────────────────────────────────────────
  // IMAGE ZOOM FUNCTIONS
  // ─────────────────────────────────────────────
  const openModal = (product) => {
    setActiveProduct(product);
    setZoom(1);
    setPosition({ x: 0, y: 0 });
    setShowModal(true);
  };

  const handleWheel = (e) => {
    e.preventDefault();
    let newZoom = zoom + (e.deltaY < 0 ? 0.1 : -0.1);
    if (newZoom < 1) newZoom = 1;
    if (newZoom > 5) newZoom = 5;
    setZoom(newZoom);
  };

  const handleMouseDown = (e) => {
    if (zoom === 1) return;
    setIsDragging(true);
    setStartPos({ x: e.clientX - position.x, y: e.clientY - position.y });
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    setPosition({ x: e.clientX - startPos.x, y: e.clientY - startPos.y });
  };

  const handleMouseUp = () => setIsDragging(false);

  // ─────────────────────────────────────────────
  // GET UNIQUE CATEGORIES
  // ─────────────────────────────────────────────
  const categories = [...new Set(products.map((p) => p.categoryType))];

  // ─────────────────────────────────────────────
  // UI
  // ─────────────────────────────────────────────
  return (
    <Container className="mt-4">

      {/* FILTER INPUTS + REFRESH */}
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
              <option key={idx} value={cat}>{cat}</option>
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
          <Button variant="secondary" onClick={loadProducts}>
            <FaSyncAlt className="me-2" /> Refresh
          </Button>
        </Col>
      </Row>

      {/* CART ICON */}
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
        {filteredProducts.map((product) => (
          <Col key={product.id} className="mb-4" xs={12} md={6} lg={4}>
            <Card className="h-100 shadow-sm border-0 rounded overflow-hidden product-card">
              <div
                style={{ overflow: "hidden", height: "220px", cursor: "zoom-in" }}
                onClick={() => openModal(product)}
              >
                <img
                  src={product.photo || "/placeholder.jpg"}
                  alt="Product"
                  className="product-image"
                  style={{
                    width: "100%",
                    height: "220px",
                    objectFit: "cover",
                    transition: "transform 0.3s",
                  }}
                />
              </div>

              <Card.Body className="d-flex flex-column">
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <Card.Title className="product-title mb-0">{product.name}</Card.Title>
                  <Card.Subtitle className="text-success fw-bold mb-0">
                    ${Number(product.price).toLocaleString()}
                  </Card.Subtitle>
                </div>

                <Card.Subtitle className="text-muted mb-2">
                  {product.categoryType}
                </Card.Subtitle>

                <Card.Text className="text-muted mb-3" style={{ fontSize: "0.9rem" }}>
                  {product.description?.substring(0, 80)}...
                </Card.Text>

                <div className="d-flex gap-2 mt-auto">
                  <Button variant="primary" className="flex-fill">Buy Today</Button>
                  <Button
                    variant="outline-success"
                    className="flex-fill"
                    onClick={() => addToCart(product)}
                  >
                    Add to Cart
                  </Button>
                </div>
              </Card.Body>

              <style jsx>{`
                .product-card:hover .product-image {
                  transform: scale(1.05);
                }
                .product-title {
                  color: #2c3e50;
                }
              `}</style>
            </Card>
          </Col>
        ))}
      </Row>

      {/* FLOATING CART */}
      {showCart && cart.length > 0 && (
        <Card
          style={{
            position: "fixed",
            top: "120px",
            right: "20px",
            width: "300px",
            maxHeight: "70vh",
            overflowY: "auto",
            zIndex: 999,
          }}
          className="shadow-sm border-0"
        >
          <Card.Body>
            <Card.Title className="mb-3">
              Cart ({cart.length}) – Subtotal: ${subtotal.toLocaleString()}
            </Card.Title>

            {cart.map((item) => (
              <Card key={item.id} className="mb-2 border-0 shadow-sm">
                <Row className="g-0 align-items-center">
                  <Col xs={4}>
                    <Card.Img
                      src={item.photo || "/placeholder.jpg"}
                      style={{
                        height: "60px",
                        objectFit: "cover",
                        borderRadius: "4px",
                      }}
                    />
                  </Col>
                  <Col xs={8}>
                    <Card.Body className="p-2">
                      <Card.Title style={{ fontSize: "0.9rem" }}>{item.name}</Card.Title>
                      <Card.Subtitle style={{ fontSize: "0.8rem" }} className="text-success">
                        ${item.price}
                      </Card.Subtitle>
                      <Button
                        variant="danger"
                        size="sm"
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

      {/* IMAGE MODAL */}
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
            src={activeProduct?.photo || "/placeholder.jpg"}
            alt="Full Product"
            style={{
              width: "100%",
              transform: `scale(${zoom}) translate(${position.x / zoom}px, ${position.y / zoom}px)`,
              transition: isDragging ? "none" : "transform 0.2s",
            }}
          />
        </Modal.Body>
      </Modal>
    </Container>
  );
};

export default ProductCards;
