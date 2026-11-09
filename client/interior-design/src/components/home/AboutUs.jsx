
import React from "react";
import { useNavigate } from "react-router-dom";
import {
  FaMapMarkerAlt,
  FaPhone,
  FaEnvelope,
  FaWhatsapp,
  FaClock,
  FaArrowRight,
  FaCheckCircle,
} from "react-icons/fa";

// =====================================================
// SHOWROOM IMAGES
// Images are stored inside:
// src/assets/
// =====================================================
import showroom1 from "../../assets/showroom1.png";
import showroom2 from "../../assets/showroom2.jpg";
import showroom3 from "../../assets/showroom3.jpg";


// =====================================================
// BUSINESS INFORMATION
// =====================================================
const business = {
  name: "Whitewise Interior Furniture",
  email: "mwangimichael220@gmail.com",
  whatsapp: "254727569512",
  phone: "+254 727569512",
  mainLocation: "Nakuru, Whitehouse, KENYA",
  openingHours: "Monday - Saturday: 9:00 AM - 8:00 PM",
  sundayHours: "Sunday: Closed",
};


// =====================================================
// SHOWROOM INFORMATION
// =====================================================
const showrooms = [
  {
    id: 1,
    name: "Whitewise Main Showroom",
    location: "Nakuru, Whitehouse",
    description:
      "Our main showroom offers a wide range of modern furniture and interior solutions for homes, offices and commercial spaces.",
    image: showroom1,
  },

  {
    id: 2,
    name: "Whitewise Furniture Showroom",
    location: "Nakuru, Kenya",
    description:
      "Explore our beautiful furniture collection and discover stylish pieces designed to transform your living and working spaces.",
    image: showroom2,
  },

  {
    id: 3,
    name: "Whitewise Interior Showroom",
    location: "Nakuru, Kenya",
    description:
      "Visit us for quality furniture, interior design ideas and personalized solutions for your space.",
    image: showroom3,
  },
];


// =====================================================
// SERVICES
// =====================================================
const services = [
  "Furniture Sales",
  "Interior Design",
  "Custom Furniture",
  "Home Furniture",
  "Office Furniture",
  "Space Planning",
  "Furniture Delivery",
  "Interior Consultation",
];


// =====================================================
// ABOUT US COMPONENT
// =====================================================
const AboutUs = () => {
  const navigate = useNavigate();

  // ---------------------------------------------------
  // Open WhatsApp
  // ---------------------------------------------------
  const openWhatsApp = () => {
    const message = encodeURIComponent(
      `Hello Whitewise Interior Furniture 👋

I would like to learn more about your furniture and interior design services.

Thank you.`
    );

    window.open(
      `https://wa.me/${business.whatsapp}?text=${message}`,
      "_blank"
    );
  };


  // ---------------------------------------------------
  // Call business
  // ---------------------------------------------------
  const callBusiness = () => {
    window.location.href = `tel:${business.whatsapp}`;
  };


  // ---------------------------------------------------
  // Send email
  // ---------------------------------------------------
  const sendEmail = () => {
    window.location.href = `mailto:${business.email}`;
  };


  return (
    <div className="about-page">

      {/* =================================================
          HERO SECTION
      ================================================= */}
      <section
        className="about-hero"
        style={{
          backgroundImage: `
            linear-gradient(
              rgba(0, 0, 0, 0.60),
              rgba(0, 0, 0, 0.60)
            ),
            url(${showroom1})
          `,
        }}
      >
        <div className="hero-content">

          <span className="hero-small-title">
            WELCOME TO
          </span>

          <h1>
            Whitewise Interior Furniture
          </h1>

          <p>
            Transforming spaces with beautiful, comfortable
            and quality furniture.
          </p>

          <div className="hero-buttons">

            <button
              className="primary-button"
              onClick={() => navigate("/")}
            >
              Browse Furniture
              <FaArrowRight />
            </button>

            <button
              className="whatsapp-button"
              onClick={openWhatsApp}
            >
              <FaWhatsapp />
              Chat With Us
            </button>

          </div>
        </div>
      </section>


      {/* =================================================
          INTRODUCTION
      ================================================= */}
      <section className="about-intro">

        <div className="intro-image">
          <img
            src={showroom1}
            alt="Whitewise Interior Furniture showroom"
          />
        </div>

        <div className="intro-content">

          <span className="section-label">
            ABOUT US
          </span>

          <h2>
            Creating Beautiful Spaces,
            <span> One Piece At A Time</span>
          </h2>

          <p>
            Welcome to Whitewise Interior Furniture, your trusted
            destination for quality furniture and interior solutions
            in Nakuru, Kenya.
          </p>

          <p>
            We provide carefully selected furniture for homes,
            offices and commercial spaces. Our goal is to combine
            comfort, functionality and modern design to help you
            create spaces that reflect your style.
          </p>

          <p>
            Whether you are furnishing a new home, upgrading your
            office or looking for custom interior solutions, our
            team is ready to help you find the right solution.
          </p>

          <button
            className="outline-button"
            onClick={() => navigate("/")}
          >
            Explore Our Furniture
            <FaArrowRight />
          </button>

        </div>
      </section>


      {/* =================================================
          SERVICES
      ================================================= */}
      <section className="services-section">

        <div className="section-heading">

          <span className="section-label">
            WHAT WE DO
          </span>

          <h2>
            Our Services
          </h2>

          <p>
            Professional furniture and interior solutions
            designed around your needs.
          </p>

        </div>


        <div className="services-grid">

          {services.map((service, index) => (
            <div
              className="service-card"
              key={index}
            >

              <FaCheckCircle className="service-icon" />

              <span>
                {service}
              </span>

            </div>
          ))}

        </div>

      </section>


      {/* =================================================
          SHOWROOMS
      ================================================= */}
      <section className="showrooms-section">

        <div className="section-heading">

          <span className="section-label">
            VISIT US
          </span>

          <h2>
            Our Showrooms
          </h2>

          <p>
            Visit our showroom and experience our furniture
            collections in person.
          </p>

        </div>


        <div className="showrooms-grid">

          {showrooms.map((showroom) => (

            <div
              className="showroom-card"
              key={showroom.id}
            >

              {/* -----------------------------------------
                  SHOWROOM IMAGE
              ------------------------------------------ */}
              <div className="showroom-image">

                <img
                  src={showroom.image}
                  alt={showroom.name}
                />

                <div className="showroom-number">
                  0{showroom.id}
                </div>

              </div>


              {/* -----------------------------------------
                  SHOWROOM INFORMATION
              ------------------------------------------ */}
              <div className="showroom-content">

                <h3>
                  {showroom.name}
                </h3>

                <div className="showroom-location">

                  <FaMapMarkerAlt />

                  <span>
                    {showroom.location}
                  </span>

                </div>

                <p>
                  {showroom.description}
                </p>

                <button
                  className="location-button"
                  onClick={openWhatsApp}
                >
                  Enquire About This Showroom
                  <FaArrowRight />
                </button>

              </div>

            </div>

          ))}

        </div>

      </section>


      {/* =================================================
          CONTACT SECTION
      ================================================= */}
      <section className="contact-section">

        <div className="contact-container">

          <div className="contact-text">

            <span className="section-label">
              GET IN TOUCH
            </span>

            <h2>
              Let's Create Your
              <span> Perfect Space</span>
            </h2>

            <p>
              Have a question about our furniture or interior
              design services? Contact us today and our team
              will be happy to assist you.
            </p>

          </div>


          <div className="contact-details">

            {/* EMAIL */}
            <div
              className="contact-item"
              onClick={sendEmail}
            >

              <div className="contact-icon">
                <FaEnvelope />
              </div>

              <div>
                <small>Email</small>
                <strong>
                  {business.email}
                </strong>
              </div>

            </div>


            {/* PHONE */}
            <div
              className="contact-item"
              onClick={callBusiness}
            >

              <div className="contact-icon">
                <FaPhone />
              </div>

              <div>
                <small>Phone</small>
                <strong>
                  {business.phone}
                </strong>
              </div>

            </div>


            {/* WHATSAPP */}
            <div
              className="contact-item"
              onClick={openWhatsApp}
            >

              <div className="contact-icon">
                <FaWhatsapp />
              </div>

              <div>
                <small>WhatsApp</small>
                <strong>
                  +254 727 569 512
                </strong>
              </div>

            </div>


            {/* LOCATION */}
            <div className="contact-item">

              <div className="contact-icon">
                <FaMapMarkerAlt />
              </div>

              <div>
                <small>Location</small>
                <strong>
                  {business.mainLocation}
                </strong>
              </div>

            </div>


            {/* OPENING HOURS */}
            <div className="contact-item">

              <div className="contact-icon">
                <FaClock />
              </div>

              <div>
                <small>Opening Hours</small>

                <strong>
                  {business.openingHours}
                </strong>

                <span>
                  {business.sundayHours}
                </span>

              </div>

            </div>

          </div>

        </div>

      </section>


      {/* =================================================
          FINAL CTA
      ================================================= */}
      <section className="final-cta">

        <div>

          <h2>
            Ready to Transform Your Space?
          </h2>

          <p>
            Browse our furniture collection or speak with
            our team today.
          </p>

          <div className="cta-buttons">

            <button
              className="primary-button"
              onClick={() => navigate("/")}
            >
              View Furniture
              <FaArrowRight />
            </button>

            <button
              className="whatsapp-button"
              onClick={openWhatsApp}
            >
              <FaWhatsapp />
              WhatsApp Us
            </button>

          </div>

        </div>

      </section>


      {/* =================================================
          PAGE STYLES
      ================================================= */}
      <style>{`

        * {
          box-sizing: border-box;
        }

        .about-page {
          width: 100%;
          overflow-x: hidden;
          background: #ffffff;
          color: #222;
        }


        /* ===============================================
           HERO
        =============================================== */

        .about-hero {
          min-height: 560px;
          background-size: cover;
          background-position: center;
          background-repeat: no-repeat;

          display: flex;
          align-items: center;
          justify-content: center;

          text-align: center;
          padding: 80px 20px;
        }

        .hero-content {
          max-width: 900px;
          color: white;
        }

        .hero-small-title {
          font-size: 14px;
          letter-spacing: 4px;
          font-weight: 700;
        }

        .hero-content h1 {
          font-size: clamp(40px, 6vw, 72px);
          line-height: 1.05;
          margin: 20px 0;
          font-weight: 800;
        }

        .hero-content p {
          font-size: 20px;
          max-width: 700px;
          margin: 0 auto 35px;
          line-height: 1.7;
        }

        .hero-buttons,
        .cta-buttons {
          display: flex;
          justify-content: center;
          gap: 15px;
          flex-wrap: wrap;
        }


        /* ===============================================
           BUTTONS
        =============================================== */

        .primary-button,
        .whatsapp-button,
        .outline-button,
        .location-button {
          border: none;
          cursor: pointer;

          display: inline-flex;
          align-items: center;
          justify-content: center;

          gap: 10px;

          padding: 14px 24px;
          border-radius: 8px;

          font-size: 15px;
          font-weight: 700;

          transition: all 0.3s ease;
        }

        .primary-button {
          background: white;
          color: #222;
        }

        .primary-button:hover {
          transform: translateY(-3px);
          box-shadow: 0 10px 25px rgba(0,0,0,0.2);
        }

        .whatsapp-button {
          background: #25d366;
          color: white;
        }

        .whatsapp-button:hover {
          transform: translateY(-3px);
          background: #1ebe5d;
        }

        .outline-button {
          background: transparent;
          border: 2px solid #222;
          color: #222;
        }

        .outline-button:hover {
          background: #222;
          color: white;
        }

        .location-button {
          background: #222;
          color: white;
          width: 100%;
        }

        .location-button:hover {
          transform: translateY(-2px);
          background: #444;
        }


        /* ===============================================
           INTRODUCTION
        =============================================== */

        .about-intro {
          max-width: 1200px;
          margin: auto;

          padding: 100px 25px;

          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 70px;

          align-items: center;
        }

        .intro-image img {
          width: 100%;
          height: 500px;

          object-fit: cover;

          border-radius: 18px;

          box-shadow:
            0 20px 50px rgba(0,0,0,0.15);
        }

        .section-label {
          font-size: 13px;
          font-weight: 800;
          letter-spacing: 3px;
          color: #a07845;
        }

        .intro-content h2 {
          font-size: 42px;
          line-height: 1.2;
          margin: 15px 0 25px;
        }

        .intro-content h2 span,
        .contact-text h2 span {
          display: block;
          color: #a07845;
        }

        .intro-content p {
          color: #666;
          line-height: 1.8;
          margin-bottom: 18px;
        }


        /* ===============================================
           SERVICES
        =============================================== */

        .services-section {
          background: #f7f5f1;
          padding: 90px 25px;
        }

        .section-heading {
          max-width: 750px;
          margin: 0 auto 50px;
          text-align: center;
        }

        .section-heading h2 {
          font-size: 42px;
          margin: 12px 0;
        }

        .section-heading p {
          color: #666;
          line-height: 1.7;
        }

        .services-grid {
          max-width: 1100px;
          margin: auto;

          display: grid;
          grid-template-columns:
            repeat(4, 1fr);

          gap: 20px;
        }

        .service-card {
          background: white;
          padding: 25px;

          border-radius: 12px;

          display: flex;
          align-items: center;
          gap: 14px;

          font-weight: 600;

          box-shadow:
            0 8px 25px rgba(0,0,0,0.05);

          transition: 0.3s;
        }

        .service-card:hover {
          transform: translateY(-5px);
        }

        .service-icon {
          color: #a07845;
          font-size: 20px;
        }


        /* ===============================================
           SHOWROOMS
        =============================================== */

        .showrooms-section {
          padding: 100px 25px;
          background: white;
        }

        .showrooms-grid {
          max-width: 1200px;
          margin: auto;

          display: grid;
          grid-template-columns:
            repeat(3, 1fr);

          gap: 30px;
        }

        .showroom-card {
          background: white;

          border-radius: 16px;

          overflow: hidden;

          box-shadow:
            0 10px 35px rgba(0,0,0,0.10);

          transition:
            transform 0.3s ease,
            box-shadow 0.3s ease;
        }

        .showroom-card:hover {
          transform: translateY(-8px);

          box-shadow:
            0 20px 50px rgba(0,0,0,0.16);
        }

        .showroom-image {
          position: relative;
          height: 280px;
          overflow: hidden;
        }

        .showroom-image img {
          width: 100%;
          height: 100%;

          object-fit: cover;

          display: block;

          transition:
            transform 0.5s ease;
        }

        .showroom-card:hover
        .showroom-image img {
          transform: scale(1.08);
        }

        .showroom-number {
          position: absolute;
          top: 15px;
          left: 15px;

          width: 45px;
          height: 45px;

          border-radius: 50%;

          display: flex;
          align-items: center;
          justify-content: center;

          background: rgba(255,255,255,0.95);

          font-weight: 800;
          color: #222;

          box-shadow:
            0 5px 15px rgba(0,0,0,0.15);
        }

        .showroom-content {
          padding: 25px;
        }

        .showroom-content h3 {
          font-size: 23px;
          margin: 0 0 12px;
        }

        .showroom-location {
          display: flex;
          align-items: center;
          gap: 8px;

          color: #a07845;

          font-weight: 600;

          margin-bottom: 15px;
        }

        .showroom-content p {
          color: #666;
          line-height: 1.7;
          min-height: 105px;
        }


        /* ===============================================
           CONTACT
        =============================================== */

        .contact-section {
          padding: 90px 25px;

          background: #f7f5f1;
        }

        .contact-container {
          max-width: 1200px;
          margin: auto;

          display: grid;
          grid-template-columns: 1fr 1fr;

          gap: 70px;
          align-items: center;
        }

        .contact-text h2 {
          font-size: 44px;
          line-height: 1.2;
          margin: 15px 0 25px;
        }

        .contact-text p {
          color: #666;
          line-height: 1.8;
          font-size: 17px;
        }

        .contact-details {
          display: grid;
          gap: 15px;
        }

        .contact-item {
          background: white;

          padding: 18px;

          border-radius: 12px;

          display: flex;
          align-items: center;

          gap: 15px;

          cursor: pointer;

          transition: 0.3s;
        }

        .contact-item:hover {
          transform: translateX(5px);
        }

        .contact-icon {
          width: 48px;
          height: 48px;

          border-radius: 50%;

          display: flex;
          align-items: center;
          justify-content: center;

          background: #f0e7da;
          color: #a07845;

          font-size: 19px;

          flex-shrink: 0;
        }

        .contact-item small {
          display: block;
          color: #888;
          margin-bottom: 3px;
        }

        .contact-item strong {
          display: block;
          color: #222;
        }

        .contact-item span {
          display: block;
          color: #888;
          margin-top: 3px;
          font-size: 13px;
        }


        /* ===============================================
           FINAL CTA
        =============================================== */

        .final-cta {
          padding: 90px 25px;

          background: #222;

          text-align: center;
          color: white;
        }

        .final-cta h2 {
          font-size: 42px;
          margin-bottom: 15px;
        }

        .final-cta p {
          color: #ccc;
          margin-bottom: 30px;
          font-size: 17px;
        }


        /* ===============================================
           RESPONSIVE DESIGN
        =============================================== */

        @media (max-width: 900px) {

          .about-intro,
          .contact-container {
            grid-template-columns: 1fr;
          }

          .services-grid {
            grid-template-columns:
              repeat(2, 1fr);
          }

          .showrooms-grid {
            grid-template-columns:
              repeat(2, 1fr);
          }

          .intro-image img {
            height: 400px;
          }
        }


        @media (max-width: 600px) {

          .about-hero {
            min-height: 500px;
          }

          .hero-content h1 {
            font-size: 42px;
          }

          .hero-content p {
            font-size: 17px;
          }

          .about-intro,
          .showrooms-section,
          .services-section,
          .contact-section {
            padding: 65px 18px;
          }

          .intro-content h2,
          .section-heading h2,
          .contact-text h2,
          .final-cta h2 {
            font-size: 32px;
          }

          .services-grid,
          .showrooms-grid {
            grid-template-columns: 1fr;
          }

          .intro-image img {
            height: 350px;
          }

          .showroom-image {
            height: 250px;
          }

          .primary-button,
          .whatsapp-button {
            width: 100%;
          }

          .hero-buttons,
          .cta-buttons {
            width: 100%;
            max-width: 350px;
            margin: auto;
          }
        }

      `}</style>

    </div>
  );
};


// =====================================================
// EXPORT
// =====================================================
export default AboutUs;

