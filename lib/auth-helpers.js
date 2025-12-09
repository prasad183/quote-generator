import { cookies } from "next/headers";
import mongoose from "mongoose";
import { getUserById } from "@/lib/users";

/**
 * Get authenticated user from session cookie
 * @returns {Promise<{success: boolean, user?: object, userId?: mongoose.Types.ObjectId, error?: string}>}
 */
export async function getAuthenticatedUser() {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get("auth-session");

    if (!sessionCookie || !sessionCookie.value) {
      console.log("No session cookie found");
      return { success: false, error: "Not authenticated - No session cookie" };
    }

    try {
      // Try to parse the cookie value
      let user;
      try {
        user = JSON.parse(sessionCookie.value);
      } catch (parseErr) {
        console.error("Failed to parse session cookie:", parseErr);
        console.log("Cookie value:", sessionCookie.value);
        return { success: false, error: "Invalid session - Cookie parse error" };
      }

      // Check if user object has required fields
      if (!user || !user.id) {
        console.error("Session cookie missing user.id:", user);
        return { success: false, error: "Invalid session - Missing user ID" };
      }
      
      // Verify user still exists
      const result = await getUserById(user.id);
      
      if (result.success) {
        // Convert string ID to ObjectId for MongoDB queries
        let userId;
        try {
          userId = new mongoose.Types.ObjectId(result.user.id);
        } catch (error) {
          console.error("Failed to convert userId to ObjectId:", error);
          // If conversion fails, try using the id directly (might already be ObjectId)
          userId = result.user.id;
        }
        return { 
          success: true, 
          user: result.user,
          userId: userId
        };
      } else {
        console.error("User not found in database:", user.id);
        return { success: false, error: "User not found" };
      }
    } catch (parseError) {
      console.error("Error in getAuthenticatedUser:", parseError);
      return { success: false, error: `Invalid session - ${parseError.message}` };
    }
  } catch (error) {
    console.error("Error getting authenticated user:", error);
    return { success: false, error: `Internal server error - ${error.message}` };
  }
}

