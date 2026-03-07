// PaymentPage.jsx
import React, { useEffect, useState } from "react";
import { Container, Card, Button, Row, Col } from "react-bootstrap";
import axios from "axios";

const PaymentPage = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const paymentData = localStorage.getItem("payment_data");
    if (paymentData) setData(JSON.parse(paymentData));
  }, []);

  if (!data) return <Container className="mt-5">No data found.</Container>;

  const handlePayment = async () => {
    try {
      setLoading(true);

      // IMPORTANT: MPESA expects phone without "+"
      const formattedCustomer = {
        ...data.customer,
        phone: data.customer.phone.replace("+", "")
      };

      const payload = {
        customer: formattedCustomer,
        cart: data.cart,
        subtotal: data.subtotal
      };

      const response = await axios.post(
        "http://localhost:9193/api/orders/checkout",
        payload
      );

      alert("MPESA request sent. Check your phone to complete payment.");

      console.log("Order created:", response.data);
    } catch (error) {
      console.error("Payment error:", error);
      alert("Failed to initiate MPESA payment. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const { customer, cart, subtotal } = data;

  return (
    <Container style={{ maxWidth: "800px", marginTop: "50px" }}>
      <h3 className="mb-4">Review & Payment</h3>

      <Card className="mb-4">
        <Card.Body>
          <h5>Customer Details</h5>
          <p>
            {customer.firstName} {customer.lastName}<br/>
            Email: {customer.email}<br/>
            Phone: {customer.phone}<br/>
            {customer.address1}, {customer.address2}<br/>
            {customer.town}, {customer.subcounty}, {customer.county}, {customer.city}, {customer.country}
          </p>
        </Card.Body>
      </Card>

      <Card className="mb-4">
        <Card.Body>
          <h5>Items in Cart</h5>
          {cart.map((item, idx) => (
            <Row key={idx} className="mb-2">
              <Col>{item.name}</Col>
              <Col className="text-end">
                Ksh {Number(item.priceAtAddition).toLocaleString()}
              </Col>
            </Row>
          ))}
          <hr/>
          <h5 className="text-end">
            Subtotal: Ksh {subtotal.toLocaleString()}
          </h5>
        </Card.Body>
      </Card>

      <Button
        variant="success"
        className="w-100"
        onClick={handlePayment}
        disabled={loading}
      >
        {loading ? "Processing..." : "Pay with Lipa Na Mpesa"}
      </Button>
    </Container>
  );
};

export default PaymentPage;
