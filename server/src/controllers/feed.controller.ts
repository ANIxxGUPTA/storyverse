import { Request, Response } from 'express';
import Post from '../models/Post';

export const getFeed = async (req: Request, res: Response) => {
  try {
    const { communityGenre } = req.query;
    
    let query: any = {};
    if (communityGenre && typeof communityGenre === 'string') {
      query.communityGenre = communityGenre;
    }

    const posts = await Post.find(query)
      .populate("author", "username image")
      .sort({ createdAt: -1 });

    return res.json(posts);
  } catch (error) {
    console.error("GET feed error:", error);
    return res.status(500).json({ error: "Failed to fetch feed" });
  }
};

export const createPost = async (req: Request, res: Response) => {
  try {
    const { content, image, communityGenre } = req.body;
    const user = req.user as any;

    if (!content) {
      return res.status(400).json({ error: "Post content is required" });
    }

    const newPost = await Post.create({
      content,
      image: image || "",
      communityGenre: communityGenre || "",
      author: user._id,
      likes: [],
    });

    const populatedPost = await Post.findById(newPost._id).populate(
      "author",
      "username image"
    );

    return res.status(201).json(populatedPost);
  } catch (error) {
    console.error("POST feed error:", error);
    return res.status(500).json({ error: "Failed to create post" });
  }
};

export const deletePost = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await Post.findByIdAndDelete(id);
    return res.json({ success: true });
  } catch (error) {
    console.error("DELETE feed error:", error);
    return res.status(500).json({ error: "Failed to delete post" });
  }
};
