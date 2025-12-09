import { NextResponse } from "next/server";
import connectDB, { isMongoEnabled } from "@/lib/mongodb";
import { quotes as staticQuotes } from "@/lib/quotes";

export async function GET() {
  try {
    // Check if MongoDB is enabled
    if (isMongoEnabled()) {
      try {
        await connectDB();
        const Quote = (await import("@/lib/models/Quote")).default;
        
        // Basic counts
        const totalQuotes = await Quote.countDocuments();
        
        // Get unique authors and categories using aggregation
        const authorsResult = await Quote.distinct('author');
        const totalAuthors = authorsResult.length;
        const authors = authorsResult.sort();
        
        const categoriesResult = await Quote.distinct('category');
        const totalCategories = categoriesResult.length;
        const categories = categoriesResult.sort();
        
        // Calculate statistics using aggregation
        const stats = await Quote.aggregate([
          {
            $project: {
              textLength: { $strLenCP: "$text" },
              wordCount: {
                $size: {
                  $filter: {
                    input: { $split: ["$text", " "] },
                    cond: { $ne: ["$$this", ""] },
                  },
                },
              },
            },
          },
          {
            $group: {
              _id: null,
              totalChars: { $sum: "$textLength" },
              totalWords: { $sum: "$wordCount" },
              maxLength: { $max: "$textLength" },
              minLength: { $min: "$textLength" },
            },
          },
        ]);
        
        const statsData = stats[0] || {};
        const averageQuoteLength = totalQuotes > 0 ? Math.round(statsData.totalChars / totalQuotes) : 0;
        const averageWordsPerQuote = totalQuotes > 0 ? Math.round(statsData.totalWords / totalQuotes) : 0;
        
        // Find longest and shortest quotes using aggregation
        let longestQuote = null;
        let shortestQuote = null;
        
        if (totalQuotes > 0) {
          // Find longest quote
          const longestResult = await Quote.aggregate([
            {
              $project: {
                id: 1,
                text: 1,
                textLength: { $strLenCP: "$text" },
              },
            },
            {
              $sort: { textLength: -1 },
            },
            {
              $limit: 1,
            },
          ]);
          
          if (longestResult.length > 0) {
            longestQuote = {
              id: longestResult[0].id,
              text: longestResult[0].text,
              length: longestResult[0].textLength,
            };
          }
          
          // Find shortest quote
          const shortestResult = await Quote.aggregate([
            {
              $project: {
                id: 1,
                text: 1,
                textLength: { $strLenCP: "$text" },
              },
            },
            {
              $sort: { textLength: 1 },
            },
            {
              $limit: 1,
            },
          ]);
          
          if (shortestResult.length > 0) {
            shortestQuote = {
              id: shortestResult[0].id,
              text: shortestResult[0].text,
              length: shortestResult[0].textLength,
            };
          }
        }
        
        // Category breakdown
        const categoryBreakdown = await Quote.aggregate([
          {
            $group: {
              _id: "$category",
              count: { $sum: 1 },
            },
          },
          {
            $project: {
              _id: 0,
              name: "$_id",
              count: 1,
            },
          },
          {
            $sort: { count: -1 },
          },
        ]);
        
        // Top 5 authors by quote count
        const topAuthors = await Quote.aggregate([
          {
            $group: {
              _id: "$author",
              count: { $sum: 1 },
            },
          },
          {
            $project: {
              _id: 0,
              name: "$_id",
              count: 1,
            },
          },
          {
            $sort: { count: -1 },
          },
          {
            $limit: 5,
          },
        ]);
        
        return NextResponse.json({
          overview: {
            totalQuotes,
            totalAuthors,
            totalCategories,
            averageQuoteLength,
            averageWordsPerQuote,
            totalWords: statsData.totalWords || 0,
          },
          categoryBreakdown,
          topAuthors,
          quoteLengths: {
            longest: longestQuote || null,
            shortest: shortestQuote || null,
          },
          authors,
          categories,
        });
      } catch (dbError) {
        console.warn("Database query failed, using static quotes:", dbError.message);
      }
    }
    
    // Use static quotes (MongoDB disabled or error)
    const totalQuotes = staticQuotes.length;
    const authorsSet = new Set();
    const categoriesSet = new Set();
    const categoryMap = new Map();
    const authorMap = new Map();
    
    let totalChars = 0;
    let totalWords = 0;
    let maxLength = 0;
    let minLength = Infinity;
    let longestQuote = null;
    let shortestQuote = null;
    
    staticQuotes.forEach(quote => {
      authorsSet.add(quote.author);
      categoriesSet.add(quote.category);
      
      // Category breakdown
      const catCount = categoryMap.get(quote.category) || 0;
      categoryMap.set(quote.category, catCount + 1);
      
      // Author breakdown
      const authCount = authorMap.get(quote.author) || 0;
      authorMap.set(quote.author, authCount + 1);
      
      // Text statistics
      const textLength = quote.text.length;
      const wordCount = quote.text.split(/\s+/).filter(w => w.length > 0).length;
      totalChars += textLength;
      totalWords += wordCount;
      
      if (textLength > maxLength) {
        maxLength = textLength;
        longestQuote = {
          id: quote.id,
          text: quote.text,
          length: textLength,
        };
      }
      
      if (textLength < minLength) {
        minLength = textLength;
        shortestQuote = {
          id: quote.id,
          text: quote.text,
          length: textLength,
        };
      }
    });
    
    const totalAuthors = authorsSet.size;
    const totalCategories = categoriesSet.size;
    const authors = Array.from(authorsSet).sort();
    const categories = Array.from(categoriesSet).sort();
    const averageQuoteLength = totalQuotes > 0 ? Math.round(totalChars / totalQuotes) : 0;
    const averageWordsPerQuote = totalQuotes > 0 ? Math.round(totalWords / totalQuotes) : 0;
    
    // Category breakdown
    const categoryBreakdown = Array.from(categoryMap.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);
    
    // Top 5 authors
    const topAuthors = Array.from(authorMap.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
    
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
        longest: longestQuote || null,
        shortest: shortestQuote || null,
      },
      authors,
      categories,
      source: "static",
    });
  } catch (error) {
    console.error("Error fetching statistics:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

