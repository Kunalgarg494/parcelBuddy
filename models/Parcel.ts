import mongoose, { Schema, Document, Model } from "mongoose";
import { Types } from "mongoose";

export interface IParcel extends Document {
  _id: Types.ObjectId; 
  name: string;
  contactNumber: string;
  gender: string;
  parcelCost: number;
  placedItemSite: string;
  parcelStatus: "paid" | "unpaid";
  pickupPlace: string;
  deadline: Date; // New field
  deliveryPersonName: string; // New field
  deliveryStatus : string;
  hostelBlock: string; // New field
  userId : string;
  deliveryPersonId : string;
}

const ParcelSchema: Schema<IParcel> = new Schema(
  {
    name: { type: String, required: true },
    contactNumber: { type: String, required: true },
    gender: { type: String, required: true },
    parcelCost: { type: Number, required: true },
    placedItemSite: { type: String, required: true },
    deliveryPersonId: { type: String, default: null },
    parcelStatus: {
      type: String,
      enum: ["paid", "unpaid"],
      required: true,
      lowercase: true,
    },
    pickupPlace: { type: String, required: true },
    deadline: { type: Date, required: true }, 
    deliveryPersonName: { type: String, required: true },
     deliveryStatus: {
      type: String,
      enum: ["pending", "in_progress", "delivered"],
      default: "pending",
    },
    hostelBlock: { type: String, required: true },
    userId: { type: String, required: true },
  },
  { timestamps: true }
);

// ✅ Prevent OverwriteModelError
const Parcel: Model<IParcel> =
  mongoose.models.Parcel || mongoose.model<IParcel>("Parcel", ParcelSchema);

export default Parcel;
