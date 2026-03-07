import React, { useState, useEffect } from "react";
import { Table, Form, Button, Modal } from "react-bootstrap";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";

const API_URL = "http://localhost:9193/api/sales";

const Sales = () => {
  const [sales, setSales] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingIndex, setEditingIndex] = useState(null);
  const [formData, setFormData] = useState({
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
  });

  // Filter state
  const [filter, setFilter] = useState({
    receiptNo: "",
    customerName: "",
    date: "",
  });

  // Load all sales
  useEffect(() => {
    fetch(API_URL)
      .then((res) => res.json())
      .then((data) => setSales(data))
      .catch((err) => console.error(err));
  }, []);

  // Change handler + auto calculate total
  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => {
      const updated = { ...prev, [name]: value };
      if (name === "quantity" || name === "unitPrice") {
        const qty = Number(name === "quantity" ? value : prev.quantity);
        const price = Number(name === "unitPrice" ? value : prev.unitPrice);
        updated.totalPrice = qty && price ? qty * price : "";
      }
      return updated;
    });
  };

  // Add or update sale
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (editingIndex !== null) {
        const saleId = sales[editingIndex].id;
        const res = await fetch(`${API_URL}/${saleId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });
        const updatedSale = await res.json();

        setSales((prev) =>
          prev.map((s, i) => (i === editingIndex ? updatedSale : s))
        );
        setEditingIndex(null);
      } else {
        const res = await fetch(API_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });
        const newSale = await res.json();
        setSales((prev) => [...prev, newSale]);
      }

      setFormData({
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
      });

      setShowModal(false);
    } catch (err) {
      console.error("Save error:", err);
    }
  };

  const handleEdit = (index) => {
    setFormData({ ...sales[index] });
    setEditingIndex(index);
    setShowModal(true);
  };

  const handleDelete = async (index) => {
    if (!window.confirm("Are you sure?")) return;

    try {
      const saleId = sales[index].id;
      await fetch(`${API_URL}/${saleId}`, { method: "DELETE" });
      setSales((prev) => prev.filter((_, i) => i !== index));
    } catch (err) {
      console.error("Delete error:", err);
    }
  };

  // -----------------------------
  // PDF EXPORT
  // -----------------------------
  const downloadPDF = () => {
    const doc = new jsPDF();

    doc.text("Sales Report", 14, 10);

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
      body: filteredSales.map((s, i) => [
        i + 1,
        s.receiptNo,
        s.phoneNo,
        s.customerName,
        s.date,
        s.itemSold,
        s.quantity,
        s.unitPrice,
        s.totalPrice,
        s.paymentStatus,
        s.salesPerson,
        s.delivered,
      ]),
      startY: 20,
    });

    doc.save("sales_report.pdf");
  };

  // -----------------------------
  // EXCEL EXPORT
  // -----------------------------
  const downloadExcel = () => {
    const sheet = XLSX.utils.json_to_sheet(filteredSales);
    const book = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(book, sheet, "Sales");
    XLSX.writeFile(book, "sales_report.xlsx");
  };

  // -----------------------------
  // Filtered sales
  // -----------------------------
  const filteredSales = sales.filter((s) => {
    return (
      (!filter.receiptNo || s.receiptNo.includes(filter.receiptNo)) &&
      (!filter.customerName ||
        s.customerName.toLowerCase().includes(filter.customerName.toLowerCase())) &&
      (!filter.date || s.date === filter.date)
    );
  });

  return (
    <div className="container mt-4">
      <h3>Sales</h3>

      <Button
        variant="primary"
        onClick={() => setShowModal(true)}
        className="me-2"
      >
        Add Sale
      </Button>
      <Button variant="success" className="me-2" onClick={downloadPDF}>
        Download PDF
      </Button>
      <Button variant="info" onClick={downloadExcel}>
        Download Excel
      </Button>

      {/* Filter Inputs */}
      <div className="mb-3 mt-3">
        <Form className="d-flex gap-2 flex-wrap">
          <Form.Control
            type="text"
            placeholder="Filter by Receipt No"
            value={filter.receiptNo}
            onChange={(e) =>
              setFilter({ ...filter, receiptNo: e.target.value })
            }
          />
          <Form.Control
            type="text"
            placeholder="Filter by Customer Name"
            value={filter.customerName}
            onChange={(e) =>
              setFilter({ ...filter, customerName: e.target.value })
            }
          />
          <Form.Control
            type="date"
            placeholder="Filter by Date"
            value={filter.date}
            onChange={(e) => setFilter({ ...filter, date: e.target.value })}
          />
          <Button
            variant="secondary"
            onClick={() => setFilter({ receiptNo: "", customerName: "", date: "" })}
          >
            Clear
          </Button>
        </Form>
      </div>

      <Table striped bordered hover className="mt-3">
        <thead>
          <tr>
            <th>#</th>
            <th>Receipt No</th>
            <th>Phone No</th>
            <th>Customer Name</th>
            <th>Date</th>
            <th>Item Sold</th>
            <th>Qty</th>
            <th>Unit Price</th>
            <th>Total</th>
            <th>Payment</th>
            <th>Sales Person</th>
            <th>Delivered</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredSales.length === 0 ? (
            <tr>
              <td colSpan="13" className="text-center">
                No sales found.
              </td>
            </tr>
          ) : (
            filteredSales.map((s, index) => (
              <tr key={s.id || index}>
                <td>{index + 1}</td>
                <td>{s.receiptNo}</td>
                <td>{s.phoneNo}</td>
                <td>{s.customerName}</td>
                <td>{s.date}</td>
                <td>{s.itemSold}</td>
                <td>{s.quantity}</td>
                <td>{s.unitPrice}</td>
                <td>{s.totalPrice}</td>
                <td>{s.paymentStatus}</td>
                <td>{s.salesPerson}</td>
                <td>{s.delivered}</td>
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

      {/* MODAL FORM */}
      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>{editingIndex !== null ? "Edit Sale" : "Add Sale"}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleSubmit}>
            {[
              ["Receipt No", "receiptNo", "text"],
              ["Phone No", "phoneNo", "text"],
              ["Customer Name", "customerName", "text"],
              ["Date", "date", "date"],
              ["Item Sold", "itemSold", "text"],
              ["Quantity", "quantity", "number"],
              ["Unit Price", "unitPrice", "number"],
            ].map(([label, name, type]) => (
              <Form.Group className="mb-2" key={name}>
                <Form.Label>{label}</Form.Label>
                <Form.Control
                  type={type}
                  name={name}
                  value={formData[name]}
                  onChange={handleChange}
                  required={name !== "receiptNo" && name !== "phoneNo"}
                />
              </Form.Group>
            ))}

            <Form.Group className="mb-2">
              <Form.Label>Total Price</Form.Label>
              <Form.Control
                type="number"
                name="totalPrice"
                value={formData.totalPrice}
                readOnly
              />
            </Form.Group>

            <Form.Group className="mb-2">
              <Form.Label>Payment Status</Form.Label>
              <Form.Control
                type="text"
                name="paymentStatus"
                value={formData.paymentStatus}
                onChange={handleChange}
              />
            </Form.Group>

            <Form.Group className="mb-2">
              <Form.Label>Sales Person</Form.Label>
              <Form.Control
                type="text"
                name="salesPerson"
                value={formData.salesPerson}
                onChange={handleChange}
              />
            </Form.Group>

            <Form.Group className="mb-2">
              <Form.Label>Delivered</Form.Label>
              <Form.Control
                as="select"
                name="delivered"
                value={formData.delivered}
                onChange={handleChange}
              >
                <option value="">Select</option>
                <option value="Delivered">Delivered</option>
                <option value="Not Delivered">Not Delivered</option>
              </Form.Control>
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

export default Sales;
