import { Schema, model, type Document, Types } from 'mongoose';

export interface ISavedLocation {
  slug: string;
  name: string;
  city: string;
  district: string;
  state: string;
  coordinates: [number, number];
}

export interface IAlertPreferences {
  heatwave: boolean;
  heavyRainfall: boolean;
  poorAqi: boolean;
  extremeUv: boolean;
  waterlogging: boolean;
  thunderstorm: boolean;
  aqiThreshold: number;
}

export interface IEnvironmentalPreference extends Document {
  user: Types.ObjectId;
  temperatureUnit: 'C' | 'F';
  windSpeedUnit: 'kmh' | 'ms';
  primaryLocationSlug: string;
  savedLocations: ISavedLocation[];
  alertPreferences: IAlertPreferences;
  locationConsentGranted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const environmentalPreferenceSchema = new Schema<IEnvironmentalPreference>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    temperatureUnit: {
      type: String,
      enum: ['C', 'F'],
      default: 'C',
    },
    windSpeedUnit: {
      type: String,
      enum: ['kmh', 'ms'],
      default: 'kmh',
    },
    primaryLocationSlug: {
      type: String,
      default: 'badlapur-maharashtra',
      trim: true,
    },
    savedLocations: {
      type: [
        {
          slug: { type: String, required: true },
          name: { type: String, required: true },
          city: { type: String, required: true },
          district: { type: String, required: true },
          state: { type: String, required: true },
          coordinates: { type: [Number], required: true },
        },
      ],
      default: [],
    },
    alertPreferences: {
      heatwave: { type: Boolean, default: true },
      heavyRainfall: { type: Boolean, default: true },
      poorAqi: { type: Boolean, default: true },
      extremeUv: { type: Boolean, default: true },
      waterlogging: { type: Boolean, default: true },
      thunderstorm: { type: Boolean, default: true },
      aqiThreshold: { type: Number, default: 200, min: 50, max: 450 },
    },
    locationConsentGranted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true },
);

const EnvironmentalPreference = model<IEnvironmentalPreference>(
  'EnvironmentalPreference',
  environmentalPreferenceSchema,
);

export default EnvironmentalPreference;
