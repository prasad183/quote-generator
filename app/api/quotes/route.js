import { NextResponse } from "next/server";
import connectDB, { isMongoEnabled } from "@/lib/mongodb";
import { quotes as staticQuotes } from "@/lib/quotes";

// Available categories for validation
const validCategories = [
  "motivation",
  "wisdom",
  "perseverance",
  "success",
  "leadership",
  "inspiration",
  "general",
];

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Parse query parameters
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const author = searchParams.get('author');
    const category = searchParams.get('category');
    const search = searchParams.get('search');
    
    // Validate pagination parameters
    if (page < 1) {
      return NextResponse.json(
        { error: "Page must be greater than 0" },
        { status: 400 }
      );
    }
    
    if (limit < 1 || limit > 100) {
      return NextResponse.json(
        { error: "Limit must be between 1 and 100" },
        { status: 400 }
      );
    }
    
    // Check if MongoDB is enabled
    const mongoEnabled = isMongoEnabled();
    
    if (mongoEnabled) {
      try {
        await connectDB();
        const Quote = (await import("@/lib/models/Quote")).default;
        
        // Build MongoDB query
        const query = {};
        
        // Filter by author (case-insensitive partial match)
        if (author) {
          query.author = { $regex: author.trim(), $options: 'i' };
        }
        
        // Filter by category (case-insensitive exact match)
        if (category) {
          query.category = { $regex: new RegExp(`^${category.trim()}$`, 'i') };
        }
        
        // Search in text, author, or category (case-insensitive)
        if (search) {
          query.$or = [
            { text: { $regex: search.trim(), $options: 'i' } },
            { author: { $regex: search.trim(), $options: 'i' } },
            { category: { $regex: search.trim(), $options: 'i' } },
          ];
        }
        
        // Calculate pagination
        const total = await Quote.countDocuments(query);
        const totalPages = Math.ceil(total / limit);
        const skip = (page - 1) * limit;
        
        // Fetch paginated quotes
        const quotes = await Quote.find(query)
          .sort({ id: 1 }) // Sort by ID ascending
          .skip(skip)
          .limit(limit)
          .lean();
        
        // Format quotes for response
        const formattedQuotes = quotes.map(quote => ({
          id: quote.id,
          text: quote.text,
          author: quote.author,
          category: quote.category,
          createdAt: quote.createdAt ? new Date(quote.createdAt).toISOString() : new Date().toISOString(),
        }));
        
        // Return response
        return NextResponse.json({
          quotes: formattedQuotes,
          pagination: {
            page,
            limit,
            total,
            totalPages,
            hasNextPage: page < totalPages,
            hasPreviousPage: page > 1,
          },
          filters: {
            ...(author && { author }),
            ...(category && { category }),
            ...(search && { search }),
          },
        });
      } catch (dbError) {
        console.warn("Database query failed, using static quotes:", dbError.message);
      }
    }
    
    // Use static quotes (MongoDB disabled or error)
    let filteredQuotes = [...staticQuotes];
    
    // Apply filters
    if (author) {
      const authorLower = author.toLowerCase().trim();
      filteredQuotes = filteredQuotes.filter(q => 
        q.author.toLowerCase().includes(authorLower)
      );
    }
    
    if (category) {
      const categoryLower = category.toLowerCase().trim();
      filteredQuotes = filteredQuotes.filter(q => 
        q.category.toLowerCase() === categoryLower
      );
    }
    
    if (search) {
      const searchLower = search.toLowerCase().trim();
      filteredQuotes = filteredQuotes.filter(q => 
        q.text.toLowerCase().includes(searchLower) ||
        q.author.toLowerCase().includes(searchLower) ||
        q.category.toLowerCase().includes(searchLower)
      );
    }
    
    // Calculate pagination
    const total = filteredQuotes.length;
    const totalPages = Math.ceil(total / limit);
    const skip = (page - 1) * limit;
    
    // Get paginated quotes
    const paginatedQuotes = filteredQuotes
      .slice(skip, skip + limit)
      .map(quote => ({
        id: quote.id,
        text: quote.text,
        author: quote.author,
        category: quote.category,
        createdAt: new Date().toISOString(),
      }));
    
    return NextResponse.json({
      quotes: paginatedQuotes,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      },
      filters: {
        ...(author && { author }),
        ...(category && { category }),
        ...(search && { search }),
      },
      source: "static",
    });
  } catch (error) {
    console.error("Error fetching quotes:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  let parsedBody = null;
  
  try {
    parsedBody = await request.json();
    const { text, author, category } = parsedBody;
    
    // If MongoDB is disabled, return error for POST requests
    if (!isMongoEnabled()) {
      return NextResponse.json(
        { 
          error: "MongoDB is disabled. Cannot create new quotes. Please enable MongoDB to add quotes.",
          hint: "Set ENABLE_MONGODB=true in your environment variables to enable MongoDB."
        },
        { status: 503 }
      );
    }
    
    await connectDB();

    // Validation
    if (!text || typeof text !== "string" || text.trim().length === 0) {
      return NextResponse.json(
        { error: "Quote text is required and must be a non-empty string" },
        { status: 400 }
      );
    }

    if (text.trim().length > 500) {
      return NextResponse.json(
        { error: "Quote text must be 500 characters or less" },
        { status: 400 }
      );
    }

    if (!author || typeof author !== "string" || author.trim().length === 0) {
      return NextResponse.json(
        { error: "Author is required and must be a non-empty string" },
        { status: 400 }
      );
    }

    if (author.trim().length > 100) {
      return NextResponse.json(
        { error: "Author name must be 100 characters or less" },
        { status: 400 }
      );
    }

    // Validate category (optional, defaults to "general")
    const quoteCategory = category
      ? category.trim().toLowerCase()
      : "general";

    if (!validCategories.includes(quoteCategory)) {
      return NextResponse.json(
        {
          error: `Invalid category. Must be one of: ${validCategories.join(", ")}`,
        },
        { status: 400 }
      );
    }

    const Quote = (await import("@/lib/models/Quote")).default;
    
    // Generate new ID - find the maximum existing ID and add 1
    const maxQuote = await Quote.findOne().sort({ id: -1 });
    const newId = maxQuote ? maxQuote.id + 1 : 1;

    // Create new quote in MongoDB
    const newQuote = new Quote({
      id: newId,
      text: text.trim(),
      author: author.trim(),
      category: quoteCategory,
      createdAt: new Date(),
    });

    await newQuote.save();

    // Format for response
    const formattedQuote = {
      id: newQuote.id,
      text: newQuote.text,
      author: newQuote.author,
      category: newQuote.category,
      createdAt: newQuote.createdAt ? new Date(newQuote.createdAt).toISOString() : new Date().toISOString(),
    };

    return NextResponse.json(formattedQuote, { status: 201 });
  } catch (error) {
    // Handle JSON parse errors
    if (error instanceof SyntaxError || error.message?.includes("JSON")) {
      return NextResponse.json(
        { error: "Invalid JSON in request body" },
        { status: 400 }
      );
    }

    // Handle duplicate ID error - retry with next ID
    if (error.code === 11000 && parsedBody && isMongoEnabled()) {
      try {
        const Quote = (await import("@/lib/models/Quote")).default;
        const { text, author, category } = parsedBody;
        const quoteCategory = category ? category.trim().toLowerCase() : "general";
        
        // Get a new ID that doesn't conflict
        const maxQuote = await Quote.findOne().sort({ id: -1 });
        const newId = maxQuote ? maxQuote.id + 1 : 1;
        
        const newQuote = new Quote({
          id: newId,
          text: text.trim(),
          author: author.trim(),
          category: quoteCategory,
          createdAt: new Date(),
        });
        
        await newQuote.save();
        
        return NextResponse.json({
          id: newQuote.id,
          text: newQuote.text,
          author: newQuote.author,
          category: newQuote.category,
          createdAt: newQuote.createdAt ? new Date(newQuote.createdAt).toISOString() : new Date().toISOString(),
        }, { status: 201 });
      } catch (retryError) {
        console.error("Error creating quote (retry):", retryError);
        return NextResponse.json(
          { error: "Internal server error" },
          { status: 500 }
        );
      }
    }

    console.error("Error creating quote:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

