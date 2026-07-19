import mongoose from "mongoose";

const HighlightSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    chapterId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Chapter",
      required: true,
    },
    selectedText: {
      type: String,
      required: true,
    },
    note: {
      type: String,
      default: "",
    },
    startIndex: {
      type: Number,
      default: 0,
    },
    endIndex: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.Highlight || mongoose.model("Highlight", HighlightSchema);
