import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyUser } from "@/lib/users";

export async function POST(request) {
  try {
    const body = await request.json();
    const { username, password } = body;

    // Validate required fields
    if (!username || !password) {
      return NextResponse.json(
        { error: "Username and password are required" },
        { status: 400 }
      );
    }

    // Verify user credentials
    const result = await verifyUser(username, password);

    if (result.success) {
      // Set session cookie
      const cookieStore = await cookies();
      cookieStore.set("auth-session", JSON.stringify(result.user), {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 7, // 7 days
        path: "/",
      });

      return NextResponse.json(
        { 
          message: "Login successful",
          user: result.user 
        },
        { status: 200 }
      );
    } else {
      return NextResponse.json(
        { error: result.error },
        { status: 401 }
      );
    }
  } catch (error) {
    // Handle JSON parse errors
    if (error instanceof SyntaxError || error.message?.includes("JSON")) {
      return NextResponse.json(
        { error: "Invalid JSON in request body" },
        { status: 400 }
      );
    }

    console.error("Error logging in:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

