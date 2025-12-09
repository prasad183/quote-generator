import { NextResponse } from "next/server";

// Map language codes to MyMemory API codes
const langMap = {
  es: "es",
  fr: "fr",
  de: "de",
  hi: "hi",
  zh: "zh",
  te: "te", // Telugu
};

// Translate text using MyMemory Translation API
async function translateText(text, targetLang) {
  if (targetLang === "en" || !text) return text;

  const apiLang = langMap[targetLang] || targetLang;

  try {
    const response = await fetch(
      `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=en|${apiLang}`
    );
    const data = await response.json();
    if (data.responseData && data.responseData.translatedText) {
      return data.responseData.translatedText;
    }
    return text;
  } catch (error) {
    console.error("Translation error:", error);
    return text;
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { text, targetLang } = body;

    // Validate input
    if (!text || typeof text !== "string") {
      return NextResponse.json(
        { error: "Text is required and must be a string" },
        { status: 400 }
      );
    }

    if (!targetLang || typeof targetLang !== "string") {
      return NextResponse.json(
        { error: "Target language is required and must be a string" },
        { status: 400 }
      );
    }

    // Validate language code
    const validLanguages = ["en", "es", "fr", "de", "hi", "zh", "te"];
    if (!validLanguages.includes(targetLang.toLowerCase())) {
      return NextResponse.json(
        { error: `Invalid language code. Supported languages: ${validLanguages.join(", ")}` },
        { status: 400 }
      );
    }

    // If target is English, return original text
    if (targetLang.toLowerCase() === "en") {
      return NextResponse.json({
        originalText: text,
        translatedText: text,
        targetLang: "en",
        success: true,
      });
    }

    // Translate the text
    const translatedText = await translateText(text, targetLang.toLowerCase());

    return NextResponse.json({
      originalText: text,
      translatedText: translatedText,
      targetLang: targetLang.toLowerCase(),
      success: true,
    });
  } catch (error) {
    console.error("Translation API error:", error);
    return NextResponse.json(
      { error: "Internal server error", details: error.message },
      { status: 500 }
    );
  }
}

