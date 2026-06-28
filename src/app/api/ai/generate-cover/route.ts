import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { title, genre, prompt } = await req.json();

    // Use prompt if provided, otherwise fallback to title and genre
    const searchKeyword = prompt || `Book cover for ${title || 'a story'} in the ${genre || 'fantasy'} genre, cinematic lighting, highly detailed`;
    
    // Pollinations.ai generates images freely via URL parameters
    const imageUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(searchKeyword)}?width=1600&height=900&nologo=true`;

    return NextResponse.json({ coverUrl: imageUrl });
  } catch (error) {
    console.error("Cover generator error:", error);
    return NextResponse.json({ error: "Failed to generate cover" }, { status: 500 });
  }
}
