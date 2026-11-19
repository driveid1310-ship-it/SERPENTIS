import { Schema, model, type Document } from 'mongoose';

export interface IWeatherObservation extends Document {
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
  observationTimestamp: Date;
  retrievalTimestamp: Date;
  payload: Record<string, unknown>;
  expiresAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const weatherObservationSchema = new Schema<IWeatherObservation>(
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
    observationTimestamp: { type: Date, required: true },
    retrievalTimestamp: { type: Date, required: true },
    payload: { type: Schema.Types.Mixed, required: true },
    expiresAt: { type: Date, required: true },
  },
  { timestamps: true },
);

weatherObservationSchema.index({ location: '2dsphere' });
weatherObservationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
weatherObservationSchema.index({ locationKey: 1, retrievalTimestamp: -1 });

const WeatherObservation = model<IWeatherObservation>(
  'WeatherObservation',
  weatherObservationSchema,
);

export default WeatherObservation;
