import axios from 'axios';

export const api = axios.create({
  baseURL: 'http://localhost:9193', // Backend URL
});

// Add a new room
export async function addRoom(photo, roomPrice, roomType) {
  if (!photo) throw new Error('No file selected');

  const formData = new FormData();
  formData.append('photo', photo);
  formData.append('roomType', roomType);
  formData.append('roomPrice', roomPrice);

  const response = await api.post('/rooms/add/new-room', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });

  return response.status === 200 || response.status === 201;
}

// Fetch room types
export async function getRoomTypes() {
  const response = await api.get('/rooms/room/types');
  return response.data;
}

// Fetch all rooms
export async function getAllRooms() {
  const response = await api.get('/rooms/all');
  return response.data;
}

// Delete room by ID
export async function deleteRoom(roomId) {
  try {
    const response = await api.delete(`/rooms/delete/room/${roomId}`);
    return response.data;
  } catch (error) {
    throw new Error(`Error deleting room: ${error.message}`);
  }
}

// Update room details
export async function updateRoom(roomId, roomData) {
  const formData = new FormData();
  formData.append('roomType', roomData.roomType);
  formData.append('roomPrice', roomData.roomPrice);
  if (roomData.photo) formData.append('photo', roomData.photo);

  const response = await api.put(`/rooms/update/${roomId}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });

  return response.status === 200 || response.status === 201;
}

// Fetch room by ID
export async function getRoomById(roomId) {
  try {
    const response = await api.get(`/rooms/room/${roomId}`);
    const data = response.data;

    // If backend returns photo as base64 string, keep it for preview
    return {
      roomType: data.roomType,
      roomPrice: data.roomPrice,
      photo: data.photo || null,
    };
  } catch (error) {
    throw new Error(`Error fetching room: ${error.message}`);
  }
}