import { NextResponse } from "next/server";

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

    const story = await Story.findById(id).populate("author", "username image bio");
    if (!story) {
      return NextResponse.json(
        { error: "Story not found" },
        { status: 404 }
      );
    }

    story.views = (story.views || 0) + 1;
    await story.save();

    const chapters = await Chapter.find({ storyId: id }).sort({ chapterNumber: 1 });

    return NextResponse.json({ story, chapters });
  } catch (error) {
    console.error("GET story details error:", error);
    return NextResponse.json(
      { error: "Failed to fetch story details" },
      { status: 500 }
    );
  }
}
