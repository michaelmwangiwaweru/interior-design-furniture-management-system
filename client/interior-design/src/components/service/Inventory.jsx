
import React, { useState, useEffect } from "react";
import {
  Table,
  Form,
  Button,
  Modal,
  Row,
  Col,
  Card,
  Badge,
  InputGroup,
} from "react-bootstrap";
import { jsPDF } from "jspdf";
import "jspdf-autotable";
import * as XLSX from "xlsx";

const API_URL = "http://localhost:9193/api/inventory";

const Inventory = () => {
  const [records, setRecords] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingIndex, setEditingIndex] = useState(null);

  const [formData, setFormData] = useState({
    date: "",
    materialName: "",
    units: "",
    quantityOut: "",
    balance: "",
    issuedTo: "",
    purpose: "",
    approvedBy: "",
    workshopOrShowroom: "",
  });

  const [filter, setFilter] = useState({
    date: "",
    materialName: "",
  });

  // Fetch inventory records
  useEffect(() => {
    fetch(API_URL)
      .then((res) => res.json())
      .then((data) => setRecords(data))
      .catch((err) => console.error(err));
  }, []);

  // Handle field changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Add or update record
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (editingIndex !== null) {
        const recordId = records[editingIndex].id;

        const res = await fetch(`${API_URL}/${recordId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });

        const updatedRecord = await res.json();

        setRecords((prev) =>
          prev.map((rec, i) =>
            i === editingIndex ? updatedRecord : rec
          )
        );

        setEditingIndex(null);
      } else {
        const res = await fetch(API_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });

        const newRecord = await res.json();
        setRecords((prev) => [...prev, newRecord]);
      }

      setFormData({
        date: "",
        materialName: "",
        units: "",
        quantityOut: "",
        balance: "",
        issuedTo: "",
        purpose: "",
        approvedBy: "",
        workshopOrShowroom: "",
      });

      setShowModal(false);
    } catch (err) {
      console.error("Save error:", err);
    }
  };

  const handleEdit = (index) => {
    setFormData(records[index]);
    setEditingIndex(index);
    setShowModal(true);
  };

  const handleDelete = async (index) => {
    if (!window.confirm("Delete this record?")) return;

    try {
      const recordId = records[index].id;

      await fetch(`${API_URL}/${recordId}`, {
        method: "DELETE",
      });

      setRecords((prev) =>
        prev.filter((_, i) => i !== index)
      );
    } catch (err) {
      console.error("Delete error:", err);
    }
  };

  // Open a fresh form for adding a record
  const handleAddNew = () => {
    setFormData({
      date: "",
      materialName: "",
      units: "",
      quantityOut: "",
      balance: "",
      issuedTo: "",
      purpose: "",
      approvedBy: "",
      workshopOrShowroom: "",
    });

    setEditingIndex(null);
    setShowModal(true);
  };

  // Filtered records
  const filteredRecords = records.filter((r) => {
    return (
      (!filter.materialName ||
        (r.materialName || "")
          .toLowerCase()
          .includes(filter.materialName.toLowerCase())) &&
      (!filter.date || r.date === filter.date)
    );
  });

  // PDF Export
  const downloadPDF = () => {
    const doc = new jsPDF({
      orientation: "landscape",
      unit: "mm",
      format: "a4",
    });

    doc.setFontSize(18);
    doc.text("WHITEWISE INTERIOR FURNITURE", 14, 15);

    doc.setFontSize(12);
    doc.text("Inventory Report", 14, 23);

    doc.setFontSize(9);
    doc.text(
      `Records: ${filteredRecords.length}`,
      14,
      30
    );

    const rows = filteredRecords.map((r, i) => [
      i + 1,
      r.date,
      r.materialName,
      r.units,
      r.quantityOut,
      r.balance,
      r.issuedTo,
      r.purpose,
      r.approvedBy,
      r.workshopOrShowroom,
    ]);

    doc.autoTable({
      head: [
        [
          "#",
          "Date",
          "Material Name",
          "Units",
          "Qty Out",
          "Balance",
          "Issued To",
          "Purpose",
          "Approved By",
          "Workshop/Showroom",
        ],
      ],
      body: rows,
      startY: 35,
      theme: "grid",
      styles: {
        fontSize: 7,
        cellPadding: 2,
        overflow: "linebreak",
      },
      headStyles: {
        fillColor: [35, 48, 68],
        textColor: 255,
        fontStyle: "bold",
      },
      alternateRowStyles: {
        fillColor: [245, 247, 250],
      },
      margin: { left: 10, right: 10 },
    });

    doc.save("inventory_report.pdf");
  };

  // Excel Export
  const downloadExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(filteredRecords);
    const workbook = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(
      workbook,
      worksheet,
      "Inventory"
    );

    XLSX.writeFile(workbook, "inventory_report.xlsx");
  };

  const totalQuantityOut = filteredRecords.reduce(
    (total, record) =>
      total + (Number(record.quantityOut) || 0),
    0
  );

  const materialCount = new Set(
    filteredRecords
      .map((record) => record.materialName?.trim().toLowerCase())
      .filter(Boolean)
  ).size;

  const totalBalance = filteredRecords.reduce(
    (total, record) =>
      total + (Number(record.balance) || 0),
    0
  );

  const fields = [
    { key: "date", type: "date", label: "Date" },
    { key: "materialName", type: "text", label: "Material Name" },
    { key: "units", type: "text", label: "Units (pcs/mtrs/kgs)" },
    { key: "quantityOut", type: "number", label: "Quantity Out" },
    { key: "balance", type: "number", label: "Balance" },
    { key: "issuedTo", type: "text", label: "Issued To" },
    { key: "purpose", type: "text", label: "Purpose" },
    { key: "approvedBy", type: "text", label: "Approved By" },
    {
      key: "workshopOrShowroom",
      type: "text",
      label: "Workshop / Showroom",
    },
  ];

  return (
    <div className="container-fluid px-3 px-lg-4 py-4 inventory-page">
      <style>{`
        .inventory-page {
          background: #f5f7fb;
          min-height: 100vh;
          color: #253247;
        }

        .inventory-header {
          background: linear-gradient(135deg, #202d43, #344967);
          border-radius: 16px;
          padding: 26px;
          color: #fff;
          box-shadow: 0 8px 24px rgba(25, 42, 70, 0.12);
        }

        .inventory-header p {
          color: #d5deeb;
        }

        .inventory-stat-card {
          height: 100%;
          border: 1px solid #e8edf4;
          border-radius: 14px;
          box-shadow: 0 4px 16px rgba(31, 45, 61, 0.04);
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }

        .inventory-stat-card:hover {
          transform: translateY(-3px);
          box-shadow: 0 8px 22px rgba(31, 45, 61, 0.08);
        }

        .inventory-stat-label {
          color: #758197;
          font-size: 0.84rem;
          font-weight: 500;
        }

        .inventory-stat-value {
          font-size: 1.65rem;
          font-weight: 700;
          color: #26364d;
          overflow-wrap: anywhere;
        }

        .inventory-panel {
          background: #fff;
          border: 1px solid #e8edf4;
          border-radius: 14px;
          box-shadow: 0 4px 16px rgba(31, 45, 61, 0.035);
        }

        .inventory-panel-title {
          font-weight: 700;
          color: #26364d;
        }

        .inventory-page .form-control,
        .inventory-page .form-select {
          border-color: #dfe5ee;
          border-radius: 8px;
          min-height: 40px;
        }

        .inventory-page .form-control:focus {
          border-color: #7894bd;
          box-shadow: 0 0 0 0.2rem rgba(75, 111, 163, 0.12);
        }

        .inventory-table {
          margin-bottom: 0;
          vertical-align: middle;
          font-size: 0.88rem;
        }

        .inventory-table thead th {
          background: #f0f3f8;
          color: #526078;
          font-size: 0.77rem;
          text-transform: uppercase;
          letter-spacing: 0.035em;
          font-weight: 700;
          white-space: nowrap;
          padding: 14px 12px;
          border-bottom: 1px solid #e1e7f0;
        }

        .inventory-table tbody td {
          padding: 13px 12px;
          border-color: #edf0f5;
          color: #3d4a5f;
        }

        .inventory-table tbody tr:hover td {
          background: #f8faff;
        }

        .inventory-material-name {
          font-weight: 600;
          color: #29384e;
        }

        .inventory-empty-state {
          padding: 42px 16px !important;
          color: #7c879a !important;
        }

        .inventory-page .btn {
          border-radius: 8px;
          font-weight: 500;
        }

        .inventory-page .modal-content {
          border: 0;
          border-radius: 15px;
          overflow: hidden;
          box-shadow: 0 18px 60px rgba(15, 23, 42, 0.2);
        }

        .inventory-page .modal-header {
          background: #f6f8fb;
          border-bottom: 1px solid #e8edf4;
          padding: 18px 22px;
        }

        .inventory-page .modal-body {
          padding: 22px;
        }

        .inventory-page .modal-title {
          color: #26364d;
          font-weight: 700;
        }

        .inventory-page .form-label {
          color: #46536a;
          font-size: 0.88rem;
          font-weight: 600;
        }

        @media (max-width: 767px) {
          .inventory-header {
            padding: 20px;
          }

          .inventory-stat-value {
            font-size: 1.4rem;
          }
        }
      `}</style>

      {/* Page Header */}
      <div className="inventory-header mb-4">
        <Row className="align-items-center g-3">
          <Col>
            <div className="small text-uppercase mb-2">
              Whitewise Interior Furniture
            </div>

            <h2 className="fw-bold mb-2">
              Inventory Management
            </h2>

            <p className="mb-0">
              Monitor materials issued, remaining balances, and inventory records.
            </p>
          </Col>

          <Col xs={12} md="auto">
            <Button
              variant="light"
              className="fw-semibold px-4 py-2"
              onClick={handleAddNew}
            >
              <i className="bi bi-plus-lg me-2"></i>
              Add Inventory Record
            </Button>
          </Col>
        </Row>
      </div>

      {/* Summary Cards */}
      <Row className="g-3 mb-4">
        <Col xs={12} sm={6} xl={3}>
          <Card className="inventory-stat-card">
            <Card.Body className="p-4">
              <div className="d-flex justify-content-between align-items-start gap-2">
                <div>
                  <div className="inventory-stat-label mb-2">
                    Total Records
                  </div>
                  <div className="inventory-stat-value">
                    {filteredRecords.length}
                  </div>
                </div>
                <div className="rounded-3 p-3 bg-primary bg-opacity-10 text-primary">
                  <i className="bi bi-clipboard-data fs-4"></i>
                </div>
              </div>
              <div className="small text-muted mt-3">
                Records matching your filters
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col xs={12} sm={6} xl={3}>
          <Card className="inventory-stat-card">
            <Card.Body className="p-4">
              <div className="d-flex justify-content-between align-items-start gap-2">
                <div>
                  <div className="inventory-stat-label mb-2">
                    Materials Listed
                  </div>
                  <div className="inventory-stat-value">
                    {materialCount}
                  </div>
                </div>
                <div className="rounded-3 p-3 bg-info bg-opacity-10 text-info">
                  <i className="bi bi-box-seam fs-4"></i>
                </div>
              </div>
              <div className="small text-muted mt-3">
                Distinct material names
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col xs={12} sm={6} xl={3}>
          <Card className="inventory-stat-card">
            <Card.Body className="p-4">
              <div className="d-flex justify-content-between align-items-start gap-2">
                <div>
                  <div className="inventory-stat-label mb-2">
                    Total Quantity Out
                  </div>
                  <div className="inventory-stat-value">
                    {totalQuantityOut.toLocaleString()}
                  </div>
                </div>
                <div className="rounded-3 p-3 bg-warning bg-opacity-10 text-warning">
                  <i className="bi bi-box-arrow-up-right fs-4"></i>
                </div>
              </div>
              <div className="small text-muted mt-3">
                Sum of recorded quantities issued
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col xs={12} sm={6} xl={3}>
          <Card className="inventory-stat-card">
            <Card.Body className="p-4">
              <div className="d-flex justify-content-between align-items-start gap-2">
                <div>
                  <div className="inventory-stat-label mb-2">
                    Total Balance
                  </div>
                  <div className="inventory-stat-value">
                    {totalBalance.toLocaleString()}
                  </div>
                </div>
                <div className="rounded-3 p-3 bg-success bg-opacity-10 text-success">
                  <i className="bi bi-boxes fs-4"></i>
                </div>
              </div>
              <div className="small text-muted mt-3">
                Sum of recorded balances
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Filters and Export */}
      <Card className="inventory-panel mb-4">
        <Card.Body className="p-3 p-lg-4">
          <Row className="align-items-end g-3">
            <Col xs={12}>
              <h5 className="inventory-panel-title mb-1">
                <i className="bi bi-funnel me-2 text-primary"></i>
                Search and Filter
              </h5>
              <p className="text-muted small mb-0">
                Find inventory records or export the filtered results.
              </p>
            </Col>

            <Col xs={12} md={5} xl={4}>
              <Form.Label>Material Name</Form.Label>
              <InputGroup>
                <InputGroup.Text className="bg-white">
                  <i className="bi bi-search"></i>
                </InputGroup.Text>
                <Form.Control
                  type="text"
                  placeholder="Search material..."
                  value={filter.materialName}
                  onChange={(e) =>
                    setFilter({
                      ...filter,
                      materialName: e.target.value,
                    })
                  }
                />
              </InputGroup>
            </Col>

            <Col xs={12} md={4} xl={3}>
              <Form.Label>Date</Form.Label>
              <Form.Control
                type="date"
                value={filter.date}
                onChange={(e) =>
                  setFilter({ ...filter, date: e.target.value })
                }
              />
            </Col>

            <Col xs={12} md={3} xl={5}>
              <div className="d-flex flex-wrap gap-2">
                <Button
                  variant="outline-secondary"
                  onClick={() =>
                    setFilter({ materialName: "", date: "" })
                  }
                >
                  <i className="bi bi-arrow-counterclockwise me-1"></i>
                  Clear
                </Button>

                <Button
                  variant="outline-danger"
                  onClick={downloadPDF}
                >
                  <i className="bi bi-file-earmark-pdf me-1"></i>
                  Export PDF
                </Button>

                <Button
                  variant="outline-success"
                  onClick={downloadExcel}
                >
                  <i className="bi bi-file-earmark-excel me-1"></i>
                  Export Excel
                </Button>
              </div>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Inventory Table */}
      <Card className="inventory-panel">
        <Card.Header className="bg-white border-0 px-3 px-lg-4 pt-4 pb-3">
          <Row className="align-items-center g-2">
            <Col>
              <h5 className="inventory-panel-title mb-1">
                Inventory Records
              </h5>
              <div className="text-muted small">
                Review and manage recorded inventory movements.
              </div>
            </Col>

            <Col xs="auto">
              <Badge bg="light" text="dark" className="border px-3 py-2">
                {filteredRecords.length}{" "}
                {filteredRecords.length === 1 ? "record" : "records"}
              </Badge>
            </Col>
          </Row>
        </Card.Header>

        <Card.Body className="p-0">
          <Table
            responsive
            hover
            className="inventory-table"
          >
            <thead>
              <tr>
                <th>#</th>
                <th>Date</th>
                <th>Material Name</th>
                <th>Units</th>
                <th>Quantity Out</th>
                <th>Balance</th>
                <th>Issued To</th>
                <th>Purpose</th>
                <th>Approved By</th>
                <th>Workshop / Showroom</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {filteredRecords.length === 0 ? (
                <tr>
                  <td colSpan="11" className="text-center inventory-empty-state">
                    <i className="bi bi-inbox fs-2 d-block mb-2"></i>
                    <strong className="d-block text-secondary">
                      No inventory records found
                    </strong>
                    <span className="small">
                      Try changing your filters or add a new record.
                    </span>
                  </td>
                </tr>
              ) : (
                filteredRecords.map((rec, index) => (
                  <tr key={rec.id || index}>
                    <td className="text-muted">{index + 1}</td>
                    <td className="text-nowrap">{rec.date}</td>
                    <td>
                      <span className="inventory-material-name">
                        {rec.materialName}
                      </span>
                    </td>
                    <td>{rec.units}</td>
                    <td>
                      <Badge bg="warning" text="dark">
                        {rec.quantityOut}
                      </Badge>
                    </td>
                    <td>
                      <Badge bg="success" text="white">
                        {rec.balance}
                      </Badge>
                    </td>
                    <td>{rec.issuedTo}</td>
                    <td>{rec.purpose}</td>
                    <td>{rec.approvedBy}</td>
                    <td>{rec.workshopOrShowroom}</td>
                    <td>
                      <div className="d-flex gap-2">
                        <Button
                          variant="outline-primary"
                          size="sm"
                          title="Edit record"
                          aria-label="Edit record"
                          onClick={() => handleEdit(records.indexOf(rec))}
                        >
                          <i className="bi bi-pencil-square"></i>
                        </Button>

                        <Button
                          variant="outline-danger"
                          size="sm"
                          title="Delete record"
                          aria-label="Delete record"
                          onClick={() => handleDelete(records.indexOf(rec))}
                        >
                          <i className="bi bi-trash3"></i>
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </Table>
        </Card.Body>

        <Card.Footer className="bg-white border-0 px-3 px-lg-4 py-3">
          <div className="small text-muted">
            Showing {filteredRecords.length} of {records.length} inventory records
          </div>
        </Card.Footer>
      </Card>

      {/* Add / Edit Modal */}
      <Modal
        show={showModal}
        onHide={() => setShowModal(false)}
        centered
        size="lg"
        backdrop="static"
      >
        <Modal.Header closeButton>
          <div>
            <Modal.Title>
              <i className="bi bi-box-seam me-2 text-primary"></i>
              {editingIndex !== null
                ? "Edit Inventory Record"
                : "Add Inventory Record"}
            </Modal.Title>
            <div className="text-muted small mt-1">
              Enter the inventory details below.
            </div>
          </div>
        </Modal.Header>

        <Modal.Body>
          <Form onSubmit={handleSubmit}>
            <Row className="g-3">
              {fields.map((field) => (
                <Col xs={12} md={6} key={field.key}>
                  <Form.Group>
                    <Form.Label>{field.label}</Form.Label>
                    <Form.Control
                      type={field.type}
                      name={field.key}
                      value={formData[field.key] ?? ""}
                      onChange={handleChange}
                      required
                      step={
                        field.key === "quantityOut" ||
                        field.key === "balance"
                          ? "any"
                          : undefined
                      }
                      min={
                        field.key === "quantityOut" ||
                        field.key === "balance"
                          ? "0"
                          : undefined
                      }
                    />
                  </Form.Group>
                </Col>
              ))}
            </Row>

            <div className="d-flex justify-content-end gap-2 mt-4 pt-3 border-top">
              <Button
                variant="light"
                className="border"
                onClick={() => setShowModal(false)}
              >
                Cancel
              </Button>

              <Button type="submit" variant="primary">
                <i
                  className={`bi ${
                    editingIndex !== null ? "bi-check-lg" : "bi-plus-lg"
                  } me-2`}
                ></i>
                {editingIndex !== null ? "Update Record" : "Save Record"}
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default Inventory;
