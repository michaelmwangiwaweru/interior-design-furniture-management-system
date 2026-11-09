
import React, { useState, useEffect } from "react";
import {
  Table,
  Form,
  Button,
  Modal,
  Row,
  Col,
  InputGroup,
} from "react-bootstrap";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";

const API_URL = "http://localhost:9193/api/sales";

const initialFormData = {
  customerName: "",
  date: "",
  itemSold: "",
  quantity: "",
  unitPrice: "",
  totalPrice: "",
  paymentStatus: "",
  salesPerson: "",
  delivered: "",
  receiptNo: "",
  phoneNo: "",
};

const initialFilters = {
  receiptNo: "",
  customerName: "",
  date: "",
  phoneNo: "",
};

const Sales = () => {
  const [sales, setSales] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingIndex, setEditingIndex] = useState(null);
  const [saving, setSaving] = useState(false);

  // View sale modal
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedSale, setSelectedSale] = useState(null);

  const [formData, setFormData] = useState({ ...initialFormData });
  const [filter, setFilter] = useState({ ...initialFilters });

  // Load sales records
  useEffect(() => {
    fetch(API_URL)
      .then((res) => {
        if (!res.ok) throw new Error("Unable to load sales records.");
        return res.json();
      })
      .then((data) => setSales(data))
      .catch((err) => console.error("Sales loading error:", err));
  }, []);

  // Automatically calculate the total price
  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => {
      const updated = { ...prev, [name]: value };

      if (name === "quantity" || name === "unitPrice") {
        const quantity = Number(
          name === "quantity" ? value : prev.quantity
        );

        const unitPrice = Number(
          name === "unitPrice" ? value : prev.unitPrice
        );

        updated.totalPrice =
          value !== "" &&
          (name === "quantity"
            ? prev.unitPrice !== ""
            : prev.quantity !== "")
            ? quantity * unitPrice
            : "";
      }

      return updated;
    });
  };

  // Open a clean form for a new sale
  const handleAdd = () => {
    setEditingIndex(null);
    setFormData({ ...initialFormData });
    setShowModal(true);
  };

  // Add or update a sale
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      const isEditing = editingIndex !== null;
      const saleId = isEditing ? sales[editingIndex].id : null;

      const response = await fetch(
        isEditing ? `${API_URL}/${saleId}` : API_URL,
        {
          method: isEditing ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        }
      );

      if (!response.ok) {
        throw new Error("Unable to save the sale. Please try again.");
      }

      const savedSale = await response.json();

      if (isEditing) {
        setSales((prev) =>
          prev.map((sale, index) =>
            index === editingIndex ? savedSale : sale
          )
        );
      } else {
        setSales((prev) => [...prev, savedSale]);
      }

      setFormData({ ...initialFormData });
      setEditingIndex(null);
      setShowModal(false);
    } catch (err) {
      console.error("Save error:", err);
      window.alert(err.message || "An error occurred while saving.");
    } finally {
      setSaving(false);
    }
  };

  // Edit a sale using its original array index
  const handleEdit = (index) => {
    setFormData({ ...initialFormData, ...sales[index] });
    setEditingIndex(index);
    setShowModal(true);
  };

  // View a sale
  const handleView = (sale) => {
    setSelectedSale(sale);
    setShowViewModal(true);
  };

  // Print the selected sale
  const handlePrintSale = () => {
    window.print();
  };

  // Delete a sale
  const handleDelete = async (index) => {
    if (!window.confirm("Are you sure you want to delete this sale?")) {
      return;
    }

    try {
      const saleId = sales[index].id;

      const response = await fetch(`${API_URL}/${saleId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Unable to delete this sale.");
      }

      setSales((prev) => prev.filter((sale) => sale.id !== saleId));

      if (selectedSale?.id === saleId) {
        setShowViewModal(false);
        setSelectedSale(null);
      }
    } catch (err) {
      console.error("Delete error:", err);
      window.alert(err.message || "An error occurred while deleting.");
    }
  };

  // Update search filters
  const handleFilterChange = (e) => {
    const { name, value } = e.target;

    setFilter((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Filter by receipt, customer, date and phone/contact
  const filteredSales = sales.filter((sale) => {
    const receipt = String(sale.receiptNo ?? "").toLowerCase();
    const customer = String(sale.customerName ?? "").toLowerCase();
    const contact = String(sale.phoneNo ?? "").toLowerCase();

    return (
      (!filter.receiptNo ||
        receipt.includes(filter.receiptNo.toLowerCase())) &&
      (!filter.customerName ||
        customer.includes(filter.customerName.toLowerCase())) &&
      (!filter.phoneNo ||
        contact.includes(filter.phoneNo.toLowerCase())) &&
      (!filter.date || sale.date === filter.date)
    );
  });

  // Export the currently filtered sales to PDF
  const downloadPDF = () => {
    const doc = new jsPDF("landscape");

    doc.setFontSize(18);
    doc.text("Sales Report", 14, 15);

    doc.setFontSize(10);
    doc.text(`Records: ${filteredSales.length}`, 14, 22);

    autoTable(doc, {
      head: [
        [
          "#",
          "Receipt No",
          "Phone No",
          "Customer",
          "Date",
          "Item",
          "Qty",
          "Unit Price",
          "Total",
          "Payment",
          "Sales Person",
          "Delivered",
        ],
      ],
      body: filteredSales.map((sale, index) => [
        index + 1,
        sale.receiptNo || "",
        sale.phoneNo || "",
        sale.customerName || "",
        sale.date || "",
        sale.itemSold || "",
        sale.quantity ?? "",
        sale.unitPrice ?? "",
        sale.totalPrice ?? "",
        sale.paymentStatus || "",
        sale.salesPerson || "",
        sale.delivered || "",
      ]),
      startY: 27,
      styles: { fontSize: 8, cellPadding: 2 },
      headStyles: { fillColor: [35, 55, 85] },
      margin: { left: 10, right: 10 },
    });

    doc.save("sales_report.pdf");
  };

  // Export the currently filtered sales to Excel
  const downloadExcel = () => {
    const rows = filteredSales.map((sale, index) => ({
      "#": index + 1,
      "Receipt No": sale.receiptNo,
      "Phone No": sale.phoneNo,
      "Customer Name": sale.customerName,
      Date: sale.date,
      "Item Sold": sale.itemSold,
      Quantity: sale.quantity,
      "Unit Price": sale.unitPrice,
      "Total Price": sale.totalPrice,
      "Payment Status": sale.paymentStatus,
      "Sales Person": sale.salesPerson,
      Delivered: sale.delivered,
    }));

    const sheet = XLSX.utils.json_to_sheet(rows);
    const book = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(book, sheet, "Sales");
    XLSX.writeFile(book, "sales_report.xlsx");
  };

  const clearFilters = () => setFilter({ ...initialFilters });

  // Find the original index after filtering
  const getOriginalIndex = (sale) =>
    sales.findIndex((item) => item.id === sale.id);

  const totalRevenue = sales.reduce(
    (total, sale) => total + (Number(sale.totalPrice) || 0),
    0
  );

  const filteredRevenue = filteredSales.reduce(
    (total, sale) => total + (Number(sale.totalPrice) || 0),
    0
  );

  const hasActiveFilters = Object.values(filter).some(
    (value) => value !== ""
  );

  const styles = {
    page: {
      minHeight: "100vh",
      background: "#f4f7fb",
      padding: "clamp(12px, 3vw, 32px)",
      color: "#1e293b",
    },
    container: {
      maxWidth: "1800px",
      margin: "0 auto",
    },
    header: {
      background: "linear-gradient(125deg, #172554 0%, #1e40af 100%)",
      borderRadius: "18px",
      padding: "clamp(20px, 4vw, 34px)",
      color: "#ffffff",
      marginBottom: "24px",
      boxShadow: "0 10px 30px rgba(30, 64, 175, 0.14)",
    },
    eyebrow: {
      display: "inline-block",
      fontSize: "11px",
      fontWeight: "700",
      letterSpacing: "2px",
      textTransform: "uppercase",
      color: "#bfdbfe",
      marginBottom: "8px",
    },
    card: {
      background: "#ffffff",
      border: "1px solid #e5eaf2",
      borderRadius: "16px",
      padding: "clamp(16px, 2.5vw, 24px)",
      marginBottom: "22px",
      boxShadow: "0 4px 18px rgba(15, 23, 42, 0.035)",
    },
    sectionTitle: {
      fontSize: "17px",
      fontWeight: "700",
      color: "#172554",
      marginBottom: "5px",
    },
    sectionText: {
      fontSize: "13px",
      color: "#64748b",
      marginBottom: "0",
    },
    metricCard: {
      height: "100%",
      background: "#ffffff",
      border: "1px solid #e5eaf2",
      borderRadius: "14px",
      padding: "18px",
      boxShadow: "0 4px 18px rgba(15, 23, 42, 0.035)",
    },
    metricLabel: {
      color: "#64748b",
      fontSize: "12px",
      fontWeight: "600",
      marginBottom: "8px",
    },
    metricValue: {
      fontSize: "clamp(21px, 3vw, 28px)",
      fontWeight: "750",
      color: "#172554",
      marginBottom: "0",
      overflowWrap: "anywhere",
    },
    label: {
      color: "#334155",
      fontWeight: "600",
      fontSize: "13px",
      marginBottom: "7px",
    },
    control: {
      minHeight: "44px",
      borderRadius: "9px",
      borderColor: "#dbe3ee",
      fontSize: "14px",
      boxShadow: "none",
    },
    table: {
      minWidth: "1250px",
      fontSize: "13px",
      marginBottom: "0",
    },
    modalHeader: {
      background: "linear-gradient(125deg, #172554 0%, #1e40af 100%)",
      color: "#ffffff",
      padding: "20px 24px",
      borderBottom: "none",
    },
    modalBody: {
      background: "#f8fafc",
      padding: "clamp(14px, 3vw, 28px)",
    },
    formSection: {
      background: "#ffffff",
      border: "1px solid #e5eaf2",
      borderRadius: "13px",
      padding: "18px",
      marginBottom: "18px",
    },
  };

  const renderField = (label, name, type = "text", options = {}) => (
    <Form.Group className="mb-3" controlId={`sale-${name}`}>
      <Form.Label style={styles.label}>
        {label}
        {options.required && <span className="text-danger"> *</span>}
      </Form.Label>

      {options.select ? (
        <Form.Select
          name={name}
          value={formData[name] ?? ""}
          onChange={handleChange}
          required={options.required}
          style={styles.control}
        >
          <option value="">Select {label.toLowerCase()}</option>
          {options.select.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </Form.Select>
      ) : (
        <Form.Control
          type={type}
          name={name}
          value={formData[name] ?? ""}
          onChange={handleChange}
          required={options.required}
          readOnly={options.readOnly}
          min={options.min}
          step={options.step}
          placeholder={
            options.placeholder || `Enter ${label.toLowerCase()}`
          }
          style={{
            ...styles.control,
            ...(options.readOnly
              ? {
                  background: "#eff6ff",
                  fontWeight: "700",
                  color: "#1d4ed8",
                }
              : {}),
          }}
        />
      )}
    </Form.Group>
  );

  return (
    <div style={styles.page}>
      <style>{`
        .sale-view-modal .modal-content {
          border: none;
          border-radius: 14px;
          overflow: hidden;
        }

        .sale-view-modal .modal-header {
          background: linear-gradient(125deg, #172554 0%, #1e40af 100%);
          color: #ffffff;
          padding: 20px 24px;
          border-bottom: none;
        }

        .sale-view-modal .modal-header .btn-close {
          filter: brightness(0) invert(1);
        }

        .sale-view-body {
          padding: 24px;
          max-height: 70vh;
          overflow-y: auto;
          background: #ffffff;
        }

        .sale-receipt {
          width: 100%;
          max-width: 520px;
          margin: 0 auto;
          color: #1e293b;
        }

        .sale-receipt-title {
          color: #172554;
          font-size: 20px;
          font-weight: 800;
          overflow-wrap: anywhere;
        }

        .sale-section-title {
          color: #1e40af;
          font-size: 13px;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          border-bottom: 1px solid #e5eaf2;
          padding-bottom: 8px;
          margin-top: 22px;
          margin-bottom: 8px;
        }

        .sale-detail-row {
          display: flex;
          justify-content: space-between;
          gap: 16px;
          padding: 10px 0;
          border-bottom: 1px solid #f1f5f9;
          font-size: 13px;
          break-inside: avoid;
        }

        .sale-detail-row span {
          color: #64748b;
          flex: 1;
          overflow-wrap: anywhere;
        }

        .sale-detail-row strong {
          text-align: right;
          overflow-wrap: anywhere;
          white-space: pre-wrap;
          max-width: 60%;
        }

        .sale-view-footer {
          background: #f8fafc;
          border-top: 1px solid #e5eaf2;
        }

        @media (max-width: 575.98px) {
          .sale-view-modal .modal-dialog {
            margin: 8px;
          }

          .sale-view-body {
            padding: 18px;
            max-height: 68vh;
          }

          .sale-view-modal .modal-header {
            padding: 16px 18px;
          }

          .sale-detail-row {
            gap: 10px;
          }
        }

        @media print {
          @page {
            size: A4 portrait;
            margin: 12mm;
          }

          body * {
            visibility: hidden !important;
          }

          .sale-view-modal,
          .sale-view-modal * {
            visibility: visible !important;
          }

          .sale-view-modal {
            position: absolute !important;
            inset: 0 !important;
            width: 100% !important;
            max-width: 100% !important;
            margin: 0 !important;
            padding: 0 !important;
          }

          .sale-view-modal .modal-dialog {
            width: 100% !important;
            max-width: 100% !important;
            margin: 0 !important;
          }

          .sale-view-modal .modal-content {
            border: none !important;
            box-shadow: none !important;
          }

          .sale-view-modal .modal-header .btn-close,
          .sale-view-footer {
            display: none !important;
          }

          .sale-view-body {
            max-height: none !important;
            overflow: visible !important;
            padding: 0 !important;
          }

          .sale-receipt {
            max-width: 100% !important;
          }

          .sale-section-title,
          .sale-detail-row {
            break-inside: avoid;
          }
        }
      `}</style>

      <div style={styles.container}>
        {/* Page header */}
        <div style={styles.header}>
          <div className="d-flex flex-column flex-lg-row justify-content-between align-items-lg-center gap-4">
            <div>
              <span style={styles.eyebrow}>SALES MANAGEMENT</span>
              <h2
                className="fw-bold mb-2"
                style={{ fontSize: "clamp(25px, 4vw, 34px)" }}
              >
                Sales Overview
              </h2>
              <p
                className="mb-0"
                style={{
                  color: "#dbeafe",
                  fontSize: "14px",
                  maxWidth: "520px",
                }}
              >
                Manage transactions, monitor sales records, and keep
                customer purchase information organized.
              </p>
            </div>

            <div className="d-flex flex-wrap gap-2">
              <Button
                variant="light"
                onClick={downloadPDF}
                className="fw-semibold px-3 py-2"
                style={{ borderRadius: "9px", fontSize: "13px" }}
              >
                Download PDF
              </Button>

              <Button
                variant="success"
                onClick={downloadExcel}
                className="fw-semibold px-3 py-2"
                style={{ borderRadius: "9px", fontSize: "13px" }}
              >
                Download Excel
              </Button>

              <Button
                variant="warning"
                onClick={handleAdd}
                className="fw-bold px-3 py-2"
                style={{ borderRadius: "9px", fontSize: "13px" }}
              >
                + Add Sale
              </Button>
            </div>
          </div>
        </div>

        {/* Summary cards */}
        <Row className="g-3 mb-4">
          <Col xs={12} sm={6} xl={4}>
            <div style={styles.metricCard}>
              <div style={styles.metricLabel}>TOTAL TRANSACTIONS</div>
              <h3 style={styles.metricValue}>{sales.length}</h3>
              <div className="small text-muted mt-2">
                All recorded sales
              </div>
            </div>
          </Col>

          <Col xs={12} sm={6} xl={4}>
            <div style={styles.metricCard}>
              <div style={styles.metricLabel}>TOTAL SALES VALUE</div>
              <h3 style={styles.metricValue}>
                {totalRevenue.toLocaleString(undefined, {
                  maximumFractionDigits: 2,
                })}
              </h3>
              <div className="small text-muted mt-2">
                Combined recorded totals
              </div>
            </div>
          </Col>

          <Col xs={12} sm={6} xl={4}>
            <div style={styles.metricCard}>
              <div style={styles.metricLabel}>MATCHING RECORDS</div>
              <h3 style={styles.metricValue}>{filteredSales.length}</h3>
              <div className="small text-muted mt-2">
                {hasActiveFilters
                  ? "Based on current filters"
                  : "Showing all records"}
              </div>
            </div>
          </Col>
        </Row>

        {/* Search and filters */}
        <div style={styles.card}>
          <div className="d-flex flex-column flex-md-row justify-content-between gap-2 mb-4">
            <div>
              <h5 style={styles.sectionTitle}>Find a Sale</h5>
              <p style={styles.sectionText}>
                Search using a receipt number, customer name, contact, or date.
              </p>
            </div>

            {hasActiveFilters && (
              <Button
                variant="outline-secondary"
                size="sm"
                onClick={clearFilters}
                className="align-self-md-start"
                style={{ borderRadius: "8px" }}
              >
                Clear filters
              </Button>
            )}
          </div>

          <Form>
            <Row className="g-3">
              <Col xs={12} sm={6} xl={3}>
                <Form.Group controlId="filter-receipt">
                  <Form.Label style={styles.label}>
                    Receipt Number
                  </Form.Label>
                  <InputGroup>
                    <InputGroup.Text style={{ background: "#f8fafc" }}>
                      #
                    </InputGroup.Text>
                    <Form.Control
                      name="receiptNo"
                      placeholder="Search receipt..."
                      value={filter.receiptNo}
                      onChange={handleFilterChange}
                      style={styles.control}
                    />
                  </InputGroup>
                </Form.Group>
              </Col>

              <Col xs={12} sm={6} xl={3}>
                <Form.Group controlId="filter-customer">
                  <Form.Label style={styles.label}>
                    Customer Name
                  </Form.Label>
                  <Form.Control
                    name="customerName"
                    placeholder="Search customer..."
                    value={filter.customerName}
                    onChange={handleFilterChange}
                    style={styles.control}
                  />
                </Form.Group>
              </Col>

              <Col xs={12} sm={6} xl={3}>
                <Form.Group controlId="filter-contact">
                  <Form.Label style={styles.label}>
                    Contact / Phone
                  </Form.Label>
                  <Form.Control
                    name="phoneNo"
                    type="search"
                    placeholder="Search phone number..."
                    value={filter.phoneNo}
                    onChange={handleFilterChange}
                    style={styles.control}
                  />
                </Form.Group>
              </Col>

              <Col xs={12} sm={6} xl={3}>
                <Form.Group controlId="filter-date">
                  <Form.Label style={styles.label}>Sale Date</Form.Label>
                  <Form.Control
                    name="date"
                    type="date"
                    value={filter.date}
                    onChange={handleFilterChange}
                    style={styles.control}
                  />
                </Form.Group>
              </Col>
            </Row>

            <div
              className="d-flex flex-wrap justify-content-between gap-2 mt-3 pt-3"
              style={{ borderTop: "1px solid #edf1f7" }}
            >
              <span className="small text-muted align-self-center">
                {filteredSales.length} matching record
                {filteredSales.length === 1 ? "" : "s"}
              </span>

              <Button
                variant="outline-primary"
                size="sm"
                onClick={clearFilters}
                disabled={!hasActiveFilters}
                style={{ borderRadius: "8px" }}
              >
                Reset search
              </Button>
            </div>
          </Form>
        </div>

        {/* Sales records */}
        <div
          className="bg-white"
          style={{
            border: "1px solid #e5eaf2",
            borderRadius: "16px",
            overflow: "hidden",
            boxShadow: "0 4px 18px rgba(15, 23, 42, 0.035)",
          }}
        >
          <div className="d-flex flex-column flex-sm-row justify-content-between align-items-sm-center gap-2 p-4">
            <div>
              <h5 style={styles.sectionTitle}>Sales Records</h5>
              <p style={styles.sectionText}>
                Review transactions and manage individual sales.
              </p>
            </div>

            <span
              className="badge rounded-pill px-3 py-2"
              style={{
                background: "#eff6ff",
                color: "#1d4ed8",
                fontSize: "12px",
                alignSelf: "flex-start",
              }}
            >
              {filteredSales.length} records
            </span>
          </div>

          <div className="table-responsive">
            <Table hover className="align-middle" style={styles.table}>
              <thead>
                <tr style={{ background: "#f8fafc" }}>
                  {[
                    "#",
                    "Receipt No",
                    "Phone No",
                    "Customer Name",
                    "Date",
                    "Item Sold",
                    "Qty",
                    "Unit Price",
                    "Total",
                    "Payment",
                    "Sales Person",
                    "Delivered",
                    "Actions",
                  ].map((heading) => (
                    <th
                      key={heading}
                      className="px-3 py-3 text-nowrap"
                      style={{
                        color: "#475569",
                        fontSize: "11px",
                        fontWeight: "700",
                        textTransform: "uppercase",
                        letterSpacing: "0.4px",
                        borderBottom: "1px solid #e5eaf2",
                      }}
                    >
                      {heading}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {filteredSales.length === 0 ? (
                  <tr>
                    <td colSpan="13" className="text-center py-5">
                      <div
                        className="mx-auto mb-3 d-flex align-items-center justify-content-center"
                        style={{
                          width: "52px",
                          height: "52px",
                          borderRadius: "14px",
                          background: "#eff6ff",
                          color: "#1d4ed8",
                          fontSize: "22px",
                        }}
                      >
                        {hasActiveFilters ? "⌕" : "S"}
                      </div>
                      <h6 className="fw-bold text-dark">
                        {hasActiveFilters
                          ? "No matching sales found"
                          : "No sales recorded yet"}
                      </h6>
                      <p className="small text-muted mb-0">
                        {hasActiveFilters
                          ? "Try a different search or clear your filters."
                          : "Add a sale to start building your records."}
                      </p>
                    </td>
                  </tr>
                ) : (
                  filteredSales.map((sale, index) => {
                    const originalIndex = getOriginalIndex(sale);

                    return (
                      <tr key={sale.id ?? index}>
                        <td className="px-3 text-muted">{index + 1}</td>
                        <td className="px-3 fw-semibold text-nowrap">
                          {sale.receiptNo || "—"}
                        </td>
                        <td className="px-3 text-nowrap">
                          {sale.phoneNo || "—"}
                        </td>
                        <td className="px-3 fw-semibold">
                          {sale.customerName || "—"}
                        </td>
                        <td className="px-3 text-nowrap">
                          {sale.date || "—"}
                        </td>
                        <td className="px-3">{sale.itemSold || "—"}</td>
                        <td className="px-3">{sale.quantity ?? "—"}</td>
                        <td className="px-3 text-nowrap">
                          {Number(sale.unitPrice || 0).toLocaleString()}
                        </td>
                        <td className="px-3 fw-bold text-nowrap">
                          {Number(sale.totalPrice || 0).toLocaleString()}
                        </td>
                        <td className="px-3">
                          <span
                            className="badge rounded-pill px-2 py-2"
                            style={{
                              background:
                                String(sale.paymentStatus || "").toLowerCase() ===
                                "paid"
                                  ? "#dcfce7"
                                  : "#fef3c7",
                              color:
                                String(sale.paymentStatus || "").toLowerCase() ===
                                "paid"
                                  ? "#166534"
                                  : "#92400e",
                            }}
                          >
                            {sale.paymentStatus || "Not specified"}
                          </span>
                        </td>
                        <td className="px-3">{sale.salesPerson || "—"}</td>
                        <td className="px-3">
                          <span
                            className="badge rounded-pill px-2 py-2"
                            style={{
                              background:
                                sale.delivered === "Delivered"
                                  ? "#dcfce7"
                                  : "#f1f5f9",
                              color:
                                sale.delivered === "Delivered"
                                  ? "#166534"
                                  : "#475569",
                            }}
                          >
                            {sale.delivered || "Not specified"}
                          </span>
                        </td>
                        <td className="px-3">
                          <div className="d-flex gap-2">
                            <Button
                              variant="outline-info"
                              size="sm"
                              onClick={() => handleView(sale)}
                            >
                              View
                            </Button>

                            <Button
                              variant="outline-primary"
                              size="sm"
                              disabled={originalIndex === -1}
                              onClick={() => handleEdit(originalIndex)}
                            >
                              Edit
                            </Button>

                            <Button
                              variant="outline-danger"
                              size="sm"
                              disabled={originalIndex === -1}
                              onClick={() => handleDelete(originalIndex)}
                            >
                              Delete
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </Table>
          </div>

          <div
            className="d-flex flex-column flex-sm-row justify-content-between gap-2 px-4 py-3"
            style={{
              background: "#fafcff",
              borderTop: "1px solid #edf1f7",
            }}
          >
            <span className="small text-muted">
              Showing {filteredSales.length} of {sales.length} total records
            </span>
            <span className="small text-muted">
              Filtered sales value:{" "}
              <strong className="text-dark">
                {filteredRevenue.toLocaleString(undefined, {
                  maximumFractionDigits: 2,
                })}
              </strong>
            </span>
          </div>
        </div>
      </div>

      {/* Add/Edit sale modal */}
      <Modal
        show={showModal}
        onHide={() => {
          if (!saving) setShowModal(false);
        }}
        centered
        scrollable
        size="lg"
        fullscreen="sm-down"
        backdrop={saving ? "static" : true}
        keyboard={!saving}
        contentClassName="border-0 sales-modal-content"
        dialogClassName="sales-form-dialog"
      >
        <div
          style={{
            borderRadius: "15px",
            overflow: "hidden",
            display: "flex",
            flexDirection: "column",
            maxHeight: "calc(100dvh - 32px)",
          }}
        >
          <Modal.Header closeButton style={styles.modalHeader}>
            <div>
              <div style={styles.eyebrow}>SALES MANAGEMENT</div>
              <Modal.Title className="fw-bold" style={{ fontSize: "23px" }}>
                {editingIndex !== null ? "Edit Sale" : "Record a New Sale"}
              </Modal.Title>
              <p
                className="mb-0 mt-2"
                style={{ color: "#dbeafe", fontSize: "13px" }}
              >
                Enter transaction details and customer information below.
              </p>
            </div>
          </Modal.Header>

          <Modal.Body
            style={{
              ...styles.modalBody,
              flex: "1 1 auto",
              minHeight: 0,
              maxHeight: "calc(100dvh - 150px)",
              overflowY: "auto",
              overscrollBehavior: "contain",
            }}
          >
            <Form onSubmit={handleSubmit}>
              {/* Customer details */}
              <div style={styles.formSection}>
                <div className="d-flex align-items-center gap-3 mb-3">
                  <div
                    className="d-flex align-items-center justify-content-center fw-bold"
                    style={{
                      width: "38px",
                      height: "38px",
                      borderRadius: "10px",
                      background: "#eff6ff",
                      color: "#1d4ed8",
                      flexShrink: 0,
                    }}
                  >
                    01
                  </div>
                  <div>
                    <h6 className="fw-bold mb-1">Customer Information</h6>
                    <p className="small text-muted mb-0">
                      Identify the customer and transaction.
                    </p>
                  </div>
                </div>

                <Row className="g-2">
                  <Col xs={12} md={6}>
                    {renderField("Receipt Number", "receiptNo", "text", {
                      placeholder: "Enter receipt number",
                    })}
                  </Col>
                  <Col xs={12} md={6}>
                    {renderField("Customer Name", "customerName", "text", {
                      required: true,
                      placeholder: "Enter full customer name",
                    })}
                  </Col>
                  <Col xs={12} md={6}>
                    {renderField("Phone / Contact", "phoneNo", "tel", {
                      placeholder: "Enter customer phone number",
                    })}
                  </Col>
                  <Col xs={12} md={6}>
                    {renderField("Sale Date", "date", "date", {
                      required: true,
                    })}
                  </Col>
                </Row>
              </div>

              {/* Product and pricing */}
              <div style={styles.formSection}>
                <div className="d-flex align-items-center gap-3 mb-3">
                  <div
                    className="d-flex align-items-center justify-content-center fw-bold"
                    style={{
                      width: "38px",
                      height: "38px",
                      borderRadius: "10px",
                      background: "#f0fdf4",
                      color: "#15803d",
                      flexShrink: 0,
                    }}
                  >
                    02
                  </div>
                  <div>
                    <h6 className="fw-bold mb-1">Product & Pricing</h6>
                    <p className="small text-muted mb-0">
                      Record the item sold and its price.
                    </p>
                  </div>
                </div>

                <Row className="g-2">
                  <Col xs={12}>
                    {renderField("Item Sold", "itemSold", "text", {
                      required: true,
                      placeholder: "Enter product or furniture item",
                    })}
                  </Col>
                  <Col xs={12} sm={6}>
                    {renderField("Quantity", "quantity", "number", {
                      required: true,
                      min: "1",
                      step: "1",
                      placeholder: "Enter quantity",
                    })}
                  </Col>
                  <Col xs={12} sm={6}>
                    {renderField("Unit Price", "unitPrice", "number", {
                      required: true,
                      min: "0",
                      step: "0.01",
                      placeholder: "Enter unit price",
                    })}
                  </Col>
                  <Col xs={12}>
                    {renderField("Total Price", "totalPrice", "number", {
                      readOnly: true,
                      placeholder: "Calculated automatically",
                    })}
                    <div className="small text-muted mb-2">
                      Total price is calculated automatically from quantity × unit price.
                    </div>
                  </Col>
                </Row>
              </div>

              {/* Payment and delivery */}
              <div style={styles.formSection}>
                <div className="d-flex align-items-center gap-3 mb-3">
                  <div
                    className="d-flex align-items-center justify-content-center fw-bold"
                    style={{
                      width: "38px",
                      height: "38px",
                      borderRadius: "10px",
                      background: "#f5f3ff",
                      color: "#6d28d9",
                      flexShrink: 0,
                    }}
                  >
                    03
                  </div>
                  <div>
                    <h6 className="fw-bold mb-1">Payment & Delivery</h6>
                    <p className="small text-muted mb-0">
                      Track payment progress and fulfilment.
                    </p>
                  </div>
                </div>

                <Row className="g-2">
                  <Col xs={12} md={6}>
                    {renderField("Payment Status", "paymentStatus", "text", {
                      placeholder: "e.g. Paid, Pending, Partial",
                    })}
                  </Col>
                  <Col xs={12} md={6}>
                    {renderField("Sales Person", "salesPerson", "text", {
                      placeholder: "Enter staff name",
                    })}
                  </Col>
                  <Col xs={12}>
                    {renderField("Delivery Status", "delivered", "text", {
                      select: ["Delivered", "Not Delivered"],
                    })}
                  </Col>
                </Row>
              </div>

              {/* Sticky buttons */}
              <div
                className="d-flex flex-column-reverse flex-sm-row justify-content-end gap-2 pt-3"
                style={{
                  position: "sticky",
                  bottom: "-1px",
                  background: "#f8fafc",
                  paddingBottom: "10px",
                  paddingTop: "14px",
                  marginTop: "4px",
                  borderTop: "1px solid #e5eaf2",
                  zIndex: 5,
                }}
              >
                <Button
                  type="button"
                  variant="outline-secondary"
                  disabled={saving}
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2"
                  style={{ borderRadius: "9px" }}
                >
                  Cancel
                </Button>

                <Button
                  type="submit"
                  variant="primary"
                  disabled={saving}
                  className="px-4 py-2 fw-semibold"
                  style={{
                    borderRadius: "9px",
                    background: "#1d4ed8",
                    borderColor: "#1d4ed8",
                  }}
                >
                  {saving
                    ? "Saving..."
                    : editingIndex !== null
                    ? "Save Changes"
                    : "Record Sale"}
                </Button>
              </div>
            </Form>
          </Modal.Body>
        </div>
      </Modal>

      {/* View Sale - Portrait Receipt Popup */}
      <Modal
        show={showViewModal}
        onHide={() => setShowViewModal(false)}
        centered
        dialogClassName="sale-view-modal"
        contentClassName="border-0"
      >
        <Modal.Header closeButton>
          <div>
            <Modal.Title className="fw-bold">Sale Details</Modal.Title>
            <div className="small opacity-75">
              Sales receipt and transaction information
            </div>
          </div>
        </Modal.Header>

        <Modal.Body className="sale-view-body">
          {selectedSale && (
            <div className="sale-receipt">
              <div className="text-center pb-3 mb-3 border-bottom">
                <h4 className="sale-receipt-title">
                  WHITEWISE INTERIOR FURNITURE
                </h4>
                <div className="small text-muted">
                  Furniture for your home and space
                </div>

                <h5 className="fw-bold mt-4 mb-2">SALES RECEIPT</h5>

                <div className="small text-muted">
                  Receipt No: {selectedSale.receiptNo || "—"}
                </div>
                <div className="small text-muted">
                  Date: {selectedSale.date || "—"}
                </div>
              </div>

              <h6 className="sale-section-title">
                Customer Information
              </h6>

              {[
                ["Customer Name", selectedSale.customerName],
                ["Phone Number", selectedSale.phoneNo],
                ["Sales Person", selectedSale.salesPerson],
              ].map(([label, value]) => (
                <div className="sale-detail-row" key={label}>
                  <span>{label}</span>
                  <strong>{value || "—"}</strong>
                </div>
              ))}

              <h6 className="sale-section-title">Item Details</h6>

              {[
                ["Item Sold", selectedSale.itemSold],
                ["Quantity", selectedSale.quantity],
                ["Unit Price", selectedSale.unitPrice],
              ].map(([label, value]) => (
                <div className="sale-detail-row" key={label}>
                  <span>{label}</span>
                  <strong>{value ?? "—"}</strong>
                </div>
              ))}

              <div className="sale-detail-row">
                <span>Total Price</span>
                <strong>
                  {selectedSale.totalPrice !== null &&
                  selectedSale.totalPrice !== undefined
                    ? Number(selectedSale.totalPrice).toLocaleString(
                        undefined,
                        { maximumFractionDigits: 2 }
                      )
                    : "—"}
                </strong>
              </div>

              <h6 className="sale-section-title">Payment & Delivery</h6>

              {[
                ["Payment Status", selectedSale.paymentStatus],
                ["Delivery Status", selectedSale.delivered],
              ].map(([label, value]) => (
                <div className="sale-detail-row" key={label}>
                  <span>{label}</span>
                  <strong>{value || "—"}</strong>
                </div>
              ))}

              <div className="text-center border-top mt-4 pt-3">
                <p className="fw-semibold mb-1">
                  Thank you for your purchase!
                </p>
                <small className="text-muted">
                  Please keep this receipt for your records.
                </small>
              </div>
            </div>
          )}
        </Modal.Body>

        <Modal.Footer className="sale-view-footer">
          <Button
            variant="outline-secondary"
            onClick={() => setShowViewModal(false)}
          >
            Close
          </Button>

          <Button variant="primary" onClick={handlePrintSale}>
            Print Sale
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default Sales;
