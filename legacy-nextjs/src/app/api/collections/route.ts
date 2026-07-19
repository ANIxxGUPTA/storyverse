import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";

import { connectDB } from "@/lib/db";
import Collection from "@/models/Collection";
import Story from "@/models/Story"; // Register for populate
import { authOptions } from "@/lib/auth";

// Fetch collections
export async function GET(request: Request) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");
    
    const session = await getServerSession(authOptions);

    let query: any = {};

    if (userId) {
      // If asking for a specific user, show only public collections, unless it is the user themselves
      if (session && session.user && session.user.id === userId) {
        query = { user: userId };
      } else {
        query = { user: userId, isPrivate: false };
      }
    } else {
      // If no user specified, requires authentication to show current user's collections
      if (!session || !session.user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
      query = { user: session.user.id };
    }

    const collections = await Collection.find(query)
      .populate("stories", "title coverImage description views likes status author")
      .sort({ updatedAt: -1 });

    return NextResponse.json(collections);
  } catch (error) {
    console.error("GET collections error:", error);
    return NextResponse.json(
      { error: "Failed to fetch collections" },
      { status: 500 }
    );
  }
}

// Create collection
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    const { name, description, isPrivate } = await request.json();

    if (!name) {
      return NextResponse.json(
        { error: "Collection name is required" },
        { status: 400 }
      );
    }

    const newCollection = await Collection.create({
      name,
      description: description || "",
      isPrivate: !!isPrivate,
      user: session.user.id,
      stories: [],
    });

    return NextResponse.json(newCollection, { status: 201 });
  } catch (error) {
    console.error("POST collection error:", error);
    return NextResponse.json(
      { error: "Failed to create collection" },
      { status: 500 }
    );
  }
}
