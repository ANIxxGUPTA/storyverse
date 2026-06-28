import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import mongoose from "mongoose";

import { connectDB } from "@/lib/db";
import Chapter from "@/models/Chapter";
import { authOptions } from "@/lib/auth";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string; chapterId: string }> }
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
    const { chapterId } = await params;

    const chapter = await Chapter.findById(chapterId);
    if (!chapter) {
      return NextResponse.json(
        { error: "Chapter not found" },
        { status: 404 }
      );
    }

    const userIdStr = session.user.id;
    
    if (!Array.isArray(chapter.likes)) {
      chapter.likes = [];
    }

    const likeIndex = chapter.likes.findIndex((id: any) => id.toString() === userIdStr);

    if (likeIndex > -1) {
      // Unlike/unvote
      chapter.likes.splice(likeIndex, 1);
    } else {
      // Like/vote
      chapter.likes.push(new mongoose.Types.ObjectId(userIdStr));
    }

    await chapter.save();

    return NextResponse.json({
      success: true,
      likes: chapter.likes,
      likesCount: chapter.likes.length,
    });
  } catch (error) {
    console.error("POST chapter vote error:", error);
    return NextResponse.json(
      { error: "Failed to submit vote" },
      { status: 500 }
    );
  }
}
