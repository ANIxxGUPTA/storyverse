import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import Story from "@/models/Story";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const { status } = await req.json();

    if (!status || !["ideas", "draft", "editing", "published", "archived"].includes(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }

    await connectDB();

    const story = await Story.findOne({ _id: id, author: session.user.id });
    
    if (!story) {
      return NextResponse.json({ error: "Story not found or unauthorized" }, { status: 404 });
    }

    // Map published back to ongoing for compatibility with other parts of the app if needed,
    // but the user requested explicit 'published' state in the Kanban.
    // Let's use 'published' for the workspace and we can update the other places later if needed,
    // or just map 'published' to 'ongoing' internally. 
    // Actually, let's keep it exactly as the column says for simplicity.
    const newStatus = status === "published" ? "ongoing" : status;

    story.status = newStatus;
    await story.save();

    return NextResponse.json({ success: true, story });
  } catch (error) {
    console.error("Workspace status update error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
