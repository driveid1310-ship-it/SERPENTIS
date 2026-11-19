import { Schema, model, type Document } from 'mongoose';

export type HistoryGranularity = 'hourly' | 'daily';

export interface IEnvironmentalMetricHistory extends Document {
  locationSlug: string;
  city: string;
  district: string;
  state: string;
  granularity: HistoryGranularity;
  periodStart: Date;
  temperatureAvgC?: number | undefined;
  temperatureMinC?: number | undefined;
  temperatureMaxC?: number | undefined;
  humidityAvgPct?: number | undefined;
  rainfallTotalMm?: number | undefined;
  windSpeedAvgKmh?: number | undefined;
  aqiAvg?: number | undefined;
  aqiMax?: number | undefined;
  pm25Avg?: number | undefined;
  pm10Avg?: number | undefined;
  dominantPollutant?: string | undefined;
  noiseDbAvg?: number | undefined;
  dataType: 'observed' | 'modeled' | 'aggregated-citizen';
  provider: string;
  sampleCount: number;
  createdAt: Date;
  updatedAt: Date;
}

const environmentalMetricHistorySchema = new Schema<IEnvironmentalMetricHistory>(
  {
    locationSlug: { type: String, required: true, trim: true, lowercase: true },
    city: { type: String, required: true, trim: true },
    district: { type: String, required: true, trim: true },
    state: { type: String, required: true, trim: true },
    granularity: {
      type: String,
      enum: ['hourly', 'daily'],
      required: true,
    },
    periodStart: { type: Date, required: true },
    temperatureAvgC: { type: Number },
    temperatureMinC: { type: Number },
    temperatureMaxC: { type: Number },
    humidityAvgPct: { type: Number },
    rainfallTotalMm: { type: Number },
    windSpeedAvgKmh: { type: Number },
    aqiAvg: { type: Number },
    aqiMax: { type: Number },
    pm25Avg: { type: Number },
    pm10Avg: { type: Number },
    dominantPollutant: { type: String },
    noiseDbAvg: { type: Number },
    dataType: {
      type: String,
      enum: ['observed', 'modeled', 'aggregated-citizen'],
      required: true,
    },
    provider: { type: String, required: true, trim: true },
    sampleCount: { type: Number, default: 1 },
  },
  { timestamps: true },
);

environmentalMetricHistorySchema.index(
  { locationSlug: 1, granularity: 1, periodStart: 1, dataType: 1 },
  { unique: true },
);
environmentalMetricHistorySchema.index({ city: 1, periodStart: -1 });

const EnvironmentalMetricHistory = model<IEnvironmentalMetricHistory>(
  'EnvironmentalMetricHistory',
  environmentalMetricHistorySchema,
);

export default EnvironmentalMetricHistory;
