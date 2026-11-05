import mongoose, { Schema, Document, Model } from "mongoose";

export interface IEducation extends Document {
  degree: string;
  institution: string;
  location?: string; // Optional
  logo?: string; // Optional
  period: string;
  gpa?: string; // Optional (allows custom GPA formats like 3.8/4.0)
  details: string[];
  link?: string; // Optional
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

const EducationSchema = new Schema<IEducation>(
  {
    degree: { type: String, required: true },
    institution: { type: String, required: true },
    location: { type: String, default: "" }, // Optional
    logo: { type: String, default: "" }, // Optional
    period: { type: String, required: true },
    gpa: { type: String, default: "" }, // Optional
    details: { type: [String], default: [] },
    link: { type: String, default: "" }, // Optional
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

// Force delete the model from mongoose.models in development to pick up schema changes
if (process.env.NODE_ENV === "development") {
  delete mongoose.models.Education;
}

const Education: Model<IEducation> =
  mongoose.models.Education || mongoose.model<IEducation>("Education", EducationSchema);

export default Education;
