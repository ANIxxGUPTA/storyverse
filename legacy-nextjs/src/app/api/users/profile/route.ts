import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";

import { connectDB } from "@/lib/db";
import User from "@/models/User";
import { authOptions } from "@/lib/auth";

export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    await connectDB();
    const { bio, image } = await request.json();

    const updatedUser = await User.findByIdAndUpdate(
      session.user.id,
      { bio: bio || "", image: image || "" },
      { new: true }
    ).select("-password");

    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error("PUT profile error:", error);
    return NextResponse.json(
      { error: "Failed to update profile info" },
      { status: 500 }
    );
  }
}
