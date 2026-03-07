import React, { useEffect, useState } from "react";
import bgImage from "../image/background2.jpg";
import { getAllRooms } from "../utils/ApiFunctions";
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";
import { useNavigate } from "react-router-dom";

function Home() {
  const [rooms, setRooms] = useState([]);
  const [activeRoom, setActiveRoom] = useState(null);

  const navigate = useNavigate();

  /* ================= FETCH ROOMS ================= */
  useEffect(() => {
    getAllRooms()
      .then((data) => {
        if (Array.isArray(data)) setRooms(data);
      })
      .catch((err) => console.error(err));
  }, []);

  /* ================= SERVICES ================= */
  const services = [
    { title: "Living Room", text: "Sofas, coffee tables, lounge chairs" },
    { title: "Bedroom", text: "Beds, wardrobes, nightstands" },
    { title: "Dining", text: "Dining tables and chairs" },
    { title: "Office", text: "Desks, shelves, ergonomic chairs" },
  ];

  /* ================= CONTAINER STYLE ================= */
  const containerStyle = {
    minHeight: "85vh",
    margin: "5vh auto",
    maxWidth: "95%",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    backgroundImage: `url(${bgImage})`,
    backgroundRepeat: "no-repeat",
    backgroundPosition: "center",
    backgroundSize: "contain",
  };

  return (
    <>
      {/* ================= BACK BUTTON ================= */}
      <div style={{ textAlign: "center", marginTop: 20 }}>
        <button
          onClick={() => navigate("/products")}
          style={{
            background: "#000",
            color: "#fff",
            border: "none",
            padding: "0.8rem 1.6rem",
            borderRadius: "50px",
            cursor: "pointer",
            fontWeight: 600,
          }}
        >
          ← Products
        </button>
      </div>

      {/* ================= HOT DEAL TEXT ================= */}
      <div className="hot-deal">
        🔥 HOT DEALS — MAKE YOUR ORDER NOW 🔥
      </div>

      {/* ================= MAIN CONTENT ================= */}
      <div style={containerStyle}>
        <div className="layout-row">
          {/* ===== SERVICES CARD ===== */}
          <div className="services-card">
            <h3>Our Services</h3>
            {services.map((s, i) => (
              <div key={i} className="service-item">
                <h5>{s.title}</h5>
                <p>{s.text}</p>
              </div>
            ))}
          </div>

          {/* ===== ROOMS STRIP ===== */}
          <div className="rooms-strip">
            {rooms.map((room, index) => (
              <div
                key={index}
                className="room-card"
                style={{ animationDelay: `${index * 1.3}s` }}
                onClick={() => setActiveRoom(room)}
              >
                <img
                  src={
                    room.photo
                      ? `data:image/*;base64,${room.photo}`
                      : "/placeholder.jpg"
                  }
                  alt={room.roomType}
                />
                <div className="room-info">
                  <h4>{room.roomType}</h4>
                  <p className="price">Ksh {room.roomPrice}</p>
                  <p className="hint">Upgrade your home with furniture that speaks style and quality.
At Whitewise Interior Furniture, we blend modern design with lasting comfort to give your space a fresh, luxurious feel you’ll love every day.</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ================= MODAL ================= */}
      {activeRoom && (
        <div className="modal-overlay" onClick={() => setActiveRoom(null)}>
          <div
            className="modal-content"
            onClick={(e) => e.stopPropagation()}
          >
            <TransformWrapper
              initialScale={1}
              minScale={1}
              maxScale={6}
              wheel={{ step: 0.2 }}
              pinch={{ step: 5 }}
              doubleClick={{ disabled: false }}
            >
              {({ zoomIn, zoomOut, resetTransform }) => (
                <>
                  <div className="zoom-controls">
                    <button onClick={zoomIn}>+</button>
                    <button onClick={zoomOut}>−</button>
                    <button onClick={resetTransform}>Reset</button>
                  </div>

                  <TransformComponent>
                    <img
                      src={`data:image/*;base64,${activeRoom.photo}`}
                      alt={activeRoom.roomType}
                      className="modal-img"
                    />
                  </TransformComponent>
                </>
              )}
            </TransformWrapper>

            <h3>{activeRoom.roomType}</h3>
            <p className="price">Ksh {activeRoom.roomPrice}</p>
            <p>{activeRoom.roomDescription}</p>

            <button
              className="close-btn"
              onClick={() => setActiveRoom(null)}
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* ================= FLOATING BUTTONS ================= */}
      <div className="floating-buttons">
        <div className="tooltip-wrapper">
          <a href="tel:+254759838070" className="floating-btn call">
            📞
          </a>
          <span className="tooltip-text">Call us</span>
        </div>

        <div className="tooltip-wrapper">
          <a
            href="https://bit.ly/468lWjo"
            target="_blank"
            rel="noopener noreferrer"
            className="floating-btn whatsapp"
          >
            💬
          </a>
          <span className="tooltip-text">WhatsApp us</span>
        </div>
      </div>

      {/* ================= CSS ================= */}
      <style>{`
        /* HOT DEAL */
        .hot-deal {
          text-align: center;
          font-size: 2.2rem;
          font-weight: 900;
          margin: 25px 0;
          color: #0044ffff;
          animation: firePulse 1.5s infinite;
          text-shadow: 0 0 10px red, 0 0 20px orange;
        }

        @keyframes firePulse {
          0% { transform: scale(1); }
          50% { transform: scale(1.08); }
          100% { transform: scale(1); }
        }

        .layout-row {
          display: flex;
          gap: 40px;
          align-items: center;
        }

        /* SERVICES */
        .services-card {
          width: 300px;
          background: rgba(0,0,0,0.85);
          color: white;
          padding: 20px;
          border-radius: 15px;
        }

        .services-card h3 {
          color: #4caf50;
          text-align: center;
          margin-bottom: 15px;
        }

        .service-item {
          background: black;
          padding: 10px;
          border-radius: 10px;
          margin-bottom: 10px;
        }

        /* ROOMS */
        .rooms-strip {
          display: flex;
          gap: 20px;
          overflow: hidden;
          width: 750px;
        }

        .room-card {
          min-width: 260px;
          background: white;
          border-radius: 15px;
          cursor: pointer;
          animation: moveLeftRight 9s linear infinite;
          box-shadow: 0 10px 25px rgba(0,0,0,0.35);
        }

        .room-card img {
          width: 100%;
          height: 180px;
          object-fit: cover;
          border-radius: 15px 15px 0 0;
        }

        .room-info {
          padding: 10px;
          text-align: center;
        }

        .price {
          color: #4caf50;
          font-weight: bold;
        }

        .hint {
          font-size: 0.75rem;
          color: #2c2555ff;
          font-weight: bold;
        }

        @keyframes moveLeftRight {
          0% { transform: translateX(-50px); }
          50% { transform: translateX(50px); }
          100% { transform: translateX(-50px); }
        }

        /* MODAL */
        .modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0,0,0,0.85);
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 9999;
        }

        .modal-content {
          background: white;
          padding: 20px;
          border-radius: 15px;
          max-width: 90%;
          max-height: 90%;
          overflow: auto;
        }

        .modal-img {
          max-height: 70vh;
          width: auto;
          border-radius: 10px;
        }

        .zoom-controls button {
          margin-right: 8px;
          cursor: pointer;
        }

        .close-btn {
          margin-top: 10px;
          cursor: pointer;
        }

        /* FLOATING */
        .floating-buttons {
          position: fixed;
          bottom: 80px;
          left: 50%;
          transform: translateX(-50%);
          display: flex;
          gap: 20px;
          z-index: 9999;
        }

        .floating-btn {
          width: 60px;
          height: 60px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 28px;
          color: white;
          animation: heartbeat 1.3s infinite;
        }

        .call { background: #0a84ff; }
        .whatsapp { background: #25d366; }

        .tooltip-wrapper {
          position: relative;
        }

        .tooltip-text {
          visibility: hidden;
          background: black;
          color: white;
          padding: 5px 8px;
          border-radius: 6px;
          position: absolute;
          bottom: 120%;
          left: 50%;
          transform: translateX(-50%);
        }

        .tooltip-wrapper:hover .tooltip-text {
          visibility: visible;
        }

        @keyframes heartbeat {
          0% { transform: scale(1); }
          25% { transform: scale(1.1); }
          50% { transform: scale(1); }
          75% { transform: scale(1.1); }
          100% { transform: scale(1); }
        }
      `}</style>
    </>
  );
}

export default Home;
