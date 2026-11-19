import { Schema, model, type Document } from 'mongoose';

export type StationType =
  | 'cpcb'
  | 'mpcb'
  | 'openaq'
  | 'imd'
  | 'citizen-sensor'
  | 'modeled-grid';

export type ReliabilityTier = 'official-reference' | 'community-calibrated' | 'modeled-estimate' | 'citizen-uncalibrated';

export interface IMonitoringStation extends Document {
  stationCode: string;
  name: string;
  provider: string;
  stationType: StationType;
  reliabilityTier: ReliabilityTier;
  location: {
    type: 'Point';
    coordinates: [number, number];
  };
  city: string;
  district: string;
  state: string;
  locality: string;
  supportedParameters: string[];
  isActive: boolean;
  lastReportedAt?: Date | undefined;
  metadata?: Record<string, unknown> | undefined;
  createdAt: Date;
  updatedAt: Date;
}

const monitoringStationSchema = new Schema<IMonitoringStation>(
  {
    stationCode: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    provider: {
      type: String,
      required: true,
      trim: true,
    },
    stationType: {
      type: String,
      enum: ['cpcb', 'mpcb', 'openaq', 'imd', 'citizen-sensor', 'modeled-grid'],
      required: true,
    },
    reliabilityTier: {
      type: String,
      enum: [
        'official-reference',
        'community-calibrated',
        'modeled-estimate',
        'citizen-uncalibrated',
      ],
      default: 'official-reference',
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
    city: { type: String, required: true, trim: true },
    district: { type: String, required: true, trim: true },
    state: { type: String, required: true, trim: true },
    locality: { type: String, default: '', trim: true },
    supportedParameters: { type: [String], default: [] },
    isActive: { type: Boolean, default: true },
    lastReportedAt: { type: Date },
    metadata: { type: Schema.Types.Mixed },
  },
  { timestamps: true },
);

monitoringStationSchema.index({ location: '2dsphere' });
monitoringStationSchema.index({ city: 1, stationType: 1 });

const MonitoringStation = model<IMonitoringStation>(
  'MonitoringStation',
  monitoringStationSchema,
);

export default MonitoringStation;
