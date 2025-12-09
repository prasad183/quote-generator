import { NextResponse } from "next/server";
import connectDB, { isMongoEnabled } from "@/lib/mongodb";
import { quotes as staticQuotes } from "@/lib/quotes";

export async function GET(request) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    
    // Get search query (required)
    const q = searchParams.get('q');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const field = searchParams.get('field'); // Optional: 'text', 'author', 'category', or 'all'
    
    // Validate search query
    if (!q || q.trim().length === 0) {
      return NextResponse.json(
        { error: "Search query parameter 'q' is required" },
        { status: 400 }
      );
    }
    
    // Validate pagination
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
    
    // Validate field parameter
    const validFields = ['text', 'author', 'category', 'all'];
    const searchField = field && validFields.includes(field.toLowerCase()) 
      ? field.toLowerCase() 
      : 'all';
    
    // Prepare search terms (split by space for multiple terms)
    const searchTerms = q.toLowerCase().trim().split(/\s+/).filter(term => term.length > 0);
    const searchRegex = new RegExp(searchTerms.join('|'), 'i');
    
    // Check if MongoDB is enabled
    if (isMongoEnabled()) {
      try {
        await connectDB();
        const Quote = (await import("@/lib/models/Quote")).default;
        
        // Build MongoDB query based on field
        const query = {};
        if (searchField === 'all') {
          query.$or = [
            { text: { $regex: searchRegex } },
            { author: { $regex: searchRegex } },
            { category: { $regex: searchRegex } },
          ];
        } else if (searchField === 'text') {
          query.text = { $regex: searchRegex };
        } else if (searchField === 'author') {
          query.author = { $regex: searchRegex };
        } else if (searchField === 'category') {
          query.category = { $regex: searchRegex };
        }
        
        // Get total count for pagination
        const total = await Quote.countDocuments(query);
        const totalPages = Math.ceil(total / limit);
        const skip = (page - 1) * limit;
        
        // Fetch quotes with pagination
        const quotes = await Quote.find(query)
          .sort({ id: 1 })
          .skip(skip)
          .limit(limit)
          .lean();
        
        // Format results
        const formattedResults = quotes.map(quote => ({
          id: quote.id,
          text: quote.text,
          author: quote.author,
          category: quote.category,
          createdAt: quote.createdAt ? new Date(quote.createdAt).toISOString() : new Date().toISOString(),
        }));
        
        return NextResponse.json({
          query: q,
          field: searchField,
          results: formattedResults,
          count: total,
          pagination: {
            page,
            limit,
            total,
            totalPages,
            hasNextPage: page < totalPages,
            hasPreviousPage: page > 1,
          },
          searchInfo: {
            terms: searchTerms,
            totalMatches: total,
          },
        });
      } catch (dbError) {
        console.warn("Database query failed, using static quotes:", dbError.message);
      }
    }
    
    // Use static quotes (MongoDB disabled or error)
    let filteredQuotes = [...staticQuotes];
    
    // Filter based on search field
    if (searchField === 'all') {
      filteredQuotes = filteredQuotes.filter(quote =>
        searchTerms.some(term =>
          quote.text.toLowerCase().includes(term) ||
          quote.author.toLowerCase().includes(term) ||
          quote.category.toLowerCase().includes(term)
        )
      );
    } else if (searchField === 'text') {
      filteredQuotes = filteredQuotes.filter(quote =>
        searchTerms.some(term => quote.text.toLowerCase().includes(term))
      );
    } else if (searchField === 'author') {
      filteredQuotes = filteredQuotes.filter(quote =>
        searchTerms.some(term => quote.author.toLowerCase().includes(term))
      );
    } else if (searchField === 'category') {
      filteredQuotes = filteredQuotes.filter(quote =>
        searchTerms.some(term => quote.category.toLowerCase().includes(term))
      );
    }
    
    // Sort by ID
    filteredQuotes.sort((a, b) => a.id - b.id);
    
    // Calculate pagination
    const total = filteredQuotes.length;
    const totalPages = Math.ceil(total / limit);
    const skip = (page - 1) * limit;
    
    // Get paginated results
    const paginatedQuotes = filteredQuotes.slice(skip, skip + limit);
    
    // Format results
    const formattedResults = paginatedQuotes.map(quote => ({
      id: quote.id,
      text: quote.text,
      author: quote.author,
      category: quote.category,
      createdAt: new Date().toISOString(),
    }));
    
    return NextResponse.json({
      query: q,
      field: searchField,
      results: formattedResults,
      count: total,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      },
      searchInfo: {
        terms: searchTerms,
        totalMatches: total,
      },
      source: "static",
    });
  } catch (error) {
    console.error("Error searching quotes:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

