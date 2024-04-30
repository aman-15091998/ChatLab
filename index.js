import dotenv from "dotenv";
dotenv.config();
import { connectDB } from "./configs/mongo.config.js";
import { server } from "./server.js";
const port = process.env.PORT || 3000;
server.listen(port, () => {
  console.log("Server is active");
  connectDB();
});
