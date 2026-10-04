import dotenv from "dotenv";
import mongoose from "mongoose";
import axios from "axios";
import path from "path";
import { fileURLToPath } from "url";
import PublicService, { type ServiceCategory } from "../models/PublicService.js";
import Place, { type PlaceCategory } from "../models/Place.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, "../../.env") });

const BBOX = "18.89,72.77,19.27,73.00";
const OVERPASS_URL = "https://overpass-api.de/api/interpreter";

const serviceQueries: Partial<Record<ServiceCategory, string[]>> = {
  hospital: ['node["amenity"="hospital"]'],
  police: ['node["amenity"="police"]'],
  "fire-station": ['node["amenity"="fire_station"]'],
  pharmacy: ['node["amenity"="pharmacy"]'],
  bank: ['node["amenity"="bank"]'],
  atm: ['node["amenity"="atm"]'],
  "bus-stop": ['node["highway"="bus_stop"]'],
  "railway-station": ['node["railway"="station"]'],
  "government-office": ['node["office"="government"]', 'node["amenity"="townhall"]'],
  parking: ['node["amenity"="parking"]'],
  "public-toilet": ['node["amenity"="toilets"]'],
};

const placeQueries: Partial<Record<PlaceCategory, string[]>> = {
  fort: ['node["historic"="fort"]'],
  temple: ['node["amenity"="place_of_worship"]["religion"="hindu"]'],
  museum: ['node["tourism"="museum"]'],
  park: ['node["leisure"="park"]'],
  lake: ['node["natural"="water"]["water"="lake"]'],
  waterfall: ['node["waterway"="waterfall"]'],
  viewpoint: ['node["tourism"="viewpoint"]'],
};

async function fetchOSMData(queries: string[]) {
  if (queries.length === 0) return [];
  const queryBody = queries.map(q => `${q}(${BBOX});`).join("\n  ");
  const overpassQuery = `[out:json][timeout:90];\n(\n  ${queryBody}\n);\nout body;`;
  
  let attempts = 3;
  while(attempts > 0) {
    try {
      await new Promise(r => setTimeout(r, 4000));
      const response = await axios.post(OVERPASS_URL, `data=${encodeURIComponent(overpassQuery)}`, {
        headers: { 
          "Content-Type": "application/x-www-form-urlencoded",
          "Accept": "application/json",
          "User-Agent": "Serpentis-App/1.0"
        },
        timeout: 120000
      });
      return response.data.elements || [];
    } catch (error: any) {
      console.error(`Failed to fetch OSM data (Attempts left ${attempts - 1}): ${error.message}`);
      attempts--;
      if (attempts === 0) return [];
      await new Promise(r => setTimeout(r, 10000)); // wait 10s before retry
    }
  }
  return [];
}

function getAddress(tags: any): string {
  if (tags["addr:full"]) return tags["addr:full"];
  const parts = [];
  if (tags["addr:housenumber"]) parts.push(tags["addr:housenumber"]);
  if (tags["addr:street"]) parts.push(tags["addr:street"]);
  if (tags["addr:city"]) parts.push(tags["addr:city"]);
  if (parts.length > 0) return parts.join(", ");
  return "Mumbai, Maharashtra";
}

function getLonLat(el: any): [number, number] {
  if (el.type === "node") return [el.lon, el.lat];
  if (el.center) return [el.center.lon, el.center.lat];
  return [0, 0];
}

async function runImport() {
  if (!process.env.MONGO_URI) {
    console.error("MONGO_URI not found in .env");
    process.exit(1);
  }

  console.log("Connecting to database...");
  await mongoose.connect(process.env.MONGO_URI);
  console.log("Connected successfully.");

  const serviceResults: Record<string, { imported: number; skipped: number; invalid: number }> = {};
  const placeResults: Record<string, { imported: number; skipped: number; invalid: number }> = {};
  let totalServiceImported = 0;
  let totalServiceSkipped = 0;
  let totalServiceInvalid = 0;
  let totalPlaceImported = 0;
  let totalPlaceSkipped = 0;
  let totalPlaceInvalid = 0;

  console.log("--- IMPORTING PUBLIC SERVICES ---");
  for (const [categoryStr, queries] of Object.entries(serviceQueries)) {
    const category = categoryStr as ServiceCategory;
    console.log(`Fetching ${category}...`);
    const elements = await fetchOSMData(queries);
    console.log(`Found ${elements.length} records for ${category}`);

    let imported = 0;
    let skipped = 0;
    let invalid = 0;

    for (const el of elements) {
      if (!el.tags || !el.tags.name) {
        invalid++;
        continue;
      }
      const name = el.tags.name.trim();
      if (name.length < 3) {
        invalid++;
        continue;
      }
      
      const coords = getLonLat(el);
      if (coords[0] === 0 && coords[1] === 0) {
        invalid++;
        continue;
      }

      const exists = await PublicService.findOne({ name, category });
      if (exists) {
        skipped++;
        continue;
      }

      const description = el.tags.description || el.tags.amenity || `Public ${category} facility located in the Mumbai region.`;
      const address = getAddress(el.tags).substring(0, 300);

      try {
        await PublicService.create({
          name,
          description: description.substring(0, 2000),
          category,
          address,
          phone: el.tags.phone || "",
          email: el.tags.email || "",
          website: el.tags.website || "",
          openingHours: el.tags.opening_hours || "",
          isEmergency: category === "hospital" || category === "police" || category === "fire-station" || el.tags.emergency === "yes",
          images: [],
          location: {
            type: "Point",
            coordinates: coords
          }
        });
        imported++;
      } catch (err: any) {
        invalid++;
      }
    }

    serviceResults[category] = { imported, skipped, invalid };
    totalServiceImported += imported;
    totalServiceSkipped += skipped;
    totalServiceInvalid += invalid;
  }

  console.log("--- IMPORTING HERITAGE PLACES ---");
  for (const [categoryStr, queries] of Object.entries(placeQueries)) {
    const category = categoryStr as PlaceCategory;
    console.log(`Fetching ${category}...`);
    const elements = await fetchOSMData(queries);
    console.log(`Found ${elements.length} records for ${category}`);

    let imported = 0;
    let skipped = 0;
    let invalid = 0;

    for (const el of elements) {
      if (!el.tags || !el.tags.name) {
        invalid++;
        continue;
      }
      const name = el.tags.name.trim();
      
      const coords = getLonLat(el);
      if (coords[0] === 0 && coords[1] === 0) {
        invalid++;
        continue;
      }

      const exists = await Place.findOne({ name, category });
      if (exists) {
        skipped++;
        continue;
      }

      const description = el.tags.description || el.tags.historic || el.tags.tourism || `Historical ${category} located in the Mumbai region.`;
      const address = getAddress(el.tags);

      try {
        await Place.create({
          name,
          description,
          category,
          address,
          images: [],
          location: {
            type: "Point",
            coordinates: coords
          }
        });
        imported++;
      } catch (err: any) {
        invalid++;
      }
    }

    placeResults[category] = { imported, skipped, invalid };
    totalPlaceImported += imported;
    totalPlaceSkipped += skipped;
    totalPlaceInvalid += invalid;
  }

  console.log("\n\nMumbai SERPENTIS data import complete\n");
  console.log("Places:");
  for (const [cat, res] of Object.entries(serviceResults)) {
    console.log(`${cat}: ${res.imported}`);
  }
  console.log(`Total imported: ${totalServiceImported}`);
  console.log(`Duplicates skipped: ${totalServiceSkipped}`);
  console.log(`Invalid records skipped: ${totalServiceInvalid}\n`);

  console.log("Heritage:");
  for (const [cat, res] of Object.entries(placeResults)) {
    console.log(`${cat}: ${res.imported}`);
  }
  console.log(`Total imported: ${totalPlaceImported}`);
  console.log(`Duplicates skipped: ${totalPlaceSkipped}`);
  console.log(`Invalid records skipped: ${totalPlaceInvalid}\n`);

  await mongoose.disconnect();
  process.exit(0);
}

runImport().catch(console.error);
