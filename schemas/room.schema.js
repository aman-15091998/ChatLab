import mongoose, { mongo } from "mongoose";

const roomSchema = mongoose.Schema({
  roomname: {
    type: String,
    required: true,
    unique: true,
  },
  users: [{ type: mongoose.Types.ObjectId, ref: "User" }],
  // messages: [{ type: mongoose.Types.ObjectId, ref: "Message" }],
});

export const roomsModel = mongoose.model("Room", roomSchema);
