import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";

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
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    const { id } = await params;
    const { content } = await request.json();

    if (!content || content.trim() === "") {
      return NextResponse.json({ error: "Comment content is required" }, { status: 400 });
    }

    const post = await Post.findById(id);
    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    const newComment = {
      author: session.user.id,
      content,
      createdAt: new Date(),
    };

    post.comments.push(newComment);
    await post.save();

    // Re-fetch post and populate comments author
    const updatedPost = await Post.findById(id).populate({
      path: "comments.author",
      select: "username image",
    });

    const addedComment = updatedPost.comments[updatedPost.comments.length - 1];

    return NextResponse.json({ success: true, comment: addedComment });
  } catch (error) {
    console.error("POST comment error:", error);
    return NextResponse.json(
      { error: "Failed to add comment" },
      { status: 500 }
    );
  }
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const { id } = await params;

    const post = await Post.findById(id).populate({
      path: "comments.author",
      select: "username image",
    });

    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    // Sort comments by newest first
    const comments = [...post.comments].sort(
      (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
    );

    return NextResponse.json(comments);
  } catch (error) {
    console.error("GET comments error:", error);
    return NextResponse.json(
      { error: "Failed to fetch comments" },
      { status: 500 }
    );
  }
}
