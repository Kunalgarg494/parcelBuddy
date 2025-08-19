import mongoose, { Schema, Document, Model } from "mongoose";

export interface IFeedback extends Document {
  userId: string; // Firebase UID
  feedback: string;
  createdAt: Date;
}

const FeedbackSchema: Schema<IFeedback> = new Schema(
  {
    userId: { type: String, required: true },
    feedback: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

const Feedback: Model<IFeedback> =
  mongoose.models.Feedback || mongoose.model<IFeedback>("Feedback", FeedbackSchema);

export default Feedback;
