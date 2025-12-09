import { NextResponse } from "next/server";

// Import translations from the page component
// Since we can't directly import from page.js, we'll define a simplified version here
// In production, you might want to move translations to a shared file
const translations = {
  en: {
    home: "Home",
    search: "Search",
    browse: "Browse",
    submit: "Submit",
    authors: "Authors",
    stats: "Stats",
    favorites: "Favorites",
    settings: "Settings",
    collections: "Collections",
    quoteGenerator: "💡 Quote Generator",
    discoverShare: "Discover, Favo, and share inspiring quotes",
    getQuote: "Get Quote",
    copy: "Copy",
    copied: "Copied!",
    share: "Share",
    favorite: "Favorites",
    filterQuote: "🔍 Filter Quote",
    authorOptional: "Author (optional)",
    categoryOptional: "Category (optional)",
    searchQuotes: "Search Quotes",
    searchPlaceholder: "Enter search query...",
    allFields: "All Fields",
    textOnly: "Text Only",
    authorOnly: "Author Only",
    categoryOnly: "Category Only",
    submitQuote: "Submit Quote",
    quoteText: "Quote Text",
    author: "Author",
    category: "Category",
    browseAll: "Browse All Quotes",
    myCollections: "My Collections",
    createCollection: "Create Collection",
    collectionName: "Collection Name",
    save: "Save",
    cancel: "Cancel",
    delete: "Delete",
    edit: "Edit",
    addToCollection: "Add to Collection",
    removeFromCollection: "Remove from Collection",
    noCollections: "No collections yet. Create one to organize your quotes!",
    quotesInCollection: "quotes in this collection",
    loading: "Loading...",
    error: "Error",
    success: "Success",
    language: "Language",
    english: "English",
    spanish: "Spanish",
    french: "French",
    german: "German",
    hindi: "Hindi",
    chinese: "Chinese",
    telugu: "Telugu",
  },
  // Note: For brevity, only English is shown. In production, include all languages
  // The full translations object should be moved to a shared file
};

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const lang = searchParams.get("lang") || "en";

    // Validate language code
    const validLanguages = ["en", "es", "fr", "de", "hi", "zh", "te"];
    const targetLang = validLanguages.includes(lang.toLowerCase())
      ? lang.toLowerCase()
      : "en";

    // Get translations for the requested language
    const langTranslations = translations[targetLang] || translations.en;

    return NextResponse.json({
      language: targetLang,
      translations: langTranslations,
      success: true,
    });
  } catch (error) {
    console.error("Error fetching translations:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

