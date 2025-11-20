import { NextResponse } from "next/server";
import { createUser } from "@/lib/users";

export async function POST(request) {
  try {
    const body = await request.json();
    const { name, username, password } = body;

    // Validate required fields
    if (!name || !username || !password) {
      return NextResponse.json(
        { error: "Name, username, and password are required" },
        { status: 400 }
      );
    }

    // Create user
    const result = createUser(name, username, password);

    if (result.success) {
      return NextResponse.json(
        { 
          message: "User registered successfully",
          user: result.user 
        },
        { status: 201 }
      );
    } else {
      return NextResponse.json(
        { error: result.error },
        { status: 400 }
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

    console.error("Error registering user:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

