import { NextResponse } from "next/server";

import { connectDB } from "@/lib/db";
import Story from "@/models/Story";
import Chapter from "@/models/Chapter";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string; chapterId: string }> }
) {
  try {
    await connectDB();
    const { id, chapterId } = await params;

    const chapter = await Chapter.findById(chapterId);
    if (!chapter) {
      return NextResponse.json(
        { error: "Chapter not found" },
        { status: 404 }
      );
    }

    const story = await Story.findById(id).select("title author");
    if (!story) {
      return NextResponse.json(
        { error: "Story not found" },
        { status: 404 }
      );
    }

    // Find previous and next chapters for navigation
    const prevChapter = await Chapter.findOne({
      storyId: id,
      chapterNumber: chapter.chapterNumber - 1,
    }).select("_id title");

    const nextChapter = await Chapter.findOne({
      storyId: id,
      chapterNumber: chapter.chapterNumber + 1,
    }).select("_id title");

    return NextResponse.json({
      chapter,
      story,
      prevChapter: prevChapter || null,
      nextChapter: nextChapter || null,
    });
  } catch (error) {
    console.error("GET chapter details error:", error);
    return NextResponse.json(
      { error: "Failed to fetch chapter details" },
      { status: 500 }
    );
  }
}
