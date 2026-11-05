import mongoose, { Schema, Document, Model } from "mongoose";

export interface IProject extends Document {
  title: string;
  slug: string;
  description: string;
  image: string;
  technologyIds: mongoose.Types.ObjectId[];
  github: { label?: string; url: string }[];
  live: { label?: string; url: string }[];
  featured: boolean;
  categoryIds: mongoose.Types.ObjectId[];
  improvements: string[];
  media: {
    type: "image" | "video" | "embed";
    url: string;
    caption?: string;
    thumbnail?: string;
  }[];
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

const ProjectSchema = new Schema<IProject>(
  {
    title: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    description: { type: String, required: true },
    image: { type: String }, // Optional for backward compatibility
    technologyIds: [{ type: Schema.Types.ObjectId, ref: "Technology" }],
    github: [
      {
        label: { type: String, default: "Repository" },
        url: { type: String, required: true },
      },
    ],
    live: [
      {
        label: { type: String, default: "Live Demo" },
        url: { type: String, required: true },
      },
    ],
    featured: { type: Boolean, default: false },
    categoryIds: [{ type: Schema.Types.ObjectId, ref: "Category" }],
    improvements: [{ type: String }],
    media: [
      {
        type: {
          type: String,
          enum: ["image", "video", "embed"],
          default: "image",
        },
        url: { type: String, required: true },
        caption: { type: String },
        thumbnail: { type: String },
      },
    ],
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

// Force delete the model from mongoose.models in development to pick up schema changes
if (process.env.NODE_ENV === "development") {
  delete mongoose.models.Project;
}

const Project: Model<IProject> =
  mongoose.models.Project || mongoose.model<IProject>("Project", ProjectSchema);

export default Project;
