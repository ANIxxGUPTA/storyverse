import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";

import { connectDB } from "@/lib/db";
import Story from "@/models/Story";
import Chapter from "@/models/Chapter";
import { authOptions } from "@/lib/auth";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    await connectDB();
    const { id } = await params;

    // Find the story to ensure it exists and belongs to the user
    const story = await Story.findById(id);
    if (!story) {
      return NextResponse.json(
        { error: "Story not found" },
        { status: 404 }
      );
    }

    if (story.author.toString() !== session.user.id) {
      return NextResponse.json(
        { error: "Forbidden - You are not the author of this story" },
        { status: 403 }
      );
    }

    const { title, content } = await request.json();
    if (!title || !content) {
      return NextResponse.json(
        { error: "Chapter title and content are required" },
        { status: 400 }
      );
    }

    // Get the next chapter number
    const chapterCount = await Chapter.countDocuments({ storyId: id });
    const chapterNumber = chapterCount + 1;

    const newChapter = await Chapter.create({
      storyId: id,
      title,
      content,
      chapterNumber,
    });

    return NextResponse.json(newChapter, { status: 201 });
  } catch (error) {
    console.error("POST chapter error:", error);
    return NextResponse.json(
      { error: "Failed to publish chapter" },
      { status: 500 }
    );
  }
}
