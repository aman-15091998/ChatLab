import mongoose from "mongoose";
import { messagesModel } from "../schemas/message.schema.js";
export async function getPreviousMessagesByRoomID(roomID) {
  try {
    const messages = await messagesModel
      .find({ roomID: roomID })
      .sort({ createdAt: 1 })
      .limit(50)
      .populate("userID")
      .exec();
    return messages;
  } catch (err) {
    console.log(err);
  }
}

export async function createNewMessage(roomID, userID, text) {
  try {
    const newMessage = new messagesModel({ text, userID, roomID });
    await newMessage.save();
    return newMessage;
  } catch (err) {
    console.log(err);
  }
}

export async function deleteMessagesByRoomID(roomID) {
  try {
    await messagesModel.deleteMany({ roomID });
  } catch (err) {
    console.log(err);
  }
}
