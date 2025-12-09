import { NextResponse } from "next/server";
import connectDB, { isMongoEnabled } from "@/lib/mongodb";

// In-memory collections storage (fallback when MongoDB is disabled)
let inMemoryCollections = null;

// Get or initialize in-memory collections
function getInMemoryCollections() {
  if (!inMemoryCollections) {
    // Try to get from global scope (shared with collections/quotes/route.js)
    if (global.inMemoryCollections) {
      inMemoryCollections = global.inMemoryCollections;
    } else {
      inMemoryCollections = new Map();
      global.inMemoryCollections = inMemoryCollections;
    }
  }
  return inMemoryCollections;
}

// GET - Get all collections or a specific collection by name
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const name = searchParams.get("name");

    // Check if MongoDB is enabled
    if (isMongoEnabled()) {
      try {
        await connectDB();
        const Collection = (await import("@/lib/models/Collection")).default;

        // If name parameter is provided, return the specific collection
        if (name) {
          const collection = await Collection.findOne({ 
            name: { $regex: new RegExp(`^${name.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') }
          });

          if (!collection) {
            return NextResponse.json(
              { error: "Collection not found" },
              { status: 404 }
            );
          }

          return NextResponse.json({
            collection: collection.toAPIFormat(),
            success: true,
          });
        }

        // Otherwise, return all collections
        const collections = await Collection.find({}).sort({ createdAt: -1 });
        const formattedCollections = collections.map(col => col.toAPIFormat());

        return NextResponse.json({
          collections: formattedCollections,
          count: formattedCollections.length,
          success: true,
        });
      } catch (dbError) {
        console.warn("Database query failed, using in-memory storage:", dbError.message);
      }
    }

    // Use in-memory storage (MongoDB disabled or error)
    const memoryCollections = getInMemoryCollections();
    if (name) {
      const collectionName = name.trim().toLowerCase();
      const collection = Array.from(memoryCollections.values())
        .find(col => col.name.toLowerCase() === collectionName);
      
      if (!collection) {
        return NextResponse.json(
          { error: "Collection not found" },
          { status: 404 }
        );
      }

      return NextResponse.json({
        collection: {
          id: collection.id,
          name: collection.name,
          userId: collection.userId,
          isPublic: collection.isPublic,
          quotes: collection.quotes || [],
          createdAt: collection.createdAt,
          updatedAt: collection.updatedAt,
        },
        success: true,
        source: "memory",
      });
    }

    // Return all collections
    const collections = Array.from(memoryCollections.values())
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .map(col => ({
        id: col.id,
        name: col.name,
        userId: col.userId,
        isPublic: col.isPublic,
        quotes: col.quotes || [],
        createdAt: col.createdAt,
        updatedAt: col.updatedAt,
      }));

    return NextResponse.json({
      collections,
      count: collections.length,
      success: true,
      source: "memory",
    });
  } catch (error) {
    console.error("Error fetching collections:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST - Create a new collection
export async function POST(request) {
  try {
    const body = await request.json();
    const { name } = body;

    // Validation
    if (!name || typeof name !== "string" || name.trim().length === 0) {
      return NextResponse.json(
        { error: "Collection name is required and must be a non-empty string" },
        { status: 400 }
      );
    }

    if (name.trim().length > 100) {
      return NextResponse.json(
        { error: "Collection name must be 100 characters or less" },
        { status: 400 }
      );
    }

    const trimmedName = name.trim();
    const nameLower = trimmedName.toLowerCase();

    // Check if MongoDB is enabled
    if (isMongoEnabled()) {
      try {
        await connectDB();
        const Collection = (await import("@/lib/models/Collection")).default;

        // Escape special regex characters in the name
        const escapedName = trimmedName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const existingCollection = await Collection.findOne({ 
          name: { $regex: new RegExp(`^${escapedName}$`, 'i') },
          $or: [
            { userId: null },
            { userId: { $exists: false } }
          ]
        });
        
        if (existingCollection) {
          return NextResponse.json(
            { error: "A collection with this name already exists" },
            { status: 409 }
          );
        }

        // Create new collection with userId explicitly set to null
        // Don't set createdAt/updatedAt manually - let the pre-save hook handle it
        const newCollection = new Collection({
          name: trimmedName,
          userId: null,
          quotes: [],
          isPublic: false,
        });

        try {
          await newCollection.save();
        } catch (saveError) {
          console.error("Error saving collection:", saveError);
          if (saveError.code === 11000) {
            return NextResponse.json(
              { error: "A collection with this name already exists" },
              { status: 409 }
            );
          }
          throw saveError;
        }
        
        // Reload the collection to ensure all fields are populated
        const savedCollection = await Collection.findById(newCollection._id);
        
        if (!savedCollection) {
          console.error("Collection was saved but could not be retrieved");
          return NextResponse.json(
            { error: "Collection was created but could not be retrieved" },
            { status: 500 }
          );
        }
        
        return NextResponse.json({
          ...savedCollection.toAPIFormat(),
          success: true,
        }, { status: 201 });
      } catch (dbError) {
        console.error("Database operation failed:", dbError);
        console.error("Error details:", {
          message: dbError.message,
          stack: dbError.stack,
          name: dbError.name,
        });
        // Return error instead of falling back to memory
        return NextResponse.json(
          { 
            error: "Failed to create collection in database",
            details: dbError.message,
            hint: "Check MongoDB connection. Make sure MongoDB is running and ENABLE_MONGODB=true is set."
          },
          { status: 500 }
        );
      }
    }

    // Use in-memory storage (MongoDB disabled or error)
    const memoryCollections = getInMemoryCollections();
    // Check if collection with same name already exists
    const existing = Array.from(memoryCollections.values())
      .find(col => col.name.toLowerCase() === nameLower);
    
    if (existing) {
      return NextResponse.json(
        { error: "A collection with this name already exists" },
        { status: 409 }
      );
    }

    // Create new collection in memory
    const collectionId = `col_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const now = new Date().toISOString();
    const newCollection = {
      id: collectionId,
      name: trimmedName,
      userId: null,
      quotes: [],
      isPublic: false,
      createdAt: now,
      updatedAt: now,
    };

    memoryCollections.set(collectionId, newCollection);

    return NextResponse.json({
      ...newCollection,
      success: true,
      source: "memory",
    }, { status: 201 });
  } catch (error) {
    console.error("Error creating collection:", error);
    console.error("Error details:", {
      message: error.message,
      code: error.code,
      keyPattern: error.keyPattern,
      keyValue: error.keyValue,
    });
    if (error instanceof SyntaxError) {
      return NextResponse.json(
        { error: "Invalid JSON in request body" },
        { status: 400 }
      );
    }
    // Handle duplicate key error (MongoDB error code 11000)
    if (error.code === 11000) {
      return NextResponse.json(
        { error: "A collection with this name already exists" },
        { status: 409 }
      );
    }
    return NextResponse.json(
      { 
        error: "Internal server error",
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      { status: 500 }
    );
  }
}

// PUT - Update a collection (rename) - supports query parameter
export async function PUT(request) {
  try {
    const { searchParams } = new URL(request.url);
    const collectionName = searchParams.get("name");
    const body = await request.json();
    const { name: newName } = body;

    // Validation
    if (!collectionName) {
      return NextResponse.json(
        { error: "Collection name is required as query parameter: ?name=CollectionName" },
        { status: 400 }
      );
    }

    if (!newName || typeof newName !== "string" || newName.trim().length === 0) {
      return NextResponse.json(
        { error: "New collection name is required and must be a non-empty string" },
        { status: 400 }
      );
    }

    if (newName.trim().length > 100) {
      return NextResponse.json(
        { error: "Collection name must be 100 characters or less" },
        { status: 400 }
      );
    }

    const trimmedNewName = newName.trim();
    const newNameLower = trimmedNewName.toLowerCase();
    const collectionNameLower = collectionName.trim().toLowerCase();

    // Check if MongoDB is enabled
    if (isMongoEnabled()) {
      try {
        await connectDB();
        const Collection = (await import("@/lib/models/Collection")).default;

        // Find collection by name
        const collection = await Collection.findOne({ 
          name: { $regex: new RegExp(`^${collectionName.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') }
        });

        if (!collection) {
          return NextResponse.json(
            { error: "Collection not found" },
            { status: 404 }
          );
        }

        // Check if another collection with same name exists
        const existingCollection = await Collection.findOne({ 
          name: { $regex: new RegExp(`^${trimmedNewName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') },
          _id: { $ne: collection._id }
        });
        
        if (existingCollection) {
          return NextResponse.json(
            { error: "A collection with this name already exists" },
            { status: 409 }
          );
        }

        // Update collection
        collection.name = trimmedNewName;
        collection.updatedAt = new Date();
        await collection.save();

        return NextResponse.json({
          collection: collection.toAPIFormat(),
          success: true,
        });
      } catch (dbError) {
        console.warn("Database operation failed, using in-memory storage:", dbError.message);
      }
    }

    // Use in-memory storage (MongoDB disabled or error)
    const memoryCollections = getInMemoryCollections();
    const collection = Array.from(memoryCollections.values())
      .find(col => col.name.toLowerCase() === collectionNameLower);

    if (!collection) {
      return NextResponse.json(
        { error: "Collection not found" },
        { status: 404 }
      );
    }

    // Check if another collection with same name exists
    const existing = Array.from(memoryCollections.values())
      .find(col => col.id !== collection.id && col.name.toLowerCase() === newNameLower);
    
    if (existing) {
      return NextResponse.json(
        { error: "A collection with this name already exists" },
        { status: 409 }
      );
    }

    // Update collection
    collection.name = trimmedNewName;
    collection.updatedAt = new Date().toISOString();

    return NextResponse.json({
      collection: {
        id: collection.id,
        name: collection.name,
        userId: collection.userId,
        isPublic: collection.isPublic,
        quotes: collection.quotes || [],
        createdAt: collection.createdAt,
        updatedAt: collection.updatedAt,
      },
      success: true,
      source: "memory",
    });
  } catch (error) {
    console.error("Error updating collection:", error);
    if (error instanceof SyntaxError) {
      return NextResponse.json(
        { error: "Invalid JSON in request body" },
        { status: 400 }
      );
    }
    // Handle duplicate key error
    if (error.code === 11000) {
      return NextResponse.json(
        { error: "A collection with this name already exists" },
        { status: 409 }
      );
    }
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE - Delete a collection - supports query parameter
export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const collectionName = searchParams.get("name");

    if (!collectionName) {
      return NextResponse.json(
        { error: "Collection name is required as query parameter: ?name=CollectionName" },
        { status: 400 }
      );
    }

    const collectionNameLower = collectionName.trim().toLowerCase();

    // Check if MongoDB is enabled
    if (isMongoEnabled()) {
      try {
        await connectDB();
        const Collection = (await import("@/lib/models/Collection")).default;

        // Find and delete collection
        const result = await Collection.findOneAndDelete({ 
          name: { $regex: new RegExp(`^${collectionName.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') }
        });

        if (!result) {
          return NextResponse.json(
            { error: "Collection not found" },
            { status: 404 }
          );
        }

        return NextResponse.json({
          message: "Collection deleted successfully",
          success: true,
        });
      } catch (dbError) {
        console.warn("Database operation failed, using in-memory storage:", dbError.message);
      }
    }

    // Use in-memory storage (MongoDB disabled or error)
    const memoryCollections = getInMemoryCollections();
    const collection = Array.from(memoryCollections.values())
      .find(col => col.name.toLowerCase() === collectionNameLower);

    if (!collection) {
      return NextResponse.json(
        { error: "Collection not found" },
        { status: 404 }
      );
    }

    // Delete collection
    memoryCollections.delete(collection.id);

    return NextResponse.json({
      message: "Collection deleted successfully",
      success: true,
      source: "memory",
    });
  } catch (error) {
    console.error("Error deleting collection:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

