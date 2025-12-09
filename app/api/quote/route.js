import { NextResponse } from "next/server";
import { quotes as staticQuotes, formatQuoteForLegacy } from "@/lib/quotes";
import connectDB, { isMongoEnabled } from "@/lib/mongodb";

// Helper function to get random quote from static quotes with filters
function getRandomStaticQuote(author, category) {
  let filteredQuotes = [...staticQuotes];
  
  // Apply filters to static quotes
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
  
  if (filteredQuotes.length === 0) {
    return null;
  }
  
  const randomIndex = Math.floor(Math.random() * filteredQuotes.length);
  const randomQuote = filteredQuotes[randomIndex];
  
  return {
    id: randomQuote.id,
    text: randomQuote.text,
    author: randomQuote.author,
    category: randomQuote.category,
    createdAt: new Date().toISOString(),
  };
}

export async function GET(request) {
  // Parse search params once at the start
  const { searchParams } = new URL(request.url);
  const author = searchParams.get('author');
  const category = searchParams.get('category');
  
  try {
    // Check if MongoDB is enabled
    const mongoEnabled = isMongoEnabled();
    
    if (mongoEnabled) {
      await connectDB();
      const Quote = (await import("@/lib/models/Quote")).default;
      
      // Build MongoDB query
      const query = {};
      
      // Filter by author if provided (case-insensitive partial match)
      if (author) {
        query.author = { $regex: author.trim(), $options: 'i' };
      }
      
      // Filter by category if provided (case-insensitive exact match)
      if (category) {
        query.category = { $regex: new RegExp(`^${category.trim()}$`, 'i') };
      }
      
      try {
        // Get count of matching quotes
        const count = await Quote.countDocuments(query);
        
        // If database has quotes, use them
        if (count > 0) {
          // Get random quote from filtered list in MongoDB
          const randomSkip = Math.floor(Math.random() * count);
          const quotes = await Quote.find(query)
            .skip(randomSkip)
            .limit(1)
            .lean();
          
          const randomQuote = quotes[0];
          
          // Format quote for response
          const formattedQuote = {
            id: randomQuote.id,
            text: randomQuote.text,
            author: randomQuote.author,
            category: randomQuote.category,
            createdAt: randomQuote.createdAt ? new Date(randomQuote.createdAt).toISOString() : new Date().toISOString(),
          };
          
          // Return in legacy format for backward compatibility
          const legacyFormat = formatQuoteForLegacy(formattedQuote);
          
          return NextResponse.json({ 
            quote: legacyFormat,
            data: formattedQuote
          });
        }
      } catch (dbError) {
        console.warn("Database query failed, using static quotes:", dbError.message);
      }
    }
    
    // Use static quotes (either MongoDB is disabled or database is empty/error)
    const formattedQuote = getRandomStaticQuote(author, category);
    
    if (!formattedQuote) {
      return NextResponse.json(
        { 
          error: "No quotes found with the specified filters",
          hint: mongoEnabled ? "Database appears empty. Run migration: POST /api/migrate/quotes" : "MongoDB is disabled. Using static quotes only."
        },
        { status: 404 }
      );
    }
    
    // Return in legacy format for backward compatibility
    const legacyFormat = formatQuoteForLegacy(formattedQuote);
    
    return NextResponse.json({ 
      quote: legacyFormat,
      data: formattedQuote,
      source: "static"
    });
  } catch (error) {
    console.error("Error fetching random quote:", error);
    
    // Final fallback to static quotes
    const formattedQuote = getRandomStaticQuote(author, category);
    
    if (formattedQuote) {
      const legacyFormat = formatQuoteForLegacy(formattedQuote);
      
      return NextResponse.json({ 
        quote: legacyFormat,
        data: formattedQuote,
        source: "static",
        warning: "Using static quotes due to error"
      });
    }
    
    return NextResponse.json(
      { 
        error: "Internal server error",
        message: error.message || "Unable to fetch quotes"
      },
      { status: 500 }
    );
  }
}

