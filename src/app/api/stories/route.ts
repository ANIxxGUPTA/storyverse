import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";

import { connectDB } from "@/lib/db";
import Story from "@/models/Story";
import User from "@/models/User"; // Required for Mongoose populating User ref
import { authOptions } from "@/lib/auth";

export async function GET(request: Request) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const authorId = searchParams.get("authorId");
    
    let query = {};
    if (authorId) {
      query = { author: authorId };
    }

    // Sort by most recent first
    const stories = await Story.find(query)
      .populate("author", "username image")
      .sort({ createdAt: -1 });

    return NextResponse.json(stories);
  } catch (error) {
    console.error("GET stories error:", error);
    return NextResponse.json(
      { error: "Failed to fetch stories" },
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
    const { title, coverImage, description } = await request.json();

    if (!title || !description) {
      return NextResponse.json(
        { error: "Title and description are required" },
        { status: 400 }
      );
    }

    const newStory = await Story.create({
      title,
      coverImage: coverImage || "",
      description,
      author: session.user.id,
    });

    return NextResponse.json(newStory, { status: 201 });
  } catch (error) {
    console.error("POST story error:", error);
    return NextResponse.json(
      { error: "Failed to create story" },
      { status: 500 }
    );
  }
}
