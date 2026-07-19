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
    const genre = searchParams.get("genre");
    const tag = searchParams.get("tag");
    const search = searchParams.get("search");
    const sort = searchParams.get("sort") || "recent"; // recent, likes, views
    
    let query: any = {};
    
    if (authorId) {
      query.author = authorId;
    }
    
    if (genre && genre !== "All") {
      query.genre = { $regex: new RegExp(`^${genre}$`, "i") };
    }
    
    if (tag) {
      query.tags = { $in: [new RegExp(`^${tag}$`, "i")] };
    }
    
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }

    let sortOption: any = { createdAt: -1 };
    if (sort === "views") {
      sortOption = { views: -1 };
    } else if (sort === "likes") {
      // In MongoDB, sorting by array length is not directly supported without aggregation, 
      // but we can sort by views or fallback to createdAt, or we can handle array length sorting in memory.
      // Since it's a small app, we'll sort in memory or use aggregation if needed. Let's do simple sort fallback first.
      sortOption = { createdAt: -1 };
    }

    let stories = await Story.find(query)
      .populate("author", "username image")
      .sort(sortOption);

    // If sorting by likes, do it in-memory
    if (sort === "likes") {
      stories = stories.sort((a, b) => {
        const aLikes = Array.isArray(a.likes) ? a.likes.length : 0;
        const bLikes = Array.isArray(b.likes) ? b.likes.length : 0;
        return bLikes - aLikes;
      });
    }

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
    const { title, coverImage, description, genre, tags } = await request.json();

    if (!title || !description) {
      return NextResponse.json(
        { error: "Title and description are required" },
        { status: 400 }
      );
    }

    // Process tags into array of strings if it is sent as string
    let processedTags: string[] = [];
    if (Array.isArray(tags)) {
      processedTags = tags.map(t => t.trim()).filter(Boolean);
    } else if (typeof tags === "string") {
      processedTags = tags.split(",").map(t => t.trim()).filter(Boolean);
    }

    const newStory = await Story.create({
      title,
      coverImage: coverImage || "",
      description,
      genre: genre || "Fiction",
      tags: processedTags,
      author: session.user.id,
      likes: [],
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
