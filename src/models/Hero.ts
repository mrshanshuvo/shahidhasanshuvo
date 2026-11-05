import mongoose, { Schema, Document, Model } from "mongoose";

interface TypeSequenceItem {
  text: string;
  delay: number;
}

export interface IHero extends Document {
  name: string;
  lastName: string;
  profileImage: string;
  resumeUrl: string;
  tagline: string;
  bio: string;
  typeSequences: TypeSequenceItem[];
  createdAt: Date;
  updatedAt: Date;
}

const HeroSchema = new Schema<IHero>(
  {
    _id: {
      type: Schema.Types.ObjectId,
      default: () => new mongoose.Types.ObjectId("000000000000000000000002"),
    },
    name: { type: String, required: true },
    lastName: { type: String, required: true },
    profileImage: { type: String },
    resumeUrl: { type: String },
    tagline: { type: String, default: "" },
    bio: { type: String, default: "" },
    typeSequences: [
      {
        text: { type: String },
        delay: { type: Number, default: 2000 },
      },
    ],
  },
  { timestamps: true }
);

// Enforce singleton behavior by forcing a fixed _id
HeroSchema.pre("save", function (this: any) {
  this._id = new mongoose.Types.ObjectId("000000000000000000000002");
});

// Force delete the model from mongoose.models in development to pick up schema changes
if (process.env.NODE_ENV === "development") {
  delete mongoose.models.Hero;
}

const Hero: Model<IHero> =
  mongoose.models.Hero || mongoose.model<IHero>("Hero", HeroSchema);

export default Hero;
