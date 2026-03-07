 import React,{ useEffect, useState } from 'react';
import RoomCard from "./RoomCard";
import { getAllRooms } from "../utils/ApiFunctions";
import { Container, Col, Row, Card, Button } from 'react-bootstrap';
import RoomFilter from  "../common/RoomFilter";
import RoomPaginator from "../common/RoomPaginator";
import { FaShoppingCart } from 'react-icons/fa';

const Room = () => {
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [roomsPerPage] = useState(6);
  const [cart, setCart] = useState([]);
  const [showCart, setShowCart] = useState(false);

  // Load cart from localStorage
  useEffect(() => {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) setCart(JSON.parse(savedCart));
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    setIsLoading(true);
    getAllRooms()
      .then((data) => {
        const roomsArray = Array.isArray(data) ? data : [];
        setData(roomsArray);
        setFilteredData(roomsArray);
        setIsLoading(false);
      })
      .catch((error) => {
        setError(error.message);
        setIsLoading(false);
      });
  }, []);

  const handlePageChange = (pageNumber) => setCurrentPage(pageNumber);
  const totalPages = Math.ceil(filteredData.length / roomsPerPage);

  const handleAddToCart = (room) => {
    setCart(prev => {
      if (prev.find(r => r.id === room.id)) return prev; // avoid duplicates
      return [...prev, room];
    });
  };

  const handleRemoveFromCart = (roomId) => {
    setCart(prev => prev.filter(item => item.id !== roomId));
  };

  const subtotal = cart.reduce((total, item) => total + Number(item.roomPrice), 0);

  const renderRooms = () => {
    const start = (currentPage - 1) * roomsPerPage;
    return filteredData
      .slice(start, start + roomsPerPage)
      .map(room => (
        <RoomCard
          key={room.id}
          room={room}
          onAddToCart={handleAddToCart} // pass to RoomCard for "Add to Cart" button
        />
      ));
  };

  if (isLoading) return <div>Loading rooms...</div>;
  if (error) return <div className='text-danger'>Error: {error}</div>;

  return (
    <Container>
      {/* Filter + Cart Row */}
      <Row className="mb-3 align-items-center">
        <Col md={6}>
          <RoomFilter data={data} setFilteredData={setFilteredData} />
        </Col>

        <Col md={6} className="d-flex justify-content-end align-items-center">
          {/* Cart icon only shows number of items */}
          <div
            className="me-3 position-relative"
            style={{ cursor: 'pointer' }}
            onClick={() => setShowCart(prev => !prev)}
          >
            <FaShoppingCart size={24} />
            {cart.length > 0 && (
              <span className="badge bg-danger position-absolute top-0 start-100 translate-middle">
                {cart.length}
              </span>
            )}
          </div>
        </Col>
      </Row>

      {/* Room Grid */}
      <Row className="d-flex flex-wrap g-3">
        {filteredData.length === 0 ? <p>No rooms available.</p> : renderRooms()}
      </Row>

      {/* Pagination stays BELOW rooms */}
      <Row className="mt-4">
        <Col md={6} className="d-flex justify-content-end">
          <RoomPaginator
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        </Col>
      </Row>

      {/* Floating Cart */}
      {showCart && cart.length > 0 && (
        <Card
          style={{
            position: 'fixed',
            top: '100px',
            right: '20px',
            width: '300px',
            maxHeight: '70vh',
            overflowY: 'auto',
            zIndex: 999,
          }}
          className="shadow-sm border-0"
        >
          <Card.Body>
            <Card.Title className="mb-3">
              Cart ({cart.length}) - Subtotal: Ksh {subtotal.toLocaleString()}
            </Card.Title>
            {cart.map(item => (
              <Card key={item.id} className="mb-2 shadow-sm">
                <Row className="g-0 align-items-center">
                  <Col xs={4}>
                    <Card.Img
                      src={item.photo ? `data:image/*;base64,${item.photo}` : '/placeholder.jpg'}
                      style={{ height: '60px', objectFit: 'cover' }}
                    />
                  </Col>
                  <Col xs={8}>
                    <Card.Body className="p-2">
                      <Card.Title style={{ fontSize: '0.9rem' }}>{item.roomType}</Card.Title>
                      <Card.Subtitle style={{ fontSize: '0.8rem' }} className="text-success">
                        Ksh {item.roomPrice.toLocaleString()}
                      </Card.Subtitle>
                      <Card.Text style={{ fontSize: '0.7rem', color: '#555' }}>
                        Some room information goes here for the guest.
                      </Card.Text>
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => handleRemoveFromCart(item.id)}
                      >
                        Remove
                      </Button>
                    </Card.Body>
                  </Col>
                </Row>
              </Card>
            ))}
          </Card.Body>
        </Card>
      )}
    </Container>
  );
};

export default Room;