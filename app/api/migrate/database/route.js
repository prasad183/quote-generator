import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import mongoose from "mongoose";
import User from "@/lib/models/User";
import Quote from "@/lib/models/Quote";
import Collection from "@/lib/models/Collection";

// POST - Migrate database and initialize new collections
export async function POST(request) {
  try {
    await connectDB();
    
    const results = {
      usersUpdated: 0,
      collectionsUpdated: 0,
      errors: [],
    };

    // 1. Clean up User documents - remove unused fields
    try {
      const allUsers = await User.find({});
      let usersUpdatedCount = 0;
      
      // Fields to remove (not used in the application)
      const fieldsToRemove = [
        'email', 'avatar', 'bio', 'location', 'website', 
        'socialLinks', 'lastLoginAt', 'lastActiveAt',
        'totalQuotesViewed', 'totalFavorites', 'totalCollections'
      ];
      
      for (const user of allUsers) {
        const update = { $unset: {} };
        let hasFieldsToRemove = false;
        
        fieldsToRemove.forEach(field => {
          if (user[field] !== undefined) {
            update.$unset[field] = "";
            hasFieldsToRemove = true;
          }
        });

        if (hasFieldsToRemove) {
          await User.updateOne({ _id: user._id }, update);
          usersUpdatedCount++;
        }
      }
      
      results.usersUpdated = usersUpdatedCount;
      
      // Get a sample user to verify
      const sampleUser = await User.findOne();
      if (sampleUser) {
        results.sampleUserFields = Object.keys(sampleUser.toObject());
      }
    } catch (error) {
      results.errors.push(`Error cleaning users: ${error.message}`);
    }

    // 2. Update existing Collection documents with new fields
    try {
      // Update ALL collections to ensure they have all new fields
      const allCollections = await Collection.find({});
      let collectionsUpdatedCount = 0;
      
      for (const collection of allCollections) {
        let needsUpdate = false;
        const updateData = {};
        const collectionObj = collection.toObject();
        
        // Check and set userId (check if field exists)
        if (!('userId' in collectionObj) || collection.userId === undefined) {
          updateData.userId = null;
          needsUpdate = true;
        }
        
        // Check and set isPublic (check if field exists or is null)
        if (!('isPublic' in collectionObj) || collection.isPublic === undefined || collection.isPublic === null) {
          updateData.isPublic = false;
          needsUpdate = true;
        }
        
        // Update if needed
        if (needsUpdate) {
          await Collection.updateOne(
            { _id: collection._id },
            { $set: updateData }
          );
          collectionsUpdatedCount++;
        }
      }
      
      results.collectionsUpdated = collectionsUpdatedCount;
      
      // Get a sample collection to verify
      const sampleCollection = await Collection.findOne();
      if (sampleCollection) {
        results.sampleCollectionFields = Object.keys(sampleCollection.toObject());
      }
    } catch (error) {
      results.errors.push(`Error updating collections: ${error.message}`);
    }

    // 3. Ensure all indexes are created
    try {
      await User.createIndexes();
      await Collection.createIndexes();
      await Quote.createIndexes();
      
      results.indexesCreated = true;
    } catch (error) {
      results.errors.push(`Error creating indexes: ${error.message}`);
    }

    // 4. Verify updates by fetching sample documents
    try {
      const sampleUser = await User.findOne().lean();
      const sampleCollection = await Collection.findOne().lean();
      
      results.verification = {
        userFields: sampleUser ? Object.keys(sampleUser) : [],
        collectionFields: sampleCollection ? Object.keys(sampleCollection) : [],
        userHasRequiredFields: sampleUser ? [
          'name' in sampleUser,
          'username' in sampleUser,
          'password' in sampleUser,
          'createdAt' in sampleUser,
        ] : [],
        collectionHasNewFields: sampleCollection ? [
          'userId' in sampleCollection,
          'isPublic' in sampleCollection,
        ] : [],
      };
    } catch (error) {
      results.errors.push(`Error verifying updates: ${error.message}`);
    }

    return NextResponse.json({
      message: "Database migration completed",
      results,
      note: "Refresh MongoDB Compass to see the updated fields. If fields still don't show, try viewing a document directly.",
      success: true,
    });
  } catch (error) {
    console.error("Error migrating database:", error);
    return NextResponse.json(
      { 
        error: "Internal server error",
        details: error.message 
      },
      { status: 500 }
    );
  }
}

// GET - Check database status
export async function GET() {
  try {
    await connectDB();
    
    const status = {
      collections: {},
      totalDocuments: 0,
    };

    const collections = [
      { name: 'users', model: User },
      { name: 'quotes', model: Quote },
      { name: 'collections', model: Collection },
    ];

    for (const { name, model } of collections) {
      try {
        const count = await model.countDocuments();
        const schemaPaths = Object.keys(model.schema.paths);
        status.collections[name] = {
          exists: true,
          documentCount: count,
          fields: schemaPaths,
          indexedFields: Object.keys(model.schema.indexes() || {}),
        };
        status.totalDocuments += count;
      } catch (error) {
        status.collections[name] = {
          exists: false,
          error: error.message,
        };
      }
    }

    return NextResponse.json({
      status,
      success: true,
    });
  } catch (error) {
    console.error("Error checking database status:", error);
    return NextResponse.json(
      { 
        error: "Internal server error",
        details: error.message 
      },
      { status: 500 }
    );
  }
}

