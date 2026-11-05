import mongoose, { Schema, Document, Model } from "mongoose";

export interface ITechnology extends Document {
  name: string;
  iconUrl: string;
  brandColor?: string;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

const TechnologySchema = new Schema<ITechnology>(
  {
    name: { type: String, required: true },
    iconUrl: { type: String, required: true },
    brandColor: { type: String },
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

if (process.env.NODE_ENV === "development") {
  delete mongoose.models.Technology;
}

const Technology: Model<ITechnology> =
  mongoose.models.Technology ||
  mongoose.model<ITechnology>("Technology", TechnologySchema);

export default Technology;
