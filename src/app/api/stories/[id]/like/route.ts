import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import mongoose from "mongoose";

import { connectDB } from "@/lib/db";
import Story from "@/models/Story";
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

    const story = await Story.findById(id);
    if (!story) {
      return NextResponse.json(
        { error: "Story not found" },
        { status: 404 }
      );
    }

    const userId = new mongoose.Types.ObjectId(session.user.id);
    
    // Safety check if likes is not an array yet (migration fallback)
    if (!Array.isArray(story.likes)) {
      story.likes = [];
    }

    const likeIndex = story.likes.indexOf(userId);

    if (likeIndex > -1) {
      // User has already liked the story, so unlike it
      story.likes.splice(likeIndex, 1);
    } else {
      // User has not liked the story, so like it
      story.likes.push(userId);
    }

    await story.save();

    return NextResponse.json({
      success: true,
      likes: story.likes,
      likesCount: story.likes.length,
    });
  } catch (error) {
    console.error("POST story like error:", error);
    return NextResponse.json(
      { error: "Failed to toggle story like" },
      { status: 500 }
    );
  }
}
