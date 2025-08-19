import mongoose, { Schema, Document, Model } from "mongoose";

export interface INotification extends Document {
  userId: string;          // ✅ the receiver's email (owner or delivery person)
  message: string;         // ✅ notification message
  relatedParcelId: string; // ✅ link to the parcel
  senderEmail?: string;    // email of the person who triggered the notification
  senderName?: string;     // optional name of sender
  isRead: boolean;         // whether notification has been read
  createdAt: Date;
}

const NotificationSchema: Schema<INotification> = new Schema(
  {
    userId: { type: String, required: true }, // email of the user receiving notification
    message: { type: String, required: true },
    relatedParcelId: { type: String, required: true },
    senderEmail: { type: String },
    senderName: { type: String },
    isRead: { type: Boolean, default: false },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

const Notification: Model<INotification> =
  mongoose.models.Notification ||
  mongoose.model<INotification>("Notification", NotificationSchema);

export default Notification;
