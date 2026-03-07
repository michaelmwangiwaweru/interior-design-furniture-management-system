package com.dailycodework.interior_design.service;

import com.dailycodework.interior_design.exception.ResourceNotFoundEception;
import com.dailycodework.interior_design.model.Room;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.math.BigDecimal;
import java.sql.SQLException;
import java.util.*;
import java.util.concurrent.atomic.AtomicLong;

@Service
public class RoomServiceImpl implements IRoomService {

    // Mock DB
    private final Map<Long, Room> roomMap = new HashMap<>();
    private final AtomicLong idCounter = new AtomicLong(1);

    @Override
    public Room addNewRoom(MultipartFile photo, String roomType, BigDecimal roomPrice) throws IOException {
        Room room = new Room();
        room.setId(idCounter.getAndIncrement());
        room.setRoomType(roomType);
        room.setRoomPrice(roomPrice);

        if (photo != null && !photo.isEmpty()) {
            room.setPhotoUrl("mock-photo-path/" + photo.getOriginalFilename());
        }

        roomMap.put(room.getId(), room);
        return room;
    }

    @Override
    public List<String> getAllRoomTypes() {
        return Arrays.asList("Single", "Double", "Suite");
    }

    @Override
    public List<Room> getAllRooms() {
        return new ArrayList<>(roomMap.values());
    }

    @Override
    public byte[] getRoomPhotoByRoomId(Long roomId) throws SQLException {
        Room room = roomMap.get(roomId);
        if (room == null) return new byte[0];
        // For mock, return empty byte array or placeholder
        return new byte[0];
    }

    @Override
    public void deleteRoom(long roomId) {
        if (!roomMap.containsKey(roomId)) {
            throw new ResourceNotFoundEception("Room not found");
        }
        roomMap.remove(roomId);
    }

    @Override
    public Room updateRoom(Long roomId, String roomType, BigDecimal roomPrice, byte[] photoBytes) {
        Room room = roomMap.get(roomId);
        if (room == null) {
            throw new ResourceNotFoundEception("Room not found");
        }

        if (roomType != null) room.setRoomType(roomType);
        if (roomPrice != null) room.setRoomPrice(roomPrice);
        // photoBytes can be saved as needed; here we just mock
        return room;
    }

    @Override
    public Optional<Room> getRoomById(Long roomId) {
        return Optional.ofNullable(roomMap.get(roomId));
    }
}
