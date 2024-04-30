import mongoose from "mongoose";

const messageSchema = mongoose.Schema({
  text: {
    type: String,
    required: true,
  },
  roomID: {
    type: mongoose.Types.ObjectId,
    ref: "Room",
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  userID: {
    type: mongoose.Types.ObjectId,
    ref: "User",
    required: true,
  },
});

export const messagesModel = mongoose.model("Message", messageSchema);
