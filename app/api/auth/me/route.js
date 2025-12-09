import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getUserById } from "@/lib/users";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get("auth-session");

    if (!sessionCookie || !sessionCookie.value) {
      return NextResponse.json(
        { error: "Not authenticated" },
        { status: 401 }
      );
    }

    try {
      const user = JSON.parse(sessionCookie.value);
      
      // Verify user still exists
      const result = await getUserById(user.id);
      
      if (result.success) {
        return NextResponse.json({ user: result.user }, { status: 200 });
      } else {
        // User doesn't exist anymore, clear session
        cookieStore.delete("auth-session");
        return NextResponse.json(
          { error: "User not found" },
          { status: 401 }
        );
      }
    } catch (parseError) {
      // Invalid session cookie
      cookieStore.delete("auth-session");
      return NextResponse.json(
        { error: "Invalid session" },
        { status: 401 }
      );
    }
  } catch (error) {
    console.error("Error checking authentication:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

