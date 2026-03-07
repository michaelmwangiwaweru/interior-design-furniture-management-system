import React, { useState } from 'react';
import { Card, Col, Button, Modal } from 'react-bootstrap';
import { Link } from 'react-router-dom';

const RoomCard = ({ room, onAddToCart }) => {
  const [showModal, setShowModal] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });

  const handleWheel = (e) => {
    e.preventDefault();
    let newZoom = zoom + (e.deltaY < 0 ? 0.1 : -0.1);
    if (newZoom < 1) newZoom = 1;
    if (newZoom > 5) newZoom = 5; // allow more zoom
    setZoom(newZoom);
  };

  const handleMouseDown = (e) => {
    setIsDragging(true);
    setStartPos({ x: e.clientX - position.x, y: e.clientY - position.y });
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    setPosition({ x: e.clientX - startPos.x, y: e.clientY - startPos.y });
  };

  const handleMouseUp = () => setIsDragging(false);

  return (
    <Col className='mb-4' xs={12} md={6} lg={4}>
      <Card className="h-100 shadow-sm border-0 rounded overflow-hidden">

        {/* Room Image with click to open full view */}
        <div
          style={{ overflow: "hidden", height: "200px", cursor: "zoom-in" }}
          onClick={() => setShowModal(true)}
        >
          <img
            src={room.photo ? `data:image/*;base64,${room.photo}` : '/placeholder.jpg'}
            alt='Room Photo'
            style={{ width: "100%", height: "200px", objectFit: "cover" }}
          />
        </div>

        <Card.Body className='d-flex flex-column'>
          <div className="d-flex justify-content-between align-items-center mb-2">
            <Card.Title className='hotel-color mb-0'>{room.roomType}</Card.Title>
            <Card.Subtitle className='text-success mb-0 fw-bold'>
              Ksh {room.roomPrice.toLocaleString()}
            </Card.Subtitle>
          </div>

          <Card.Text className="text-muted mb-3" style={{ fontSize: "0.9rem" }}>
            Some room information goes here for the guest.
          </Card.Text>

          <div className="mt-auto d-flex gap-2">
            <Link to={`/bookings/${room.id}`} className="btn btn-hotel btn-sm flex-fill">
              Buy now
            </Link>
            <Button
              variant="outline-success"
              className="btn-sm flex-fill"
              onClick={() => onAddToCart(room)}
            >
              Add to Cart
            </Button>
          </div>
        </Card.Body>

        {/* Full Image Modal */}
        <Modal
          show={showModal}
          onHide={() => setShowModal(false)}
          size="lg"
          centered
        >
          <Modal.Header closeButton>
            <Modal.Title>{room.roomType}</Modal.Title>
          </Modal.Header>
          <Modal.Body
            style={{ overflow: "hidden", cursor: zoom > 1 ? "grab" : "default" }}
            onWheel={handleWheel}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
          >
            <img
              src={room.photo ? `data:image/*;base64,${room.photo}` : '/placeholder.jpg'}
              alt='Room Full View'
              style={{
                width: "100%",
                transform: `scale(${zoom}) translate(${position.x / zoom}px, ${position.y / zoom}px)`,
                transition: isDragging ? "none" : "transform 0.2s",
              }}
            />
          </Modal.Body>
        </Modal>

        <style jsx>{`
          .btn-hotel {
            background-color: #28a745;
            color: white;
            border-radius: 4px;
            transition: background-color 0.3s;
          }
          .btn-hotel:hover {
            background-color: #218838;
            color: white;
          }
          .hotel-color {
            color: #2c3e50;
          }
          .room-price {
            font-weight: 600;
          }
        `}</style>
      </Card>
    </Col>
  );
};

export default RoomCard;




