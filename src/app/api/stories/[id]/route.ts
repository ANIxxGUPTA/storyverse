import { NextResponse } from "next/server";
import mongoose from "mongoose";

import { connectDB } from "@/lib/db";
import Story from "@/models/Story";
import Chapter from "@/models/Chapter";
import User from "@/models/User";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const { id } = await params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: "Story not found" },
        { status: 404 }
      );
    }

    const storyDoc = await Story.findById(id);
    if (!storyDoc) {
      return NextResponse.json(
        { error: "Story not found" },
        { status: 404 }
      );
    }
    
    const authorId = storyDoc.author;
    await storyDoc.populate("author", "username image bio");

    storyDoc.views = (storyDoc.views || 0) + 1;
    await storyDoc.save();

    const chapters = await Chapter.find({ storyId: id }).sort({ chapterNumber: 1 });

    const story = storyDoc.toObject();
    story.authorId = authorId;

    return NextResponse.json({ story, chapters });
  } catch (error) {
    console.error("GET story details error:", error);
    return NextResponse.json(
      { error: "Failed to fetch story details" },
      { status: 500 }
    );
  }
}
