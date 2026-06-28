import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import Story from "@/models/Story";

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const stories = await Story.find({ author: session.user.id })
      .select("title genre status coverImage views likes createdAt")
      .sort({ updatedAt: -1 })
      .lean();

    // Map ongoing to published if necessary
    const mappedStories = stories.map(story => {
      let st = story.status;
      if (st === "ongoing") st = "published";
      return { ...story, status: st };
    });

    // Group stories by their status
    const columns = {
      ideas: mappedStories.filter(s => s.status === "idea" || s.status === "ideas"),
      draft: mappedStories.filter(s => s.status === "draft"),
      editing: mappedStories.filter(s => s.status === "editing"),
      published: mappedStories.filter(s => s.status === "published"),
      archived: mappedStories.filter(s => s.status === "archived"),
    };

    return NextResponse.json({ success: true, columns });
  } catch (error) {
    console.error("Workspace fetch error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
