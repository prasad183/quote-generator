import { NextResponse } from "next/server";
import { quotes } from "@/lib/quotes";

export async function GET(request, { params }) {
  try {
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
    
    // Find quote by ID
    const quote = quotes.find(q => q.id === id);
    
    if (!quote) {
      return NextResponse.json(
        { error: `Quote with ID ${id} not found` },
        { status: 404 }
      );
    }
    
    return NextResponse.json(quote);
  } catch (error) {
    console.error("Error fetching quote by ID:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 }
    );
  }
}

