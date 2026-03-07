import React, { useState, useRef } from 'react'
import { addRoom } from '../utils/ApiFunctions'
import RoomTypeSelector from '../common/RoomTypeSelector'
import { Link } from 'react-router-dom'

const AddRoom = () => {
  const [newRoom, setNewRoom] = useState({ photo: null, roomPrice: '', roomType: '' })
  const [imagePreview, setImagePreview] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const fileInputRef = useRef(null)

  const handleRoomInputChange = (e) => {
    const { name, value } = e.target
    setNewRoom(prev => ({
      ...prev,
      [name]: name === 'roomPrice' ? parseInt(value) || '' : value
    }))
  }

  const handleImageChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setNewRoom(prev => ({ ...prev, photo: file }))
      setImagePreview(URL.createObjectURL(file))
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!newRoom.photo) {
      setErrorMessage('Please select a photo.')
      return
    }
    if (!newRoom.roomType) {
      setErrorMessage('Please select a product type.')
      return
    }

    try {
      const success = await addRoom(newRoom.photo, newRoom.roomPrice, newRoom.roomType)
      if (success) {
        setSuccessMessage('Prouduct added successfully!')
        setErrorMessage('')
        setNewRoom({ photo: null, roomPrice: '', roomType: '' })
        setImagePreview('')
        if (fileInputRef.current) fileInputRef.current.value = ''
      } else {
        setErrorMessage('Failed to add product.')
        setSuccessMessage('')
      }
    } catch (err) {
      setErrorMessage(err.message)
      setSuccessMessage('')
    }
  }

  return (
    <section className="container mt-5 mb-5">
      <div className="row justify-content-center">
        <div className="col-md-8 col-lg-6">
          <h2 className="mt-5 mb-2">Add a New product</h2>
          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label htmlFor="roomType" className="form-label">Category type</label>
              <RoomTypeSelector
                handleRoomInputChange={handleRoomInputChange}
                newRoom={newRoom}
              />
            </div>

            <div className="mb-3">
              <label htmlFor="roomPrice" className="form-label">product Price</label>
              <input
                type="number"
                className="form-control"
                id="roomPrice"
                name="roomPrice"
                value={newRoom.roomPrice}
                onChange={handleRoomInputChange}
                required
              />
            </div>

            <div className="mb-3">
              <label htmlFor="photo" className="form-label">product Photo</label>
              <input
                type="file"
                className="form-control"
                id="photo"
                name="photo"
                onChange={handleImageChange}
                ref={fileInputRef}
                required
              />
              {imagePreview && (
                <img
                  src={imagePreview}
                  alt="Preview Room"
                  className="mb-3 mt-3"
                  style={{ maxWidth: '400px', maxHeight: '400px' }}
                />
              )}
            </div>

            <div className="d-flex justify-content-between">
              <Link to="/existing-rooms" className="btn btn-outline-secondary">View Existing products</Link>
              <button type="submit" className="btn btn-outline-primary">Save Product</button>
            </div>

            {successMessage && <div className="alert alert-success mt-3">{successMessage}</div>}
            {errorMessage && <div className="alert alert-danger mt-3">{errorMessage}</div>}
          </form>
        </div>
      </div>
    </section>
  )
}

export default AddRoom
