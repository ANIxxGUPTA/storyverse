import { Request, Response } from 'express';
import Post from '../models/Post';

export const getFeed = async (req: Request, res: Response) => {
  try {
    const { communityGenre, page, limit } = req.query;
    
    const pageNum = parseInt(page as string) || 1;
    const limitNum = parseInt(limit as string) || 0;
    
    let query: any = {};
    if (communityGenre && typeof communityGenre === 'string') {
      query.communityGenre = communityGenre;
    }

    let postsQuery = Post.find(query)
      .populate("author", "username image")
      .sort({ createdAt: -1 });

    if (limitNum > 0) {
      postsQuery = postsQuery.skip((pageNum - 1) * limitNum).limit(limitNum);
    }

    const posts = await postsQuery;

    return res.json(posts);
  } catch (error) {
    console.error("GET feed error:", error);
    return res.status(500).json({ error: "Failed to fetch feed" });
  }
};

export const createPost = async (req: Request, res: Response) => {
  try {
    const { content, communityGenre } = req.body;
    const authUser = req.user as any;

    if (!content || typeof content !== 'string') {
      return res.status(400).json({ error: "Content is required and must be text" });
    }
    if (content.trim().length === 0 || content.length > 1000) {
      return res.status(400).json({ error: "Content must be between 1 and 1000 characters" });
    }

    const newPost = await Post.create({
      content,
      image: "",
      communityGenre: communityGenre || "",
      author: authUser._id,
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
