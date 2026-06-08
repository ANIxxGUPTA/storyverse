import { NextResponse } from "next/server";

import { connectDB } from "@/lib/db";
import User from "@/models/User";
import Story from "@/models/Story";
import Post from "@/models/Post";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const { id } = await params;

    // Find user, but exclude password for security
    const user = await User.findById(id).select("-password");
    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Fetch user's stories
    const stories = await Story.find({ author: id }).sort({ createdAt: -1 });

    // Fetch user's posts
    const posts = await Post.find({ author: id }).populate("author", "username image").sort({ createdAt: -1 });

    return NextResponse.json({
      user,
      stories,
      posts,
      stats: {
        storiesCount: stories.length,
        postsCount: posts.length,
      },
    });
  } catch (error) {
    console.error("GET user details error:", error);
    return NextResponse.json(
      { error: "Failed to fetch user profile details" },
      { status: 500 }
    );
  }
}
