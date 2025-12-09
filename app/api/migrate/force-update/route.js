import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import User from "@/lib/models/User";
import Collection from "@/lib/models/Collection";

// POST - Force update all documents to ensure new fields are visible
export async function POST(request) {
  try {
    await connectDB();
    
    const results = {
      usersProcessed: 0,
      collectionsProcessed: 0,
      errors: [],
    };

    // Update ALL User documents individually to ensure fields are set
    try {
      const users = await User.find({});
      for (const user of users) {
        // Set defaults for missing fields
        if (user.email === undefined || user.email === null) {
          user.email = "";
        }
        if (user.avatar === undefined || user.avatar === null) {
          user.avatar = "";
        }
        if (user.bio === undefined || user.bio === null) {
          user.bio = "";
        }
        if (user.location === undefined || user.location === null) {
          user.location = "";
        }
        if (user.website === undefined || user.website === null) {
          user.website = "";
        }
        if (!user.socialLinks) {
          user.socialLinks = {
            twitter: "",
            linkedin: "",
            github: "",
          };
        } else {
          if (!user.socialLinks.twitter) user.socialLinks.twitter = "";
          if (!user.socialLinks.linkedin) user.socialLinks.linkedin = "";
          if (!user.socialLinks.github) user.socialLinks.github = "";
        }
        if (user.totalQuotesViewed === undefined || user.totalQuotesViewed === null) {
          user.totalQuotesViewed = 0;
        }
        if (user.totalFavorites === undefined || user.totalFavorites === null) {
          user.totalFavorites = 0;
        }
        if (user.totalCollections === undefined || user.totalCollections === null) {
          user.totalCollections = 0;
        }
        
        await user.save();
        results.usersProcessed++;
      }
    } catch (error) {
      results.errors.push(`Error updating users: ${error.message}`);
    }

    // Update ALL Collection documents individually
    try {
      const collections = await Collection.find({});
      for (const collection of collections) {
        // Set defaults for missing fields
        if (collection.userId === undefined) {
          collection.userId = null;
        }
        if (collection.isPublic === undefined || collection.isPublic === null) {
          collection.isPublic = false;
        }
        
        await collection.save();
        results.collectionsProcessed++;
      }
    } catch (error) {
      results.errors.push(`Error updating collections: ${error.message}`);
    }

    // Get sample documents to verify
    const sampleUser = await User.findOne().lean();
    const sampleCollection = await Collection.findOne().lean();

    return NextResponse.json({
      message: "Force update completed",
      results: {
        ...results,
        verification: {
          sampleUserFields: sampleUser ? Object.keys(sampleUser) : [],
          sampleCollectionFields: sampleCollection ? Object.keys(sampleCollection) : [],
          sampleUser: sampleUser ? {
            hasEmail: 'email' in sampleUser,
            hasAvatar: 'avatar' in sampleUser,
            hasBio: 'bio' in sampleUser,
            hasTotalQuotesViewed: 'totalQuotesViewed' in sampleUser,
            hasTotalFavorites: 'totalFavorites' in sampleUser,
            hasTotalCollections: 'totalCollections' in sampleUser,
          } : null,
          sampleCollection: sampleCollection ? {
            hasUserId: 'userId' in sampleCollection,
            hasIsPublic: 'isPublic' in sampleCollection,
          } : null,
        },
      },
      note: "All documents have been updated. Refresh MongoDB Compass and click on a document to see all fields.",
      success: true,
    });
  } catch (error) {
    console.error("Error in force update:", error);
    return NextResponse.json(
      { 
        error: "Internal server error",
        details: error.message 
      },
      { status: 500 }
    );
  }
}

