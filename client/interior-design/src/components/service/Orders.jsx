
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
import { jsPDF } from "jspdf";
import "jspdf-autotable";
import * as XLSX from "xlsx";

const API_URL = "http://localhost:9193/api/orders";

const initialFormData = {
  name: "",
  date: "",
  phone: "",
  itemDescription: "",
  quantity: "",
  unitPrice: "",
  totalPrice: "",
  deposit: "",
  balance: "",
  paymentStatus: "",
  expectedFinishDate: "",
  actualCompletionDate: "",
  status: "",
  showroomOrWorkshopName: "",
  assignedTo: "",
  stage: "",
  remarks: "",
};

const fieldLabels = {
  name: "Customer Name",
  date: "Order Date",
  phone: "Phone Number",
  itemDescription: "Item Description",
  quantity: "Quantity",
  unitPrice: "Unit Price",
  deposit: "Deposit",
  paymentStatus: "Payment Status",
  expectedFinishDate: "Expected Finish Date",
  actualCompletionDate: "Actual Completion Date",
  showroomOrWorkshopName: "Workshop / Showroom",
  assignedTo: "Assigned To",
  remarks: "Receiver & Remarks",
};

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingIndex, setEditingIndex] = useState(null);
  const [saving, setSaving] = useState(false);

  // View-order modal state
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);

  const [formData, setFormData] = useState({ ...initialFormData });

  const [filterName, setFilterName] = useState("");
  const [filterDate, setFilterDate] = useState("");

  // Fetch orders
  useEffect(() => {
    fetch(API_URL)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch orders");
        return res.json();
      })
      .then((data) => setOrders(data))
      .catch((err) => console.error("Fetch orders error:", err));
  }, []);

  // Handle input changes and automatically calculate totals
  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => {
      const updated = { ...prev, [name]: value };

      const quantity = name === "quantity" ? value : prev.quantity;
      const unitPrice = name === "unitPrice" ? value : prev.unitPrice;

      const total =
        quantity !== "" && unitPrice !== ""
          ? Number(quantity) * Number(unitPrice)
          : "";

      updated.totalPrice = total;

      const deposit = name === "deposit" ? value : prev.deposit;

      updated.balance =
        total !== "" && deposit !== ""
          ? total - Number(deposit)
          : total !== ""
          ? total
          : "";

      return updated;
    });
  };

  // Open a fresh form
  const handleAdd = () => {
    setFormData({ ...initialFormData });
    setEditingIndex(null);
    setShowModal(true);
  };

  // Add or update order
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (saving) return;

    setSaving(true);

    try {
      if (editingIndex !== null) {
        const orderId = orders[editingIndex].id;

        const res = await fetch(`${API_URL}/${orderId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });

        if (!res.ok) throw new Error("Failed to update order");

        const updatedOrder = await res.json();

        setOrders((prev) =>
          prev.map((order, index) =>
            index === editingIndex ? updatedOrder : order
          )
        );
      } else {
        const res = await fetch(API_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });

        if (!res.ok) throw new Error("Failed to create order");

        const newOrder = await res.json();
        setOrders((prev) => [...prev, newOrder]);
      }

      setFormData({ ...initialFormData });
      setEditingIndex(null);
      setShowModal(false);
    } catch (err) {
      console.error("Save error:", err);
      window.alert(
        "Unable to save the order. Please check the backend and try again."
      );
    } finally {
      setSaving(false);
    }
  };

  // Edit an order
  const handleEdit = (index) => {
    setFormData({
      ...initialFormData,
      ...orders[index],
    });
    setEditingIndex(index);
    setShowModal(true);
  };

  // View an order
  const handleView = (order) => {
    setSelectedOrder(order);
    setShowViewModal(true);
  };

  // Delete an order
  const handleDelete = async (index) => {
    if (!window.confirm("Delete this order?")) return;

    try {
      const orderId = orders[index].id;

      const res = await fetch(`${API_URL}/${orderId}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error("Failed to delete order");

      setOrders((prev) =>
        prev.filter((order) => order.id !== orderId)
      );

      if (editingIndex === index) {
        setEditingIndex(null);
      }

      if (selectedOrder?.id === orderId) {
        setShowViewModal(false);
        setSelectedOrder(null);
      }
    } catch (err) {
      console.error("Delete error:", err);
      window.alert("Unable to delete the order. Please try again.");
    }
  };

  // PDF export
  const downloadPDF = () => {
    const doc = new jsPDF("landscape");

    doc.setFontSize(18);
    doc.text("Orders Report", 14, 15);

    const tableData = filteredOrders.map((o, i) => [
      i + 1,
      o.name || "",
      o.date || "",
      o.phone || "",
      o.itemDescription || "",
      o.quantity || "",
      o.unitPrice || "",
      o.totalPrice || "",
      o.deposit || "",
      o.balance || "",
      o.paymentStatus || "",
      o.expectedFinishDate || "",
      o.actualCompletionDate || "",
      o.status || "",
      o.showroomOrWorkshopName || "",
      o.assignedTo || "",
      o.stage || "",
      o.remarks || "",
    ]);

    doc.autoTable({
      head: [
        [
          "#",
          "Name",
          "Date",
          "Phone",
          "Item Description",
          "Qty",
          "Unit Price",
          "Total",
          "Deposit",
          "Balance",
          "Payment Status",
          "Expected Finish",
          "Actual Completion",
          "Status",
          "Workshop/Showroom",
          "Assigned To",
          "Stage",
          "Remarks",
        ],
      ],
      body: tableData,
      startY: 23,
      styles: { fontSize: 7, cellPadding: 2 },
      headStyles: { fillColor: [35, 55, 85] },
    });

    doc.save("orders_report.pdf");
  };

  // Excel export
  const downloadExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(filteredOrders);
    const workbook = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(workbook, worksheet, "Orders");
    XLSX.writeFile(workbook, "orders_report.xlsx");
  };

  // Filter orders
  const filteredOrders = orders.filter((order) => {
    const matchesName = (order.name || "")
      .toLowerCase()
      .includes(filterName.toLowerCase());

    const matchesDate = filterDate
      ? order.date === filterDate
      : true;

    return matchesName && matchesDate;
  });

  const clearFilters = () => {
    setFilterName("");
    setFilterDate("");
  };

  const renderInput = (field) => {
    const isNumber = ["quantity", "unitPrice", "deposit"].includes(field);
    const isDate = field.toLowerCase().includes("date");

    return (
      <Form.Group className="mb-3" key={field}>
        <Form.Label className="orders-label">
          {fieldLabels[field] || field}
          {field !== "remarks" && (
            <span className="text-danger ms-1">*</span>
          )}
        </Form.Label>

        <Form.Control
          type={isNumber ? "number" : isDate ? "date" : "text"}
          name={field}
          value={formData[field] ?? ""}
          onChange={handleChange}
          required={field !== "remarks"}
          min={isNumber ? "0" : undefined}
          step={isNumber ? "any" : undefined}
          placeholder={
            isDate
              ? "Select date"
              : `Enter ${(fieldLabels[field] || field).toLowerCase()}`
          }
          className="orders-input"
        />
      </Form.Group>
    );
  };

  const viewSections = selectedOrder
    ? [
        {
          title: "Customer Information",
          fields: [
            ["Customer Name", selectedOrder.name],
            ["Phone Number", selectedOrder.phone],
            ["Order Date", selectedOrder.date],
            ["Item Description", selectedOrder.itemDescription],
          ],
        },
        {
          title: "Order & Payment",
          fields: [
            ["Quantity", selectedOrder.quantity],
            ["Unit Price", selectedOrder.unitPrice],
            ["Total Price", selectedOrder.totalPrice],
            ["Deposit", selectedOrder.deposit],
            ["Balance", selectedOrder.balance],
            ["Payment Status", selectedOrder.paymentStatus],
          ],
        },
        {
          title: "Production & Completion",
          fields: [
            ["Expected Finish Date", selectedOrder.expectedFinishDate],
            ["Actual Completion Date", selectedOrder.actualCompletionDate],
            ["Order Status", selectedOrder.status],
            ["Production Stage", selectedOrder.stage],
          ],
        },
        {
          title: "Assignment & Remarks",
          fields: [
            ["Workshop / Showroom", selectedOrder.showroomOrWorkshopName],
            ["Assigned To", selectedOrder.assignedTo],
            ["Receiver & Remarks", selectedOrder.remarks],
          ],
        },
      ]
    : [];

  return (
    <div className="container-fluid px-3 px-md-4 py-4 orders-page">
      <style>{`
        .orders-page {
          color: #243047;
          min-width: 0;
        }

        .orders-heading {
          font-weight: 750;
          letter-spacing: -0.5px;
          color: #1d2b43;
        }

        .orders-subtitle {
          color: #748096;
          font-size: 0.92rem;
        }

        .orders-toolbar,
        .orders-filter-card,
        .orders-table-card {
          background: #fff;
          border: 1px solid #e7ebf1;
          border-radius: 14px;
          box-shadow: 0 4px 18px rgba(31, 45, 61, 0.04);
        }

        .orders-toolbar,
        .orders-filter-card {
          padding: 16px;
        }

        .orders-table-card {
          overflow: hidden;
        }

        .orders-table-scroll {
          overflow-x: auto;
          width: 100%;
        }

        .orders-table {
          margin-bottom: 0;
          white-space: nowrap;
          vertical-align: middle;
        }

        .orders-table thead th {
          background: #f4f7fb;
          color: #43516a;
          font-size: 0.78rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.35px;
          padding: 14px 12px;
          border-bottom: 1px solid #e5eaf1;
        }

        .orders-table tbody td {
          padding: 12px;
          font-size: 0.88rem;
          color: #46536a;
        }

        .orders-table tbody tr:hover td {
          background: #f8faff;
        }

        .orders-modal .modal-content {
          border: none;
          border-radius: 16px;
          overflow: hidden;
          box-shadow: 0 20px 65px rgba(20, 33, 55, 0.2);
        }

        .orders-modal .modal-header {
          padding: 20px 24px;
          background: linear-gradient(135deg, #203653, #315b83);
          color: #fff;
          border-bottom: none;
        }

        .orders-modal .modal-title {
          font-size: 1.15rem;
          font-weight: 700;
        }

        .orders-modal .btn-close {
          filter: brightness(0) invert(1);
        }

        .orders-modal .modal-body {
          background: #f8fafd;
          padding: 22px 24px;
          overflow-y: auto;
          overscroll-behavior: contain;
        }

        .orders-section {
          background: #fff;
          border: 1px solid #e5eaf1;
          border-radius: 12px;
          padding: 18px;
          margin-bottom: 16px;
        }

        .orders-section-title {
          color: #243c5a;
          font-size: 0.95rem;
          font-weight: 750;
          margin-bottom: 16px;
          padding-bottom: 10px;
          border-bottom: 1px solid #edf0f5;
        }

        .orders-label {
          display: block;
          font-size: 0.83rem;
          font-weight: 650;
          color: #47566e;
          margin-bottom: 7px;
        }

        .orders-input {
          min-height: 43px;
          border: 1px solid #dce3ed;
          border-radius: 8px;
          font-size: 0.9rem;
          padding: 10px 12px;
          background-color: #fff;
        }

        .orders-input:focus {
          border-color: #7099c5;
          box-shadow: 0 0 0 3px rgba(49, 91, 131, 0.11);
        }

        .orders-readonly {
          background: #eef3f9 !important;
          color: #203653;
          font-weight: 700;
        }

        .orders-modal-footer {
          position: sticky;
          bottom: -22px;
          z-index: 2;
          background: #f8fafd;
          border-top: 1px solid #e5eaf1;
          padding: 16px 0 0;
          margin-top: 6px;
        }

        .orders-action-btn {
          min-height: 40px;
          font-weight: 600;
          border-radius: 8px;
        }

        /* Portrait view-order popup */
        .order-view-modal .modal-content {
          border-radius: 14px;
          overflow: hidden;
          border: none;
          box-shadow: 0 16px 45px rgba(20, 33, 55, 0.2);
        }

        .order-view-header {
          background: linear-gradient(135deg, #203653, #315b83);
          color: white;
          padding: 20px 24px;
        }

        .order-view-header .btn-close {
          filter: brightness(0) invert(1);
        }

        .order-view-body {
          padding: 24px;
          background: #fff;
          max-height: 72vh;
          overflow-y: auto;
        }

        .order-view-brand {
          text-align: center;
          padding-bottom: 18px;
          margin-bottom: 20px;
          border-bottom: 2px solid #e8edf4;
        }

        .order-view-brand h5 {
          color: #203653;
          font-weight: 800;
          margin-bottom: 5px;
        }

        .order-view-section {
          margin-bottom: 20px;
          break-inside: avoid;
        }

        .order-view-section-title {
          color: #315b83;
          font-size: 0.82rem;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.7px;
          padding-bottom: 8px;
          margin-bottom: 8px;
          border-bottom: 1px solid #e8edf4;
        }

        .order-view-row {
          display: flex;
          justify-content: space-between;
          gap: 14px;
          padding: 9px 0;
          border-bottom: 1px solid #f0f2f6;
          font-size: 0.88rem;
        }

        .order-view-label {
          color: #748096;
          flex: 0 0 45%;
          overflow-wrap: anywhere;
        }

        .order-view-value {
          color: #243047;
          font-weight: 600;
          text-align: right;
          flex: 1;
          min-width: 0;
          overflow-wrap: anywhere;
          white-space: pre-wrap;
        }

        .order-view-footer {
          padding: 14px 24px;
          background: #f8fafd;
          border-top: 1px solid #e8edf4;
        }

        @media (max-width: 575.98px) {
          .orders-modal .modal-dialog {
            margin: 0.5rem;
          }

          .orders-modal .modal-header {
            padding: 16px;
          }

          .orders-modal .modal-body {
            padding: 14px;
            max-height: calc(100dvh - 125px);
          }

          .orders-section {
            padding: 14px;
          }

          .orders-toolbar {
            padding: 12px;
          }

          .order-view-modal .modal-dialog {
            margin: 0.5rem;
          }

          .order-view-body {
            padding: 18px;
            max-height: 68vh;
          }

          .order-view-header {
            padding: 16px 18px;
          }

          .order-view-footer {
            padding: 12px 18px;
          }
        }

        @media print {
          body * {
            visibility: hidden !important;
          }

          .order-view-modal,
          .order-view-modal * {
            visibility: visible !important;
          }

          .order-view-modal {
            position: absolute !important;
            inset: 0 !important;
            width: 100% !important;
            max-width: 100% !important;
            margin: 0 !important;
            padding: 0 !important;
          }

          .order-view-modal .modal-content {
            box-shadow: none !important;
            border: none !important;
          }

          .order-view-footer,
          .order-view-header .btn-close {
            display: none !important;
          }

          .order-view-body {
            max-height: none !important;
            overflow: visible !important;
          }
        }
      `}</style>

      {/* Page heading */}
      <div className="d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-3 mb-4">
        <div>
          <h3 className="orders-heading mb-1">Orders Management</h3>
          <div className="orders-subtitle">
            Manage customer orders, payments, and production progress.
          </div>
        </div>

        <div className="d-flex align-items-center gap-2">
          <span className="badge rounded-pill text-bg-light border px-3 py-2">
            {filteredOrders.length}{" "}
            {filteredOrders.length === 1 ? "Order" : "Orders"}
          </span>
        </div>
      </div>

      {/* Action buttons */}
      <div className="orders-toolbar mb-3">
        <div className="d-flex flex-wrap gap-2">
          <Button
            variant="primary"
            className="orders-action-btn px-3"
            onClick={handleAdd}
          >
            <span className="me-2">+</span>
            Add Order
          </Button>

          <Button
            variant="outline-danger"
            className="orders-action-btn px-3"
            onClick={downloadPDF}
          >
            Download PDF
          </Button>

          <Button
            variant="outline-success"
            className="orders-action-btn px-3"
            onClick={downloadExcel}
          >
            Download Excel
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="orders-filter-card mb-3">
        <div className="d-flex align-items-center justify-content-between gap-2 mb-3">
          <h6 className="fw-bold mb-0">Filter Orders</h6>
          <Button
            variant="link"
            size="sm"
            className="text-decoration-none p-0"
            onClick={clearFilters}
          >
            Clear filters
          </Button>
        </div>

        <Form>
          <Row className="g-3 align-items-end">
            <Col xs={12} md={5}>
              <Form.Label className="orders-label">
                Customer Name
              </Form.Label>
              <InputGroup>
                <InputGroup.Text>
                  <span aria-hidden="true">⌕</span>
                </InputGroup.Text>
                <Form.Control
                  type="text"
                  placeholder="Search by customer name"
                  value={filterName}
                  onChange={(e) => setFilterName(e.target.value)}
                />
              </InputGroup>
            </Col>

            <Col xs={12} md={4}>
              <Form.Label className="orders-label">
                Order Date
              </Form.Label>
              <Form.Control
                type="date"
                value={filterDate}
                onChange={(e) => setFilterDate(e.target.value)}
              />
            </Col>

            <Col xs={12} md={3}>
              <Button
                variant="secondary"
                className="w-100 orders-action-btn"
                onClick={clearFilters}
                type="button"
              >
                Reset Filters
              </Button>
            </Col>
          </Row>
        </Form>
      </div>

      {/* Orders table */}
      <div className="orders-table-card">
        <div className="d-flex flex-column flex-sm-row justify-content-between align-items-sm-center gap-2 p-3 border-bottom">
          <div>
            <h6 className="fw-bold mb-1">Order Records</h6>
            <small className="text-muted">
              Scroll horizontally to view all columns.
            </small>
          </div>
          <small className="text-muted">
            Showing {filteredOrders.length} of {orders.length}
          </small>
        </div>

        <div className="orders-table-scroll">
          <Table hover className="orders-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Customer Name</th>
                <th>Date</th>
                <th>Phone</th>
                <th>Item Description</th>
                <th>Qty</th>
                <th>Unit Price</th>
                <th>Total</th>
                <th>Deposit</th>
                <th>Balance</th>
                <th>Payment Status</th>
                <th>Expected Finish</th>
                <th>Actual Completion</th>
                <th>Status</th>
                <th>Workshop/Showroom</th>
                <th>Assigned To</th>
                <th>Stage</th>
                <th>Receiver & Remarks</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={19} className="text-center py-5">
                    <div className="fw-semibold text-secondary">
                      No orders found
                    </div>
                    <small className="text-muted">
                      Try changing your filters or add a new order.
                    </small>
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order, index) => {
                  const originalIndex = orders.findIndex(
                    (item) => item.id === order.id
                  );

                  return (
                    <tr key={order.id || index}>
                      <td>{index + 1}</td>
                      <td className="fw-semibold">{order.name}</td>
                      <td>{order.date}</td>
                      <td>{order.phone}</td>
                      <td>{order.itemDescription}</td>
                      <td>{order.quantity}</td>
                      <td>{order.unitPrice}</td>
                      <td>{order.totalPrice}</td>
                      <td>{order.deposit}</td>
                      <td>{order.balance}</td>
                      <td>{order.paymentStatus}</td>
                      <td>{order.expectedFinishDate}</td>
                      <td>{order.actualCompletionDate}</td>
                      <td>{order.status}</td>
                      <td>{order.showroomOrWorkshopName}</td>
                      <td>{order.assignedTo}</td>
                      <td>{order.stage}</td>
                      <td>{order.remarks}</td>
                      <td>
                        <div className="d-flex gap-2">
                          <Button
                            variant="outline-info"
                            size="sm"
                            onClick={() => handleView(order)}
                          >
                            View
                          </Button>

                          <Button
                            variant="outline-primary"
                            size="sm"
                            onClick={() => handleEdit(originalIndex)}
                          >
                            Edit
                          </Button>

                          <Button
                            variant="outline-danger"
                            size="sm"
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
      </div>

      {/* Add/Edit order modal */}
      <Modal
        show={showModal}
        onHide={() => {
          if (!saving) setShowModal(false);
        }}
        size="lg"
        scrollable
        centered={false}
        dialogClassName="orders-modal"
        contentClassName="border-0"
        backdrop={saving ? "static" : true}
        keyboard={!saving}
      >
        <Modal.Header closeButton>
          <div>
            <Modal.Title>
              {editingIndex !== null ? "Edit Order" : "Add New Order"}
            </Modal.Title>
            <div className="small opacity-75 mt-1">
              Enter the order details below.
            </div>
          </div>
        </Modal.Header>

        <Modal.Body>
          <Form onSubmit={handleSubmit}>
            {/* Customer information */}
            <div className="orders-section">
              <h6 className="orders-section-title">
                1. Customer Information
              </h6>

              <Row className="g-3">
                <Col xs={12} md={6}>
                  {renderInput("name")}
                </Col>
                <Col xs={12} md={6}>
                  {renderInput("phone")}
                </Col>
                <Col xs={12} md={6}>
                  {renderInput("date")}
                </Col>
                <Col xs={12}>
                  {renderInput("itemDescription")}
                </Col>
              </Row>
            </div>

            {/* Order and payment */}
            <div className="orders-section">
              <h6 className="orders-section-title">
                2. Order & Payment Details
              </h6>

              <Row className="g-3">
                <Col xs={12} sm={6}>
                  {renderInput("quantity")}
                </Col>
                <Col xs={12} sm={6}>
                  {renderInput("unitPrice")}
                </Col>

                <Col xs={12} sm={6}>
                  <Form.Group className="mb-3">
                    <Form.Label className="orders-label">
                      Total Price
                    </Form.Label>
                    <Form.Control
                      type="number"
                      name="totalPrice"
                      value={formData.totalPrice ?? ""}
                      readOnly
                      className="orders-input orders-readonly"
                    />
                    <Form.Text className="text-muted">
                      Automatically calculated.
                    </Form.Text>
                  </Form.Group>
                </Col>

                <Col xs={12} sm={6}>
                  {renderInput("deposit")}
                </Col>

                <Col xs={12} sm={6}>
                  <Form.Group className="mb-3">
                    <Form.Label className="orders-label">
                      Balance
                    </Form.Label>
                    <Form.Control
                      type="number"
                      name="balance"
                      value={formData.balance ?? ""}
                      readOnly
                      className="orders-input orders-readonly"
                    />
                    <Form.Text className="text-muted">
                      Total price minus deposit.
                    </Form.Text>
                  </Form.Group>
                </Col>

                <Col xs={12} sm={6}>
                  {renderInput("paymentStatus")}
                </Col>
              </Row>
            </div>

            {/* Production tracking */}
            <div className="orders-section">
              <h6 className="orders-section-title">
                3. Production & Completion
              </h6>

              <Row className="g-3">
                <Col xs={12} sm={6}>
                  {renderInput("expectedFinishDate")}
                </Col>
                <Col xs={12} sm={6}>
                  {renderInput("actualCompletionDate")}
                </Col>

                <Col xs={12} sm={6}>
                  <Form.Group className="mb-3">
                    <Form.Label className="orders-label">
                      Order Status
                      <span className="text-danger ms-1">*</span>
                    </Form.Label>
                    <Form.Select
                      name="status"
                      value={formData.status ?? ""}
                      onChange={handleChange}
                      required
                      className="orders-input"
                    >
                      <option value="">Select status</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Completed">Completed</option>
                    </Form.Select>
                  </Form.Group>
                </Col>

                <Col xs={12} sm={6}>
                  <Form.Group className="mb-3">
                    <Form.Label className="orders-label">
                      Production Stage
                      <span className="text-danger ms-1">*</span>
                    </Form.Label>
                    <Form.Select
                      name="stage"
                      value={formData.stage ?? ""}
                      onChange={handleChange}
                      required
                      className="orders-input"
                    >
                      <option value="">Select stage</option>
                      <option value="Cutting">Cutting</option>
                      <option value="Assembly">Assembly</option>
                      <option value="Finishing">Finishing</option>
                    </Form.Select>
                  </Form.Group>
                </Col>
              </Row>
            </div>

            {/* Assignment and remarks */}
            <div className="orders-section mb-0">
              <h6 className="orders-section-title">
                4. Assignment & Remarks
              </h6>

              <Row className="g-3">
                <Col xs={12} sm={6}>
                  {renderInput("showroomOrWorkshopName")}
                </Col>
                <Col xs={12} sm={6}>
                  {renderInput("assignedTo")}
                </Col>
                <Col xs={12}>
                  {renderInput("remarks")}
                </Col>
              </Row>
            </div>

            {/* Form actions */}
            <div className="orders-modal-footer">
              <div className="d-flex flex-column-reverse flex-sm-row justify-content-end gap-2 pb-1">
                <Button
                  type="button"
                  variant="outline-secondary"
                  className="orders-action-btn px-4"
                  disabled={saving}
                  onClick={() => setShowModal(false)}
                >
                  Cancel
                </Button>

                <Button
                  type="submit"
                  variant="primary"
                  className="orders-action-btn px-4"
                  disabled={saving}
                >
                  {saving
                    ? "Saving..."
                    : editingIndex !== null
                    ? "Save Changes"
                    : "Add Order"}
                </Button>
              </div>
            </div>
          </Form>
        </Modal.Body>
      </Modal>

      {/* View Order - Portrait Popup */}
      <Modal
        show={showViewModal}
        onHide={() => setShowViewModal(false)}
        centered
        dialogClassName="order-view-modal"
        contentClassName="border-0"
      >
        <Modal.Header closeButton className="order-view-header">
          <div>
            <Modal.Title className="fw-bold">
              Order Details
            </Modal.Title>
            <div className="small opacity-75 mt-1">
              Complete order information
            </div>
          </div>
        </Modal.Header>

        <Modal.Body className="order-view-body">
          {selectedOrder && (
            <>
              <div className="order-view-brand">
                <h5>ORDER RECORD</h5>
                <div className="text-muted small">
                  Order details and production tracking
                </div>
                <div className="small mt-2">
                  Order ID: {selectedOrder.id ?? "N/A"}
                </div>
              </div>

              {viewSections.map((section) => (
                <div className="order-view-section" key={section.title}>
                  <div className="order-view-section-title">
                    {section.title}
                  </div>

                  {section.fields.map(([label, value]) => (
                    <div className="order-view-row" key={label}>
                      <span className="order-view-label">{label}</span>
                      <span className="order-view-value">
                        {value !== null &&
                        value !== undefined &&
                        value !== ""
                          ? value
                          : "—"}
                      </span>
                    </div>
                  ))}
                </div>
              ))}
            </>
          )}
        </Modal.Body>

        <Modal.Footer className="order-view-footer">
          <Button
            variant="outline-secondary"
            onClick={() => setShowViewModal(false)}
          >
            Close
          </Button>

          <Button
            variant="primary"
            onClick={() => window.print()}
          >
            Print Order
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default Orders;
