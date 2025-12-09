import { NextResponse } from "next/server";
import connectDB, { isMongoEnabled } from "@/lib/mongodb";
import { quotes as staticQuotes } from "@/lib/quotes";

export async function GET(request, { params }) {
  try {
    await connectDB();
    // Handle params - in Next.js 15+, params might be a Promise
    let idParam;
    if (params instanceof Promise) {
      const resolvedParams = await params;
      idParam = resolvedParams?.id;
    } else {
      idParam = params?.id;
    }
    
    if (!idParam) {
      return NextResponse.json(
        { error: "Quote ID is required" },
        { status: 400 }
      );
    }
    
    const id = parseInt(String(idParam));
    
    // Validate ID
    if (isNaN(id) || id < 1) {
      return NextResponse.json(
        { error: "Invalid quote ID. ID must be a positive number." },
        { status: 400 }
      );
    }
    
    // Check if MongoDB is enabled
    if (isMongoEnabled()) {
      try {
        await connectDB();
        const Quote = (await import("@/lib/models/Quote")).default;
        
        // Find quote by ID in MongoDB
        const quote = await Quote.findOne({ id }).lean();
        
        if (quote) {
          // Format quote for response
          const formattedQuote = {
            id: quote.id,
            text: quote.text,
            author: quote.author,
            category: quote.category,
            createdAt: quote.createdAt ? new Date(quote.createdAt).toISOString() : new Date().toISOString(),
          };
          
          return NextResponse.json(formattedQuote);
        }
      } catch (dbError) {
        console.warn("Database query failed, using static quotes:", dbError.message);
      }
    }
    
    // Use static quotes (MongoDB disabled or error)
    const quote = staticQuotes.find(q => q.id === id);
    
    if (!quote) {
      return NextResponse.json(
        { error: `Quote with ID ${id} not found` },
        { status: 404 }
      );
    }
    
    // Format quote for response
    const formattedQuote = {
      id: quote.id,
      text: quote.text,
      author: quote.author,
      category: quote.category,
      createdAt: new Date().toISOString(),
    };
    
    return NextResponse.json(formattedQuote);
  } catch (error) {
    console.error("Error fetching quote by ID:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 }
    );
  }
}

