import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

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

    const allChapters = await Chapter.find({ storyId: id })
      .select("_id title chapterNumber")
      .sort({ chapterNumber: 1 });

    return NextResponse.json({
      chapter,
      story,
      prevChapter: prevChapter || null,
      nextChapter: nextChapter || null,
      allChapters,
    });
  } catch (error) {
    console.error("GET chapter details error:", error);
    return NextResponse.json(
      { error: "Failed to fetch chapter details" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string; chapterId: string }> }
) {
  try {
    await connectDB();
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id, chapterId } = await params;
    const story = await Story.findById(id);
    if (story.author.toString() !== session.user.id && story.authorId?.toString() !== session.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    await Chapter.findByIdAndDelete(chapterId);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to delete chapter" }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string; chapterId: string }> }
) {
  try {
    await connectDB();
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id, chapterId } = await params;
    const story = await Story.findById(id);
    if (story.author.toString() !== session.user.id && story.authorId?.toString() !== session.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const body = await request.json();
    const chapter = await Chapter.findByIdAndUpdate(chapterId, body, { new: true });
    return NextResponse.json({ success: true, chapter });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to update chapter" }, { status: 500 });
  }
}
