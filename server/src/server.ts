import dotenv from "dotenv";
dotenv.config();

import app from "./app.js";
import connectDB from "./config/database.js";
import http from 'http';
import { setupSocket } from './socket.js';

await connectDB();

const PORT = process.env.PORT || 5000;
const server = http.createServer(app);
setupSocket(server);

server.listen(PORT, () => {
  console.log(`SERPENTIS Server running on http://localhost:${PORT}`);
});