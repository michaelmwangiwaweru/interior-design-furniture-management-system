// src/components/service/CatalogPage.jsx (or your exact path)
import React, { useState, useEffect } from "react";
import { Table, Form, Button, Modal, Image } from "react-bootstrap";

const API_URL = "http://localhost:9193/api/catalog";

const CatalogPage = () => {
  const [items, setItems] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingIndex, setEditingIndex] = useState(null);
  const [photoFile, setPhotoFile] = useState(null);
  const [preview, setPreview] = useState(null);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    category: "",
  });

  const loadItems = async () => {
    try {
      const res = await fetch(API_URL);
      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`HTTP ${res.status}: ${errorText.substring(0, 200)}`);
      }
      const data = await res.json();

      // Defensive check: ensure data is an array
      if (!Array.isArray(data)) {
        console.error("Backend returned non-array data:", data);
        setItems([]);
        alert("Catalog data is invalid (not an array). Check backend response.");
        return;
      }

      setItems(data);
    } catch (err) {
      console.error("Failed to load catalog:", err);
      setItems([]); // Prevent crash
      alert(`Failed to load catalog items: ${err.message}`);
    }
  };

  useEffect(() => {
    loadItems();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFile = (e) => {
    const file = e.target.files[0];
    setPhotoFile(file);
    if (file) {
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const fd = new FormData();
    fd.append("name", formData.name);
    fd.append("description", formData.description);
    fd.append("price", formData.price);
    fd.append("category", formData.category);
    if (photoFile) fd.append("photo", photoFile);

    const url = editingIndex !== null ? `${API_URL}/${items[editingIndex].id}` : API_URL;
    const method = editingIndex !== null ? "PUT" : "POST";

    try {
      const res = await fetch(url, {
        method,
        body: fd,
      });

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`HTTP ${res.status}: ${errorText}`);
      }

      closeModal();
      loadItems();
    } catch (err) {
      alert("Submit error: " + err.message);
    }
  };

  const handleEdit = (index) => {
    const item = items[index];
    setFormData({
      name: item.name || "",
      description: item.description || "",
      price: item.price || "",
      category: item.category || "",
    });
    setEditingIndex(index);
    setPhotoFile(null);
    setPreview(item.photo ? `data:image/jpeg;base64,${item.photo}` : null);
    setShowModal(true);
  };

  const handleDelete = async (index) => {
    if (!window.confirm("Are you sure you want to delete this item?")) return;

    const id = items[index].id;
    try {
      const res = await fetch(`${API_URL}/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Delete failed");
      loadItems();
    } catch (err) {
      alert("Delete failed: " + err.message);
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingIndex(null);
    setPhotoFile(null);
    setPreview(null);
    setFormData({ name: "", description: "", price: "", category: "" });
  };

  return (
    <div className="container mt-4">
      <h3>Catalog Management</h3>
      <Button variant="primary" onClick={() => setShowModal(true)} className="mb-3">
        Add New Item
      </Button>

      <Table striped bordered hover responsive>
        <thead>
          <tr>
            <th>#</th>
            <th>Photo</th>
            <th>Name</th>
            <th>Description</th>
            <th>Price</th>
            <th>Category</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {!Array.isArray(items) || items.length === 0 ? (
            <tr>
              <td colSpan="7" className="text-center">
                {items.length === 0 ? "No items yet" : "Loading or error..."}
              </td>
            </tr>
          ) : (
            items.map((item, i) => (
              <tr key={item.id || i}>
                <td>{i + 1}</td>
                <td>
                  {item.photo && (
                    <Image
                      src={`data:image/jpeg;base64,${item.photo}`}
                      width={80}
                      thumbnail
                      alt={item.name}
                    />
                  )}
                </td>
                <td>{item.name}</td>
                <td>{item.description}</td>
                <td>${Number(item.price).toFixed(2)}</td>
                <td>{item.category}</td>
                <td>
                  <Button size="sm" variant="warning" onClick={() => handleEdit(i)} className="me-2">
                    Edit
                  </Button>
                  <Button size="sm" variant="danger" onClick={() => handleDelete(i)}>
                    Delete
                  </Button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </Table>

      <Modal show={showModal} onHide={closeModal}>
        <Modal.Header closeButton>
          <Modal.Title>{editingIndex !== null ? "Edit" : "Add"} Item</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>Photo</Form.Label>
              <Form.Control type="file" accept="image/*" onChange={handleFile} />
              {preview && (
                <Image src={preview} width={200} className="mt-3 d-block" rounded alt="Preview" />
              )}
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Name</Form.Label>
              <Form.Control name="name" value={formData.name} onChange={handleChange} required />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Description</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                name="description"
                value={formData.description}
                onChange={handleChange}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Price</Form.Label>
              <Form.Control
                type="number"
                step="0.01"
                name="price"
                value={formData.price}
                onChange={handleChange}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Category</Form.Label>
              <Form.Control name="category" value={formData.category} onChange={handleChange} required />
            </Form.Group>

            <div className="d-flex gap-2">
              <Button variant="success" type="submit">
                {editingIndex !== null ? "Update" : "Add"} Item
              </Button>
              <Button variant="secondary" onClick={closeModal}>
                Cancel
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default CatalogPage;