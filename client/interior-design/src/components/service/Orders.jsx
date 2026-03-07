import React, { useState, useEffect } from "react";
import { Table, Form, Button, Modal } from "react-bootstrap";
import { jsPDF } from "jspdf";
import "jspdf-autotable";
import * as XLSX from "xlsx";

const API_URL = "http://localhost:9193/api/orders";

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingIndex, setEditingIndex] = useState(null);

  const [formData, setFormData] = useState({
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
  });

  // FILTER STATES
  const [filterName, setFilterName] = useState("");
  const [filterDate, setFilterDate] = useState("");

  // Fetch orders
  useEffect(() => {
    fetch(API_URL)
      .then((res) => res.json())
      .then((data) => setOrders(data))
      .catch((err) => console.error(err));
  }, []);

  // Handle input change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      const updated = { ...prev, [name]: value };

      const qty = name === "quantity" ? value : prev.quantity;
      const price = name === "unitPrice" ? value : prev.unitPrice;
      updated.totalPrice = qty && price ? qty * price : "";

      const dep = name === "deposit" ? value : prev.deposit;
      updated.balance =
        updated.totalPrice && dep ? updated.totalPrice - dep : "";

      return updated;
    });
  };

  // Add or update order
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingIndex !== null) {
        const orderId = orders[editingIndex].id;
        const res = await fetch(`${API_URL}/${orderId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });
        const updatedOrder = await res.json();
        setOrders((prev) =>
          prev.map((o, i) => (i === editingIndex ? updatedOrder : o))
        );
        setEditingIndex(null);
      } else {
        const res = await fetch(API_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });
        const newOrder = await res.json();
        setOrders((prev) => [...prev, newOrder]);
      }

      // Reset form
      setFormData({
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
      });

      setShowModal(false);
    } catch (err) {
      console.error("Save error:", err);
    }
  };

  const handleEdit = (index) => {
    setFormData(orders[index]);
    setEditingIndex(index);
    setShowModal(true);
  };

  const handleDelete = async (index) => {
    if (!window.confirm("Delete this order?")) return;
    try {
      const orderId = orders[index].id;
      await fetch(`${API_URL}/${orderId}`, { method: "DELETE" });
      setOrders((prev) => prev.filter((_, i) => i !== index));
    } catch (err) {
      console.error("Delete error:", err);
    }
  };

  // PDF export
  const downloadPDF = () => {
    const doc = new jsPDF();
    doc.text("Orders Report", 14, 10);

    const tableData = orders.map((o, i) => [
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
      startY: 20,
    });

    doc.save("orders_report.pdf");
  };

  // Excel export
  const downloadExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(orders);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Orders");
    XLSX.writeFile(workbook, "orders_report.xlsx");
  };

  // FILTERED ORDERS
  const filteredOrders = orders.filter((o) => {
    const matchesName = o.name.toLowerCase().includes(filterName.toLowerCase());
    const matchesDate = filterDate ? o.date === filterDate : true;
    return matchesName && matchesDate;
  });

  return (
    <div className="container mt-4">
      <h3>Orders</h3>

      <Button
        variant="primary"
        onClick={() => setShowModal(true)}
        className="me-2"
      >
        Add Order
      </Button>

      <Button variant="success" onClick={downloadPDF} className="me-2">
        Download PDF
      </Button>

      <Button variant="info" onClick={downloadExcel}>
        Download Excel
      </Button>

      {/* Filter Section */}
      <Form className="mb-3 d-flex gap-2 mt-3">
        <Form.Control
          type="text"
          placeholder="Filter by Name"
          value={filterName}
          onChange={(e) => setFilterName(e.target.value)}
        />
        <Form.Control
          type="date"
          placeholder="Filter by Date"
          value={filterDate}
          onChange={(e) => setFilterDate(e.target.value)}
        />
        <Button
          variant="secondary"
          onClick={() => {
            setFilterName("");
            setFilterDate("");
          }}
        >
          Clear
        </Button>
      </Form>

      <Table striped bordered hover className="mt-3">
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
            <th> reciever& remarks</th>
            <th>Actions</th>
          </tr>
        </thead>

        <tbody>
          {filteredOrders.length === 0 ? (
            <tr>
              <td colSpan="19" className="text-center">
                No orders found.
              </td>
            </tr>
          ) : (
            filteredOrders.map((o, index) => (
              <tr key={o.id || index}>
                <td>{index + 1}</td>
                <td>{o.name}</td>
                <td>{o.date}</td>
                <td>{o.phone}</td>
                <td>{o.itemDescription}</td>
                <td>{o.quantity}</td>
                <td>{o.unitPrice}</td>
                <td>{o.totalPrice}</td>
                <td>{o.deposit}</td>
                <td>{o.balance}</td>
                <td>{o.paymentStatus}</td>
                <td>{o.expectedFinishDate}</td>
                <td>{o.actualCompletionDate}</td>
                <td>{o.status}</td>
                <td>{o.showroomOrWorkshopName}</td>
                <td>{o.assignedTo}</td>
                <td>{o.stage}</td>
                <td>{o.remarks}</td>
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
          <Modal.Title>
            {editingIndex !== null ? "Edit Order" : "Add Order"}
          </Modal.Title>
        </Modal.Header>

        <Modal.Body>
          <Form onSubmit={handleSubmit}>
            {[
              "name",
              "date",
              "phone",
              "itemDescription",
              "quantity",
              "unitPrice",
              "deposit",
              "paymentStatus",
              "expectedFinishDate",
              "actualCompletionDate",
              "showroomOrWorkshopName",
              "assignedTo",
              "remarks",
            ].map((field) => (
              <Form.Group className="mb-2" key={field}>
                <Form.Label>
                  {field
                    .replace(/([A-Z])/g, " $1")
                    .replace(/^./, (str) => str.toUpperCase())}
                </Form.Label>

                <Form.Control
                  type={
                    ["quantity", "unitPrice", "deposit"].includes(field)
                      ? "number"
                      : field.toLowerCase().includes("date")
                      ? "date"
                      : "text"
                  }
                  name={field}
                  value={formData[field]}
                  onChange={handleChange}
                  required={field !== "remarks"}
                />
              </Form.Group>
            ))}

            {/* STATUS SELECT */}
            <Form.Group className="mb-2">
              <Form.Label>Status</Form.Label>
              <Form.Control
                as="select"
                name="status"
                value={formData.status}
                onChange={handleChange}
                required
              >
                <option value="">Select...</option>
                <option value="In Progress">In Progress</option>
                <option value="Completed">Completed</option>
              </Form.Control>
            </Form.Group>

            {/* STAGE SELECT */}
            <Form.Group className="mb-2">
              <Form.Label>Stage</Form.Label>
              <Form.Control
                as="select"
                name="stage"
                value={formData.stage}
                onChange={handleChange}
                required
              >
                <option value="">Select...</option>
                <option value="Cutting">Cutting</option>
                <option value="Assembly">Assembly</option>
                <option value="Finishing">Finishing</option>
              </Form.Control>
            </Form.Group>

            {/* READ-ONLY CALCULATIONS */}
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
              <Form.Label>Balance</Form.Label>
              <Form.Control
                type="number"
                name="balance"
                value={formData.balance}
                readOnly
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

export default Orders;
