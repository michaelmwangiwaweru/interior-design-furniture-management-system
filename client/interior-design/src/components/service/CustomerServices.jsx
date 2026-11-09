
import React, { useState, useEffect } from "react";
import { Table, Form, Button, Modal, Row, Col } from "react-bootstrap";
import jsPDF from "jspdf";
import "jspdf-autotable";
import * as XLSX from "xlsx";
import "./CustomerServices.css";

const API_URL = "http://localhost:9193/api/customer-services";
const RECORDS_PER_PAGE = 10;

const CustomerServices = () => {
  const [services, setServices] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingIndex, setEditingIndex] = useState(null);

  // Search and pagination state
  const [searchName, setSearchName] = useState("");
  const [searchContact, setSearchContact] = useState("");
  const [searchDate, setSearchDate] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

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

  // Find the original record index so editing/deleting still works
  // correctly when search and pagination are active.
  const handleEdit = (service) => {
    const originalIndex = services.findIndex(
      (item) => item.id === service.id
    );

    setFormData({ ...service });
    setEditingIndex(originalIndex);
    setShowModal(true);
  };

  const handleDelete = async (service) => {
    const originalIndex = services.findIndex(
      (item) => item.id === service.id
    );

    const serviceId = service.id;

    if (window.confirm("Are you sure you want to delete this service?")) {
      await fetch(`${API_URL}/${serviceId}`, { method: "DELETE" });

      setServices((prev) => prev.filter((_, i) => i !== originalIndex));
    }
  };

  // Search by customer name, contact, and exact date
  const filteredServices = services.filter((service) => {
    const nameMatches = (service.customerName || "")
      .toLowerCase()
      .includes(searchName.trim().toLowerCase());

    const contactMatches = (service.contact || "")
      .toLowerCase()
      .includes(searchContact.trim().toLowerCase());

    const dateMatches =
      !searchDate || (service.date || "").slice(0, 10) === searchDate;

    return nameMatches && contactMatches && dateMatches;
  });

  // Pagination calculations
  const totalPages = Math.ceil(
    filteredServices.length / RECORDS_PER_PAGE
  );

  const startIndex = (currentPage - 1) * RECORDS_PER_PAGE;

  const paginatedServices = filteredServices.slice(
    startIndex,
    startIndex + RECORDS_PER_PAGE
  );

  // Keep the page valid when records are searched or deleted
  useEffect(() => {
    if (currentPage > Math.max(1, totalPages)) {
      setCurrentPage(Math.max(1, totalPages));
    }
  }, [currentPage, totalPages]);

  const handleSearchChange = (setter) => (e) => {
    setter(e.target.value);
    setCurrentPage(1);
  };

  const clearSearch = () => {
    setSearchName("");
    setSearchContact("");
    setSearchDate("");
    setCurrentPage(1);
  };

  // Export PDF - exports all records, not just the current page
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

  // Export Excel - exports all records, not just the current page
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

    XLSX.utils.book_append_sheet(
      workbook,
      worksheet,
      "CustomerServices"
    );

    XLSX.writeFile(workbook, "customer_services.xlsx");
  };

  return (
    <div className="customer-services-page">
      <div className="customer-services-container">

        {/* Page heading */}
        <div className="customer-services-heading">
          <div>
            <span className="customer-services-eyebrow">
              CUSTOMER RELATIONS
            </span>

            <h2>Customer Services</h2>

            <p>
              Manage customer inquiries, service records and feedback
              from one place.
            </p>
          </div>

          <Button
            variant="primary"
            className="add-service-btn"
            onClick={() => {
              setFormData({
                customerName: "",
                contact: "",
                date: "",
                time: "",
                inquiry: "",
                feedback: "",
              });
              setEditingIndex(null);
              setShowModal(true);
            }}
          >
            <span className="button-plus">+</span> Add Service
          </Button>
        </div>

        {/* Summary and export actions */}
        <div className="customer-services-toolbar">
          <div className="service-count-card">
            <div className="service-count-icon">CS</div>

            <div>
              <span className="service-count-label">Total records</span>
              <h4>{services.length}</h4>
            </div>
          </div>

          <div className="service-export-actions">
            <Button
              variant="outline-danger"
              className="service-action-btn"
              onClick={exportPDF}
            >
              Export PDF
            </Button>

            <Button
              variant="outline-success"
              className="service-action-btn"
              onClick={exportExcel}
            >
              Export Excel
            </Button>
          </div>
        </div>

        {/* Services table */}
        <div className="customer-services-card">
          <div className="services-card-heading">
            <div>
              <h5>Service Records</h5>
              <p>View and manage recorded customer interactions.</p>
            </div>
          </div>

          {/* Search filters */}
          <div className="customer-services-filters">
            <Row className="g-3 align-items-end">
              <Col xs={12} md={4}>
                <Form.Group>
                  <Form.Label>Search customer name</Form.Label>
                  <Form.Control
                    type="search"
                    placeholder="Enter customer name..."
                    value={searchName}
                    onChange={handleSearchChange(setSearchName)}
                  />
                </Form.Group>
              </Col>

              <Col xs={12} md={4}>
                <Form.Group>
                  <Form.Label>Search contact</Form.Label>
                  <Form.Control
                    type="search"
                    placeholder="Enter phone or contact..."
                    value={searchContact}
                    onChange={handleSearchChange(setSearchContact)}
                  />
                </Form.Group>
              </Col>

              <Col xs={12} md={3}>
                <Form.Group>
                  <Form.Label>Filter by date</Form.Label>
                  <Form.Control
                    type="date"
                    value={searchDate}
                    onChange={handleSearchChange(setSearchDate)}
                  />
                </Form.Group>
              </Col>

              <Col xs={12} md={1}>
                <Button
                  variant="outline-secondary"
                  className="clear-service-filters"
                  onClick={clearSearch}
                  title="Clear all filters"
                >
                  Clear
                </Button>
              </Col>
            </Row>
          </div>

          <div className="customer-services-results">
            Showing{" "}
            {filteredServices.length === 0 ? 0 : startIndex + 1}
            {"–"}
            {Math.min(startIndex + RECORDS_PER_PAGE, filteredServices.length)}
            {" of "}
            {filteredServices.length} matching records
          </div>

          <div className="table-responsive customer-services-table-wrap">
            <Table hover className="customer-services-table align-middle mb-0">
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
                    <td colSpan="8" className="empty-services">
                      <div className="empty-services-icon">CS</div>
                      <h6>No service records yet</h6>
                      <p>
                        Customer service records will appear here when
                        they are added.
                      </p>
                    </td>
                  </tr>
                ) : filteredServices.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="empty-services">
                      <div className="empty-services-icon">CS</div>
                      <h6>No matching records</h6>
                      <p>
                        Try another name, contact, or date, or clear
                        your search filters.
                      </p>
                    </td>
                  </tr>
                ) : (
                  paginatedServices.map((service, index) => (
                    <tr key={service.id}>
                      <td className="service-row-number">
                        {startIndex + index + 1}
                      </td>

                      <td className="service-customer-name">
                        {service.customerName}
                      </td>

                      <td>{service.contact}</td>
                      <td>{service.date}</td>
                      <td>{service.time}</td>

                      <td className="service-text-cell">
                        {service.inquiry}
                      </td>

                      <td className="service-text-cell">
                        {service.feedback}
                      </td>

                      <td>
                        <div className="service-row-actions">
                          <Button
                            variant="outline-primary"
                            size="sm"
                            className="service-edit-btn"
                            onClick={() => handleEdit(service)}
                          >
                            Edit
                          </Button>

                          <Button
                            variant="outline-danger"
                            size="sm"
                            className="service-delete-btn"
                            onClick={() => handleDelete(service)}
                          >
                            Delete
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </Table>
          </div>

          {/* Pagination controls */}
          {filteredServices.length > 0 && (
            <div className="customer-services-pagination">
              <span className="pagination-page-info">
                Page {currentPage} of {Math.max(1, totalPages)}
              </span>

              <div className="pagination-buttons">
                <Button
                  variant="outline-secondary"
                  size="sm"
                  disabled={currentPage === 1}
                  onClick={() =>
                    setCurrentPage((page) => Math.max(1, page - 1))
                  }
                >
                  Previous
                </Button>

                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter(
                    (page) =>
                      page === 1 ||
                      page === totalPages ||
                      Math.abs(page - currentPage) <= 1
                  )
                  .reduce((pages, page, index, array) => {
                    if (index > 0 && page - array[index - 1] > 1) {
                      pages.push("...");
                    }
                    pages.push(page);
                    return pages;
                  }, [])
                  .map((page, index) =>
                    page === "..." ? (
                      <span key={`ellipsis-${index}`} className="pagination-ellipsis">
                        …
                      </span>
                    ) : (
                      <Button
                        key={page}
                        variant={
                          currentPage === page ? "primary" : "outline-secondary"
                        }
                        size="sm"
                        onClick={() => setCurrentPage(page)}
                        aria-current={currentPage === page ? "page" : undefined}
                      >
                        {page}
                      </Button>
                    )
                  )}

                <Button
                  variant="outline-secondary"
                  size="sm"
                  disabled={currentPage >= totalPages}
                  onClick={() =>
                    setCurrentPage((page) =>
                      Math.min(totalPages, page + 1)
                    )
                  }
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Add/Edit modal */}
      <Modal
        show={showModal}
        onHide={() => setShowModal(false)}
        centered
        scrollable
        size="lg"
        dialogClassName="customer-service-modal"
      >
        <Modal.Header closeButton className="service-modal-header">
          <div>
            <span className="customer-services-eyebrow">
              CUSTOMER RELATIONS
            </span>

            <Modal.Title>
              {editingIndex !== null ? "Edit Service" : "Add Service"}
            </Modal.Title>

            <p className="service-modal-subtitle">
              Enter the customer details and service information below.
            </p>
          </div>
        </Modal.Header>

        <Modal.Body className="service-modal-body">
          <Form onSubmit={handleSubmit}>
            <Row className="g-3">
              <Col xs={12} md={6}>
                <Form.Group>
                  <Form.Label>Customer Name</Form.Label>
                  <Form.Control
                    type="text"
                    name="customerName"
                    placeholder="Enter customer name"
                    value={formData.customerName}
                    onChange={handleChange}
                    required
                    autoComplete="name"
                  />
                </Form.Group>
              </Col>

              <Col xs={12} md={6}>
                <Form.Group>
                  <Form.Label>Contact</Form.Label>
                  <Form.Control
                    type="text"
                    name="contact"
                    placeholder="Enter phone number or contact"
                    value={formData.contact}
                    onChange={handleChange}
                    autoComplete="tel"
                  />
                </Form.Group>
              </Col>

              <Col xs={12} sm={6}>
                <Form.Group>
                  <Form.Label>Date</Form.Label>
                  <Form.Control
                    type="date"
                    name="date"
                    value={formData.date}
                    onChange={handleChange}
                  />
                </Form.Group>
              </Col>

              <Col xs={12} sm={6}>
                <Form.Group>
                  <Form.Label>Time</Form.Label>
                  <Form.Control
                    type="time"
                    name="time"
                    value={formData.time}
                    onChange={handleChange}
                  />
                </Form.Group>
              </Col>

              <Col xs={12}>
                <Form.Group>
                  <Form.Label>Customer Inquiry</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    name="inquiry"
                    placeholder="Describe the customer's inquiry..."
                    value={formData.inquiry}
                    onChange={handleChange}
                  />
                </Form.Group>
              </Col>

              <Col xs={12}>
                <Form.Group>
                  <Form.Label>Feedback / Resolution</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    name="feedback"
                    placeholder="Record feedback or action taken..."
                    value={formData.feedback}
                    onChange={handleChange}
                  />
                </Form.Group>
              </Col>
            </Row>

            <div className="service-modal-footer">
              <Button
                variant="light"
                className="service-cancel-btn"
                onClick={() => setShowModal(false)}
              >
                Cancel
              </Button>

              <Button
                type="submit"
                variant="primary"
                className="service-submit-btn"
              >
                {editingIndex !== null ? "Update Service" : "Save Service"}
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default CustomerServices;
