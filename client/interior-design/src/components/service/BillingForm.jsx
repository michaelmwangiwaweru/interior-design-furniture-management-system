// BillingForm.jsx
import React, { useState, useEffect } from "react";
import { Container, Form, Button, Row, Col } from "react-bootstrap";
import { useNavigate } from "react-router-dom";

const counties = [
  "Mombasa","Kwale","Kilifi","Tana River","Lamu","Taita Taveta","Garissa","Wajir",
  "Mandera","Marsabit","Isiolo","Meru","Tharaka-Nithi","Embu","Kitui","Machakos",
  "Makueni","Nyandarua","Nyeri","Kirinyaga","Murang'a","Kiambu","Turkana","West Pokot",
  "Samburu","Trans Nzoia","Uasin Gishu","Elgeyo Marakwet","Nandi","Baringo","Laikipia",
  "Nakuru","Narok","Kajiado","Kericho","Bomet","Kakamega","Vihiga","Bungoma","Busia",
  "Siaya","Kisumu","Homa Bay","Migori","Kisii","Nyamira","Nairobi"
];

const subcounties = [
  // Nakuru County 
  "Others",
  "Nakuru Town East",
  "Nakuru Town West",
  "Naivasha",
  "Gilgil",
  "Subukia",
  "Rongai",
  "Bahati",
  "Kuresoi North",
  "Kuresoi South",
  "Molo",
  "Njoro",

  // Nairobi City County
  "Westlands",
  "Dagoretti North",
  "Dagoretti South",
  "Lang’ata",
  "Kibra",
  "Roysambu",
  "Kasarani",
  "Ruaraka",
  "Embakasi North",
  "Embakasi South",
  "Embakasi East",
  "Embakasi West",
  "Embakasi Central",
  "Starehe",
  "Mathare",

  // Embu County
  "Embu East",
  "Embu West",
  "Embu North",
  "Mbeere North",
  "Mbeere South"
];


const BillingForm = () => {
  const navigate = useNavigate();
  const [cart, setCart] = useState([]);
  const [customer, setCustomer] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address1: "",
    address2: "",
    county: "",
    subcounty: "",
    town: "",
    city: "",
    country: "Kenya"
  });
  const [checkboxChecked, setCheckboxChecked] = useState(false);

  useEffect(() => {
    const savedCart = localStorage.getItem("checkout_cart");
    if (savedCart) setCart(JSON.parse(savedCart));
  }, []);

  const subtotal = cart.reduce(
    (sum, item) => sum + Number(item.priceAtAddition || 0),
    0
  );

  const isFormComplete = Object.values(customer).every(
    val => val.trim() !== ""
  );

  const handleContinue = () => {
    if (!checkboxChecked) return;

    localStorage.setItem(
      "payment_data",
      JSON.stringify({ customer, cart, subtotal })
    );
    navigate("/payment");
  };

  return (
    <Container style={{ maxWidth: "700px", marginTop: "50px" }}>
      <h3 className="mb-4">Billing Details</h3>
      <Form>
        <Row>
          <Col md={6}>
            <Form.Group className="mb-3">
              <Form.Label>First Name</Form.Label>
              <Form.Control
                type="text"
                value={customer.firstName}
                onChange={(e) =>
                  setCustomer({ ...customer, firstName: e.target.value })
                }
                required
              />
            </Form.Group>
          </Col>

          <Col md={6}>
            <Form.Group className="mb-3">
              <Form.Label>Last Name</Form.Label>
              <Form.Control
                type="text"
                value={customer.lastName}
                onChange={(e) =>
                  setCustomer({ ...customer, lastName: e.target.value })
                }
                required
              />
            </Form.Group>
          </Col>
        </Row>

        <Row>
          <Col md={6}>
            <Form.Group className="mb-3">
              <Form.Label>Email</Form.Label>
              <Form.Control
                type="email"
                value={customer.email}
                onChange={(e) =>
                  setCustomer({ ...customer, email: e.target.value })
                }
                required
              />
            </Form.Group>
          </Col>

          <Col md={6}>
            <Form.Group className="mb-3">
              <Form.Label>Phone (+254...)</Form.Label>
              <Form.Control
                type="tel"
                placeholder="+2547XXXXXXXX"
                value={customer.phone}
                onChange={(e) =>
                  setCustomer({ ...customer, phone: e.target.value })
                }
                required
              />
            </Form.Group>
          </Col>
        </Row>

        <Form.Group className="mb-3">
          <Form.Label>Address Line 1</Form.Label>
          <Form.Control
            type="text"
            value={customer.address1}
            onChange={(e) =>
              setCustomer({ ...customer, address1: e.target.value })
            }
            required
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Address Line 2</Form.Label>
          <Form.Control
            type="text"
            value={customer.address2}
            onChange={(e) =>
              setCustomer({ ...customer, address2: e.target.value })
            }
            required
          />
        </Form.Group>

        <Row>
          <Col md={6}>
            <Form.Group className="mb-3">
              <Form.Label>County</Form.Label>
              <Form.Select
                value={customer.county}
                onChange={(e) =>
                  setCustomer({ ...customer, county: e.target.value })
                }
                required
              >
                <option value="">Select County</option>
                {counties.map((c, idx) => (
                  <option key={idx} value={c}>{c}</option>
                ))}
              </Form.Select>
            </Form.Group>
          </Col>

          <Col md={6}>
            <Form.Group className="mb-3">
              <Form.Label>Subcounty</Form.Label>
              <Form.Select
                value={customer.subcounty}
                onChange={(e) =>
                  setCustomer({ ...customer, subcounty: e.target.value })
                }
                required
              >
                <option value="">Select Subcounty</option>
                {subcounties.map((s, idx) => (
                  <option key={idx} value={s}>{s}</option>
                ))}
              </Form.Select>
            </Form.Group>
          </Col>
        </Row>

        <Row>
          <Col md={6}>
            <Form.Group className="mb-3">
              <Form.Label>Town</Form.Label>
              <Form.Control
                type="text"
                value={customer.town}
                onChange={(e) =>
                  setCustomer({ ...customer, town: e.target.value })
                }
                required
              />
            </Form.Group>
          </Col>

          <Col md={6}>
            <Form.Group className="mb-3">
              <Form.Label>City</Form.Label>
              <Form.Control
                type="text"
                value={customer.city}
                onChange={(e) =>
                  setCustomer({ ...customer, city: e.target.value })
                }
                required
              />
            </Form.Group>
          </Col>
        </Row>

        <Form.Group className="mb-3">
          <Form.Label>Country</Form.Label>
          <Form.Control type="text" value="Kenya" readOnly />
        </Form.Group>

        <Form.Group className="mb-3 form-check">
          <Form.Check
            type="checkbox"
            label="I confirm all fields are filled correctly"
            checked={checkboxChecked}
            onChange={(e) => setCheckboxChecked(e.target.checked)}
            disabled={!isFormComplete}
          />
        </Form.Group>

        {/* ✅ ONLY CHANGE IS HERE */}
        <Button
          type="button"
          variant="success"
          className="w-100"
          disabled={!checkboxChecked}
          onClick={handleContinue}
        >
          Continue
        </Button>
      </Form>
    </Container>
  );
};

export default BillingForm;
