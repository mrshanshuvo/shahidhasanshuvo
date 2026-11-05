import mongoose, { Schema, Document, Model } from "mongoose";

export interface ICertification extends Document {
  title: string;
  issuer: string;
  date: string;
  issuedAt?: Date;
  expiresAt?: Date;
  certificateFile?: string;
  badgeLogo?: string;
  details: string[];
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

const CertificationSchema = new Schema<ICertification>(
  {
    title: { type: String, required: true },
    issuer: { type: String, required: true },
    date: { type: String, required: true },
    issuedAt: { type: Date },
    expiresAt: { type: Date },
    certificateFile: { type: String },
    badgeLogo: { type: String },
    details: { type: [String], default: [] },
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

// Force delete the model from mongoose.models in development to pick up schema changes
if (process.env.NODE_ENV === "development") {
  delete mongoose.models.Certification;
}

const Certification: Model<ICertification> =
  mongoose.models.Certification ||
  mongoose.model<ICertification>("Certification", CertificationSchema);

export default Certification;
