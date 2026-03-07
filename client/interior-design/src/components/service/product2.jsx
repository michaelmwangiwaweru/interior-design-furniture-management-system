import React, { useState, useEffect } from "react";
import { Table, Form, Button, Modal } from "react-bootstrap";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";

const API_URL = "http://localhost:9193/api/products";

const Products = () => {
  const [products, setProducts] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingIndex, setEditingIndex] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    category: "",
    price: "",
    description: "",
    photo: "",
  });
  const [preview, setPreview] = useState(null); // For image preview

  const [filter, setFilter] = useState({ name: "", category: "" });

  useEffect(() => {
    fetch(API_URL)
      .then((res) => res.json())
      .then((data) => setProducts(data))
      .catch((err) => console.error(err));
  }, []);

  // Convert file to base64
  const toBase64 = (file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });

  const handleChange = async (e) => {
    const { name, value, files } = e.target;
    if (name === "photo" && files.length > 0) {
      const file = files[0];
      const base64 = await toBase64(file);
      setFormData((prev) => ({ ...prev, photo: base64 }));
      setPreview(base64);
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingIndex !== null) {
        const productId = products[editingIndex].id;
        const res = await fetch(`${API_URL}/${productId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });
        const updatedProduct = await res.json();
        setProducts((prev) =>
          prev.map((p, i) => (i === editingIndex ? updatedProduct : p))
        );
        setEditingIndex(null);
      } else {
        const res = await fetch(API_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });
        const newProduct = await res.json();
        setProducts((prev) => [...prev, newProduct]);
      }

      setFormData({ name: "", category: "", price: "", description: "", photo: "" });
      setPreview(null);
      setShowModal(false);
    } catch (err) {
      console.error("Save error:", err);
    }
  };

  const handleEdit = (index) => {
    const product = products[index];
    setFormData({
      name: product.name,
      category: product.category,
      price: product.price,
      description: product.description,
      photo: product.photo,
    });
    setPreview(product.photo || null);
    setEditingIndex(index);
    setShowModal(true);
  };

  const handleDelete = async (index) => {
    if (!window.confirm("Are you sure?")) return;
    try {
      const productId = products[index].id;
      await fetch(`${API_URL}/${productId}`, { method: "DELETE" });
      setProducts((prev) => prev.filter((_, i) => i !== index));
    } catch (err) {
      console.error("Delete error:", err);
    }
  };

  const downloadPDF = () => {
    const doc = new jsPDF();
    doc.text("Products Report", 14, 10);
    autoTable(doc, {
      head: [["#", "Name", "Category", "Price", "Description"]],
      body: filteredProducts.map((p, i) => [i + 1, p.name, p.category, p.price, p.description]),
      startY: 20,
    });
    doc.save("products_report.pdf");
  };

  const downloadExcel = () => {
    const sheet = XLSX.utils.json_to_sheet(filteredProducts);
    const book = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(book, sheet, "Products");
    XLSX.writeFile(book, "products_report.xlsx");
  };

  const filteredProducts = products.filter(
    (p) =>
      (!filter.name || p.name.toLowerCase().includes(filter.name.toLowerCase())) &&
      (!filter.category || p.category.toLowerCase().includes(filter.category.toLowerCase()))
  );

  return (
    <div className="container mt-4">
      <h3>Products</h3>

      <Button variant="primary" onClick={() => { setShowModal(true); setEditingIndex(null); setFormData({ name: "", category: "", price: "", description: "", photo: "" }); setPreview(null); }} className="me-2">
        Add Product
      </Button>
      <Button variant="success" className="me-2" onClick={downloadPDF}>Download PDF</Button>
      <Button variant="info" onClick={downloadExcel}>Download Excel</Button>

      {/* Filters */}
      <div className="mb-3 mt-3">
        <Form className="d-flex gap-2 flex-wrap">
          <Form.Control
            type="text"
            placeholder="Filter by Name"
            value={filter.name}
            onChange={(e) => setFilter({ ...filter, name: e.target.value })}
          />
          <Form.Control
            type="text"
            placeholder="Filter by Category"
            value={filter.category}
            onChange={(e) => setFilter({ ...filter, category: e.target.value })}
          />
          <Button variant="secondary" onClick={() => setFilter({ name: "", category: "" })}>Clear</Button>
        </Form>
      </div>

      <Table striped bordered hover className="mt-3">
        <thead>
          <tr>
            <th>#</th><th>Name</th><th>Category</th><th>Price</th><th>Description</th><th>Photo</th><th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredProducts.length === 0 ? (
            <tr><td colSpan="7" className="text-center">No products found.</td></tr>
          ) : (
            filteredProducts.map((p, index) => (
              <tr key={p.id || index}>
                <td>{index + 1}</td>
                <td>{p.name}</td>
                <td>{p.category}</td>
                <td>{p.price}</td>
                <td>{p.description}</td>
                <td>{p.photo ? <img src={p.photo} alt={p.name} style={{ width: "50px", height: "50px", objectFit: "cover" }} /> : "No Photo"}</td>
                <td>
                  <Button variant="warning" size="sm" className="me-2" onClick={() => handleEdit(index)}>Edit</Button>
                  <Button variant="danger" size="sm" onClick={() => handleDelete(index)}>Delete</Button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </Table>

      {/* Modal Form */}
      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>{editingIndex !== null ? "Edit Product" : "Add Product"}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleSubmit}>
            {[
              ["Name", "name", "text"],
              ["Category", "category", "text"],
              ["Price", "price", "number"],
              ["Description", "description", "text"]
            ].map(([label, name, type]) => (
              <Form.Group className="mb-2" key={name}>
                <Form.Label>{label}</Form.Label>
                <Form.Control type={type} name={name} value={formData[name]} onChange={handleChange} required />
              </Form.Group>
            ))}

            <Form.Group className="mb-2">
              <Form.Label>Photo</Form.Label>
              <Form.Control type="file" name="photo" onChange={handleChange} />
              {preview && <div className="mt-2"><img src={preview} alt="Preview" style={{ width: "100px", height: "100px", objectFit: "cover" }} /></div>}
            </Form.Group>

            <Button type="submit" variant="success" className="mt-2">{editingIndex !== null ? "Update" : "Add"}</Button>
          </Form>
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default Products;
