import { Schema, model, type Document } from 'mongoose';

export interface IAirQualityObservation extends Document {
  locationKey: string;
  city: string;
  district: string;
  state: string;
  location: {
    type: 'Point';
    coordinates: [number, number];
  };
  provider: string;
  dataType: 'observed' | 'modeled' | 'forecast';
  methodology: string;
  overallAqi: number | null;
  aqiCategory: string | null;
  isOfficialAqi: boolean;
  dominantPollutant: string | null;
  observationTimestamp: Date;
  retrievalTimestamp: Date;
  payload: Record<string, unknown>;
  expiresAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const airQualityObservationSchema = new Schema<IAirQualityObservation>(
  {
    locationKey: { type: String, required: true, index: true },
    city: { type: String, required: true, trim: true },
    district: { type: String, required: true, trim: true },
    state: { type: String, required: true, trim: true },
    location: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point',
        required: true,
      },
      coordinates: { type: [Number], required: true },
    },
    provider: { type: String, required: true, trim: true },
    dataType: {
      type: String,
      enum: ['observed', 'modeled', 'forecast'],
      required: true,
    },
    methodology: { type: String, default: 'CPCB_INDIA_NAQI' },
    overallAqi: { type: Number, default: null },
    aqiCategory: { type: String, default: null },
    isOfficialAqi: { type: Boolean, default: false },
    dominantPollutant: { type: String, default: null },
    observationTimestamp: { type: Date, required: true },
    retrievalTimestamp: { type: Date, required: true },
    payload: { type: Schema.Types.Mixed, required: true },
    expiresAt: { type: Date, required: true },
  },
  { timestamps: true },
);

airQualityObservationSchema.index({ location: '2dsphere' });
airQualityObservationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
airQualityObservationSchema.index({ locationKey: 1, retrievalTimestamp: -1 });

const AirQualityObservation = model<IAirQualityObservation>(
  'AirQualityObservation',
  airQualityObservationSchema,
);

export default AirQualityObservation;
