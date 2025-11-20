import { NextResponse } from "next/server";
import { quotes } from "@/lib/quotes";

export async function GET() {
  try {
    // Create a map to count quotes per author
    const authorMap = {};
    
    quotes.forEach(quote => {
      const author = quote.author;
      if (!authorMap[author]) {
        authorMap[author] = {
          name: author,
          quoteCount: 0,
          categories: new Set(),
        };
      }
      authorMap[author].quoteCount++;
      if (quote.category) {
        authorMap[author].categories.add(quote.category);
      }
    });
    
    // Convert to array and format
    const authors = Object.values(authorMap).map(author => ({
      name: author.name,
      quoteCount: author.quoteCount,
      categories: Array.from(author.categories).sort(),
    }))
    // Sort by quote count (descending), then by name (ascending)
    .sort((a, b) => {
      if (b.quoteCount !== a.quoteCount) {
        return b.quoteCount - a.quoteCount;
      }
      return a.name.localeCompare(b.name);
    });
    
    return NextResponse.json({
      authors,
      total: authors.length,
      totalQuotes: quotes.length,
    });
  } catch (error) {
    console.error("Error fetching authors:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

