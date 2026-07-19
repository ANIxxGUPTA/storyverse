import dotenv from "dotenv";
import { connectDB } from "../config/db";
import User from "../models/User";
import Story from "../models/Story";
import Post from "../models/Post";

dotenv.config();

const verifyModels = async () => {
  try {
    await connectDB();

    const userCount = await User.countDocuments();
    const storyCount = await Story.countDocuments();
    const postCount = await Post.countDocuments();

    console.log("=== Database Counts ===");
    console.log(`Users: ${userCount}`);
    console.log(`Stories: ${storyCount}`);
    console.log(`Posts: ${postCount}`);
    console.log("=======================\n");

    if (userCount > 0) {
      const sampleUser = await User.findOne().lean();
      if (sampleUser) {
        delete sampleUser.password;
        console.log("=== Sample User ===");
        console.log(JSON.stringify(sampleUser, null, 2));
      }
    }

    if (storyCount > 0) {
      const sampleStory = await Story.findOne().lean();
      if (sampleStory) {
        console.log("=== Sample Story ===");
        console.log(JSON.stringify(sampleStory, null, 2));
      }
    }

    if (postCount > 0) {
      const samplePost = await Post.findOne().lean();
      if (samplePost) {
        console.log("=== Sample Post ===");
        console.log(JSON.stringify(samplePost, null, 2));
      }
    }

    process.exit(0);
  } catch (error) {
    console.error("Verification error:", error);
    process.exit(1);
  }
};

verifyModels();
