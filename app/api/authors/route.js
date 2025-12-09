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
        
        // Use MongoDB aggregation to group by author
        const authorStats = await Quote.aggregate([
          {
            $group: {
              _id: "$author",
              quoteCount: { $sum: 1 },
              categories: { $addToSet: "$category" },
            },
          },
          {
            $project: {
              _id: 0,
              name: "$_id",
              quoteCount: 1,
              categories: { $sortArray: { input: "$categories", sortBy: 1 } },
            },
          },
          {
            $sort: {
              quoteCount: -1,
              name: 1,
            },
          },
        ]);
        
        // Get total quotes count
        const totalQuotes = await Quote.countDocuments();
        
        return NextResponse.json({
          authors: authorStats,
          total: authorStats.length,
          totalQuotes,
        });
      } catch (dbError) {
        console.warn("Database query failed, using static quotes:", dbError.message);
      }
    }
    
    // Use static quotes (MongoDB disabled or error)
    const authorMap = new Map();
    
    staticQuotes.forEach(quote => {
      if (!authorMap.has(quote.author)) {
        authorMap.set(quote.author, {
          name: quote.author,
          quoteCount: 0,
          categories: new Set(),
        });
      }
      const author = authorMap.get(quote.author);
      author.quoteCount++;
      author.categories.add(quote.category);
    });
    
    const authorStats = Array.from(authorMap.values()).map(author => ({
      name: author.name,
      quoteCount: author.quoteCount,
      categories: Array.from(author.categories).sort(),
    })).sort((a, b) => {
      if (b.quoteCount !== a.quoteCount) {
        return b.quoteCount - a.quoteCount;
      }
      return a.name.localeCompare(b.name);
    });
    
    return NextResponse.json({
      authors: authorStats,
      total: authorStats.length,
      totalQuotes: staticQuotes.length,
      source: "static",
    });
  } catch (error) {
    console.error("Error fetching authors:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

