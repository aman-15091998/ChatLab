import mongoose from "mongoose";
import { usersModel } from "../schemas/user.schema.js";

export async function createUser(newUser) {
  //   let user = await usersModel.findOne({ socketID: user.socketID });
  //   if (user) return user;
  //   else {
  let user = new usersModel(newUser);
  await user.save();
  return user;
  //   }
}

export async function allUsersByRoomID(roomID) {
  try {
    const allUsers = await usersModel.find({ roomID: roomID });
    return allUsers;
  } catch (err) {
    console.log(err);
  }
}

export async function getUserBySocketID(socketID) {
  try {
    const user = await usersModel.findOne({ socketID });
    return user;
  } catch (err) {}
}

export async function deleteUserBySocketID(socketID) {
  try {
    const user = await usersModel.findOne({ socketID });
    await usersModel.deleteOne({ socketID });
    return user;
  } catch (err) {
    console.log(err);
  }
}
