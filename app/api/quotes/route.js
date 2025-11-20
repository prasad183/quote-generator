import { NextResponse } from "next/server";
import { quotes } from "@/lib/quotes";

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
    
    // Start with all quotes
    let filteredQuotes = [...quotes];
    
    // Filter by author (case-insensitive partial match)
    if (author) {
      const authorLower = author.toLowerCase().trim();
      filteredQuotes = filteredQuotes.filter(q => 
        q.author.toLowerCase().includes(authorLower)
      );
    }
    
    // Filter by category (case-insensitive exact match)
    if (category) {
      const categoryLower = category.toLowerCase().trim();
      filteredQuotes = filteredQuotes.filter(q => 
        q.category.toLowerCase() === categoryLower
      );
    }
    
    // Search in text, author, or category (case-insensitive)
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
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedQuotes = filteredQuotes.slice(startIndex, endIndex);
    
    // Return response
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
  try {
    const body = await request.json();
    const { text, author, category } = body;

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

    // Generate new ID (in production, this would come from a database)
    const newId = quotes.length > 0 ? Math.max(...quotes.map((q) => q.id)) + 1 : 1;

    // Create new quote object
    const newQuote = {
      id: newId,
      text: text.trim(),
      author: author.trim(),
      category: quoteCategory,
      createdAt: new Date().toISOString(),
    };

    // Add quote to array (in production, this would save to a database)
    quotes.push(newQuote);

    return NextResponse.json(newQuote, { status: 201 });
  } catch (error) {
    // Handle JSON parse errors
    if (error instanceof SyntaxError || error.message?.includes("JSON")) {
      return NextResponse.json(
        { error: "Invalid JSON in request body" },
        { status: 400 }
      );
    }

    console.error("Error creating quote:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

