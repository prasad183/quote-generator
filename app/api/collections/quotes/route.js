import { NextResponse } from "next/server";
import connectDB, { isMongoEnabled } from "@/lib/mongodb";

// In-memory collections storage (shared with collections/route.js)
// Note: This is a fallback when MongoDB is disabled
let inMemoryCollections = null;

// Get or initialize in-memory collections
function getInMemoryCollections() {
  if (!inMemoryCollections) {
    // Try to get from global scope (shared with collections/route.js)
    if (global.inMemoryCollections) {
      inMemoryCollections = global.inMemoryCollections;
    } else {
      inMemoryCollections = new Map();
      global.inMemoryCollections = inMemoryCollections;
    }
  }
  return inMemoryCollections;
}

// POST - Add a quote to a collection - supports query parameter
export async function POST(request) {
  try {
    const { searchParams } = new URL(request.url);
    const collectionName = searchParams.get("name");
    const body = await request.json();
    const { text, author } = body;

    if (!collectionName) {
      return NextResponse.json(
        { error: "Collection name is required as query parameter: ?name=CollectionName" },
        { status: 400 }
      );
    }

    // Validation
    if (!text || typeof text !== "string" || text.trim().length === 0) {
      return NextResponse.json(
        { error: "Quote text is required and must be a non-empty string" },
        { status: 400 }
      );
    }

    if (!author || typeof author !== "string" || author.trim().length === 0) {
      return NextResponse.json(
        { error: "Author is required and must be a non-empty string" },
        { status: 400 }
      );
    }

    const trimmedText = text.trim();
    const trimmedAuthor = author.trim();
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

        // Check if quote already exists in collection
        const existingQuote = collection.quotes.find(
          (q) => q.text.trim().toLowerCase() === trimmedText.toLowerCase() && 
                 q.author.trim().toLowerCase() === trimmedAuthor.toLowerCase()
        );

        if (existingQuote) {
          return NextResponse.json(
            { error: "Quote already exists in this collection" },
            { status: 409 }
          );
        }

        // Add quote to collection
        const newQuote = {
          id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
          text: trimmedText,
          author: trimmedAuthor,
          addedAt: new Date(),
        };

        collection.quotes.push(newQuote);
        collection.updatedAt = new Date();
        // Mark quotes array as modified
        collection.markModified('quotes');
        await collection.save();

        return NextResponse.json({
          quote: {
            id: newQuote.id,
            text: newQuote.text,
            author: newQuote.author,
            addedAt: newQuote.addedAt.toISOString(),
          },
          collection: collection.toAPIFormat(),
          success: true,
        }, { status: 201 });
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

    // Check if quote already exists in collection
    const existingQuote = (collection.quotes || []).find(
      (q) => q.text.trim().toLowerCase() === trimmedText.toLowerCase() && 
             q.author.trim().toLowerCase() === trimmedAuthor.toLowerCase()
    );

    if (existingQuote) {
      return NextResponse.json(
        { error: "Quote already exists in this collection" },
        { status: 409 }
      );
    }

    // Add quote to collection
    if (!collection.quotes) {
      collection.quotes = [];
    }

    const newQuote = {
      id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
      text: trimmedText,
      author: trimmedAuthor,
      addedAt: new Date().toISOString(),
    };

    collection.quotes.push(newQuote);
    collection.updatedAt = new Date().toISOString();

    return NextResponse.json({
      quote: {
        id: newQuote.id,
        text: newQuote.text,
        author: newQuote.author,
        addedAt: newQuote.addedAt,
      },
      collection: {
        id: collection.id,
        name: collection.name,
        userId: collection.userId,
        isPublic: collection.isPublic,
        quotes: collection.quotes,
        createdAt: collection.createdAt,
        updatedAt: collection.updatedAt,
      },
      success: true,
      source: "memory",
    }, { status: 201 });
  } catch (error) {
    console.error("Error adding quote to collection:", error);
    if (error instanceof SyntaxError) {
      return NextResponse.json(
        { error: "Invalid JSON in request body" },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE - Remove a quote from a collection using text and author (no ID required)
export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    let collectionName = searchParams.get("name");
    const body = await request.json();
    const { text, author } = body;

    if (!collectionName) {
      return NextResponse.json(
        { error: "Collection name is required as query parameter: ?name=CollectionName" },
        { status: 400 }
      );
    }

    // Validation
    if (!text || typeof text !== "string" || text.trim().length === 0) {
      return NextResponse.json(
        { error: "Quote text is required and must be a non-empty string" },
        { status: 400 }
      );
    }

    if (!author || typeof author !== "string" || author.trim().length === 0) {
      return NextResponse.json(
        { error: "Author is required and must be a non-empty string" },
        { status: 400 }
      );
    }

    // Decode the collection name in case it's URL encoded
    try {
      collectionName = decodeURIComponent(collectionName);
    } catch (e) {
      // If decoding fails, use as-is (might already be decoded)
    }

    const trimmedText = text.trim();
    const trimmedAuthor = author.trim();
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
            { 
              error: "Collection not found",
              searchedName: collectionName,
            },
            { status: 404 }
          );
        }
        
        // Find quote by text and author (case-insensitive matching)
        const quoteIndex = collection.quotes.findIndex(
          (q) => q.text.trim().toLowerCase() === trimmedText.toLowerCase() && 
                 q.author.trim().toLowerCase() === trimmedAuthor.toLowerCase()
        );

        if (quoteIndex === -1) {
          return NextResponse.json(
            { 
              error: "Quote not found in collection",
              searchedText: trimmedText,
              searchedAuthor: trimmedAuthor,
            },
            { status: 404 }
          );
        }

        // Remove quote from collection
        const removedQuote = collection.quotes[quoteIndex];
        collection.quotes.splice(quoteIndex, 1);
        collection.updatedAt = new Date();
        await collection.save();

        return NextResponse.json({
          message: "Quote removed from collection successfully",
          removedQuote: {
            id: removedQuote.id,
            text: removedQuote.text,
            author: removedQuote.author,
            addedAt: removedQuote.addedAt.toISOString(),
          },
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
        { 
          error: "Collection not found",
          searchedName: collectionName,
        },
        { status: 404 }
      );
    }
    
    // Find quote by text and author (case-insensitive matching)
    const quotes = collection.quotes || [];
    const quoteIndex = quotes.findIndex(
      (q) => q.text.trim().toLowerCase() === trimmedText.toLowerCase() && 
             q.author.trim().toLowerCase() === trimmedAuthor.toLowerCase()
    );

    if (quoteIndex === -1) {
      return NextResponse.json(
        { 
          error: "Quote not found in collection",
          searchedText: trimmedText,
          searchedAuthor: trimmedAuthor,
        },
        { status: 404 }
      );
    }

    // Remove quote from collection
    const removedQuote = quotes[quoteIndex];
    quotes.splice(quoteIndex, 1);
    collection.updatedAt = new Date().toISOString();

    return NextResponse.json({
      message: "Quote removed from collection successfully",
      removedQuote: {
        id: removedQuote.id,
        text: removedQuote.text,
        author: removedQuote.author,
        addedAt: removedQuote.addedAt,
      },
      collection: {
        id: collection.id,
        name: collection.name,
        userId: collection.userId,
        isPublic: collection.isPublic,
        quotes: quotes,
        createdAt: collection.createdAt,
        updatedAt: collection.updatedAt,
      },
      success: true,
      source: "memory",
    });
  } catch (error) {
    console.error("Error removing quote from collection:", error);
    if (error instanceof SyntaxError) {
      return NextResponse.json(
        { error: "Invalid JSON in request body" },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

