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

    collaborators: {
      type: [{
        user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        role: { type: String, enum: ["Owner", "Editor", "Reviewer", "Beta Reader", "Artist", "Translator"], default: "Editor" }
      }],
      default: [],
    },

    views: {
      type: Number,
      default: 0,
    },

    likes: {
      type: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
      default: [],
    },

    genre: {
      type: String,
      default: "Fiction",
    },

    tags: {
      type: [String],
      default: [],
    },

    embedding: {
      type: [Number],
      default: [],
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

StorySchema.index({ createdAt: -1 });
StorySchema.index({ genre: 1 });
StorySchema.index({ tags: 1 });
StorySchema.index({ author: 1 });

export default
  mongoose.models.Story ||
  mongoose.model("Story", StorySchema);
