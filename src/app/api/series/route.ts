import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";

import { connectDB } from "@/lib/db";
import Series from "@/models/Series";
import { authOptions } from "@/lib/auth";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const series = await Series.find({ author: session.user.id })
      .sort({ createdAt: -1 })
      .populate("stories", "_id title coverImage");

    return NextResponse.json({ series });
  } catch (error) {
    console.error("GET series error:", error);
    return NextResponse.json({ error: "Failed to load series" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const { name, description } = await request.json();

    if (!name || !name.trim()) {
      return NextResponse.json({ error: "Series name is required" }, { status: 400 });
    }

    const newSeries = await Series.create({
      name: name.trim(),
      description: description?.trim() || "",
      author: session.user.id,
      stories: [],
    });

    return NextResponse.json({ series: newSeries }, { status: 201 });
  } catch (error) {
    console.error("POST series error:", error);
    return NextResponse.json({ error: "Failed to create series" }, { status: 500 });
  }
}
