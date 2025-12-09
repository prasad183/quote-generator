import { NextResponse } from "next/server";

// Available languages with their metadata
const languages = [
  {
    code: "en",
    name: "English",
    nativeName: "English",
  },
  {
    code: "es",
    name: "Spanish",
    nativeName: "Español",
  },
  {
    code: "fr",
    name: "French",
    nativeName: "Français",
  },
  {
    code: "de",
    name: "German",
    nativeName: "Deutsch",
  },
  {
    code: "hi",
    name: "Hindi",
    nativeName: "हिंदी",
  },
  {
    code: "zh",
    name: "Chinese",
    nativeName: "中文",
  },
  {
    code: "te",
    name: "Telugu",
    nativeName: "తెలుగు",
  },
];

export async function GET() {
  try {
    return NextResponse.json({
      languages,
      count: languages.length,
      success: true,
    });
  } catch (error) {
    console.error("Error fetching languages:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

