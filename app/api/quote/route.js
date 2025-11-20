import { NextResponse } from "next/server";
import { quotes, formatQuoteForLegacy } from "@/lib/quotes";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const author = searchParams.get('author');
    const category = searchParams.get('category');
    
    let filteredQuotes = [...quotes];
    
    // Filter by author if provided
    if (author) {
      const authorLower = author.toLowerCase().trim();
      filteredQuotes = filteredQuotes.filter(q => 
        q.author.toLowerCase().includes(authorLower)
      );
    }
    
    // Filter by category if provided
    if (category) {
      const categoryLower = category.toLowerCase().trim();
      filteredQuotes = filteredQuotes.filter(q => 
        q.category.toLowerCase() === categoryLower
      );
    }
    
    if (filteredQuotes.length === 0) {
      return NextResponse.json(
        { error: "No quotes found with the specified filters" },
        { status: 404 }
      );
    }
    
    // Get random quote from filtered list
    const randomIndex = Math.floor(Math.random() * filteredQuotes.length);
    const randomQuote = filteredQuotes[randomIndex];
    
    // Return in legacy format for backward compatibility
    const legacyFormat = formatQuoteForLegacy(randomQuote);
    
    return NextResponse.json({ 
      quote: legacyFormat,
      data: randomQuote // Also include structured data
    });
  } catch (error) {
    console.error("Error fetching random quote:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

