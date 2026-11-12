import { Schema, model, type Document } from 'mongoose';

export type AlertCategory =
  | 'heatwave'
  | 'extreme-temperature'
  | 'heavy-rainfall'
  | 'thunderstorm'
  | 'lightning'
  | 'strong-winds'
  | 'poor-aqi'
  | 'extreme-uv'
  | 'waterlogging'
  | 'flood'
  | 'landslide';

export type AlertSeverity = 'advisory' | 'moderate' | 'severe' | 'extreme';

export type AlertVerificationStatus = 'official' | 'threshold-advisory' | 'experimental';

export interface IEnvironmentalAlert extends Document {
  fingerprint: string;
  category: AlertCategory;
  severity: AlertSeverity;
  title: string;
  description: string;
  precautions: string[];
  provider: string;
  source: string;
  verificationStatus: AlertVerificationStatus;
  city: string;
  district: string;
  state: string;
  coverageRadiusKm: number;
  location: {
    type: 'Point';
    coordinates: [number, number];
  };
  issuedAt: Date;
  validFrom: Date;
  expiresAt: Date;
  isActive: boolean;
  metricsSnapshot?: Record<string, unknown> | undefined;
  createdAt: Date;
  updatedAt: Date;
}

const environmentalAlertSchema = new Schema<IEnvironmentalAlert>(
  {
    fingerprint: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    category: {
      type: String,
      enum: [
        'heatwave',
        'extreme-temperature',
        'heavy-rainfall',
        'thunderstorm',
        'lightning',
        'strong-winds',
        'poor-aqi',
        'extreme-uv',
        'waterlogging',
        'flood',
        'landslide',
      ],
      required: true,
    },
    severity: {
      type: String,
      enum: ['advisory', 'moderate', 'severe', 'extreme'],
      required: true,
    },
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    precautions: { type: [String], default: [] },
    provider: { type: String, required: true, trim: true },
    source: { type: String, required: true, trim: true },
    verificationStatus: {
      type: String,
      enum: ['official', 'threshold-advisory', 'experimental'],
      default: 'threshold-advisory',
    },
    city: { type: String, required: true, trim: true },
    district: { type: String, required: true, trim: true },
    state: { type: String, required: true, trim: true },
    coverageRadiusKm: { type: Number, default: 15 },
    location: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point',
        required: true,
      },
      coordinates: { type: [Number], required: true },
    },
    issuedAt: { type: Date, required: true },
    validFrom: { type: Date, required: true },
    expiresAt: { type: Date, required: true },
    isActive: { type: Boolean, default: true },
    metricsSnapshot: { type: Schema.Types.Mixed },
  },
  { timestamps: true },
);

environmentalAlertSchema.index({ location: '2dsphere' });
environmentalAlertSchema.index({ city: 1, isActive: 1, expiresAt: 1 });
environmentalAlertSchema.index({ category: 1, severity: 1 });

const EnvironmentalAlert = model<IEnvironmentalAlert>(
  'EnvironmentalAlert',
  environmentalAlertSchema,
);

export default EnvironmentalAlert;
