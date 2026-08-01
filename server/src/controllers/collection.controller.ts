import { Request, Response } from "express";
import Collection from "../models/Collection";

export const getUserCollections = async (req: Request, res: Response) => {
  try {
    const user = req.user as any;
    const collections = await Collection.find({ user: user._id })
      .populate("stories", "title coverImage _id")
      .sort({ createdAt: -1 });
    return res.json(collections);
  } catch (error: any) {
    console.error("getUserCollections error:", error);
    return res.status(500).json({ error: "Failed to fetch collections" });
  }
};

export const createCollection = async (req: Request, res: Response) => {
  try {
    const { name, description, isPrivate } = req.body;
    const user = req.user as any;

    if (!name) {
      return res.status(400).json({ error: "Collection name is required" });
    }

    const newCollection = new Collection({
      name,
      description,
      isPrivate: isPrivate || false,
      user: user._id,
      stories: [],
    });

    await newCollection.save();
    return res.status(201).json(newCollection);
  } catch (error: any) {
    console.error("createCollection error:", error);
    return res.status(500).json({ error: "Failed to create collection" });
  }
};

export const addStoryToCollection = async (req: Request, res: Response) => {
  try {
    const { id } = req.params; // collection ID
    const { storyId } = req.body;
    const user = req.user as any;

    if (!storyId) {
      return res.status(400).json({ error: "Story ID is required" });
    }

    const collection = await Collection.findOne({ _id: id, user: user._id });
    if (!collection) {
      return res.status(404).json({ error: "Collection not found" });
    }

    if (collection.stories.includes(storyId)) {
      return res.status(400).json({ error: "Story already in collection" });
    }

    collection.stories.push(storyId);
    await collection.save();

    return res.json(collection);
  } catch (error: any) {
    console.error("addStoryToCollection error:", error);
    return res.status(500).json({ error: "Failed to add story to collection" });
  }
};
