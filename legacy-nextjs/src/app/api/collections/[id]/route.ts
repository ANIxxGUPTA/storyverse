import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";

import { connectDB } from "@/lib/db";
import Collection from "@/models/Collection";
import { authOptions } from "@/lib/auth";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const { id } = await params;

    const collection = await Collection.findById(id).populate({
      path: "stories",
      populate: { path: "author", select: "username image" }
    });

    if (!collection) {
      return NextResponse.json({ error: "Collection not found" }, { status: 404 });
    }

    // Check privacy
    if (collection.isPrivate) {
      const session = await getServerSession(authOptions);
      if (!session || !session.user || session.user.id !== collection.user.toString()) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
    }

    return NextResponse.json(collection);
  } catch (error) {
    console.error("GET collection details error:", error);
    return NextResponse.json(
      { error: "Failed to fetch collection details" },
      { status: 500 }
    );
  }
}

export async function PUT(
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

    const collection = await Collection.findById(id);
    if (!collection) {
      return NextResponse.json({ error: "Collection not found" }, { status: 404 });
    }

    if (collection.user.toString() !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { name, description, isPrivate, stories, addStoryId, removeStoryId } = await request.json();

    if (name !== undefined) collection.name = name;
    if (description !== undefined) collection.description = description;
    if (isPrivate !== undefined) collection.isPrivate = !!isPrivate;
    
    if (stories !== undefined) {
      collection.stories = stories;
    }

    if (addStoryId) {
      if (!collection.stories.includes(addStoryId)) {
        collection.stories.push(addStoryId);
      }
    }

    if (removeStoryId) {
      collection.stories = collection.stories.filter(
        (s: any) => s.toString() !== removeStoryId.toString()
      );
    }

    await collection.save();

    return NextResponse.json(collection);
  } catch (error) {
    console.error("PUT collection error:", error);
    return NextResponse.json(
      { error: "Failed to update collection" },
      { status: 500 }
    );
  }
}

export async function DELETE(
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

    const collection = await Collection.findById(id);
    if (!collection) {
      return NextResponse.json({ error: "Collection not found" }, { status: 404 });
    }

    if (collection.user.toString() !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await Collection.findByIdAndDelete(id);

    return NextResponse.json({ success: true, message: "Collection deleted" });
  } catch (error) {
    console.error("DELETE collection error:", error);
    return NextResponse.json(
      { error: "Failed to delete collection" },
      { status: 500 }
    );
  }
}
