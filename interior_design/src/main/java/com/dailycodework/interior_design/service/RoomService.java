package com.dailycodework.interior_design.service;

import com.dailycodework.interior_design.exception.InternalServerException;
import com.dailycodework.interior_design.exception.ResourceNotFoundEception;
import com.dailycodework.interior_design.model.Room;
import com.dailycodework.interior_design.repository.RoomRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import javax.sql.rowset.serial.SerialBlob;
import java.io.IOException;
import java.math.BigDecimal;
import java.sql.Blob;
import java.sql.SQLException;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class RoomService implements IRoomService{
    private final RoomRepository roomRepository;
    @Override
    public Room addNewRoom(MultipartFile file, String roomType, BigDecimal roomPrice) throws SQLException, IOException {
        Room room = new Room();
        room.setRoomType(roomType);
        room.setRoomPrice(roomPrice);
        if(!file.isEmpty()){
            byte[] photoBytes= file.getBytes();
            Blob photoBlob =new SerialBlob(photoBytes);
            room.setPhoto(photoBlob);
        }
        return roomRepository.save(room);
    }

    @Override
    public List<String> getAllRoomTypes() {
        return roomRepository.findDistinctRoomTypes();
    }

    @Override
    public List<Room> getAllRooms() {
        return roomRepository.findAll();
    }

    @Override
    public byte[] getRoomPhotoByRoomId(Long roomId) throws SQLException {
        Optional<Room> room = roomRepository.findById(roomId);
        if(room.isEmpty()){
            throw new ResourceNotFoundEception("sorry, room not found");

        }
        Blob photoBlob = room.get().getPhoto();
        if(photoBlob !=null){
            return photoBlob.getBytes(1,(int)photoBlob.length());

        }
        return null;
    }

    @Override
    public void deleteRoom(long roomId) {
        Optional<Room> theRoom = roomRepository.findById(roomId);
        if(theRoom.isPresent()){
            roomRepository.deleteById(roomId); // ✅ corrected line

        }

    }


    @Override
    public Room updateRoom(Long roomId, String roomType,
                           BigDecimal roomPrice, byte[] photoBytes)
    {
        Room room=roomRepository.findById(roomId).orElseThrow(()->
                new ResourceNotFoundEception("Room NOT FOUND"));
        if(roomType!=null) room.setRoomType(roomType);

        if(roomPrice!=null) room.setRoomPrice(roomPrice);
        if(photoBytes!=null && photoBytes.length>0){
            try{
room.setPhoto(new SerialBlob(photoBytes));
            }catch (SQLException EX){
                throw new InternalServerException("errorr updating room");
            }
        }
        return roomRepository.save(room);
    }

    @Override
    public Optional<Room> getRoomById(Long roomId) {
        return Optional.of (roomRepository.findById(roomId).get());
    }

}
