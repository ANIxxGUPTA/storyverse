import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";

import { connectDB } from "@/lib/db";
import ReadingProgress from "@/models/ReadingProgress";
import Chapter from "@/models/Chapter";
import Story from "@/models/Story";
import { authOptions } from "@/lib/auth";

// GET user's reading progress lists
export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const progressList = await ReadingProgress.find({ userId: session.user.id })
      .populate("storyId", "title coverImage author")
      .populate("chapterId", "title chapterNumber")
      .sort({ updatedAt: -1 });

    // Populate user author info in stories manually or use deep populate
    const results = await Promise.all(
      progressList.map(async (p) => {
        const item = p.toObject();
        if (item.storyId && item.storyId.author) {
          // fetch author username
          const authorUser = await mongoose.model("User").findById(item.storyId.author).select("username");
          if (item.storyId) {
            item.storyId.authorName = authorUser ? authorUser.username : "Unknown";
          }
        }
        return item;
      })
    );

    return NextResponse.json(results);
  } catch (error) {
    console.error("GET progress error:", error);
    return NextResponse.json(
      { error: "Failed to fetch reading progress" },
      { status: 500 }
    );
  }
}

// Helper to make sure User is imported in context
import mongoose from "mongoose";

// POST updates/adds a progress item
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    const { storyId, chapterId } = await request.json();

    if (!storyId || !chapterId) {
      return NextResponse.json(
        { error: "storyId and chapterId are required" },
        { status: 450 }
      );
    }

    // Get the current chapter and calculate percentage
    const currentChapter = await Chapter.findById(chapterId);
    if (!currentChapter) {
      return NextResponse.json({ error: "Chapter not found" }, { status: 404 });
    }

    // Get all chapters for this story to calculate percentage
    const allChapters = await Chapter.find({ storyId }).sort({ chapterNumber: 1 });
    const totalChapters = allChapters.length;
    const currentIdx = allChapters.findIndex(c => c._id.toString() === chapterId.toString());
    
    // Calculate percentage based on chapter position
    const progressPercent = totalChapters > 0 
      ? Math.round(((currentIdx + 1) / totalChapters) * 100) 
      : 100;

    const progress = await ReadingProgress.findOneAndUpdate(
      { userId: session.user.id, storyId },
      {
        chapterId,
        progressPercent,
        lastReadAt: new Date(),
      },
      { upsert: true, returnDocument: 'after' }
    );

    return NextResponse.json({ success: true, progress });
  } catch (error) {
    console.error("POST progress error:", error);
    return NextResponse.json(
      { error: "Failed to update reading progress" },
      { status: 500 }
    );
  }
}
