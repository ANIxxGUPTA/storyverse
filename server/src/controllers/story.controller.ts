import { Request, Response } from 'express';
import mongoose from 'mongoose';
import Story from '../models/Story';
import Chapter from '../models/Chapter';
import ChapterRevision from '../models/ChapterRevision';

export const getStories = async (req: Request, res: Response) => {
  try {
    const { authorId, genre, tag, search, sort = 'recent', page, limit } = req.query;
    
    const pageNum = parseInt(page as string) || 1;
    const limitNum = parseInt(limit as string) || 0; // default 0 means no limit (matching legacy behavior)
    
    let query: any = {};
    
    if (authorId) {
      query.author = authorId;
    }
    
    if (genre && genre !== "All") {
      query.genre = { $regex: new RegExp(`^${genre}$`, "i") };
    }
    
    if (tag) {
      query.tags = { $in: [new RegExp(`^${tag}$`, "i")] };
    }
    
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }

    let sortOption: any = { createdAt: -1 };
    if (sort === "views") {
      sortOption = { views: -1 };
    } else if (sort === "likes") {
      sortOption = { createdAt: -1 }; // fallback
    }

    let storiesQuery = Story.find(query)
      .populate("author", "username image")
      .sort(sortOption);

    if (limitNum > 0) {
      storiesQuery = storiesQuery.skip((pageNum - 1) * limitNum).limit(limitNum);
    }

    let stories = await storiesQuery;

    if (sort === "likes") {
      stories = stories.sort((a, b) => {
        const aLikes = Array.isArray(a.likes) ? a.likes.length : 0;
        const bLikes = Array.isArray(b.likes) ? b.likes.length : 0;
        return bLikes - aLikes;
      });
    }

    return res.json(stories);
  } catch (error) {
    console.error("GET stories error:", error);
    return res.status(500).json({ error: "Failed to fetch stories" });
  }
};

export const getStory = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id as string)) {
      return res.status(404).json({ error: "Story not found" });
    }

    const storyDoc = await Story.findById(id);
    if (!storyDoc) {
      return res.status(404).json({ error: "Story not found" });
    }
    
    const authorId = storyDoc.author;
    await storyDoc.populate("author", "username image bio");

    storyDoc.views = (storyDoc.views || 0) + 1;
    await storyDoc.save();

    const chapters = await Chapter.find({ storyId: id }).sort({ chapterNumber: 1 });

    const story = storyDoc.toObject();
    story.authorId = authorId;

    return res.json({ story, chapters });
  } catch (error) {
    console.error("GET story details error:", error);
    return res.status(500).json({ error: "Failed to fetch story details" });
  }
};

export const createStory = async (req: Request, res: Response) => {
  try {
    const { title, coverImage, description, genre, tags } = req.body;
    const user = req.user as any;

    if (!title || !description) {
      return res.status(400).json({ error: "Title and description are required" });
    }

    let processedTags: string[] = [];
    if (Array.isArray(tags)) {
      processedTags = tags.map(t => t.trim()).filter(Boolean);
    } else if (typeof tags === "string") {
      processedTags = tags.split(",").map(t => t.trim()).filter(Boolean);
    }

    const newStory = await Story.create({
      title,
      coverImage: coverImage || "",
      description,
      genre: genre || "Fiction",
      tags: processedTags,
      author: user._id,
      likes: [],
    });

    return res.status(201).json(newStory);
  } catch (error) {
    console.error("POST story error:", error);
    return res.status(500).json({ error: "Failed to create story" });
  }
};

export const updateStory = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    const updatedStory = await Story.findByIdAndUpdate(id, updates, { new: true });
    return res.json({ success: true, story: updatedStory });
  } catch (error) {
    console.error("PUT story error:", error);
    return res.status(500).json({ error: "Failed to update story" });
  }
};

export const deleteStory = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await Story.findByIdAndDelete(id);
    await Chapter.deleteMany({ storyId: id });
    return res.json({ success: true });
  } catch (error) {
    console.error("DELETE story error:", error);
    return res.status(500).json({ error: "Failed to delete story" });
  }
};

export const createChapter = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { title, content, status = "draft", wordCount = 0, publishAt } = req.body;

    if (!title || !content) {
      return res.status(400).json({ error: "Chapter title and content are required" });
    }

    const chapterCount = await Chapter.countDocuments({ storyId: id });
    const chapterNumber = chapterCount + 1;

    const newChapter = await Chapter.create({
      storyId: id,
      title,
      content,
      chapterNumber,
      status,
      wordCount,
      publishAt: publishAt || null,
    });

    await ChapterRevision.create({
      chapterId: newChapter._id,
      content: content,
      versionNumber: 1,
    });

    return res.status(201).json(newChapter);
  } catch (error) {
    console.error("POST chapter error:", error);
    return res.status(500).json({ error: "Failed to publish chapter" });
  }
};

export const updateChapter = async (req: Request, res: Response) => {
  try {
    const { chapterId } = req.params;
    const updates = req.body;
    
    const chapter = await Chapter.findByIdAndUpdate(chapterId, updates, { new: true });
    if (!chapter) {
      return res.status(404).json({ error: "Chapter not found" });
    }
    
    return res.json({ success: true, chapter });
  } catch (error) {
    console.error("PUT chapter error:", error);
    return res.status(500).json({ error: "Failed to update chapter" });
  }
};

export const reorderChapters = async (req: Request, res: Response) => {
  try {
    // Expected body: { chapterIds: ["id1", "id2", "id3"] } - ordered array of chapter ObjectIds
    const { chapterIds } = req.body;
    
    if (!Array.isArray(chapterIds)) {
      return res.status(400).json({ error: "chapterIds must be an array" });
    }
    
    const updates = chapterIds.map((id: string, index: number) => ({
      updateOne: {
        filter: { _id: id },
        update: { chapterNumber: index + 1 }
      }
    }));
    
    if (updates.length > 0) {
      await Chapter.bulkWrite(updates);
    }
    
    return res.json({ success: true });
  } catch (error) {
    console.error("PUT chapter reorder error:", error);
    return res.status(500).json({ error: "Failed to reorder chapters" });
  }
};

export const deleteChapter = async (req: Request, res: Response) => {
  try {
    const { chapterId } = req.params;
    await Chapter.findByIdAndDelete(chapterId);
    return res.json({ success: true });
  } catch (error) {
    console.error("DELETE chapter error:", error);
    return res.status(500).json({ error: "Failed to delete chapter" });
  }
};
