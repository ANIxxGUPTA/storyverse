import mongoose from "mongoose";

const ChapterSchema = new mongoose.Schema(
  {
    storyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Story",
    },

    title: String,

    status: {
      type: String,
      enum: ['draft', 'published'],
      default: 'draft'
    },

    publishAt: {
      type: Date,
      default: null
    },

    wordCount: {
      type: Number,
      default: 0
    },

    chapterNumber: Number,

    content: String,

    likes: {
      type: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

export default
  mongoose.models.Chapter ||
  mongoose.model("Chapter", ChapterSchema);
