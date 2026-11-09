
import React, { useState, useEffect } from "react";
import {
  Table,
  Form,
  Button,
  Modal,
  Image,
  Card,
  Row,
  Col,
  Badge,
  InputGroup,
  Spinner,
  Alert,
} from "react-bootstrap";

const API_URL = "http://localhost:9193/api/catalog";

const CatalogPage = () => {
  const [items, setItems] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingIndex, setEditingIndex] = useState(null);
  const [photoFile, setPhotoFile] = useState(null);
  const [preview, setPreview] = useState(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    category: "",
  });

  // Load catalog items from the backend.
  const loadItems = async () => {
    try {
      setLoading(true);
      setError("");

      const res = await fetch(API_URL);

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(
          `HTTP ${res.status}: ${errorText.substring(0, 200)}`
        );
      }

      const data = await res.json();

      if (!Array.isArray(data)) {
        console.error("Backend returned non-array data:", data);
        throw new Error("The backend returned invalid catalog data.");
      }

      setItems(data);
    } catch (err) {
      console.error("Failed to load catalog:", err);
      setItems([]);
      setError(`Failed to load catalog items: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadItems();
  }, []);

  // Update form fields.
  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Select an image and display its preview.
  const handleFile = (e) => {
    const file = e.target.files?.[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Please select a valid image file.");
      e.target.value = "";
      return;
    }

    // Prevent unnecessarily large image uploads.
    if (file.size > 5 * 1024 * 1024) {
      setError("Please select an image smaller than 5 MB.");
      e.target.value = "";
      return;
    }

    setError("");
    setPhotoFile(file);

    const reader = new FileReader();

    reader.onloadend = () => {
      setPreview(reader.result);
    };

    reader.readAsDataURL(file);
  };

  // Add a new item or update an existing item.
  const handleSubmit = async (e) => {
    e.preventDefault();

    const price = Number(formData.price);

    if (!Number.isFinite(price) || price < 0) {
      setError("Please enter a valid, non-negative price.");
      return;
    }

    const fd = new FormData();

    fd.append("name", formData.name.trim());
    fd.append("description", formData.description.trim());
    fd.append("price", formData.price);
    fd.append("category", formData.category.trim());

    if (photoFile) {
      fd.append("photo", photoFile);
    }

    const isEditing = editingIndex !== null;

    const url = isEditing
      ? `${API_URL}/${items[editingIndex].id}`
      : API_URL;

    const method = isEditing ? "PUT" : "POST";

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      const res = await fetch(url, {
        method,
        body: fd,
      });

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`HTTP ${res.status}: ${errorText}`);
      }

      closeModal();

      setSuccess(
        isEditing
          ? "Catalog item updated successfully."
          : "Catalog item added successfully."
      );

      await loadItems();
    } catch (err) {
      console.error("Catalog submission failed:", err);
      setError(`Unable to save catalog item: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  // Open the form with the selected item's information.
  const handleEdit = (index) => {
    const item = items[index];

    setFormData({
      name: item.name || "",
      description: item.description || "",
      price: item.price ?? "",
      category: item.category || "",
    });

    setEditingIndex(index);
    setPhotoFile(null);

    setPreview(
      item.photo
        ? `data:image/jpeg;base64,${item.photo}`
        : null
    );

    setError("");
    setSuccess("");
    setShowModal(true);
  };

  // Delete an item from the catalog.
  const handleDelete = async (index) => {
    const item = items[index];

    if (
      !window.confirm(
        `Are you sure you want to delete "${item.name}"? This action cannot be undone.`
      )
    ) {
      return;
    }

    try {
      setDeletingId(item.id);
      setError("");
      setSuccess("");

      const res = await fetch(`${API_URL}/${item.id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(
          errorText || `HTTP ${res.status}: Delete failed`
        );
      }

      setSuccess(`"${item.name}" was deleted successfully.`);
      await loadItems();
    } catch (err) {
      console.error("Delete failed:", err);
      setError(`Delete failed: ${err.message}`);
    } finally {
      setDeletingId(null);
    }
  };

  // Reset and close the add/edit form.
  const closeModal = () => {
    setShowModal(false);
    setEditingIndex(null);
    setPhotoFile(null);
    setPreview(null);

    setFormData({
      name: "",
      description: "",
      price: "",
      category: "",
    });

    setError("");
  };

  // Open a clean form for a new catalog item.
  const openAddModal = () => {
    setFormData({
      name: "",
      description: "",
      price: "",
      category: "",
    });

    setEditingIndex(null);
    setPhotoFile(null);
    setPreview(null);
    setError("");
    setSuccess("");
    setShowModal(true);
  };

  // Filter items by name, description, or category.
  const filteredItems = items.filter((item) => {
    const search = searchTerm.toLowerCase().trim();

    return (
      (item.name || "").toLowerCase().includes(search) ||
      (item.description || "").toLowerCase().includes(search) ||
      (item.category || "").toLowerCase().includes(search)
    );
  });

  // Format prices for display.
  const formatPrice = (price) => {
    const amount = Number(price);

    if (!Number.isFinite(amount)) return "0.00";

    return amount.toLocaleString("en-KE", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  return (
    <div
      className="catalog-page"
      style={{
        background: "#f5f7fb",
        minHeight: "100vh",
        padding: "28px 0 40px",
      }}
    >
      <style>
        {`
          .catalog-page .catalog-title {
            color: #172554;
            font-weight: 800;
            letter-spacing: -0.5px;
          }

          .catalog-page .catalog-subtitle {
            color: #64748b;
            font-size: 14px;
          }

          .catalog-page .catalog-card {
            border: 1px solid #e8edf5;
            border-radius: 14px;
            box-shadow: 0 4px 18px rgba(15, 23, 42, 0.04);
          }

          .catalog-page .catalog-table thead th {
            background: #f8fafc;
            color: #475569;
            font-size: 12px;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            white-space: nowrap;
            padding: 15px 12px;
            border-bottom: 1px solid #e2e8f0;
          }

          .catalog-page .catalog-table tbody td {
            padding: 14px 12px;
            vertical-align: middle;
            color: #334155;
            font-size: 14px;
          }

          .catalog-page .catalog-table tbody tr:hover {
            background: #f8fafc;
          }

          .catalog-page .catalog-image {
            width: 64px;
            height: 58px;
            object-fit: cover;
            border-radius: 9px;
            border: 1px solid #e2e8f0;
            background: #fff;
          }

          .catalog-page .catalog-input {
            border-radius: 9px;
            border-color: #dbe2ea;
            padding: 10px 12px;
          }

          .catalog-page .catalog-input:focus {
            border-color: #6479bd;
            box-shadow: 0 0 0 3px rgba(59, 91, 184, 0.1);
          }

          .catalog-page .catalog-primary {
            background: #172554;
            border-color: #172554;
            border-radius: 9px;
            font-weight: 600;
            padding: 10px 16px;
          }

          .catalog-page .catalog-primary:hover {
            background: #263b78;
            border-color: #263b78;
          }

          .catalog-page .catalog-modal .modal-content {
            border: 0;
            border-radius: 16px;
            overflow: hidden;
          }

          .catalog-page .catalog-modal .modal-header {
            background: #172554;
            color: white;
            padding: 20px 24px;
          }

          .catalog-page .catalog-modal .btn-close {
            filter: invert(1);
          }

          .catalog-page .catalog-section-label {
            color: #172554;
            font-size: 12px;
            font-weight: 800;
            letter-spacing: 0.8px;
            text-transform: uppercase;
            margin-bottom: 14px;
          }

          @media (max-width: 768px) {
            .catalog-page {
              padding-top: 16px !important;
            }

            .catalog-page .catalog-header {
              align-items: stretch !important;
            }

            .catalog-page .catalog-header .btn {
              width: 100%;
            }

            .catalog-page .catalog-table tbody td {
              padding: 10px 8px;
            }
          }
        `}
      </style>

      <div className="container-fluid px-3 px-lg-4">
        {/* Page heading */}
        <div className="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-4 catalog-header">
          <div>
            <div
              style={{
                color: "#64748b",
                fontSize: "12px",
                fontWeight: 700,
                letterSpacing: "1.4px",
                textTransform: "uppercase",
                marginBottom: "7px",
              }}
            >
              PRODUCT MANAGEMENT
            </div>

            <h2 className="catalog-title mb-2">
              Catalog Management
            </h2>

            <p className="catalog-subtitle mb-0">
              Manage your products, descriptions, categories, photos, and prices.
            </p>
          </div>

          <Button
            className="catalog-primary"
            onClick={openAddModal}
          >
            <span className="me-2">+</span>
            Add New Item
          </Button>
        </div>

        {/* Feedback messages */}
        {success && (
          <Alert
            variant="success"
            dismissible
            onClose={() => setSuccess("")}
          >
            {success}
          </Alert>
        )}

        {error && (
          <Alert
            variant="danger"
            dismissible
            onClose={() => setError("")}
          >
            {error}
          </Alert>
        )}

        {/* Summary cards */}
        <Row className="g-3 mb-4">
          <Col xs={12} sm={6} lg={4}>
            <Card className="catalog-card h-100">
              <Card.Body className="d-flex align-items-center gap-3 p-4">
                <div
                  style={{
                    background: "#e8edff",
                    color: "#263b78",
                    borderRadius: "12px",
                    width: "48px",
                    height: "48px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "23px",
                    fontWeight: 800,
                  }}
                >
                  #
                </div>

                <div>
                  <div className="text-muted small mb-1">
                    Total Catalog Items
                  </div>
                  <h3 className="mb-0 fw-bold" style={{ color: "#172554" }}>
                    {items.length}
                  </h3>
                </div>
              </Card.Body>
            </Card>
          </Col>

          <Col xs={12} sm={6} lg={4}>
            <Card className="catalog-card h-100">
              <Card.Body className="d-flex align-items-center gap-3 p-4">
                <div
                  style={{
                    background: "#dcfce7",
                    color: "#166534",
                    borderRadius: "12px",
                    width: "48px",
                    height: "48px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "22px",
                    fontWeight: 800,
                  }}
                >
                  ✓
                </div>

                <div>
                  <div className="text-muted small mb-1">
                    Categories
                  </div>
                  <h3 className="mb-0 fw-bold" style={{ color: "#172554" }}>
                    {
                      new Set(
                        items
                          .map((item) => (item.category || "").trim())
                          .filter(Boolean)
                          .map((category) => category.toLowerCase())
                      ).size
                    }
                  </h3>
                </div>
              </Card.Body>
            </Card>
          </Col>

          <Col xs={12} sm={6} lg={4}>
            <Card className="catalog-card h-100">
              <Card.Body className="d-flex align-items-center gap-3 p-4">
                <div
                  style={{
                    background: "#fef3c7",
                    color: "#92400e",
                    borderRadius: "12px",
                    width: "48px",
                    height: "48px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "22px",
                  }}
                >
                  ◉
                </div>

                <div>
                  <div className="text-muted small mb-1">
                    Items with Photos
                  </div>
                  <h3 className="mb-0 fw-bold" style={{ color: "#172554" }}>
                    {items.filter((item) => item.photo).length}
                  </h3>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Catalog table */}
        <Card className="catalog-card">
          <Card.Body className="p-0">
            <div className="d-flex flex-wrap justify-content-between align-items-center gap-3 p-3 p-lg-4">
              <div>
                <h5 className="mb-1 fw-bold" style={{ color: "#172554" }}>
                  Product Inventory
                </h5>
                <div className="text-muted small">
                  {loading
                    ? "Loading catalog..."
                    : `Showing ${filteredItems.length} of ${items.length} items`}
                </div>
              </div>

              <div style={{ width: "100%", maxWidth: "360px" }}>
                <InputGroup>
                  <InputGroup.Text
                    style={{
                      background: "#fff",
                      borderColor: "#dbe2ea",
                      borderRadius: "9px 0 0 9px",
                    }}
                  >
                    <span aria-hidden="true">⌕</span>
                  </InputGroup.Text>

                  <Form.Control
                    className="catalog-input"
                    style={{ borderRadius: "0 9px 9px 0" }}
                    type="search"
                    placeholder="Search name or category..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    aria-label="Search catalog"
                  />
                </InputGroup>
              </div>
            </div>

            <div className="table-responsive">
              <Table
                hover
                className="catalog-table mb-0"
                style={{ minWidth: "850px" }}
              >
                <thead>
                  <tr>
                    <th style={{ width: "60px" }}>#</th>
                    <th>Photo</th>
                    <th>Product Name</th>
                    <th>Description</th>
                    <th>Price</th>
                    <th>Category</th>
                    <th style={{ minWidth: "155px" }}>Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={7} className="text-center py-5">
                        <Spinner
                          animation="border"
                          size="sm"
                          className="me-2"
                        />
                        Loading catalog items...
                      </td>
                    </tr>
                  ) : filteredItems.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="text-center py-5">
                        <div
                          style={{
                            fontSize: "34px",
                            color: "#94a3b8",
                            marginBottom: "8px",
                          }}
                        >
                          ◇
                        </div>

                        <h6 className="fw-bold mb-2">
                          {items.length === 0
                            ? "No catalog items yet"
                            : "No matching products found"}
                        </h6>

                        <p className="text-muted small mb-3">
                          {items.length === 0
                            ? "Add your first product to get started."
                            : "Try another search term."}
                        </p>

                        {items.length === 0 && (
                          <Button
                            size="sm"
                            className="catalog-primary"
                            onClick={openAddModal}
                          >
                            Add First Item
                          </Button>
                        )}
                      </td>
                    </tr>
                  ) : (
                    filteredItems.map((item, i) => (
                      <tr key={item.id || i}>
                        <td className="text-muted">{i + 1}</td>

                        <td>
                          {item.photo ? (
                            <Image
                              src={`data:image/jpeg;base64,${item.photo}`}
                              className="catalog-image"
                              alt={item.name || "Catalog product"}
                              thumbnail={false}
                            />
                          ) : (
                            <div
                              className="catalog-image d-flex align-items-center justify-content-center"
                              style={{ color: "#94a3b8", fontSize: "22px" }}
                              aria-label="No product photo"
                            >
                              ◇
                            </div>
                          )}
                        </td>

                        <td>
                          <div className="fw-bold" style={{ color: "#172554" }}>
                            {item.name || "Unnamed item"}
                          </div>
                        </td>

                        <td style={{ maxWidth: "240px" }}>
                          <div
                            className="text-muted"
                            style={{
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              display: "-webkit-box",
                              WebkitLineClamp: 2,
                              WebkitBoxOrient: "vertical",
                              lineHeight: "1.5",
                            }}
                            title={item.description || ""}
                          >
                            {item.description || "No description"}
                          </div>
                        </td>

                        <td>
                          <span
                            className="fw-bold text-nowrap"
                            style={{ color: "#166534" }}
                          >
                            KSh {formatPrice(item.price)}
                          </span>
                        </td>

                        <td>
                          <Badge
                            bg="light"
                            text="dark"
                            className="border"
                            style={{
                              fontWeight: 600,
                              padding: "7px 10px",
                            }}
                          >
                            {item.category || "Uncategorized"}
                          </Badge>
                        </td>

                        <td>
                          <div className="d-flex gap-2">
                            <Button
                              size="sm"
                              variant="outline-primary"
                              onClick={() => handleEdit(items.indexOf(item))}
                              disabled={deletingId === item.id}
                            >
                              Edit
                            </Button>

                            <Button
                              size="sm"
                              variant="outline-danger"
                              onClick={() => handleDelete(items.indexOf(item))}
                              disabled={deletingId === item.id}
                            >
                              {deletingId === item.id ? (
                                <Spinner
                                  animation="border"
                                  size="sm"
                                  aria-label="Deleting"
                                />
                              ) : (
                                "Delete"
                              )}
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </Table>
            </div>

            <div
              className="d-flex flex-wrap justify-content-between align-items-center gap-2 px-3 px-lg-4 py-3"
              style={{
                borderTop: "1px solid #e8edf5",
                background: "#fcfdff",
                borderRadius: "0 0 14px 14px",
              }}
            >
              <small className="text-muted">
                Catalog records: {items.length}
              </small>

              <small className="text-muted">
                {searchTerm
                  ? `Filtered results: ${filteredItems.length}`
                  : "All products displayed"}
              </small>
            </div>
          </Card.Body>
        </Card>
      </div>

      {/* Add/Edit Product Modal */}
      <Modal
        show={showModal}
        onHide={closeModal}
        centered
        scrollable
        size="lg"
        dialogClassName="catalog-modal"
      >
        <Modal.Header closeButton>
          <div>
            <Modal.Title className="fw-bold">
              {editingIndex !== null ? "Edit Catalog Item" : "Add New Item"}
            </Modal.Title>

            <div className="small mt-1" style={{ color: "#dbeafe" }}>
              {editingIndex !== null
                ? "Update the product information below."
                : "Enter the product details to add it to your catalog."}
            </div>
          </div>
        </Modal.Header>

        <Modal.Body className="p-4">
          {error && (
            <Alert
              variant="danger"
              dismissible
              onClose={() => setError("")}
            >
              {error}
            </Alert>
          )}

          <Form onSubmit={handleSubmit}>
            {/* Product image section */}
            <div className="catalog-section-label">
              Product Image
            </div>

            <div
              className="p-3 mb-4 text-center"
              style={{
                background: "#f8fafc",
                border: "1px dashed #cbd5e1",
                borderRadius: "12px",
              }}
            >
              {preview ? (
                <Image
                  src={preview}
                  alt="Product preview"
                  rounded
                  fluid
                  style={{
                    maxHeight: "220px",
                    maxWidth: "100%",
                    objectFit: "contain",
                    marginBottom: "14px",
                  }}
                />
              ) : (
                <div className="py-3">
                  <div
                    style={{
                      fontSize: "40px",
                      color: "#94a3b8",
                      marginBottom: "8px",
                    }}
                  >
                    ◇
                  </div>

                  <div className="fw-semibold">No image selected</div>

                  <div className="text-muted small mt-1">
                    Upload a clear product photo, up to 5 MB.
                  </div>
                </div>
              )}

              <Form.Group>
                <Form.Label className="d-block fw-semibold small">
                  {preview ? "Change Product Photo" : "Choose Product Photo"}
                </Form.Label>

                <Form.Control
                  className="catalog-input"
                  type="file"
                  accept="image/*"
                  onChange={handleFile}
                />

                <Form.Text className="text-muted">
                  Supported formats depend on your browser and backend.
                </Form.Text>
              </Form.Group>
            </div>

            {/* Product information */}
            <div className="catalog-section-label">
              Product Information
            </div>

            <Row className="g-3">
              <Col md={6}>
                <Form.Group>
                  <Form.Label className="fw-semibold">
                    Product Name <span className="text-danger">*</span>
                  </Form.Label>

                  <Form.Control
                    className="catalog-input"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="e.g. Modern Sofa Set"
                    maxLength={150}
                    required
                  />
                </Form.Group>
              </Col>

              <Col md={6}>
                <Form.Group>
                  <Form.Label className="fw-semibold">
                    Category <span className="text-danger">*</span>
                  </Form.Label>

                  <Form.Control
                    className="catalog-input"
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    placeholder="e.g. Living Room"
                    maxLength={100}
                    required
                  />
                </Form.Group>
              </Col>

              <Col xs={12}>
                <Form.Group>
                  <Form.Label className="fw-semibold">
                    Description <span className="text-danger">*</span>
                  </Form.Label>

                  <Form.Control
                    className="catalog-input"
                    as="textarea"
                    rows={4}
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    placeholder="Describe the product, its features, materials, and dimensions..."
                    maxLength={2000}
                    required
                  />

                  <Form.Text className="text-muted">
                    {formData.description.length}/2000 characters
                  </Form.Text>
                </Form.Group>
              </Col>

              <Col xs={12}>
                <Form.Group>
                  <Form.Label className="fw-semibold">
                    Selling Price (KSh){" "}
                    <span className="text-danger">*</span>
                  </Form.Label>

                  <InputGroup>
                    <InputGroup.Text
                      style={{
                        background: "#f8fafc",
                        fontWeight: 700,
                      }}
                    >
                      KSh
                    </InputGroup.Text>

                    <Form.Control
                      className="catalog-input"
                      type="number"
                      min="0"
                      step="0.01"
                      name="price"
                      value={formData.price}
                      onChange={handleChange}
                      placeholder="0.00"
                      required
                    />
                  </InputGroup>

                  <Form.Text className="text-muted">
                    Enter the selling price in Kenyan shillings.
                  </Form.Text>
                </Form.Group>
              </Col>
            </Row>

            {/* Form actions */}
            <div
              className="d-flex flex-wrap justify-content-end gap-2 mt-4 pt-3"
              style={{ borderTop: "1px solid #e2e8f0" }}
            >
              <Button
                variant="light"
                onClick={closeModal}
                disabled={saving}
                className="px-4"
              >
                Cancel
              </Button>

              <Button
                type="submit"
                className="catalog-primary px-4"
                disabled={saving}
              >
                {saving ? (
                  <>
                    <Spinner
                      animation="border"
                      size="sm"
                      className="me-2"
                    />
                    Saving...
                  </>
                ) : editingIndex !== null ? (
                  "Save Changes"
                ) : (
                  "Add Catalog Item"
                )}
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default CatalogPage;
