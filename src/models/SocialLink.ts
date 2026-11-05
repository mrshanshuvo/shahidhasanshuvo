import mongoose, { Schema, Document, Model } from "mongoose";

export interface ISocialLink extends Document {
  href: string;
  label: string;
  iconUrl?: string;
  brandColor?: string;
  invertDark?: boolean;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

const SocialLinkSchema = new Schema<ISocialLink>(
  {
    href: { type: String, required: true },
    label: { type: String, required: true },
    iconUrl: { type: String },
    brandColor: { type: String },
    invertDark: { type: Boolean, default: false },
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

// Force delete the model from mongoose.models in development to pick up schema changes
if (process.env.NODE_ENV === "development") {
  delete mongoose.models.SocialLink;
}

const SocialLink: Model<ISocialLink> =
  mongoose.models.SocialLink ||
  mongoose.model<ISocialLink>("SocialLink", SocialLinkSchema);

export default SocialLink;
