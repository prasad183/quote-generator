import { NextResponse } from "next/server";
import { quotes } from "@/lib/quotes";

export async function GET() {
  try {
    // Basic counts
    const totalQuotes = quotes.length;
    const authors = [...new Set(quotes.map(q => q.author))];
    const totalAuthors = authors.length;
    const categories = [...new Set(quotes.map(q => q.category))];
    const totalCategories = categories.length;
    
    // Calculate average quote length
    const totalChars = quotes.reduce((sum, q) => sum + q.text.length, 0);
    const averageQuoteLength = Math.round(totalChars / totalQuotes);
    
    // Category breakdown
    const categoryCounts = {};
    quotes.forEach(q => {
      categoryCounts[q.category] = (categoryCounts[q.category] || 0) + 1;
    });
    
    // Author breakdown (top authors)
    const authorCounts = {};
    quotes.forEach(q => {
      authorCounts[q.author] = (authorCounts[q.author] || 0) + 1;
    });
    
    // Get top 5 authors by quote count
    const topAuthors = Object.entries(authorCounts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
    
    // Get category breakdown sorted by count
    const categoryBreakdown = Object.entries(categoryCounts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);
    
    // Find longest and shortest quotes
    const quoteLengths = quotes.map(q => ({ id: q.id, text: q.text, length: q.text.length }));
    const longestQuote = quoteLengths.reduce((max, q) => q.length > max.length ? q : max, quoteLengths[0]);
    const shortestQuote = quoteLengths.reduce((min, q) => q.length < min.length ? q : min, quoteLengths[0]);
    
    // Calculate total words
    const totalWords = quotes.reduce((sum, q) => {
      return sum + q.text.split(/\s+/).filter(word => word.length > 0).length;
    }, 0);
    const averageWordsPerQuote = Math.round(totalWords / totalQuotes);
    
    return NextResponse.json({
      overview: {
        totalQuotes,
        totalAuthors,
        totalCategories,
        averageQuoteLength,
        averageWordsPerQuote,
        totalWords,
      },
      categoryBreakdown,
      topAuthors,
      quoteLengths: {
        longest: {
          id: longestQuote.id,
          text: longestQuote.text,
          length: longestQuote.length,
        },
        shortest: {
          id: shortestQuote.id,
          text: shortestQuote.text,
          length: shortestQuote.length,
        },
      },
      authors: authors.sort(),
      categories: categories.sort(),
    });
  } catch (error) {
    console.error("Error fetching statistics:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

