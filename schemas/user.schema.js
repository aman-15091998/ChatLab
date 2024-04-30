import mongoose from "mongoose";

const userSchema = mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  socketID: {
    type: String,
    required: true,
    unique: true,
  },
  roomID: { type: mongoose.Types.ObjectId, ref: "Room", required: true },
});

export const usersModel = mongoose.model("User", userSchema);
