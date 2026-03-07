import React, { useState, useEffect } from "react";
import { Table, Form, Button, Modal, Row, Col } from "react-bootstrap";
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
          prev.map((rec, i) => (i === editingIndex ? updatedRecord : rec))
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
      await fetch(`${API_URL}/${recordId}`, { method: "DELETE" });
      setRecords((prev) => prev.filter((_, i) => i !== index));
    } catch (err) {
      console.error("Delete error:", err);
    }
  };

  // Filtered records
  const filteredRecords = records.filter((r) => {
    return (
      (!filter.materialName ||
        r.materialName.toLowerCase().includes(filter.materialName.toLowerCase())) &&
      (!filter.date || r.date === filter.date)
    );
  });

  // PDF Export
  const downloadPDF = () => {
    const doc = new jsPDF();
    doc.text("Inventory Report", 14, 10);

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
      startY: 20,
    });

    doc.save("inventory_report.pdf");
  };

  // Excel Export
  const downloadExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(filteredRecords);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Inventory");
    XLSX.writeFile(workbook, "inventory_report.xlsx");
  };

  return (
    <div className="container mt-4">
      <h3 className="mb-3">Inventory</h3>

      <div className="mb-3 d-flex flex-wrap gap-2">
        <Button variant="primary" onClick={() => setShowModal(true)}>
          Add Record
        </Button>
        <Button variant="success" onClick={downloadPDF}>
          Download PDF
        </Button>
        <Button variant="info" onClick={downloadExcel}>
          Download Excel
        </Button>
      </div>

      {/* Filters */}
      <Form className="mb-3">
        <Row className="g-2">
          <Col md={4}>
            <Form.Control
              type="text"
              placeholder="Filter by Material Name"
              value={filter.materialName}
              onChange={(e) =>
                setFilter({ ...filter, materialName: e.target.value })
              }
            />
          </Col>
          <Col md={4}>
            <Form.Control
              type="date"
              placeholder="Filter by Date"
              value={filter.date}
              onChange={(e) => setFilter({ ...filter, date: e.target.value })}
            />
          </Col>
          <Col md={4}>
            <Button
              variant="secondary"
              onClick={() => setFilter({ materialName: "", date: "" })}
            >
              Clear Filters
            </Button>
          </Col>
        </Row>
      </Form>

      <Table striped bordered hover responsive>
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
            <th>Workshop/Showroom</th>
            <th>Actions</th>
          </tr>
        </thead>

        <tbody>
          {filteredRecords.length === 0 ? (
            <tr>
              <td colSpan="11" className="text-center">
                No records found.
              </td>
            </tr>
          ) : (
            filteredRecords.map((rec, index) => (
              <tr key={rec.id || index}>
                <td>{index + 1}</td>
                <td>{rec.date}</td>
                <td>{rec.materialName}</td>
                <td>{rec.units}</td>
                <td>{rec.quantityOut}</td>
                <td>{rec.balance}</td>
                <td>{rec.issuedTo}</td>
                <td>{rec.purpose}</td>
                <td>{rec.approvedBy}</td>
                <td>{rec.workshopOrShowroom}</td>
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

      {/* Modal Form */}
      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>{editingIndex !== null ? "Edit Record" : "Add Record"}</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          <Form onSubmit={handleSubmit}>
            {[
              { key: "date", type: "date", label: "Date" },
              { key: "materialName", type: "text", label: "Material Name" },
              { key: "units", type: "text", label: "Units (pcs/mtrs/kgs)" },
              { key: "quantityOut", type: "number", label: "Quantity Out" },
              { key: "balance", type: "number", label: "Balance" },
              { key: "issuedTo", type: "text", label: "Issued To" },
              { key: "purpose", type: "text", label: "Purpose" },
              { key: "approvedBy", type: "text", label: "Approved By" },
              { key: "workshopOrShowroom", type: "text", label: "Workshop/Showroom" },
            ].map((f) => (
              <Form.Group className="mb-2" key={f.key}>
                <Form.Label>{f.label}</Form.Label>
                <Form.Control
                  type={f.type}
                  name={f.key}
                  value={formData[f.key]}
                  onChange={handleChange}
                  required
                />
              </Form.Group>
            ))}

            <Button type="submit" variant="success" className="mt-2">
              {editingIndex !== null ? "Update" : "Add"}
            </Button>
          </Form>
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default Inventory;
