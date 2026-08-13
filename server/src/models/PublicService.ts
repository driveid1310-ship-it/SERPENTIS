import { Schema, model, Document } from "mongoose";

export type ServiceCategory =
  | "hospital"
  | "police"
  | "fire-station"
  | "pharmacy"
  | "bank"
  | "atm"
  | "bus-stop"
  | "railway-station"
  | "government-office"
  | "parking"
  | "public-toilet"
  | "other";

export const SERVICE_CATEGORIES: ServiceCategory[] = [
  "hospital",
  "police",
  "fire-station",
  "pharmacy",
  "bank",
  "atm",
  "bus-stop",
  "railway-station",
  "government-office",
  "parking",
  "public-toilet",
  "other",
];

export interface IPublicService extends Document {
  name: string;

  description: string;

  category: ServiceCategory;

  address: string;

  phone: string;

  email: string;

  website: string;

  openingHours: string;

  isEmergency: boolean;

  images: string[];

  location: {
    type: "Point";
    coordinates: [number, number];
  };

  createdAt: Date;

  updatedAt: Date;
}

const publicServiceSchema = new Schema<IPublicService>(
  {
    name: {
      type: String,
      required: [true, "Service name is required."],
      trim: true,
      minlength: [3, "Service name must be at least 3 characters."],
      maxlength: [150, "Service name must not exceed 150 characters."],
    },

    description: {
      type: String,
      default: "",
      trim: true,
      maxlength: [2000, "Description must not exceed 2000 characters."],
    },

    category: {
      type: String,
      required: [true, "Category is required."],
      enum: {
        values: SERVICE_CATEGORIES,
        message: "Invalid service category.",
      },
    },

    address: {
      type: String,
      required: [true, "Address is required."],
      trim: true,
      maxlength: [300, "Address must not exceed 300 characters."],
    },

    phone: {
      type: String,
      default: "",
      trim: true,
    },

    email: {
      type: String,
      default: "",
      trim: true,
      lowercase: true,
    },

    website: {
      type: String,
      default: "",
      trim: true,
    },

    openingHours: {
      type: String,
      default: "",
      trim: true,
    },

    isEmergency: {
      type: Boolean,
      default: false,
    },

    images: {
      type: [String],
      default: [],
    },

    location: {
      type: {
        type: String,
        enum: ["Point"],
        default: "Point",
        required: true,
      },

      coordinates: {
        type: [Number],
        required: true,
        validate: {
          validator: function (val: number[]) {
            return (
              Array.isArray(val) &&
              val.length === 2 &&
              val[0]! >= -180 &&
              val[0]! <= 180 &&
              val[1]! >= -90 &&
              val[1]! <= 90
            );
          },
          message: "Coordinates must be [longitude, latitude] within valid geographic bounds.",
        },
      },
    },
  },
  {
    timestamps: true,
  },
);

publicServiceSchema.index({
  location: "2dsphere",
});

publicServiceSchema.index({
  category: 1,
});

publicServiceSchema.index({
  name: 1,
});
publicServiceSchema.index({
  type: 1,
});
const PublicService = model<IPublicService>(
  "PublicService",
  publicServiceSchema,
);

export default PublicService;