import React, { useState, useEffect } from 'react';
import RoomFilter from '../common/RoomFilter';
import RoomPaginator from '../common/RoomPaginator';
import { Col } from 'react-bootstrap';
import { deleteRoom, getAllRooms } from '../utils/ApiFunctions';

import { Link } from 'react-router-dom'; 
import {FaPlus, FaEdit, FaEye, FaTrashAlt } from 'react-icons/fa';

const ExistingRooms = () => {
  const [rooms, setRooms] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [filteredRooms, setFilteredRooms] = useState([]);
  const [selectedRoomType, setSelectedRoomType] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const roomsPerPage = 8;
  const [error, setError] = useState(null);

  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const fetchRooms = async () => {
    setIsLoading(true);
    try {
      const data = await getAllRooms();
      setRooms(data);
      setFilteredRooms(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRooms();
  }, []);

  useEffect(() => {
    if (!selectedRoomType) setFilteredRooms(rooms);
    else setFilteredRooms(rooms.filter((r) => r.roomType === selectedRoomType));
    setCurrentPage(1);
  }, [selectedRoomType, rooms]);

  const handleDelete = async (roomId) => {
    // Confirmation dialog
    const confirmed = window.confirm(
      `Are you sure you want to delete product with ID ${roomId}?`
    );

    if (!confirmed) return; // User canceled

    try {
      await deleteRoom(roomId);
      setSuccessMessage(`Product with ID ${roomId} deleted successfully.`);
      fetchRooms();
    } catch (error) {
      setErrorMessage(error.message);
    }

    setTimeout(() => {
      setErrorMessage('');
      setSuccessMessage('');
    }, 3000);
  };

  const totalPages = Math.ceil(filteredRooms.length / roomsPerPage);
  const currentRooms = filteredRooms.slice(
    (currentPage - 1) * roomsPerPage,
    currentPage * roomsPerPage
  );

  if (error) return <p className="text-danger">{error}</p>;

  return (
    <section className="mt-5 mb-5 container">
      <h2 className="text-center mb-4">Existing products</h2>
      <Link to="/add-room" className="btn btn-success btn-sm me-2 mb-4">
        <FaPlus/>Add New product
      </Link>

      {successMessage && <p className="text-success">{successMessage}</p>}
      {errorMessage && <p className="text-danger">{errorMessage}</p>}

      <Col md={6} className="mb-3">
        <RoomFilter
          data={rooms}
          setFilteredData={setFilteredRooms}
          selectedRoomType={selectedRoomType}
          setSelectedRoomType={setSelectedRoomType}
        />
      </Col>

      {isLoading ? (
        <p>Loading rooms...</p>
      ) : (
        <>
          <table className="table table-bordered table-hover">
            <thead>
              <tr className="text-center">
                <th>ID</th>
                <th>Category Type</th>
                <th>product Price</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {currentRooms.map((room) => (
                <tr key={room.id} className="text-center">
                  <td>{room.id}</td>
                  <td>{room.roomType}</td>
                  <td>{room.roomPrice}</td>
                  <td>
                    <Link to={`/edit-room/${room.id}`}>
                      <span className="btn btn-info btn-sm me-2">
                        <FaEye />
                      </span>
                      <span className="btn btn-warning btn-sm me-2">
                        <FaEdit />
                      </span>
                    </Link>

                    <button
                      className="btn btn-danger btn-sm"
                      onClick={() => handleDelete(room.id)}
                    >
                      <FaTrashAlt />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <RoomPaginator
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </>
      )}
    </section>
  );
};

export default ExistingRooms;
