import { Schema, model, Document } from "mongoose";

export type PlaceCategory =
  | "fort"
  | "temple"
  | "museum"
  | "park"
  | "lake"
  | "waterfall"
  | "viewpoint"
  | "food"
  | "event"
  | "other";

export interface IPlace extends Document {
  name: string;

  description: string;

  history: string;

  category: PlaceCategory;

  images: string[];

  address: string;

  location: {
    type: "Point";
    coordinates: [number, number];
  };

  visitingHours: string;



  averageRating: number;

  totalReviews: number;

  favorites: number;

  views: number;
}
export const PLACE_CATEGORIES: PlaceCategory[] = [
  "fort",
  "temple",
  "museum",
  "park",
  "lake",
  "waterfall",
  "viewpoint",
  "food",
  "event",
  "other",
];

const placeSchema = new Schema<IPlace>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      required: true,
      trim: true,
    },

    history: {
      type: String,
      default: "",
    },

    category: {
      type: String,
      enum: PLACE_CATEGORIES,
      required: true,
    },

    images: {
      type: [String],
      default: [],
    },

    address: {
      type: String,
      default: "",
    },

    location: {
      type: {
        type: String,
        enum: ["Point"],
        default: "Point",
      },

      coordinates: {
        type: [Number],
        required: true,
      },
    },

    visitingHours: {
  type: String,
  default: "",
},

averageRating: {
  type: Number,
  default: 0,
},

totalReviews: {
  type: Number,
  default: 0,
},

favorites: {
  type: Number,
  default: 0,
},

views: {
  type: Number,
  default: 0,
},
  },
  {
    timestamps: true,
  }
);

placeSchema.index({
  location: "2dsphere",
});

placeSchema.index({
  category: 1,
});
placeSchema.index({
  averageRating: -1,
});

placeSchema.index({
  views: -1,
});

placeSchema.index({
  favorites: -1,
});

const Place = model<IPlace>("Place", placeSchema);

export default Place;