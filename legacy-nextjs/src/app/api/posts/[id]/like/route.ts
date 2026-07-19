import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import mongoose from "mongoose";

import { connectDB } from "@/lib/db";
import Post from "@/models/Post";
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

    const post = await Post.findById(id);
    if (!post) {
      return NextResponse.json(
        { error: "Post not found" },
        { status: 404 }
      );
    }

    const userId = new mongoose.Types.ObjectId(session.user.id);
    const likeIndex = post.likes.indexOf(userId);

    if (likeIndex > -1) {
      // User has already liked the post, so unlike it
      post.likes.splice(likeIndex, 1);
    } else {
      // User has not liked the post, so like it
      post.likes.push(userId);
    }

    await post.save();

    return NextResponse.json({
      success: true,
      likes: post.likes,
      likesCount: post.likes.length,
    });
  } catch (error) {
    console.error("POST like error:", error);
    return NextResponse.json(
      { error: "Failed to toggle like" },
      { status: 500 }
    );
  }
}
