import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Collection from "@/lib/models/Collection";
import mongoose from "mongoose";

// POST - Fix the Collection index by dropping old index and creating new sparse index
export async function POST() {
  try {
    await connectDB();
    
    const results = {
      indexesDropped: [],
      indexesCreated: [],
      errors: [],
    };

    try {
      // Get the collection name from the model
      const collectionName = Collection.collection.name;
      const db = mongoose.connection.db;
      const collection = db.collection(collectionName);

      // Get all existing indexes
      const existingIndexes = await collection.indexes();
      console.log("Existing indexes:", existingIndexes);

      // Try to drop the old unique index on userId_1_name_1 if it exists
      try {
        // Check if the old index exists (non-sparse unique index)
        const oldIndex = existingIndexes.find(
          idx => idx.name === 'userId_1_name_1' || 
                 (idx.key && idx.key.userId === 1 && idx.key.name === 1 && !idx.sparse)
        );
        
        if (oldIndex) {
          await collection.dropIndex('userId_1_name_1');
          results.indexesDropped.push('userId_1_name_1 (old non-sparse unique index)');
          console.log("Dropped old index: userId_1_name_1");
        } else {
          results.indexesDropped.push('userId_1_name_1 (not found, may already be dropped)');
        }
      } catch (dropError) {
        // Index might not exist, that's okay
        if (dropError.code === 27) {
          // Index not found
          results.indexesDropped.push('userId_1_name_1 (not found)');
        } else {
          results.errors.push(`Error dropping index: ${dropError.message}`);
          console.error("Error dropping index:", dropError);
        }
      }

      // Create the new sparse unique index
      try {
        await Collection.collection.createIndex(
          { userId: 1, name: 1 },
          { 
            unique: true, 
            sparse: true,
            name: 'userId_1_name_1'
          }
        );
        results.indexesCreated.push('userId_1_name_1 (sparse unique index)');
        console.log("Created new sparse index: userId_1_name_1");
      } catch (createError) {
        // Index might already exist
        if (createError.code === 85 || createError.code === 86) {
          // Index already exists
          results.indexesCreated.push('userId_1_name_1 (already exists)');
        } else {
          results.errors.push(`Error creating index: ${createError.message}`);
          console.error("Error creating index:", createError);
        }
      }

      // Verify the index was created correctly
      const finalIndexes = await collection.indexes();
      const newIndex = finalIndexes.find(
        idx => idx.name === 'userId_1_name_1' || 
               (idx.key && idx.key.userId === 1 && idx.key.name === 1)
      );

      return NextResponse.json({
        message: "Collection index fix completed",
        results: {
          ...results,
          verification: {
            indexExists: !!newIndex,
            indexDetails: newIndex ? {
              name: newIndex.name,
              sparse: newIndex.sparse,
              unique: newIndex.unique,
              key: newIndex.key,
            } : null,
            allIndexes: finalIndexes.map(idx => ({
              name: idx.name,
              key: idx.key,
              sparse: idx.sparse,
              unique: idx.unique,
            })),
          },
        },
        success: true,
      });
    } catch (error) {
      results.errors.push(`General error: ${error.message}`);
      console.error("Error fixing collection index:", error);
      return NextResponse.json(
        {
          message: "Index fix completed with errors",
          results,
          error: error.message,
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Error in index fix:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error.message,
      },
      { status: 500 }
    );
  }
}

// GET - Check current index status
export async function GET() {
  try {
    await connectDB();
    
    const collectionName = Collection.collection.name;
    const db = mongoose.connection.db;
    const collection = db.collection(collectionName);
    
    const indexes = await collection.indexes();
    
    const targetIndex = indexes.find(
      idx => idx.name === 'userId_1_name_1' || 
             (idx.key && idx.key.userId === 1 && idx.key.name === 1)
    );

    return NextResponse.json({
      indexes: indexes.map(idx => ({
        name: idx.name,
        key: idx.key,
        sparse: idx.sparse,
        unique: idx.unique,
      })),
      targetIndex: targetIndex ? {
        name: targetIndex.name,
        key: targetIndex.key,
        sparse: targetIndex.sparse,
        unique: targetIndex.unique,
        isCorrect: targetIndex.sparse === true && targetIndex.unique === true,
      } : null,
      needsFix: !targetIndex || targetIndex.sparse !== true,
      success: true,
    });
  } catch (error) {
    console.error("Error checking index status:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error.message,
      },
      { status: 500 }
    );
  }
}

