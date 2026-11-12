import { Schema, model, type Document } from 'mongoose';

export type ExpansionStage = 'pilot' | 'state' | 'national';

export interface IDataCoverage {
  weather: boolean;
  airQualityModeled: boolean;
  airQualityStations: boolean;
  civicReports: boolean;
  officialAlerts: boolean;
  greenSpaces: boolean;
}

export interface IEnvironmentalLocation extends Document {
  slug: string;
  name: string;
  country: string;
  state: string;
  district: string;
  city: string;
  locality: string;
  expansionStage: ExpansionStage;
  isPilot: boolean;
  location: {
    type: 'Point';
    coordinates: [number, number]; // [longitude, latitude]
  };
  aliases: string[];
  climateZone: string;
  elevationMeters?: number | undefined;
  coverage: IDataCoverage;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const environmentalLocationSchema = new Schema<IEnvironmentalLocation>(
  {
    slug: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    country: {
      type: String,
      default: 'India',
      trim: true,
    },
    state: {
      type: String,
      required: true,
      trim: true,
    },
    district: {
      type: String,
      required: true,
      trim: true,
    },
    city: {
      type: String,
      required: true,
      trim: true,
    },
    locality: {
      type: String,
      default: '',
      trim: true,
    },
    expansionStage: {
      type: String,
      enum: ['pilot', 'state', 'national'],
      default: 'national',
    },
    isPilot: {
      type: Boolean,
      default: false,
    },
    location: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point',
        required: true,
      },
      coordinates: {
        type: [Number],
        required: true,
      },
    },
    aliases: {
      type: [String],
      default: [],
    },
    climateZone: {
      type: String,
      default: 'Tropical',
      trim: true,
    },
    elevationMeters: {
      type: Number,
    },
    coverage: {
      weather: { type: Boolean, default: true },
      airQualityModeled: { type: Boolean, default: true },
      airQualityStations: { type: Boolean, default: false },
      civicReports: { type: Boolean, default: true },
      officialAlerts: { type: Boolean, default: false },
      greenSpaces: { type: Boolean, default: false },
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true },
);

environmentalLocationSchema.index({ location: '2dsphere' });
environmentalLocationSchema.index({ state: 1, district: 1, city: 1 });
environmentalLocationSchema.index({ expansionStage: 1, isActive: 1 });

const EnvironmentalLocation = model<IEnvironmentalLocation>(
  'EnvironmentalLocation',
  environmentalLocationSchema,
);

export default EnvironmentalLocation;
