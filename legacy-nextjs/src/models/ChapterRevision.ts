import mongoose from "mongoose";

const ChapterRevisionSchema = new mongoose.Schema(
  {
    chapterId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Chapter",
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    versionNumber: {
      type: Number,
      default: 1,
    }
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.ChapterRevision || mongoose.model("ChapterRevision", ChapterRevisionSchema);
