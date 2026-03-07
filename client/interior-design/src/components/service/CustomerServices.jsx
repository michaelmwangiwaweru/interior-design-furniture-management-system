import React, { useState, useEffect } from "react";
import { Table, Form, Button, Modal } from "react-bootstrap";
import jsPDF from "jspdf";
import "jspdf-autotable";
import * as XLSX from "xlsx";

const API_URL = "http://localhost:9193/api/customer-services";

const CustomerServices = () => {
  const [services, setServices] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingIndex, setEditingIndex] = useState(null);
  const [formData, setFormData] = useState({
    customerName: "",
    contact: "",
    date: "",
    time: "",
    inquiry: "",
    feedback: "",
  });

  // Fetch services
  useEffect(() => {
    fetch(API_URL)
      .then((res) => res.json())
      .then((data) => setServices(data))
      .catch((err) => console.error(err));
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (editingIndex !== null) {
      const serviceId = services[editingIndex].id;
      const res = await fetch(`${API_URL}/${serviceId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const updatedService = await res.json();
      setServices((prev) =>
        prev.map((s, i) => (i === editingIndex ? updatedService : s))
      );
      setEditingIndex(null);
    } else {
      const res = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const newService = await res.json();
      setServices((prev) => [...prev, newService]);
    }

    setFormData({
      customerName: "",
      contact: "",
      date: "",
      time: "",
      inquiry: "",
      feedback: "",
    });
    setShowModal(false);
  };

  const handleEdit = (index) => {
    setFormData(services[index]);
    setEditingIndex(index);
    setShowModal(true);
  };

  const handleDelete = async (index) => {
    const serviceId = services[index].id;
    if (window.confirm("Are you sure you want to delete this service?")) {
      await fetch(`${API_URL}/${serviceId}`, { method: "DELETE" });
      setServices((prev) => prev.filter((_, i) => i !== index));
    }
  };

  // Export PDF
  const exportPDF = () => {
    const doc = new jsPDF();
    doc.text("Customer Services", 14, 20);
    const tableColumn = [
      "#",
      "Customer Name",
      "Contact",
      "Date",
      "Time",
      "Inquiry",
      "Feedback",
    ];
    const tableRows = services.map((service, index) => [
      index + 1,
      service.customerName,
      service.contact,
      service.date,
      service.time,
      service.inquiry,
      service.feedback,
    ]);
    doc.autoTable(tableColumn, tableRows, { startY: 25 });
    doc.save("customer_services.pdf");
  };

  // Export Excel
  const exportExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(
      services.map((service, index) => ({
        "#": index + 1,
        "Customer Name": service.customerName,
        Contact: service.contact,
        Date: service.date,
        Time: service.time,
        Inquiry: service.inquiry,
        Feedback: service.feedback,
      }))
    );
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "CustomerServices");
    XLSX.writeFile(workbook, "customer_services.xlsx");
  };

  return (
    <div className="container mt-4">
      <h3>Customer Services</h3>

      <div className="mb-3">
        <Button variant="primary" className="me-2" onClick={() => setShowModal(true)}>
          Add Service
        </Button>
        <Button variant="success" className="me-2" onClick={exportPDF}>
          Export PDF
        </Button>
        <Button variant="info" onClick={exportExcel}>
          Export Excel
        </Button>
      </div>

      <Table striped bordered hover>
        <thead>
          <tr>
            <th>#</th>
            <th>Customer Name</th>
            <th>Contact</th>
            <th>Date</th>
            <th>Time</th>
            <th>Inquiry</th>
            <th>Feedback</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {services.length === 0 ? (
            <tr>
              <td colSpan="8" className="text-center">
                No services added.
              </td>
            </tr>
          ) : (
            services.map((service, index) => (
              <tr key={service.id}>
                <td>{index + 1}</td>
                <td>{service.customerName}</td>
                <td>{service.contact}</td>
                <td>{service.date}</td>
                <td>{service.time}</td>
                <td>{service.inquiry}</td>
                <td>{service.feedback}</td>
                <td>
                  <Button
                    variant="warning"
                    size="sm"
                    className="me-2"
                    onClick={() => handleEdit(index)}
                  >
                    Edit
                  </Button>
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => handleDelete(index)}
                  >
                    Delete
                  </Button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </Table>

      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>
            {editingIndex !== null ? "Edit Service" : "Add Service"}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-2">
              <Form.Label>Customer Name</Form.Label>
              <Form.Control
                type="text"
                name="customerName"
                value={formData.customerName}
                onChange={handleChange}
                required
              />
            </Form.Group>

            <Form.Group className="mb-2">
              <Form.Label>Contact</Form.Label>
              <Form.Control
                type="text"
                name="contact"
                value={formData.contact}
                onChange={handleChange}
              />
            </Form.Group>

            <Form.Group className="mb-2">
              <Form.Label>Date</Form.Label>
              <Form.Control
                type="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
              />
            </Form.Group>

            <Form.Group className="mb-2">
              <Form.Label>Time</Form.Label>
              <Form.Control
                type="time"
                name="time"
                value={formData.time}
                onChange={handleChange}
              />
            </Form.Group>

            <Form.Group className="mb-2">
              <Form.Label>Inquiry</Form.Label>
              <Form.Control
                as="textarea"
                rows={2}
                name="inquiry"
                value={formData.inquiry}
                onChange={handleChange}
              />
            </Form.Group>

            <Form.Group className="mb-2">
              <Form.Label>Feedback</Form.Label>
              <Form.Control
                as="textarea"
                rows={2}
                name="feedback"
                value={formData.feedback}
                onChange={handleChange}
              />
            </Form.Group>

            <Button type="submit" variant="success" className="mt-2">
              {editingIndex !== null ? "Update" : "Add"}
            </Button>
          </Form>
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default CustomerServices; 
