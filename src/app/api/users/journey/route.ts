import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import ReadingSession from "@/models/ReadingSession";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import User from "@/models/User";
import Story from "@/models/Story";

// Log a reading session
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { storyId, chapterId, durationInSeconds, wordsRead } = await req.json();

    if (!storyId || !durationInSeconds) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    await connectDB();

    // Fetch story details for genre and author
    const story = await Story.findById(storyId).select("genre author");

    const readingSession = await ReadingSession.create({
      userId: session.user.id,
      storyId,
      chapterId,
      authorId: story?.author,
      genre: story?.genre || "Unknown",
      durationInSeconds,
      wordsRead,
    });

    return NextResponse.json({ success: true, readingSession });
  } catch (error) {
    console.error("Failed to log reading session:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

// Get journey analytics
export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    const userId = session.user.id;

    // Get all sessions
    const sessions = await ReadingSession.find({ userId }).populate("authorId", "username");

    // 1. Average Reading Speed (Words Per Minute)
    let totalSeconds = 0;
    let totalWords = 0;
    
    // 2. Genres
    const genreMap: Record<string, number> = {};
    
    // 3. Favorite Authors
    const authorMap: Record<string, { username: string; count: number }> = {};
    
    // 4. Heatmap data (Date strings to counts)
    const heatmap: Record<string, number> = {};

    sessions.forEach(s => {
      totalSeconds += s.durationInSeconds;
      totalWords += s.wordsRead;

      if (s.genre) {
        genreMap[s.genre] = (genreMap[s.genre] || 0) + 1;
      }

      if (s.authorId && s.authorId.username) {
        const aId = s.authorId._id.toString();
        if (!authorMap[aId]) {
          authorMap[aId] = { username: s.authorId.username, count: 0 };
        }
        authorMap[aId].count += 1;
      }

      const dateStr = s.date.toISOString().split("T")[0];
      heatmap[dateStr] = (heatmap[dateStr] || 0) + 1;
    });

    const averageWPM = totalSeconds > 0 ? Math.round((totalWords / (totalSeconds / 60))) : 0;
    
    // Sort genres
    const topGenres = Object.entries(genreMap)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    // Sort authors
    const favoriteAuthors = Object.values(authorMap)
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    return NextResponse.json({
      success: true,
      data: {
        totalWords,
        totalHours: (totalSeconds / 3600).toFixed(1),
        averageWPM,
        topGenres,
        favoriteAuthors,
        heatmap,
      }
    });
  } catch (error) {
    console.error("Failed to fetch journey data:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
