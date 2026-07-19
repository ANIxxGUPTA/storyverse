import mongoose from "mongoose";

const UserStatSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    currentStreak: {
      type: Number,
      default: 0,
    },
    longestStreak: {
      type: Number,
      default: 0,
    },
    lastReadDate: {
      type: Date,
      default: null,
    },
    totalWordsRead: {
      type: Number,
      default: 0,
    },
    chaptersRead: {
      type: Number,
      default: 0,
    }
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.UserStat || mongoose.model("UserStat", UserStatSchema);
