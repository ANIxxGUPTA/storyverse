import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";

import { connectDB } from "@/lib/db";
import User from "@/models/User";

export async function POST(
  request: Request
) {
  try {
    await connectDB();

    const {
      email,
      password,
    } = await request.json();

    const user =
      await User.findOne({ email });

    if (!user) {
      return NextResponse.json(
        {
          error: "User not found",
        },
        {
          status: 404,
        }
      );
    }

    const isValid =
      await bcrypt.compare(
        password,
        user.password
      );

    if (!isValid) {
      return NextResponse.json(
        {
          error: "Invalid password",
        },
        {
          status: 401,
        }
      );
    }

    return NextResponse.json({
  success: true,
  user: {
    id: user._id,
    username: user.username,
    email: user.email,
    image: user.image,
  },
});

  } catch (error) {
    return NextResponse.json(
      {
        error: "Login failed",
      },
      {
        status: 500,
      }
    );
  }
}