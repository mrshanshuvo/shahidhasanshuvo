import mongoose, { Schema, Document, Model } from "mongoose";

export interface ISetting extends Document {
  siteName: string;
  siteDescription: string;
  keywords: string[];
  contactEmail: string;
  contactPhone: string;
  contactLocation: string;
  ogImage: string;
  isHireable: boolean;
  maintenanceMode: boolean;
  accentColor: "emerald" | "blue" | "purple" | "rose" | "amber";
  updatedAt: Date;
}

const SettingSchema = new Schema<ISetting>(
  {
    _id: {
      type: Schema.Types.ObjectId,
      default: () => new mongoose.Types.ObjectId("000000000000000000000003"),
    },
    siteName: { type: String, default: "Portfolio" },
    siteDescription: { type: String, default: "A professional portfolio" },
    keywords: [{ type: String }],
    contactEmail: { type: String, default: "" },
    contactPhone: { type: String, default: "" },
    contactLocation: { type: String, default: "" },
    ogImage: { type: String, default: "" },
    isHireable: { type: Boolean, default: true },
    maintenanceMode: { type: Boolean, default: false },
    accentColor: { type: String, default: "emerald" },
  },
  { timestamps: true }
);

// Enforce singleton behavior by forcing a fixed _id
SettingSchema.pre("save", function (this: any) {
  this._id = new mongoose.Types.ObjectId("000000000000000000000003");
});

// Force delete the model from mongoose.models in development to pick up schema changes
if (process.env.NODE_ENV === "development") {
  delete mongoose.models.Setting;
}

const Setting: Model<ISetting> =
  mongoose.models.Setting || mongoose.model<ISetting>("Setting", SettingSchema);

export default Setting;
