import React, { useState, useEffect } from "react";
import { Table, Form, Button, Modal } from "react-bootstrap";
import { jsPDF } from "jspdf";
import "jspdf-autotable";
import * as XLSX from "xlsx";

const API_URL = "http://localhost:9193/api/finished-products";

const FinishedProduct = () => {
  const [products, setProducts] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingIndex, setEditingIndex] = useState(null);

  const [formData, setFormData] = useState({
    date: "",
    dateOut: "",
    productName: "",
    sizeOrDesign: "",
    quantityIn: "",
    quantityOut: "",
    balance: "",
    fromWorkshopName: "",
    showroomName: "",
    approvedBy: "",
    photo: null,
    photoPreview: "",
  });

  useEffect(() => {
    fetch(API_URL)
      .then((res) => res.json())
      .then(setProducts)
      .catch(console.error);
  }, []);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "photo" && files.length > 0) {
      setFormData((prev) => ({
        ...prev,
        photo: files[0],
        photoPreview: URL.createObjectURL(files[0]),
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = new FormData();
    Object.keys(formData).forEach((key) => {
      if (key === "photo" && formData.photo) data.append(key, formData.photo);
      else if (key !== "photoPreview") data.append(key, formData[key]);
    });

    try {
      let res;
      if (editingIndex !== null) {
        const id = products[editingIndex].id;
        res = await fetch(`${API_URL}/${id}`, { method: "PUT", body: data });
        const updated = await res.json();
        setProducts((prev) =>
          prev.map((p, i) => (i === editingIndex ? updated : p))
        );
        setEditingIndex(null);
      } else {
        res = await fetch(API_URL, { method: "POST", body: data });
        const newProduct = await res.json();
        setProducts((prev) => [...prev, newProduct]);
      }

      setFormData({
        date: "",
        dateOut: "",
        productName: "",
        sizeOrDesign: "",
        quantityIn: "",
        quantityOut: "",
        balance: "",
        fromWorkshopName: "",
        showroomName: "",
        approvedBy: "",
        photo: null,
        photoPreview: "",
      });
      setShowModal(false);
    } catch (err) {
      console.error(err);
    }
  };

  const handleEdit = (index) => {
    const p = products[index];
    setFormData({ ...p, photo: null, photoPreview: p.photo ? `http://localhost:9193/uploads/${p.photo}` : "" });
    setEditingIndex(index);
    setShowModal(true);
  };

  const handleDelete = async (index) => {
    const id = products[index].id;
    if (!window.confirm("Delete this record?")) return;
    await fetch(`${API_URL}/${id}`, { method: "DELETE" });
    setProducts((prev) => prev.filter((_, i) => i !== index));
  };

  const downloadPDF = () => {
    const doc = new jsPDF();
    doc.text("Finished Products Report", 14, 10);
    const tableData = products.map((p, i) => [
      i + 1,
      p.date,
      p.dateOut,
      p.productName,
      p.sizeOrDesign,
      p.quantityIn,
      p.quantityOut,
      p.balance,
      p.fromWorkshopName,
      p.showroomName,
      p.approvedBy,
    ]);
    doc.autoTable({ head: [["#", "Date In", "Date Out", "Product", "Size/Design", "Qty In", "Qty Out", "Balance", "From Workshop", "Showroom", "Approved By"]], body: tableData, startY: 20 });
    doc.save("finished_products_report.pdf");
  };

  const downloadExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(products);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Finished Products");
    XLSX.writeFile(workbook, "finished_products_report.xlsx");
  };

  return (
    <div className="container mt-4">
      <h3>Finished Products</h3>
      <Button onClick={() => setShowModal(true)}>Add Product</Button>
      <Button onClick={downloadPDF} className="ms-2">Download PDF</Button>
      <Button onClick={downloadExcel} className="ms-2">Download Excel</Button>

      <Table striped bordered hover className="mt-3">
        <thead>
          <tr>
            <th>#</th><th>Date In</th><th>Date Out</th><th>Product Name</th><th>Size/Design</th><th>Qty In</th><th>Qty Out</th><th>Balance</th><th>From Workshop</th><th>Showroom</th><th>Approved By</th><th>Photo</th><th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {products.length === 0 ? <tr><td colSpan="13">No records found.</td></tr> : products.map((item, index) => (
            <tr key={item.id}>
              <td>{index+1}</td>
              <td>{item.date}</td>
              <td>{item.dateOut}</td>
              <td>{item.productName}</td>
              <td>{item.sizeOrDesign}</td>
              <td>{item.quantityIn}</td>
              <td>{item.quantityOut}</td>
              <td>{item.balance}</td>
              <td>{item.fromWorkshopName}</td>
              <td>{item.showroomName}</td>
              <td>{item.approvedBy}</td>
              <td>{item.photo && <img src={`http://localhost:9193/uploads/${item.photo}`} alt="Product" width="50" />}</td>
              <td>
                <Button size="sm" onClick={() => handleEdit(index)}>Edit</Button>
                <Button size="sm" variant="danger" onClick={() => handleDelete(index)}>Delete</Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>

      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>{editingIndex !== null ? "Edit Product" : "Add Product"}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleSubmit}>
            {["date","dateOut","productName","sizeOrDesign","quantityIn","quantityOut","balance","fromWorkshopName","showroomName","approvedBy"].map((key) => (
              <Form.Group className="mb-2" key={key}>
                <Form.Label>{key}</Form.Label>
                <Form.Control type={["quantityIn","quantityOut","balance"].includes(key)?"number":"text"} name={key} value={formData[key]} onChange={handleChange} required />
              </Form.Group>
            ))}
            <Form.Group className="mb-2">
              <Form.Label>Photo</Form.Label>
              <Form.Control type="file" name="photo" onChange={handleChange} />
              {formData.photoPreview && <img src={formData.photoPreview} width="100" className="mt-2" />}
            </Form.Group>
            <Button type="submit">{editingIndex !== null ? "Update" : "Add"}</Button>
          </Form>
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default FinishedProduct;
