import { NextResponse } from "next/server";
import { quotes } from "@/lib/quotes";

export async function GET(request) {
  try {
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
    
    // Perform search with relevance scoring
    const searchResults = quotes.map(quote => {
      let score = 0;
      let matches = {
        text: false,
        author: false,
        category: false,
      };
      
      // Search in specified field(s)
      if (searchField === 'all' || searchField === 'text') {
        const textMatch = searchTerms.some(term => 
          quote.text.toLowerCase().includes(term)
        );
        if (textMatch) {
          matches.text = true;
          score += 3; // Higher weight for text matches
        }
      }
      
      if (searchField === 'all' || searchField === 'author') {
        const authorMatch = searchTerms.some(term => 
          quote.author.toLowerCase().includes(term)
        );
        if (authorMatch) {
          matches.author = true;
          score += 2; // Medium weight for author matches
        }
      }
      
      if (searchField === 'all' || searchField === 'category') {
        const categoryMatch = searchTerms.some(term => 
          quote.category.toLowerCase().includes(term)
        );
        if (categoryMatch) {
          matches.category = true;
          score += 1; // Lower weight for category matches
        }
      }
      
      // Exact phrase match bonus
      const exactPhrase = quote.text.toLowerCase().includes(q.toLowerCase()) ||
                         quote.author.toLowerCase().includes(q.toLowerCase());
      if (exactPhrase) {
        score += 2;
      }
      
      return {
        quote,
        score,
        matches,
      };
    })
    .filter(result => result.score > 0) // Only include results with matches
    .sort((a, b) => b.score - a.score); // Sort by relevance (highest first)
    
    // Calculate pagination
    const total = searchResults.length;
    const totalPages = Math.ceil(total / limit);
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedResults = searchResults.slice(startIndex, endIndex);
    
    // Format response (remove score and matches from final response)
    const formattedResults = paginatedResults.map(result => result.quote);
    
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
  } catch (error) {
    console.error("Error searching quotes:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

