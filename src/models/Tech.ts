import mongoose, { Schema, Document, Model } from "mongoose";

export interface ITech extends Document {
  techList: string[];
  createdAt: Date;
  updatedAt: Date;
}

const TechSchema = new Schema<ITech>(
  {
    _id: {
      type: Schema.Types.ObjectId,
      default: () => new mongoose.Types.ObjectId("000000000000000000000004"),
    },
    techList: [{ type: String }],
  },
  { timestamps: true }
);

// Enforce singleton behavior by forcing a fixed _id
TechSchema.pre("save", function (this: any) {
  this._id = new mongoose.Types.ObjectId("000000000000000000000004");
});

// Force delete the model from mongoose.models in development to pick up schema changes
if (process.env.NODE_ENV === "development") {
  delete mongoose.models.Tech;
}

const Tech: Model<ITech> =
  mongoose.models.Tech || mongoose.model<ITech>("Tech", TechSchema);

export default Tech;
