import React, { useState, useEffect } from 'react'
import { getRoomTypes } from '../utils/ApiFunctions'

const RoomTypeSelector = ({ handleRoomInputChange, newRoom }) => {
  const [roomTypes, setRoomTypes] = useState([])
  const [showNewRoomTypeInput, setShowNewRoomTypeInput] = useState(false)
  const [newRoomType, setNewRoomType] = useState('')

  useEffect(() => {
    const fetchRoomTypes = async () => {
      try {
        const data = await getRoomTypes()
        // ensure all types are strings
        const typeNames = data.map(type => typeof type === 'string' ? type : type.name)
        setRoomTypes(typeNames)
      } catch (err) {
        console.error(err)
      }
    }
    fetchRoomTypes()
  }, [])

  const handleNewRoomTypeInputChange = (e) => setNewRoomType(e.target.value)

  const handleAddNewRoomType = () => {
    if (newRoomType.trim() !== '') {
      setRoomTypes([...roomTypes, newRoomType])
      handleRoomInputChange({ target: { name: 'roomType', value: newRoomType } })
      setNewRoomType('')
      setShowNewRoomTypeInput(false)
    }
  }

  return (
    <>
      <select
        id="roomType"
        name="roomType"
        value={newRoom.roomType}
        onChange={(e) => {
          if (e.target.value === 'add New') {
            setShowNewRoomTypeInput(true)
          } else {
            handleRoomInputChange(e)
          }
        }}
        className="form-select"
        required
      >
        <option value="">Select  Type</option>
        {roomTypes.map((type, index) => (
          <option key={index} value={type}>{type}</option>
        ))}
        <option value="add New">Add New  Category</option>
      </select>

      {showNewRoomTypeInput && (
        <div className="input-group mt-2">
          <input
            type="text"
            placeholder="Enter new room type"
            value={newRoomType}
            className="form-control"
            onChange={handleNewRoomTypeInputChange}
          />
          <button
            className="btn btn-primary"
            type="button"
            onClick={handleAddNewRoomType}
          >
            Add Room Type
          </button>
        </div>
      )}
    </>
  )
}

export default RoomTypeSelector
