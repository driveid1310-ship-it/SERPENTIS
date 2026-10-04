import type { IPublicService } from "../models/PublicService.js";
import type { IPlace } from "../models/Place.js";
import mongoose from "mongoose";
import PublicService from "../models/PublicService.js";
import Place from "../models/Place.js";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// Load .env from project root
dotenv.config({ path: path.resolve(__dirname, "../../.env") });

const CENTER_LAT = 19.04125;
const CENTER_LON = 72.86128;
const RADIUS_METERS = 1500;

async function run() {
  if (!process.env.MONGO_URI) {
    console.error("MONGO_URI missing");
    process.exit(1);
  }
  await mongoose.connect(process.env.MONGO_URI);
  // Records inserted by the seed script have a recent createdAt timestamp.
  const recentCutoff = new Date(Date.now() - 10 * 60 * 1000); // 10 minutes ago

  const services = await PublicService.find({ createdAt: { $gte: recentCutoff } }).lean() as IPublicService[];
  const places = await Place.find({ createdAt: { $gte: recentCutoff } }).lean() as IPlace[];

  const all = [...services.map(s => ({
    name: s.name,
    collection: "PublicService",
    category: s.category,
    latitude: s.location.coordinates[1],
    longitude: s.location.coordinates[0],
  })),
  ...places.map(p => ({
    name: p.name,
    collection: "Place",
    category: p.category,
    latitude: p.location.coordinates[1],
    longitude: p.location.coordinates[0],
  }))];

  console.log(JSON.stringify({
    timestamp: new Date().toISOString(),
    total: all.length,
    records: all,
  }, null, 2));

  await mongoose.disconnect();
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
