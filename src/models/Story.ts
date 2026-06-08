import mongoose from "mongoose";

const StorySchema = new mongoose.Schema(
  {
    title: String,
    slug: String,
    description: String,
    coverImage: String,

    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    views: {
      type: Number,
      default: 0,
    },

    likes: {
      type: Number,
      default: 0,
    },

    status: {
      type: String,
      default: "ongoing",
    },
  },
  {
    timestamps: true,
  }
);

export default
  mongoose.models.Story ||
  mongoose.model("Story", StorySchema);