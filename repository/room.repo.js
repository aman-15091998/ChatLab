import mongoose from "mongoose";
import { roomsModel } from "../schemas/room.schema.js";

export async function createOrGetRoom(roomname) {
  try {
    let newRoom = await roomsModel.findOne({ roomname });
    if (newRoom) return newRoom;
    else {
      newRoom = new roomsModel({ roomname: roomname });
      await newRoom.save();
      return newRoom;
    }
  } catch (err) {
    console.log(err);
  }
}

export async function addUserToRoom(userObj, roomObj) {
  try {
    roomObj.users.push(userObj._id);
    userObj.roomID = roomObj._id;
    await roomObj.save();
    await userObj.save();
  } catch (err) {
    console.log(err);
  }
}

export async function getRoomByRoomName(roomname) {
  try {
    const room = await roomsModel.findOne({ roomname });
    return room;
  } catch (err) {
    console.log(err);
  }
}

export async function deleteRoomByRoomID(roomID) {
  try {
    await roomsModel.deleteOne({ _id: roomID });
  } catch (err) {
    console.log(err);
  }
}

export async function getRoomByRoomID(roomID) {
  try {
    const room = await roomsModel.findById(roomID);
    return room;
  } catch (err) {
    console.log(err);
  }
}

export async function removeUserFromRoomByUserID(roomID, userID) {
  try {
    const room = await roomsModel.findById(roomID);
    const userIndex = room.users.findIndex((user) => user == userID);
    room.users.splice(userIndex, 1);
    await room.save();
    return room;
  } catch (err) {
    console.log(err);
  }
}

export async function getAllRooms() {
  try {
    const allRooms = await roomsModel.find({});
    return allRooms;
  } catch (err) {
    console.log(err);
  }
}
