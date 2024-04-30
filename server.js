import express from "express";
import cors from "cors";
import http from "http";
import { Server } from "socket.io";
import {
  allUsersByRoomID,
  createUser,
  deleteUserBySocketID,
  getUserBySocketID,
} from "./repository/user.repo.js";
import {
  addUserToRoom,
  createOrGetRoom,
  deleteRoomByRoomID,
  getAllRooms,
  getRoomByRoomID,
  getRoomByRoomName,
  removeUserFromRoomByUserID,
} from "./repository/room.repo.js";
import {
  createNewMessage,
  deleteMessagesByRoomID,
  getPreviousMessagesByRoomID,
} from "./repository/message.repo.js";
import mongoose from "mongoose";

const app = express();
export const server = http.createServer(app);
app.use(cors());
let usersTyping = [];
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

io.on("connection", async (socket) => {
  console.log("User is connected");

  socket.on("typing", async (roomName) => {
    const room = await getRoomByRoomName(roomName);
    const activeRoomUsers = await allUsersByRoomID(room._id);
    if (!usersTyping.includes(socket.id)) usersTyping.push(socket.id);
    socket.broadcast
      .to(roomName)
      .emit("updateUsers", { activeRoomUsers, usersTyping });
  });
  socket.on("stopTyping", async (roomName) => {
    const room = await getRoomByRoomName(roomName);
    const activeRoomUsers = await allUsersByRoomID(room._id);
    const userIndex = usersTyping.findIndex((sID) => sID == socket.id);
    if (userIndex >= 0) usersTyping.splice(userIndex, 1);
    socket.broadcast
      .to(roomName)
      .emit("updateUsers", { activeRoomUsers, usersTyping });
  });
  socket.on("getRooms", async () => {
    const allRooms = await getAllRooms();
    socket.emit("availableRooms", allRooms);
  });
  socket.on("joinRoom", async (obj) => {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
      const room = await createOrGetRoom(obj.room);
      const newUser = {
        name: obj.username,
        socketID: socket.id,
        roomID: room._id,
      };
      const user = await createUser(newUser);
      await addUserToRoom(user, room);
      socket.join(obj.room);
      console.log(`${obj.username} has joined the room`);
      const activeRoomUsers = await allUsersByRoomID(room._id);
      socket.emit("updateUsers", { activeRoomUsers, socketID: socket.id });
      socket.to(obj.room).emit("updateUsers", { activeRoomUsers });

      // socket.broadcast
      const oldMessages = await getPreviousMessagesByRoomID(room._id);
      socket.emit("loadMessages", oldMessages);
      //Greet the new user
      socket.emit("welcome", user);
      // Inform others
      socket.broadcast.to(obj.room).emit("newUserJoined", user);
      await session.commitTransaction();
    } catch (err) {
      startSession.abortTransaction();
      console.log(err);
    }
    session.endSession();
  });
  socket.on("newMessage", async (obj) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const user = await getUserBySocketID(socket.id, { session });
      const room = await getRoomByRoomName(obj.roomName, { session });
      const message = await createNewMessage(room._id, user._id, obj.text, {
        session,
      });
      socket.broadcast
        .to(obj.roomName)
        .emit("newMessage", { message: message, user: user });

      await session.commitTransaction();
      session.endSession();
    } catch (error) {
      await session.abortTransaction();
      session.endSession();
      console.error(error);
    }
  });
  socket.on("exitRoom", async (roomName) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const user = await getUserBySocketID(socket.id);
      let room = await createOrGetRoom(roomName, { session });
      console.log(user._id.toString());
      room = await removeUserFromRoomByUserID(room._id, user._id.toString());
      await deleteUserBySocketID(socket.id, { session });
      socket.leave(roomName);
      const activeRoomUsers = await allUsersByRoomID(room._id, { session });
      // console.log("active users " + activeRoomUsers.length);
      if (activeRoomUsers.length == 0 || activeRoomUsers == null) {
        // delete room and delete all its messages
        await deleteMessagesByRoomID(room._id, { session });
        await deleteRoomByRoomID(room._id, { session });
        // socket.emit("exitRoom", user);
      } else {
        // send remaining active users
        // socket.emit("exitRoom", user);
        socket.broadcast.to(roomName).emit("userLeft", user);
        socket.broadcast.to(roomName).emit("updateUsers", { activeRoomUsers });
      }

      await session.commitTransaction();
      session.endSession();
    } catch (error) {
      await session.abortTransaction();
      session.endSession();
      console.error(error);
    }
  });

  socket.on("disconnect", async () => {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
      const user = await getUserBySocketID(socket.id);
      if (user != null) {
        let room = await getRoomByRoomID(user.roomID);
        room = await removeUserFromRoomByUserID(room._id, user._id.toString()); //for some reason mongoose ObjectId type is not automaticaly getting converted to string
        await deleteUserBySocketID(socket.id);
        socket.leave(room.roomname);
        const activeRoomUsers = await allUsersByRoomID(room._id);
        if (activeRoomUsers.length == 0 || activeRoomUsers == null) {
          //delete room and delete all its messages
          await deleteMessagesByRoomID(room._id);
          await deleteRoomByRoomID(room._id);
        } else {
          socket.broadcast.to(room.roomname).emit("userLeft", user);
          // send remaining active users
          socket.broadcast
            .to(room.roomname)
            .emit("updateUsers", { activeRoomUsers });
        }
        console.log("User disconnected");
      }
      await session.commitTransaction();
    } catch (err) {
      session.abortTransaction();
      console.log(err);
    }
    session.endSession();
  });
});
