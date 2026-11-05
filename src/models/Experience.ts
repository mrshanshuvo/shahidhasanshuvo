import mongoose, { Schema, Document, Model } from "mongoose";

export interface IExperience extends Document {
  title: string;
  org: string;
  duration: string;
  details: string[];
  order: number;
  createdAt: Date;
  updatedAt: Date;
  url?: string;
  previousTitles?: string[];
  links?: { label?: string; url: string }[];
  skillIds?: mongoose.Types.ObjectId[];
}

const ExperienceSchema = new Schema<IExperience>(
  {
    title: { type: String, required: true },
    org: { type: String, required: true },
    duration: { type: String, required: true },
    details: [{ type: String }],
    order: { type: Number, default: 0 },
    url: { type: String },
    previousTitles: [{ type: String }],
    links: [
      {
        label: { type: String },
        url: { type: String, required: true },
      },
    ],
    skillIds: [{ type: Schema.Types.ObjectId, ref: "Skill" }],
  },
  { timestamps: true }
);

// Force delete the model from mongoose.models in development to pick up schema changes
if (process.env.NODE_ENV === "development") {
  delete mongoose.models.Experience;
}

const Experience: Model<IExperience> =
  mongoose.models.Experience ||
  mongoose.model<IExperience>("Experience", ExperienceSchema);

export default Experience;
