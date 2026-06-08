import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";

import { connectDB } from "@/lib/db";
import Post from "@/models/Post";
import User from "@/models/User";
import { authOptions } from "@/lib/auth";

export async function GET() {
  try {
    await connectDB();

    const posts = await Post.find({})
      .populate("author", "username image")
      .sort({ createdAt: -1 });

    return NextResponse.json(posts);
  } catch (error) {
    console.error("GET posts error:", error);
    return NextResponse.json(
      { error: "Failed to fetch posts" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    await connectDB();
    const { content, image } = await request.json();

    if (!content) {
      return NextResponse.json(
        { error: "Post content is required" },
        { status: 400 }
      );
    }

    const newPost = await Post.create({
      content,
      image: image || "",
      author: session.user.id,
      likes: [],
    });

    const populatedPost = await Post.findById(newPost._id).populate(
      "author",
      "username image"
    );

    return NextResponse.json(populatedPost, { status: 201 });
  } catch (error) {
    console.error("POST post error:", error);
    return NextResponse.json(
      { error: "Failed to publish post" },
      { status: 500 }
    );
  }
}
