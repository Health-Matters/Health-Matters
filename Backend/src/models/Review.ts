import mongoose, { Document, Schema } from 'mongoose';

export interface IReview extends Document {
  practitionerClerkUserId: string;
  patientName: string;
  message: string;
  rating: number;
  createdAt: Date;
  updatedAt: Date;
}

const ReviewSchema: Schema<IReview> = new Schema(
  {
    practitionerClerkUserId: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    patientName: {
      type: String,
      required: true,
      trim: true,
    },
    message: {
      type: String,
      required: true,
      trim: true,
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
  },
  {
    timestamps: true,
  }
);

const Review = mongoose.model<IReview>('Review', ReviewSchema);

export default Review;
