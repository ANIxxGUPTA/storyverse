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

    const user = await User.findById(id).select("-password");

    // Fetch user's stories and posts even if user document is missing
    const stories = await Story.find({ author: id }).sort({ createdAt: -1 });
    const posts = await Post.find({ author: id }).populate("author", "username image").sort({ createdAt: -1 });

    if (!user) {
      return NextResponse.json({
        user: { _id: id, username: "Anonymous", image: "" },
        stories,
        posts,
        stats: {
          storiesCount: stories.length,
          postsCount: posts.length,
        },
      });
    }


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
