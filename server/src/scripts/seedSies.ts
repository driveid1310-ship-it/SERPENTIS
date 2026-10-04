import mongoose from "mongoose";
import axios from "axios";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import PublicService, { type ServiceCategory } from "../models/PublicService.js";
import Place, { type PlaceCategory } from "../models/Place.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, "../../.env") });

const LAT = 19.04125;
const LON = 72.86128;
const RADIUS = 1500; // 1.5km radius around SIES College

const OVERPASS_URL = "https://overpass-api.de/api/interpreter";

const serviceMapping: { tags: { k: string; v: string }, category: ServiceCategory }[] = [
  { tags: { k: "amenity", v: "hospital" }, category: "hospital" },
  { tags: { k: "amenity", v: "clinic" }, category: "hospital" },
  { tags: { k: "amenity", v: "police" }, category: "police" },
  { tags: { k: "amenity", v: "fire_station" }, category: "fire-station" },
  { tags: { k: "amenity", v: "pharmacy" }, category: "pharmacy" },
  { tags: { k: "amenity", v: "bank" }, category: "bank" },
  { tags: { k: "amenity", v: "atm" }, category: "atm" },
  { tags: { k: "highway", v: "bus_stop" }, category: "bus-stop" },
  { tags: { k: "railway", v: "station" }, category: "railway-station" },
  { tags: { k: "office", v: "government" }, category: "government-office" },
  { tags: { k: "amenity", v: "townhall" }, category: "government-office" },
  { tags: { k: "amenity", v: "parking" }, category: "parking" },
  { tags: { k: "amenity", v: "toilets" }, category: "public-toilet" },
  { tags: { k: "amenity", v: "school" }, category: "other" },
  { tags: { k: "amenity", v: "college" }, category: "other" },
  { tags: { k: "amenity", v: "university" }, category: "other" },
];

const placeMapping: { tags: { k: string; v: string }, category: PlaceCategory }[] = [
  { tags: { k: "historic", v: "fort" }, category: "fort" },
  { tags: { k: "amenity", v: "place_of_worship" }, category: "temple" }, // Simplified
  { tags: { k: "tourism", v: "museum" }, category: "museum" },
  { tags: { k: "leisure", v: "park" }, category: "park" },
  { tags: { k: "natural", v: "water" }, category: "lake" },
  { tags: { k: "waterway", v: "waterfall" }, category: "waterfall" },
  { tags: { k: "tourism", v: "viewpoint" }, category: "viewpoint" },
];

async function fetchAllOSMData() {
  const allConditions = [...serviceMapping, ...placeMapping].map(m => `node["${m.tags.k}"="${m.tags.v}"](around:${RADIUS},${LAT},${LON});`);
  // Remove duplicates
  const uniqueConditions = [...new Set(allConditions)];
  const queryBody = uniqueConditions.join("\n  ");
  
  const overpassQuery = `[out:json][timeout:90];\n(\n  ${queryBody}\n);\nout body;`;
  
  let attempts = 3;
  while(attempts > 0) {
    try {
      console.log(`Sending Overpass query...`);
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
      console.error(`Failed to fetch OSM data: ${error.message}`);
      attempts--;
      if (attempts === 0) return [];
      await new Promise(r => setTimeout(r, 5000));
    }
  }
  return [];
}

function getAddress(tags: any): string {
  if (tags["addr:full"]) return tags["addr:full"];
  const parts = [];
  if (tags["addr:housenumber"]) parts.push(tags["addr:housenumber"]);
  if (tags["addr:street"]) parts.push(tags["addr:street"]);
  if (tags["addr:suburb"]) parts.push(tags["addr:suburb"]);
  if (tags["addr:city"]) parts.push(tags["addr:city"]);
  if (parts.length > 0) return parts.join(", ");
  return "Sion, Mumbai, Maharashtra";
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

  const dryRun = process.argv.includes('--dry-run');

  console.log("Connecting to database...");
  await mongoose.connect(process.env.MONGO_URI);
  console.log("Connected successfully.");

  const initialServiceCount = await PublicService.countDocuments();
  const initialPlaceCount = await Place.countDocuments();
  console.log(`Initial DB State: ${initialServiceCount} Services, ${initialPlaceCount} Places.`);

  const elements = await fetchAllOSMData();
  console.log(`Received ${elements.length} raw elements from OSM.`);

  let totalServiceImported = 0;
  let totalServiceSkipped = 0;
  let totalServiceInvalid = 0;
  let totalPlaceImported = 0;
  let totalPlaceSkipped = 0;
  let totalPlaceInvalid = 0;
  
  const serviceResults: Record<string, {imported: number, skipped: number, invalid: number}> = {};
  const placeResults: Record<string, {imported: number, skipped: number, invalid: number}> = {};

  for (const el of elements) {
    if (!el.tags || !el.tags.name) {
      continue;
    }
    const name = el.tags.name.trim();
    const coords = getLonLat(el);
    if (coords[0] === 0 && coords[1] === 0) continue;

    // Determine categories
    const sCats = serviceMapping.filter(m => el.tags[m.tags.k] === m.tags.v).map(m => m.category);
    const pCats = placeMapping.filter(m => el.tags[m.tags.k] === m.tags.v).map(m => m.category);

    // Process as services
    for (const category of sCats) {
      if (!serviceResults[category]) serviceResults[category] = {imported: 0, skipped: 0, invalid: 0};
      
      const exists = await PublicService.findOne({ name, category });
      const nearbyExists = await PublicService.findOne({
        name,
        location: {
          $near: {
            $geometry: { type: "Point", coordinates: coords },
            $maxDistance: 50
          }
        }
      });

      if (exists || nearbyExists) {
        serviceResults[category].skipped++;
        totalServiceSkipped++;
        continue;
      }

      const description = el.tags.description || `Public ${category} located in the Sion area.`;
      const address = getAddress(el.tags);

      if (!dryRun) {
        try {
          await PublicService.create({
            name,
            description,
            category,
            address,
            phone: el.tags.phone || el.tags["contact:phone"] || "",
            openingHours: el.tags.opening_hours || "",
            location: {
              type: "Point",
              coordinates: coords
            }
          });
          serviceResults[category].imported++;
          totalServiceImported++;
        } catch (err) {
          serviceResults[category].invalid++;
          totalServiceInvalid++;
        }
      } else {
        serviceResults[category].imported++;
        totalServiceImported++;
      }
    }

    // Process as places
    for (const category of pCats) {
      if (!placeResults[category]) placeResults[category] = {imported: 0, skipped: 0, invalid: 0};

      const exists = await Place.findOne({ name, category });
      const nearbyExists = await Place.findOne({
        name,
        location: {
          $near: {
            $geometry: { type: "Point", coordinates: coords },
            $maxDistance: 50
          }
        }
      });

      if (exists || nearbyExists) {
        placeResults[category].skipped++;
        totalPlaceSkipped++;
        continue;
      }

      const description = el.tags.description || el.tags.historic || el.tags.tourism || `Historical ${category} located in the Sion area.`;
      const address = getAddress(el.tags);

      if (!dryRun) {
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
          placeResults[category].imported++;
          totalPlaceImported++;
        } catch (err) {
          placeResults[category].invalid++;
          totalPlaceInvalid++;
        }
      } else {
        placeResults[category].imported++;
        totalPlaceImported++;
      }
    }
  }

  console.log(`\n--- SIES EXPANSION REPORT ---`);
  console.log(`Mode: ${dryRun ? 'DRY-RUN (No inserts)' : 'PRODUCTION'}`);
  console.log(`Bounds: ${RADIUS}m radius around SIES College (${LAT}, ${LON})`);
  
  const finalServiceCount = dryRun ? initialServiceCount + totalServiceImported : await PublicService.countDocuments();
  const finalPlaceCount = dryRun ? initialPlaceCount + totalPlaceImported : await Place.countDocuments();

  console.log(`\nSERVICES:`);
  for (const [cat, res] of Object.entries(serviceResults)) {
    if (res.imported > 0 || res.skipped > 0) {
      console.log(` - ${cat}: Proposed/Added: ${res.imported}, Skipped (Dup): ${res.skipped}`);
    }
  }
  console.log(`Total New Services: ${totalServiceImported}`);
  console.log(`Duplicates Skipped: ${totalServiceSkipped}`);
  
  console.log(`\nPLACES:`);
  for (const [cat, res] of Object.entries(placeResults)) {
    if (res.imported > 0 || res.skipped > 0) {
      console.log(` - ${cat}: Proposed/Added: ${res.imported}, Skipped (Dup): ${res.skipped}`);
    }
  }
  console.log(`Total New Places: ${totalPlaceImported}`);
  console.log(`Duplicates Skipped: ${totalPlaceSkipped}`);

  console.log(`\nFinal DB State: ${finalServiceCount} Services (was ${initialServiceCount}), ${finalPlaceCount} Places (was ${initialPlaceCount})`);

  await mongoose.disconnect();
  process.exit(0);
}

runImport().catch(console.error);
