import React, { useState, useEffect, useRef } from "react";
import { Card, Row, Col, Table, Spinner, Button } from "react-bootstrap";
import { Pie, Bar, Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement,
  BarElement,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend
} from "chart.js";
import { getAllRooms } from "../utils/ApiFunctions";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import * as XLSX from "xlsx";

ChartJS.register(
  ArcElement,
  BarElement,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend
);

const SALES_API_URL = "http://localhost:9193/api/sales";
const ORDERS_API_URL = "http://localhost:9193/api/orders";

const Dashboard = () => {
  const [rooms, setRooms] = useState([]);
  const [sales, setSales] = useState([]);
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const dashboardRef = useRef();

  const fetchRooms = async () => {
    setIsLoading(true);
    try {
      const data = await getAllRooms();
      setRooms(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchSales = async () => {
    try {
      const res = await fetch(SALES_API_URL);
      const data = await res.json();
      setSales(data);
    } catch (err) {
      console.error("Sales fetch error:", err);
    }
  };

  const fetchOrders = async () => {
    try {
      const res = await fetch(ORDERS_API_URL);
      const data = await res.json();
      setOrders(data);
    } catch (err) {
      console.error("Orders fetch error:", err);
    }
  };

  useEffect(() => {
    fetchRooms();
    fetchSales();
    fetchOrders();
  }, []);

  const exportPDF = async () => {
    const canvas = await html2canvas(dashboardRef.current, { scale: 2 });
    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF("p", "mm", "a4");
    const imgProps = pdf.getImageProperties(imgData);
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
    pdf.text(`Report Generated: ${new Date().toLocaleString()}`, 10, 10);
    pdf.addImage(imgData, "PNG", 0, 15, pdfWidth, pdfHeight);
    pdf.save("dashboard_report.pdf");
  };

  const exportExcel = () => {
    const wb = XLSX.utils.book_new();
    const salesSheet = [
      ["Total Sales (Ksh)", "Total Items Sold", "Total Customers"],
      [sales.reduce((sum, s) => sum + Number(s.totalPrice || 0), 0),
       sales.reduce((sum, s) => sum + Number(s.quantity || 0), 0),
       new Set(sales.map((s) => s.customerName)).size]
    ];
    const ordersSheet = [
      ["Total Orders", "Total Quantity", "Total Revenue", "Total Deposits", "Total Balance"],
      [orders.length,
       orders.reduce((sum, o) => sum + Number(o.quantity || 0), 0),
       orders.reduce((sum, o) => sum + Number(o.totalPrice || 0), 0),
       orders.reduce((sum, o) => sum + Number(o.deposit || 0), 0),
       orders.reduce((sum, o) => sum + Number(o.balance || 0), 0)]
    ];
    XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(salesSheet), "Sales Summary");
    XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(ordersSheet), "Orders Summary");
    XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet([["Report Generated"], [new Date().toLocaleString()]]), "Generated On");
    XLSX.writeFile(wb, "dashboard_report.xlsx");
  };

  if (isLoading) {
    return (
      <div className="text-center my-5">
        <Spinner animation="border" variant="primary" />
      </div>
    );
  }

  if (error) {
    return <p className="text-danger text-center">{error}</p>;
  }

  const roomStats = rooms.reduce((acc, room) => {
    if (!acc[room.roomType]) acc[room.roomType] = { count: 0, totalAmount: 0 };
    acc[room.roomType].count += 1;
    acc[room.roomType].totalAmount += room.roomPrice;
    return acc;
  }, {});

  const totalRooms = rooms.length;
  const totalSalesAmount = sales.reduce((sum, s) => sum + Number(s.totalPrice || 0), 0);
  const totalItemsSold = sales.reduce((sum, s) => sum + Number(s.quantity || 0), 0);
  const totalCustomers = new Set(sales.map((s) => s.customerName)).size;
  const totalOrderQuantity = orders.reduce((sum, o) => sum + Number(o.quantity || 0), 0);
  const totalOrderAmount = orders.reduce((sum, o) => sum + Number(o.totalPrice || 0), 0);
  const totalOrderDeposits = orders.reduce((sum, o) => sum + Number(o.deposit || 0), 0);
  const totalOrderBalance = orders.reduce((sum, o) => sum + Number(o.balance || 0), 0);
  const totalOrders = orders.length;

  const roomPieData = { labels: Object.keys(roomStats), datasets: [{ data: Object.values(roomStats).map(i => i.count), backgroundColor: ["#4e73df","#1cc88a","#36b9cc","#f6c23e","#e74a3b"] }] };
  const roomBarData = { labels: Object.keys(roomStats), datasets: [{ label:"Total Price (Ksh)", data:Object.values(roomStats).map(i=>i.totalAmount), backgroundColor:"#4e73df" }] };
  const salesLineData = { labels:sales.map(s=>s.date), datasets:[{ label:"Sales Amount", data:sales.map(s=>s.totalPrice), fill:false, borderColor:"#1cc88a", tension:0.3 }] };
  const orderPieData = { labels:["Paid","Not Fully Paid"], datasets:[{ data:[orders.filter(o=>o.paymentStatus?.toLowerCase()==="paid").length, orders.filter(o=>o.paymentStatus?.toLowerCase()!=="paid").length], backgroundColor:["#1cc88a","#e74a3b"] }] };
  const orderBarData = { labels:["Total Deposits","Total Balance"], datasets:[{ label:"Amount (Ksh)", data:[totalOrderDeposits,totalOrderBalance], backgroundColor:["#36b9cc","#f6c23e"] }] };
  const orderLineData = { labels:orders.map(o=>o.date), datasets:[{ label:"Order Total Price", data:orders.map(o=>o.totalPrice), fill:false, borderColor:"#ff7300", tension:0.3 }] };

  return (
    <section className="container mt-5" ref={dashboardRef}>
      <div className="d-flex justify-content-end mb-3 gap-2">
        <Button variant="primary" onClick={exportPDF}>Download PDF</Button>
        <Button variant="success" onClick={exportExcel}>Download Excel</Button>
      </div>
      <h2 className="mb-4 text-center">Interior Design Dashboard</h2>

      <Row className="mb-4 text-center">
        <Col md={3}><Card className="shadow-sm"><Card.Body><Card.Title>Total Items</Card.Title><h3>{totalRooms}</h3></Card.Body></Card></Col>
        <Col md={3}><Card className="shadow-sm"><Card.Body><Card.Title>Total Sales</Card.Title><h3>Ksh {totalSalesAmount}</h3></Card.Body></Card></Col>
        <Col md={3}><Card className="shadow-sm"><Card.Body><Card.Title>Total Orders</Card.Title><h3>{totalOrders}</h3></Card.Body></Card></Col>
        <Col md={3}><Card className="shadow-sm"><Card.Body><Card.Title>Total Order Revenue</Card.Title><h3>Ksh {totalOrderAmount}</h3></Card.Body></Card></Col>
      </Row>

      <Row className="mb-4">
        <Col md={4}><Card className="p-3 shadow-sm"><h5 className="text-center">furniture Categories</h5><Pie data={roomPieData} /></Card></Col>
        <Col md={4}><Card className="p-3 shadow-sm"><h5 className="text-center">Total Price per Category</h5><Bar data={roomBarData} /></Card></Col>
        <Col md={4}><Card className="p-3 shadow-sm"><h5 className="text-center">Sales Trend</h5><Line data={salesLineData} /></Card></Col>
      </Row>

      <h4 className="mt-5 mb-3 text-center">Orders Analytics</h4>
      <Row className="mb-4">
        <Col md={4}><Card className="p-3 shadow-sm"><h5 className="text-center">Payment Status</h5><Pie data={orderPieData} /></Card></Col>
        <Col md={4}><Card className="p-3 shadow-sm"><h5 className="text-center">Deposits vs Balance</h5><Bar data={orderBarData} /></Card></Col>
        <Col md={4}><Card className="p-3 shadow-sm"><h5 className="text-center">Order Trend</h5><Line data={orderLineData} /></Card></Col>
      </Row>

      <h4 className="mb-3">Sales Summary</h4>
      <Table striped bordered hover responsive className="shadow-sm">
        <thead className="table-dark text-center"><tr><th>Total Sales (Ksh)</th><th>Total Items Sold</th><th>Total Customers</th></tr></thead>
        <tbody><tr className="text-center"><td>{totalSalesAmount}</td><td>{totalItemsSold}</td><td>{totalCustomers}</td></tr></tbody>
      </Table>

      <h4 className="mb-3">Orders Summary</h4>
      <Table striped bordered hover responsive className="shadow-sm">
        <thead className="table-dark text-center"><tr><th>Total Orders</th><th>Total Quantity</th><th>Total Revenue</th><th>Total Deposits</th><th>Total Balance</th></tr></thead>
        <tbody><tr className="text-center"><td>{totalOrders}</td><td>{totalOrderQuantity}</td><td>{totalOrderAmount}</td><td>{totalOrderDeposits}</td><td>{totalOrderBalance}</td></tr></tbody>
      </Table>
    </section>
  );
};

export default Dashboard;
