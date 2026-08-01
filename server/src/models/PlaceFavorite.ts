import { Schema, model, type Document, Types } from "mongoose";

export interface IPlaceFavorite extends Document {
  place: Types.ObjectId;
  user: Types.ObjectId;
}

const favoriteSchema = new Schema<IPlaceFavorite>(
  {
    place: {
      type: Schema.Types.ObjectId,
      ref: "Place",
      required: true,
    },

    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

favoriteSchema.index(
  {
    place: 1,
    user: 1,
  },
  {
    unique: true,
  }
);

export default model<IPlaceFavorite>(
  "PlaceFavorite",
  favoriteSchema
);
