import mongoose, { Schema, Document, Model } from "mongoose";

export interface IUser extends Document {
  uid: string; 
  name: string;
  email: string;
  photoURL?: string;
  createdAt: Date;
}

const UserSchema: Schema<IUser> = new Schema(
  {
    uid: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    email: { type: String, required: true },
    photoURL: { type: String },
    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

const User: Model<IUser> =
  mongoose.models.User || mongoose.model<IUser>("User", UserSchema);

export default User;
