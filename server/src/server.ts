import dotenv from "dotenv";

dotenv.config();

import app from "./app.js";
import connectDB from "./config/database.js";

await connectDB();

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 SERPENTIS Server running on http://localhost:${PORT}`);
});