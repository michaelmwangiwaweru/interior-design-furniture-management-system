import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getRoomById, updateRoom, getRoomTypes } from "../utils/ApiFunctions";
import RoomTypeSelector from "../common/RoomTypeSelector";
import ExistingRooms from './ExistingRooms'; // make sure import is correct
import { Link } from 'react-router-dom';

const EditRoom = () => {
  const { id } = useParams(); // route: /edit-room/:id
  const navigate = useNavigate();
  const fileInputRef = useRef();

  const [room, setRoom] = useState({
    roomType: "",
    roomPrice: "",
    photo: null,
  });

  const [roomTypes, setRoomTypes] = useState([]);
  const [imagePreview, setImagePreview] = useState("");

  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  // -------------------------------------------------------
  // Fetch Room Types + Room Data
  // -------------------------------------------------------
  useEffect(() => {
    const loadData = async () => {
      try {
        const types = await getRoomTypes();
        setRoomTypes(types);

        const data = await getRoomById(id);

        setRoom({
          roomType: data.roomType,
          roomPrice: data.roomPrice,
          photo: null, // will upload only if user changes photo
        });

        // Correctly display Base64 photo
        if (data.photo) {
          setImagePreview(`data:image/jpeg;base64,${data.photo}`);
        }
      } catch (err) {
        console.error(err);
        setErrorMessage("Failed to load room data.");
      }
    };

    loadData();
  }, [id]);

  // -------------------------------------------------------
  // Handle Image Change
  // -------------------------------------------------------
  const handleImageChange = (e) => {
    const file = e.target.files[0];

    if (file) {
      setRoom((prev) => ({ ...prev, photo: file }));
      setImagePreview(URL.createObjectURL(file));
    }
  };

  // -------------------------------------------------------
  // Handle Form Input Change
  // -------------------------------------------------------
  const handleRoomInputChange = (e) => {
    const { name, value } = e.target;

    setRoom((prev) => ({
      ...prev,
      [name]: name === "roomPrice" ? parseInt(value) || "" : value,
    }));
  };

  // -------------------------------------------------------
  // Submit Update
  // -------------------------------------------------------
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const success = await updateRoom(id, room);

      if (success) {
        setSuccessMessage("Room updated successfully!");
        setErrorMessage("");

        // Redirect to existing rooms after 1 second
        setTimeout(() => navigate("/existing-rooms"), 1000);
      } else {
        setErrorMessage("Failed to update room.");
      }
    } catch (err) {
      setErrorMessage(err.message);
    }
  };

  return (
    <div className="row justify-content-center">
      <div className="col-md-8 col-lg-6">
        <h2 className="mt-5 mb-2">Edit Room</h2>

        <form onSubmit={handleSubmit}>
          {/* ROOM TYPE */}
          <div className="mb-3">
            <label className="form-label">Room Type</label>
            <RoomTypeSelector
              handleRoomInputChange={handleRoomInputChange}
              newRoom={room}
              roomTypes={roomTypes}
            />
          </div>

          {/* ROOM PRICE */}
          <div className="mb-3">
            <label className="form-label">Room Price</label>
            <input
              type="number"
              className="form-control"
              name="roomPrice"
              value={room.roomPrice}
              onChange={handleRoomInputChange}
              required
            />
          </div>

          {/* ROOM PHOTO */}
          <div className="mb-3">
            <label className="form-label">Room Photo</label>
            <input
              type="file"
              className="form-control"
              name="photo"
              onChange={handleImageChange}
              ref={fileInputRef}
            />

            {imagePreview && (
              <img
                src={imagePreview}
                alt="Room Preview"
                className="mt-3"
                style={{ maxWidth: "400px", maxHeight: "400px" }}
              />
            )}
          </div>
<Link to="/existing-rooms" className="btn btn-outline-secondary me-2">
              back to Existing Rooms
            </Link>
          <button type="submit" className="btn btn-outline-primary">
            Update Room
          </button>

          {successMessage && (
            <div className="alert alert-success mt-3">{successMessage}</div>
          )}
          {errorMessage && (
            <div className="alert alert-danger mt-3">{errorMessage}</div>
          )}
        </form>
      </div>
    </div>
  );
};

export default EditRoom;
