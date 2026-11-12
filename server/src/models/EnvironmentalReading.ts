import { Schema, model, type Document, Types } from 'mongoose';

export type EnvironmentalDataType =
  | 'observed'
  | 'modeled'
  | 'forecast'
  | 'citizen-reported'
  | 'experimental-prediction';

export type DataQualityStatus =
  | 'valid'
  | 'suspect'
  | 'stale'
  | 'insufficient'
  | 'uncalibrated';

export type ReadingClassification = 'observation' | 'forecast';

export interface IEnvironmentalReading extends Document {
  metricName: string;
  numericValue: number;
  unit: string;
  location: {
    type: 'Point';
    coordinates: [number, number];
  };
  locationName: string;
  locality?: string | undefined;
  city: string;
  district: string;
  state: string;
  observationTimestamp: Date;
  retrievalTimestamp: Date;
  provider: string;
  monitoringStationId?: string | undefined;
  dataQualityStatus: DataQualityStatus;
  dataType: EnvironmentalDataType;
  classification: ReadingClassification;
  confidence?: number | undefined;
  reportedBy?: Types.ObjectId | undefined;
  notes?: string | undefined;
  metadata?: Record<string, unknown> | undefined;
  createdAt: Date;
  updatedAt: Date;
}

const environmentalReadingSchema = new Schema<IEnvironmentalReading>(
  {
    metricName: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    numericValue: {
      type: Number,
      required: true,
    },
    unit: {
      type: String,
      required: true,
      trim: true,
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
    locationName: { type: String, required: true, trim: true },
    locality: { type: String, trim: true },
    city: { type: String, required: true, trim: true },
    district: { type: String, required: true, trim: true },
    state: { type: String, required: true, trim: true },
    observationTimestamp: { type: Date, required: true },
    retrievalTimestamp: { type: Date, default: () => new Date(), required: true },
    provider: { type: String, required: true, trim: true },
    monitoringStationId: { type: String, trim: true },
    dataQualityStatus: {
      type: String,
      enum: ['valid', 'suspect', 'stale', 'insufficient', 'uncalibrated'],
      default: 'valid',
    },
    dataType: {
      type: String,
      enum: [
        'observed',
        'modeled',
        'forecast',
        'citizen-reported',
        'experimental-prediction',
      ],
      required: true,
    },
    classification: {
      type: String,
      enum: ['observation', 'forecast'],
      required: true,
    },
    confidence: {
      type: Number,
      min: 0,
      max: 1,
    },
    reportedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    notes: {
      type: String,
      trim: true,
      maxlength: 500,
    },
    metadata: {
      type: Schema.Types.Mixed,
    },
  },
  { timestamps: true },
);

environmentalReadingSchema.index({ location: '2dsphere' });
environmentalReadingSchema.index({ metricName: 1, city: 1, observationTimestamp: -1 });
environmentalReadingSchema.index({ dataType: 1, observationTimestamp: -1 });

const EnvironmentalReading = model<IEnvironmentalReading>(
  'EnvironmentalReading',
  environmentalReadingSchema,
);

export default EnvironmentalReading;
