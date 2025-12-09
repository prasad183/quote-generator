import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Quote from "@/lib/models/Quote";
import { quotes } from "@/lib/quotes";

// Migration endpoint - call this once to migrate quotes from lib/quotes.js to MongoDB
// POST /api/migrate/quotes
export async function POST(request) {
  try {
    await connectDB();
    
    // Check if quotes already exist
    const existingQuotesCount = await Quote.countDocuments();
    
    let imported = 0;
    let skipped = 0;
    const errors = [];

    for (const quote of quotes) {
      try {
        // Check if quote with this ID already exists
        const existing = await Quote.findOne({ id: quote.id });
        
        if (existing) {
          skipped++;
          continue;
        }

        // Create new quote in MongoDB
        const newQuote = new Quote({
          id: quote.id,
          text: quote.text,
          author: quote.author,
          category: quote.category || 'general',
          createdAt: new Date(),
        });

        await newQuote.save();
        imported++;
      } catch (error) {
        if (error.code === 11000) {
          // Duplicate key error - quote already exists
          skipped++;
        } else {
          errors.push({
            quoteId: quote.id,
            error: error.message,
          });
        }
      }
    }

    const finalCount = await Quote.countDocuments();

    return NextResponse.json({
      success: true,
      message: "Migration completed",
      summary: {
        imported,
        skipped,
        errors: errors.length,
        totalInDatabase: finalCount,
      },
      ...(errors.length > 0 && { errorDetails: errors }),
    });
  } catch (error) {
    console.error("Error migrating quotes:", error);
    return NextResponse.json(
      { 
        success: false,
        error: "Migration failed",
        message: error.message 
      },
      { status: 500 }
    );
  }
}

// GET endpoint to check migration status
export async function GET() {
  try {
    await connectDB();
    
    const totalInDatabase = await Quote.countDocuments();
    const totalInFile = quotes.length;
    const missingCount = totalInFile - totalInDatabase;

    return NextResponse.json({
      migrationStatus: {
        totalInFile,
        totalInDatabase,
        missingCount,
        isComplete: missingCount === 0 && totalInFile > 0,
      },
    });
  } catch (error) {
    console.error("Error checking migration status:", error);
    return NextResponse.json(
      { error: "Error checking migration status", message: error.message },
      { status: 500 }
    );
  }
}

