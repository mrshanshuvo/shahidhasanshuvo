import mongoose, { Schema, Document, Model } from "mongoose";

export interface IDemo extends Document {
  title: string;
  slug: string;
  description: string;
  url: string;
  github?: string;
  featured?: boolean;
  image?: string;
  technologyIds: mongoose.Types.ObjectId[];
  media: {
    type: "image" | "video" | "embed";
    url: string;
    caption?: string;
  }[];
  order: number;
}

const DemoSchema = new Schema<IDemo>(
  {
    title: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    description: { type: String, required: true },
    url: { type: String, required: true },
    github: { type: String },
    featured: { type: Boolean, default: false },
    image: { type: String },
    technologyIds: [{ type: Schema.Types.ObjectId, ref: "Technology" }],
    media: [
      {
        type: {
          type: String,
          enum: ["image", "video", "embed"],
          default: "image",
        },
        url: { type: String, required: true },
        caption: { type: String },
      },
    ],
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

// Force delete the model from mongoose.models in development to pick up schema changes
if (process.env.NODE_ENV === "development") {
  delete mongoose.models.Demo;
}

const Demo: Model<IDemo> =
  mongoose.models.Demo || mongoose.model<IDemo>("Demo", DemoSchema);

export default Demo;
