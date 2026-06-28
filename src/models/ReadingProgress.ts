import mongoose from "mongoose";

const ReadingProgressSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    storyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Story",
      required: true,
    },
    chapterId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Chapter",
      required: true,
    },
    progressPercent: {
      type: Number,
      default: 0,
    },
    lastReadAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index to guarantee uniqueness of progress per user and story
ReadingProgressSchema.index({ userId: 1, storyId: 1 }, { unique: true });

export default mongoose.models.ReadingProgress ||
  mongoose.model("ReadingProgress", ReadingProgressSchema);
