import { Schema, model, type Document, Types } from "mongoose";

export interface IPlaceReview extends Document {
  place: Types.ObjectId;
  user: Types.ObjectId;
  rating: number;
  comment: string;
  createdAt: Date;
  updatedAt: Date;
}

const placeReviewSchema = new Schema<IPlaceReview>(
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

    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },

    comment: {
      type: String,
      trim: true,
      maxlength: 500,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

placeReviewSchema.index({
  place: 1,
  user: 1,
});

export default model<IPlaceReview>(
  "PlaceReview",
  placeReviewSchema
);
