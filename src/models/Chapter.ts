import mongoose from "mongoose";

const ChapterSchema = new mongoose.Schema(
  {
    storyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Story",
    },

    title: String,

    chapterNumber: Number,

    content: String,
  },
  {
    timestamps: true,
  }
);

export default
  mongoose.models.Chapter ||
  mongoose.model("Chapter", ChapterSchema);