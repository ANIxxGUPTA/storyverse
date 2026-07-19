import mongoose from "mongoose";

const CollectionSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      default: "",
    },
    isPrivate: {
      type: Boolean,
      default: false,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    stories: {
      type: [{ type: mongoose.Schema.Types.ObjectId, ref: "Story" }],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.Collection ||
  mongoose.model("Collection", CollectionSchema);
