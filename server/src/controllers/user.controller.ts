import { Request, Response } from 'express';
import User from '../models/User';
import Story from '../models/Story';
import Post from '../models/Post';
import mongoose from 'mongoose';

export const getUserProfile = async (req: Request, res: Response) => {
  try {
    const { username } = req.params;
    
    // Legacy system used ID, but new requirement uses username.
    // We will support both for compatibility or just username.
    let user;
    if (mongoose.Types.ObjectId.isValid(username as string)) {
      user = await User.findById(username).select("-password");
    }
    
    if (!user) {
      user = await User.findOne({ username }).select("-password");
    }

    if (!user) {
      // Legacy app had a specific fallback behavior when user is not found
      return res.status(404).json({ error: "User not found" });
    }

    const stories = await Story.find({ author: user._id }).sort({ createdAt: -1 });
    const posts = await Post.find({ author: user._id }).populate("author", "username image").sort({ createdAt: -1 });

    return res.json({
      user,
      stories,
      posts,
      stats: {
        storiesCount: stories.length,
        postsCount: posts.length,
      },
    });
  } catch (error) {
    console.error("GET user profile error:", error);
    return res.status(500).json({ error: "Failed to fetch user profile" });
  }
};

export const updateMe = async (req: Request, res: Response) => {
  try {
    const { bio, image } = req.body;
    const authUser = req.user as any;

    if (bio && bio.length > 500) {
      return res.status(400).json({ error: "Bio cannot exceed 500 characters" });
    }

    const updateData: any = {};
    if (bio !== undefined) updateData.bio = bio;
    if (image !== undefined) updateData.image = image;

    const updatedUser = await User.findByIdAndUpdate(
      authUser._id,
      updateData,
      { new: true }
    ).select("-password");

    return res.json(updatedUser);
  } catch (error) {
    console.error("PUT profile error:", error);
    return res.status(500).json({ error: "Failed to update profile info" });
  }
};

export const getMyStories = async (req: Request, res: Response) => {
  try {
    const authUser = req.user as any;
    const stories = await Story.find({ author: authUser._id }).sort({ createdAt: -1 });
    return res.json(stories);
  } catch (error) {
    console.error("GET my stories error:", error);
    return res.status(500).json({ error: "Failed to fetch stories" });
  }
};

export const getMyFeed = async (req: Request, res: Response) => {
  try {
    const authUser = req.user as any;
    const posts = await Post.find({ author: authUser._id })
      .populate("author", "username image")
      .sort({ createdAt: -1 });
    return res.json(posts);
  } catch (error) {
    console.error("GET my feed error:", error);
    return res.status(500).json({ error: "Failed to fetch feed" });
  }
};
