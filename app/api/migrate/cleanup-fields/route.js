import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import User from "@/lib/models/User";
import Collection from "@/lib/models/Collection";
import Quote from "@/lib/models/Quote";

// POST - Remove unused fields from database documents
export async function POST(request) {
  try {
    await connectDB();
    
    const results = {
      users: { updated: 0, fieldsRemoved: [] },
      collections: { updated: 0, fieldsRemoved: [] },
      quotes: { updated: 0, fieldsRemoved: [] },
      errors: [],
    };

    // Fields that are actually used in the application
    // Based on lib/users.js - only these fields are used: name, username, password, createdAt
    const usedUserFields = [
      '_id', 'name', 'username', 'password', 'createdAt', '__v'
    ];

    const usedCollectionFields = [
      '_id', 'name', 'userId', 'quotes', 'isPublic', 'createdAt', 'updatedAt'
    ];

    const usedQuoteFields = [
      '_id', 'id', 'text', 'author', 'category', 'createdAt'
    ];

    // 1. Clean up User documents - remove unused fields
    try {
      const allUsers = await User.find({});
      const fieldsToRemove = [];
      
      // Get all possible fields from schema
      const schemaFields = Object.keys(User.schema.paths);
      
      // Find fields that are not in usedUserFields
      schemaFields.forEach(field => {
        if (!usedUserFields.includes(field) && field !== '__v') {
          fieldsToRemove.push(field);
        }
      });

      if (fieldsToRemove.length > 0) {
        results.users.fieldsRemoved = fieldsToRemove;
        
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
            results.users.updated++;
          }
        }
      }
    } catch (error) {
      results.errors.push(`Error cleaning users: ${error.message}`);
    }

    // 2. Clean up Collection documents - remove unused fields
    try {
      const allCollections = await Collection.find({});
      const fieldsToRemove = [];
      
      const schemaFields = Object.keys(Collection.schema.paths);
      
      schemaFields.forEach(field => {
        if (!usedCollectionFields.includes(field) && field !== '__v') {
          fieldsToRemove.push(field);
        }
      });

      if (fieldsToRemove.length > 0) {
        results.collections.fieldsRemoved = fieldsToRemove;
        
        for (const collection of allCollections) {
          const update = { $unset: {} };
          let hasFieldsToRemove = false;
          
          fieldsToRemove.forEach(field => {
            if (collection[field] !== undefined) {
              update.$unset[field] = "";
              hasFieldsToRemove = true;
            }
          });

          if (hasFieldsToRemove) {
            await Collection.updateOne({ _id: collection._id }, update);
            results.collections.updated++;
          }
        }
      }
    } catch (error) {
      results.errors.push(`Error cleaning collections: ${error.message}`);
    }

    // 3. Clean up Quote documents - remove unused fields
    try {
      const allQuotes = await Quote.find({});
      const fieldsToRemove = [];
      
      const schemaFields = Object.keys(Quote.schema.paths);
      
      schemaFields.forEach(field => {
        if (!usedQuoteFields.includes(field) && field !== '__v') {
          fieldsToRemove.push(field);
        }
      });

      if (fieldsToRemove.length > 0) {
        results.quotes.fieldsRemoved = fieldsToRemove;
        
        for (const quote of allQuotes) {
          const update = { $unset: {} };
          let hasFieldsToRemove = false;
          
          fieldsToRemove.forEach(field => {
            if (quote[field] !== undefined) {
              update.$unset[field] = "";
              hasFieldsToRemove = true;
            }
          });

          if (hasFieldsToRemove) {
            await Quote.updateOne({ _id: quote._id }, update);
            results.quotes.updated++;
          }
        }
      }
    } catch (error) {
      results.errors.push(`Error cleaning quotes: ${error.message}`);
    }

    return NextResponse.json({
      message: "Field cleanup completed",
      results,
      note: "Unused fields have been removed from documents. Refresh MongoDB Compass to see the changes.",
      success: true,
    });
  } catch (error) {
    console.error("Error cleaning up fields:", error);
    return NextResponse.json(
      { 
        error: "Internal server error",
        details: error.message 
      },
      { status: 500 }
    );
  }
}

// GET - Show which fields will be removed (dry run)
export async function GET() {
  try {
    await connectDB();
    
    const analysis = {
      users: { total: 0, fieldsToRemove: [], sampleDocument: null },
      collections: { total: 0, fieldsToRemove: [], sampleDocument: null },
      quotes: { total: 0, fieldsToRemove: [], sampleDocument: null },
    };

    // Analyze Users
    try {
      const userCount = await User.countDocuments();
      const sampleUser = await User.findOne().lean();
      
      analysis.users.total = userCount;
      
      if (sampleUser) {
        const usedFields = ['_id', 'name', 'username', 'password', 'createdAt', '__v'];
        const allFields = Object.keys(sampleUser);
        analysis.users.fieldsToRemove = allFields.filter(f => !usedFields.includes(f));
        analysis.users.sampleDocument = sampleUser;
      }
    } catch (error) {
      analysis.users.error = error.message;
    }

    // Analyze Collections
    try {
      const collectionCount = await Collection.countDocuments();
      const sampleCollection = await Collection.findOne().lean();
      
      analysis.collections.total = collectionCount;
      
      if (sampleCollection) {
        const usedFields = ['_id', 'name', 'userId', 'quotes', 'isPublic', 'createdAt', 'updatedAt', '__v'];
        const allFields = Object.keys(sampleCollection);
        analysis.collections.fieldsToRemove = allFields.filter(f => !usedFields.includes(f));
        analysis.collections.sampleDocument = sampleCollection;
      }
    } catch (error) {
      analysis.collections.error = error.message;
    }

    // Analyze Quotes
    try {
      const quoteCount = await Quote.countDocuments();
      const sampleQuote = await Quote.findOne().lean();
      
      analysis.quotes.total = quoteCount;
      
      if (sampleQuote) {
        const usedFields = ['_id', 'id', 'text', 'author', 'category', 'createdAt', '__v'];
        const allFields = Object.keys(sampleQuote);
        analysis.quotes.fieldsToRemove = allFields.filter(f => !usedFields.includes(f));
        analysis.quotes.sampleDocument = sampleQuote;
      }
    } catch (error) {
      analysis.quotes.error = error.message;
    }

    return NextResponse.json({
      message: "Field cleanup analysis (dry run)",
      analysis,
      note: "This is a preview. Use POST to actually remove the fields.",
      success: true,
    });
  } catch (error) {
    console.error("Error analyzing fields:", error);
    return NextResponse.json(
      { 
        error: "Internal server error",
        details: error.message 
      },
      { status: 500 }
    );
  }
}

