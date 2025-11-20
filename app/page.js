"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";

const gradientPalettes = {
  vibrant: [
    "135deg, #7F00FF 0%, #E100FF 100%",
    "135deg, #00c6ff 0%, #0072ff 100%",
    "135deg, #f6d365 0%, #fda085 100%",
    "135deg, #ff0844 0%, #ffb199 100%",
    "135deg, #a18cd1 0%, #fbc2eb 100%",
    "135deg, #11998e 0%, #38ef7d 100%",
  ],
  twilight: [
    "135deg, #0f2027 0%, #203a43 50%, #2c5364 100%",
    "135deg, #141E30 0%, #243B55 100%",
    "135deg, #1f1c2c 0%, #928dab 100%",
    "135deg, #42275a 0%, #734b6d 100%",
  ],
  sunrise: [
    "135deg, #f8ffae 0%, #43c6ac 100%",
    "135deg, #fddb92 0%, #d1fdff 100%",
    "135deg, #fff1eb 0%, #ace0f9 100%",
    "135deg, #ffd3a5 0%, #fd6585 100%",
  ],
};

const paletteKeys = Object.keys(gradientPalettes);

const defaultQuote = {
  text: "Click the button to get inspired!",
  author: "",
};

function parseQuote(rawQuote) {
  if (!rawQuote) {
    return defaultQuote;
  }

  const [text, author] = rawQuote.split("–").map((part) => part?.trim());
  return {
    text: text ?? rawQuote,
    author: author ?? "Unknown",
  };
}

const formatPaletteLabel = (key) =>
  key.charAt(0).toUpperCase() + key.slice(1).replace("-", " ");

export default function Home() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [paletteKey, setPaletteKey] = useState("vibrant");
  const [backgroundIndex, setBackgroundIndex] = useState(() =>
    Math.floor(Math.random() * gradientPalettes.vibrant.length),
  );
  const [quote, setQuote] = useState(defaultQuote);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [history, setHistory] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [copied, setCopied] = useState(false);
  const [fetchCount, setFetchCount] = useState(0);
  const [autoPlay, setAutoPlay] = useState(false);
  const [autoPlaySeconds, setAutoPlaySeconds] = useState(20);
  const [countdown, setCountdown] = useState(20);
  const [fontSize, setFontSize] = useState(22);
  const [readingMode, setReadingMode] = useState(false);
  const [favoriteQuery, setFavoriteQuery] = useState("");
  const [speechSupport, setSpeechSupport] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const speechUtteranceRef = useRef(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState(null);
  const [showSearch, setShowSearch] = useState(false);
  const [searchField, setSearchField] = useState("all");
  const [searchPage, setSearchPage] = useState(1);
  const [searchPagination, setSearchPagination] = useState(null);
  const [quoteId, setQuoteId] = useState("");
  const [quoteIdLoading, setQuoteIdLoading] = useState(false);
  const [quoteIdError, setQuoteIdError] = useState(null);
  const [newQuoteText, setNewQuoteText] = useState("");
  const [newQuoteAuthor, setNewQuoteAuthor] = useState("");
  const [newQuoteCategory, setNewQuoteCategory] = useState("general");
  const [submitLoading, setSubmitLoading] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [authors, setAuthors] = useState([]);
  const [authorsLoading, setAuthorsLoading] = useState(false);
  const [authorsError, setAuthorsError] = useState(null);
  const [showAuthors, setShowAuthors] = useState(false);
  const [stats, setStats] = useState(null);
  const [statsLoading, setStatsLoading] = useState(false);
  const [statsError, setStatsError] = useState(null);
  const [showStats, setShowStats] = useState(false);
  const [activeTab, setActiveTab] = useState("home");
  const [allQuotes, setAllQuotes] = useState([]);
  const [quotesLoading, setQuotesLoading] = useState(false);
  const [quotesPage, setQuotesPage] = useState(1);
  const [quotesPagination, setQuotesPagination] = useState(null);

  // Check authentication on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch("/api/auth/me", {
          credentials: "include", // Ensure cookies are sent
        });
        if (response.ok) {
          const data = await response.json();
          setUser(data.user);
          setIsAuthenticated(true);
        } else {
          router.push("/login");
        }
      } catch (err) {
        router.push("/login");
      } finally {
        setAuthLoading(false);
      }
    };
    checkAuth();
  }, [router]);

  // Handle logout
  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include", // Ensure cookies are sent
      });
      router.push("/login");
      router.refresh();
    } catch (err) {
      console.error("Logout error:", err);
    }
  };

  useEffect(() => {
    if (typeof window === "undefined" || !isAuthenticated) {
      return;
    }

    try {
      const storedPalette = window.localStorage.getItem("quote-palette");
      if (storedPalette && storedPalette in gradientPalettes) {
        setPaletteKey(storedPalette);
        setBackgroundIndex(
          Math.floor(Math.random() * gradientPalettes[storedPalette].length),
        );
      }
    } catch {
      // ignore palette retrieval errors
    }

    try {
      const storedFavorites = window.localStorage.getItem("quote-favorites");
      if (storedFavorites) {
        const parsed = JSON.parse(storedFavorites);
        if (Array.isArray(parsed)) {
          setFavorites(parsed);
        }
      }
    } catch {
      // ignore favorites retrieval errors
    }

    try {
      const storedFontSize = window.localStorage.getItem("quote-font-size");
      if (storedFontSize) {
        const parsed = Number(storedFontSize);
        if (!Number.isNaN(parsed) && parsed >= 16 && parsed <= 38) {
          setFontSize(parsed);
        }
      }
      const storedReadingMode = window.localStorage.getItem(
        "quote-reading-mode",
      );
      if (storedReadingMode) {
        setReadingMode(storedReadingMode === "true");
      }
    } catch {
      // ignore preference retrieval errors
    }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    try {
      window.localStorage.setItem("quote-palette", paletteKey);
    } catch {
      // ignore write failures
    }
  }, [paletteKey]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    try {
      window.localStorage.setItem(
        "quote-favorites",
        JSON.stringify(favorites.slice(0, 10)),
      );
    } catch {
      // ignore write failures
    }
  }, [favorites]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    try {
      window.localStorage.setItem("quote-font-size", String(fontSize));
      window.localStorage.setItem("quote-reading-mode", String(readingMode));
    } catch {
      // ignore write failures
    }
  }, [fontSize, readingMode]);

  useEffect(() => {
    setCountdown(autoPlaySeconds);
  }, [autoPlaySeconds]);

  const currentGradient = useMemo(() => {
    const palette = gradientPalettes[paletteKey];
    return palette[backgroundIndex % palette.length];
  }, [backgroundIndex, paletteKey]);

  const changeBackground = useCallback(() => {
    const palette = gradientPalettes[paletteKey];

    if (palette.length <= 1) {
      return;
    }

    setBackgroundIndex((prev) => {
      let next = Math.floor(Math.random() * palette.length);
      if (next === prev) {
        next = (next + 1) % palette.length;
      }
      return next;
    });
  }, [paletteKey]);

  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const hasSpeech =
      "speechSynthesis" in window && "SpeechSynthesisUtterance" in window;
    setSpeechSupport(hasSpeech);

    return () => {
      if (hasSpeech) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const getQuote = useCallback(
    async (isInitialLoad = false) => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch("/api/quote", { cache: "no-store" });

        if (!response.ok) {
          throw new Error("Unable to fetch a new quote right now.");
        }

        const data = await response.json();
        const nextQuote = parseQuote(data.quote);

        setQuote((prevQuote) => {
          if (!isInitialLoad && prevQuote.text !== defaultQuote.text) {
            setHistory((prevHistory) => {
              const updated = [
                {
                  id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
                  ...prevQuote,
                },
                ...prevHistory,
              ];
              return updated.slice(0, 6);
            });
          }

          return nextQuote;
        });

        if (!isInitialLoad) {
          setFetchCount((count) => count + 1);
          if (autoPlay) {
            setCountdown(autoPlaySeconds);
          }
        }

        setCopied(false);
        if (speechSupport && typeof window !== "undefined") {
          window.speechSynthesis.cancel();
          speechUtteranceRef.current = null;
          setIsSpeaking(false);
        }
        changeBackground();
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Something went wrong while fetching the quote.",
        );
      } finally {
        setLoading(false);
      }
    },
    [autoPlay, autoPlaySeconds, changeBackground, speechSupport],
  );

  useEffect(() => {
    if (isAuthenticated) {
      void getQuote(true);
    }
  }, [getQuote, isAuthenticated]);

  useEffect(() => {
    if (!autoPlay || !isMounted) {
      return;
    }

    setCountdown(autoPlaySeconds);

    const intervalId = window.setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          void getQuote();
          return autoPlaySeconds;
        }
        return prev - 1;
      });
    }, 1000);

    return () => window.clearInterval(intervalId);
  }, [autoPlay, autoPlaySeconds, getQuote, isMounted]);

  const copyQuote = useCallback(async () => {
    if (!navigator?.clipboard) {
      setError("Clipboard is not available in this browser.");
      return;
    }

    try {
      await navigator.clipboard.writeText(`"${quote.text}" — ${quote.author}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Could not copy the quote. Please try again.",
      );
    }
  }, [quote]);

  const shareQuote = useCallback(async () => {
    if (!navigator?.share) {
      await copyQuote();
      return;
    }

    try {
      await navigator.share({
        title: "Inspiring Quote",
        text: `"${quote.text}" — ${quote.author}`,
      });
    } catch {
      // Ignore share cancellation silently
    }
  }, [copyQuote, quote]);

  const stopSpeaking = useCallback(() => {
    if (!speechSupport || typeof window === "undefined") {
      return;
    }

    window.speechSynthesis.cancel();
    speechUtteranceRef.current = null;
    setIsSpeaking(false);
  }, [speechSupport]);

  const speakQuote = useCallback(() => {
    if (!speechSupport || typeof window === "undefined" || !quote.text) {
      return;
    }

    try {
      window.speechSynthesis.cancel();
      const Utterance =
        window.SpeechSynthesisUtterance ??
        (typeof SpeechSynthesisUtterance !== "undefined"
          ? SpeechSynthesisUtterance
          : null);
      if (!Utterance) {
        setSpeechSupport(false);
        return;
      }
      const utterance = new Utterance(
        quote.author
          ? `${quote.text}. ${quote.author}`
          : quote.text,
      );
      utterance.onend = () => {
        setIsSpeaking(false);
        speechUtteranceRef.current = null;
      };
      utterance.onerror = () => {
        setIsSpeaking(false);
        speechUtteranceRef.current = null;
      };
      speechUtteranceRef.current = utterance;
      setIsSpeaking(true);
      window.speechSynthesis.speak(utterance);
    } catch (err) {
      setIsSpeaking(false);
      speechUtteranceRef.current = null;
      setError(
        err instanceof Error
          ? err.message
          : "Unable to play the quote using text-to-speech.",
      );
    }
  }, [quote.author, quote.text, speechSupport]);

  const addFavorite = useCallback(() => {
    const isDefault = quote.text === defaultQuote.text;
    if (isDefault) {
      return;
    }

    setFavorites((prev) => {
      const alreadySaved = prev.some(
        (fav) => fav.text === quote.text && fav.author === quote.author,
      );
      if (alreadySaved) {
        return prev;
      }

      const nextFavorites = [
        {
          id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
          ...quote,
        },
        ...prev,
      ];

      return nextFavorites.slice(0, 10);
    });
  }, [quote]);

  const removeFavorite = useCallback((id) => {
    setFavorites((prev) => prev.filter((fav) => fav.id !== id));
  }, []);

  const restoreQuote = useCallback(
    (entry) => {
      stopSpeaking();
      setQuote(entry);
    },
    [stopSpeaking],
  );

  const toggleAutoPlay = useCallback(() => {
    setAutoPlay((prev) => {
      if (prev) {
        setCountdown(autoPlaySeconds);
      }
      return !prev;
    });
  }, [autoPlaySeconds]);

  const cyclePalette = useCallback(() => {
    const currentIndex = paletteKeys.indexOf(paletteKey);
    const nextKey = paletteKeys[(currentIndex + 1) % paletteKeys.length];
    setPaletteKey(nextKey);
  }, [paletteKey]);

  const searchQuotes = useCallback(
    async (query, field = "all", page = 1) => {
      if (!query || query.trim().length === 0) {
        setSearchResults([]);
        setSearchError(null);
        return;
      }

      try {
        setSearchLoading(true);
        setSearchError(null);

        const params = new URLSearchParams({
          q: query.trim(),
          field,
          page: page.toString(),
          limit: "10",
        });

        const response = await fetch(`/api/quotes/search?${params}`, {
          cache: "no-store",
        });

        if (!response.ok) {
          throw new Error("Unable to search quotes right now.");
        }

        const data = await response.json();
        setSearchResults(data.results || []);
        setSearchPagination(data.pagination || null);
        setSearchPage(page);
      } catch (err) {
        setSearchError(
          err instanceof Error
            ? err.message
            : "Something went wrong while searching quotes.",
        );
        setSearchResults([]);
      } finally {
        setSearchLoading(false);
      }
    },
    [],
  );

  const handleSearchSubmit = useCallback(
    (e) => {
      e.preventDefault();
      if (searchQuery.trim().length > 0) {
        setShowSearch(true);
        void searchQuotes(searchQuery, searchField, 1);
      }
    },
    [searchQuery, searchField, searchQuotes],
  );

  const handleSearchResultClick = useCallback(
    (result) => {
      stopSpeaking();
      setQuote({
        text: result.text,
        author: result.author,
      });
      setShowSearch(false);
    },
    [stopSpeaking],
  );

  const fetchQuoteById = useCallback(
    async (id) => {
      // Handle both string and number inputs
      const idString = String(id || "").trim();
      if (idString.length === 0) {
        setQuoteIdError("Please enter a quote ID");
        return;
      }

      const quoteIdNum = parseInt(idString);
      if (isNaN(quoteIdNum) || quoteIdNum < 1) {
        setQuoteIdError("Quote ID must be a positive number");
        return;
      }

      try {
        setQuoteIdLoading(true);
        setQuoteIdError(null);

        const response = await fetch(`/api/quotes/${quoteIdNum}`, {
          cache: "no-store",
        });

        if (!response.ok) {
          // Try to get error message from response
          let errorMessage = "Unable to fetch quote right now.";
          try {
            const errorData = await response.json();
            if (errorData.error) {
              errorMessage = errorData.error;
            }
          } catch {
            // If response is not JSON, use default message
            if (response.status === 404) {
              errorMessage = `Quote with ID ${quoteIdNum} not found`;
            } else if (response.status === 400) {
              errorMessage = "Invalid quote ID";
            }
          }
          throw new Error(errorMessage);
        }

        const data = await response.json();
        stopSpeaking();
        setQuote({
          text: data.text,
          author: data.author,
        });
        setQuoteId("");
      } catch (err) {
        setQuoteIdError(
          err instanceof Error
            ? err.message
            : "Something went wrong while fetching the quote.",
        );
      } finally {
        setQuoteIdLoading(false);
      }
    },
    [stopSpeaking],
  );

  const handleQuoteIdSubmit = useCallback(
    (e) => {
      e.preventDefault();
      const idString = String(quoteId || "").trim();
      if (idString.length > 0) {
        void fetchQuoteById(idString);
      } else {
        setQuoteIdError("Please enter a quote ID");
      }
    },
    [quoteId, fetchQuoteById],
  );

  const submitNewQuote = useCallback(
    async (e) => {
      e.preventDefault();

      // Reset states
      setSubmitError(null);
      setSubmitSuccess(false);

      // Validation
      if (!newQuoteText.trim()) {
        setSubmitError("Quote text is required");
        return;
      }

      if (newQuoteText.trim().length > 500) {
        setSubmitError("Quote text must be 500 characters or less");
        return;
      }

      if (!newQuoteAuthor.trim()) {
        setSubmitError("Author is required");
        return;
      }

      if (newQuoteAuthor.trim().length > 100) {
        setSubmitError("Author name must be 100 characters or less");
        return;
      }

      try {
        setSubmitLoading(true);

        const response = await fetch("/api/quotes", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            text: newQuoteText.trim(),
            author: newQuoteAuthor.trim(),
            category: newQuoteCategory,
          }),
        });

        if (!response.ok) {
          let errorMessage = "Unable to submit quote right now.";
          try {
            const errorData = await response.json();
            if (errorData.error) {
              errorMessage = errorData.error;
            }
          } catch {
            // If response is not JSON, use default message
          }
          throw new Error(errorMessage);
        }

        const data = await response.json();
        
        // Show success message
        setSubmitSuccess(true);
        
        // Clear form
        setNewQuoteText("");
        setNewQuoteAuthor("");
        setNewQuoteCategory("general");
        
        // Optionally load the new quote
        setTimeout(() => {
          setQuote({
            text: data.text,
            author: data.author,
          });
          setSubmitSuccess(false);
        }, 1500);
      } catch (err) {
        setSubmitError(
          err instanceof Error
            ? err.message
            : "Something went wrong while submitting the quote.",
        );
      } finally {
        setSubmitLoading(false);
      }
    },
    [newQuoteText, newQuoteAuthor, newQuoteCategory],
  );

  const fetchAuthors = useCallback(async () => {
    try {
      setAuthorsLoading(true);
      setAuthorsError(null);

      const response = await fetch("/api/authors", {
        cache: "no-store",
      });

      if (!response.ok) {
        throw new Error("Unable to fetch authors right now.");
      }

      const data = await response.json();
      setAuthors(data.authors || []);
      setShowAuthors(true);
    } catch (err) {
      setAuthorsError(
        err instanceof Error
          ? err.message
          : "Something went wrong while fetching authors.",
      );
    } finally {
      setAuthorsLoading(false);
    }
  }, []);

  const fetchStats = useCallback(async () => {
    try {
      setStatsLoading(true);
      setStatsError(null);

      const response = await fetch("/api/stats", {
        cache: "no-store",
      });

      if (!response.ok) {
        throw new Error("Unable to fetch statistics right now.");
      }

      const data = await response.json();
      setStats(data);
      setShowStats(true);
    } catch (err) {
      setStatsError(
        err instanceof Error
          ? err.message
          : "Something went wrong while fetching statistics.",
      );
    } finally {
      setStatsLoading(false);
    }
  }, []);

  const fetchAllQuotes = useCallback(async (page = 1, limit = 10) => {
    try {
      setQuotesLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
      });

      const response = await fetch(`/api/quotes?${params}`, {
        cache: "no-store",
      });

      if (!response.ok) {
        throw new Error("Unable to fetch quotes right now.");
      }

      const data = await response.json();
      setAllQuotes(data.quotes || []);
      setQuotesPagination(data.pagination || null);
      setQuotesPage(page);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong while fetching quotes.",
      );
    } finally {
      setQuotesLoading(false);
    }
  }, []);

  const nextPaletteLabel = useMemo(() => {
    const currentIndex = paletteKeys.indexOf(paletteKey);
    const nextKey = paletteKeys[(currentIndex + 1) % paletteKeys.length];
    return formatPaletteLabel(nextKey);
  }, [paletteKey]);

  useEffect(() => {
    if (!isMounted) {
      return;
    }

    const handler = (event) => {
      const target = event.target;
      if (
        target instanceof HTMLElement &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.isContentEditable)
      ) {
        return;
      }

      const key = event.key.toLowerCase();

      if (event.key === " " || event.code === "Space") {
        event.preventDefault();
        void getQuote();
        return;
      }

      if (key === "f") {
        event.preventDefault();
        addFavorite();
        return;
      }

      if (key === "s" && speechSupport) {
        event.preventDefault();
        if (isSpeaking) {
          stopSpeaking();
        } else {
          speakQuote();
        }
        return;
      }

      if (key === "c") {
        event.preventDefault();
        void copyQuote();
        return;
      }

      if (key === "p") {
        event.preventDefault();
        toggleAutoPlay();
        return;
      }

      if (key === "escape") {
        stopSpeaking();
        if (showSearch) {
          setShowSearch(false);
          setSearchQuery("");
          setSearchResults([]);
        }
      }

      if (key === "/" && !showSearch) {
        event.preventDefault();
        const searchInput = document.querySelector('input[type="text"][placeholder*="Search quotes"]');
        if (searchInput) {
          searchInput.focus();
        }
      }
    };

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [
    addFavorite,
    copyQuote,
    getQuote,
    isMounted,
    isSpeaking,
    showSearch,
    speakQuote,
    speechSupport,
    stopSpeaking,
    toggleAutoPlay,
  ]);

  const infoBarStyles = {
    display: "flex",
    flexWrap: "wrap",
    gap: 12,
    justifyContent: "center",
  };

  const infoPillStyles = {
    padding: "10px 16px",
    borderRadius: 999,
    backgroundColor: "rgba(15, 23, 42, 0.05)",
    border: "1px solid rgba(148, 163, 184, 0.3)",
    fontSize: 14,
    fontWeight: 500,
    display: "flex",
    alignItems: "center",
    gap: 8,
  };

  const controlsGridStyles = {
    display: "grid",
    gap: 18,
    gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
  };

  const controlCardStyles = {
    backgroundColor: "rgba(255, 255, 255, 0.75)",
    borderRadius: 20,
    padding: "18px 20px",
    boxShadow: "0 16px 32px rgba(15, 23, 42, 0.15)",
    textAlign: "left",
  };

  const buttonStyles = {
    base: {
      padding: "16px 24px",
      border: "none",
      fontSize: 16,
      borderRadius: 16,
      cursor: "pointer",
      transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
      fontWeight: 600,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      gap: 10,
      minWidth: 160,
      position: "relative",
      overflow: "hidden",
    },
    primary: {
      background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      color: "white",
      boxShadow: "0 10px 30px rgba(102, 126, 234, 0.4), 0 0 0 0 rgba(102, 126, 234, 0.5)",
    },
    secondary: {
      background: "rgba(255, 255, 255, 0.9)",
      color: "#0f172a",
      border: "1px solid rgba(255, 255, 255, 0.5)",
      boxShadow: "0 8px 24px rgba(0, 0, 0, 0.1), 0 0 0 1px rgba(255, 255, 255, 0.2) inset",
      backdropFilter: "blur(10px)",
    },
    outline: {
      background: "rgba(255, 255, 255, 0.1)",
      color: "#0f172a",
      border: "1px solid rgba(255, 255, 255, 0.3)",
      boxShadow: "0 4px 12px rgba(0, 0, 0, 0.05)",
      backdropFilter: "blur(10px)",
    },
  };

  const paletteFriendlyName = formatPaletteLabel(paletteKey);
  const isDefaultQuote = quote.text === defaultQuote.text;
  const isFavorite = favorites.some(
    (fav) => fav.text === quote.text && fav.author === quote.author,
  );
  const autoPlayProgress =
    autoPlay && autoPlaySeconds
      ? Math.min(
          100,
          Math.max(0, ((autoPlaySeconds - countdown) / autoPlaySeconds) * 100),
        )
      : 0;

  const visibleFavorites = useMemo(() => {
    const query = favoriteQuery.trim().toLowerCase();
    if (!query) {
      return favorites;
    }

    return favorites.filter((fav) =>
      `${fav.text} ${fav.author}`.toLowerCase().includes(query),
    );
  }, [favoriteQuery, favorites]);

  const favoriteStats = useMemo(() => {
    if (!favorites.length) {
      return null;
    }

    const authorCounts = favorites.reduce((acc, fav) => {
      const key = fav.author || "Unknown";
      acc[key] = (acc[key] ?? 0) + 1;
      return acc;
    }, {});

    const entries = Object.entries(authorCounts).sort(
      (a, b) => b[1] - a[1],
    );
    const [topAuthor, topCount] = entries[0];

    return {
      distinctAuthors: entries.length,
      topAuthor,
      topCount,
    };
  }, [favorites]);

  const appStyles = {
    minHeight: "100vh",
    margin: 0,
    display: "flex",
    flexDirection: "column",
    padding: "20px",
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)",
    backgroundSize: "400% 400%",
    backgroundImage: `
      radial-gradient(circle at 20% 50%, rgba(255, 255, 255, 0.1) 0%, transparent 50%),
      radial-gradient(circle at 80% 80%, rgba(255, 255, 255, 0.08) 0%, transparent 50%),
      radial-gradient(circle at 40% 20%, rgba(255, 255, 255, 0.06) 0%, transparent 50%),
      radial-gradient(circle at 60% 90%, rgba(255, 255, 255, 0.1) 0%, transparent 50%),
      radial-gradient(circle at 10% 10%, rgba(255, 255, 255, 0.05) 0%, transparent 40%),
      radial-gradient(circle at 90% 90%, rgba(255, 255, 255, 0.05) 0%, transparent 40%)
    `,
    animation: "gradientShift 15s ease infinite",
    position: "relative",
    fontFamily: "'Poppins', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    color: "#111827",
    overflow: "auto",
  };

  const cardStyles = {
    width: "100%",
    maxWidth: 1200,
    background: "rgba(255, 255, 255, 0.95)",
    borderRadius: 32,
    padding: 40,
    boxShadow: "0 30px 80px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(255, 255, 255, 0.2) inset, 0 0 100px rgba(102, 126, 234, 0.1)",
    backdropFilter: "blur(30px) saturate(180%)",
    WebkitBackdropFilter: "blur(30px) saturate(180%)",
    display: "flex",
    flexDirection: "column",
    gap: 28,
    margin: "0 auto",
    border: "1px solid rgba(255, 255, 255, 0.4)",
    transition: "transform 0.3s ease, box-shadow 0.3s ease",
  };

  const quoteCardStyles = useMemo(() => {
    const defaultBackground =
      paletteKey === "twilight"
        ? "linear-gradient(135deg, rgba(102, 126, 234, 0.95), rgba(118, 75, 162, 0.9))"
        : "linear-gradient(135deg, rgba(102, 126, 234, 0.9), rgba(240, 147, 251, 0.85))";

    return {
      background: readingMode
        ? "rgba(255, 255, 255, 0.98)"
        : defaultBackground,
      color: readingMode ? "#0f172a" : "white",
      borderRadius: 28,
      padding: "48px 40px",
      position: "relative",
      boxShadow: readingMode
        ? "0 24px 60px rgba(15, 23, 42, 0.2), 0 0 0 1px rgba(0, 0, 0, 0.05) inset"
        : "0 25px 60px rgba(102, 126, 234, 0.4), 0 0 0 1px rgba(255, 255, 255, 0.1) inset, 0 0 80px rgba(102, 126, 234, 0.2)",
      minHeight: 220,
      overflow: "hidden",
      transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
      animation: "fadeIn 0.6s ease-out",
    };
  }, [paletteKey, readingMode]);

  const quoteTextStyles = useMemo(
    () => ({
      fontSize,
      lineHeight: 1.8,
      marginBottom: 28,
      fontWeight: 500,
      fontFamily: "'Playfair Display', serif",
      textShadow: readingMode
        ? "none"
        : "0 2px 8px rgba(0, 0, 0, 0.15), 0 0 20px rgba(0, 0, 0, 0.1)",
      color: readingMode ? "#0f172a" : "white",
      transition: "all 0.3s ease",
      letterSpacing: "0.02em",
    }),
    [fontSize, readingMode],
  );

  const quoteAuthorStyles = useMemo(
    () => ({
      fontSize: Math.max(18, fontSize - 3),
      opacity: readingMode ? 0.8 : 0.9,
      fontStyle: "italic",
      letterSpacing: "0.05em",
      color: readingMode ? "#1f2937" : "rgba(255, 255, 255, 0.95)",
      transition: "all 0.3s ease",
      fontWeight: 400,
      fontFamily: "'Poppins', sans-serif",
    }),
    [fontSize, readingMode],
  );

  const sliderTrackStyles = {
    width: "100%",
    marginTop: 12,
    appearance: "none",
    height: 6,
    borderRadius: 999,
    background: "rgba(148, 163, 184, 0.35)",
    outline: "none",
  };

  const sliderThumbStyles = `
    input[type=range]::-webkit-slider-thumb {
      appearance: none;
      width: 18px;
      height: 18px;
      border-radius: 50%;
      background: #0284c7;
      cursor: pointer;
      box-shadow: 0 0 0 4px rgba(2, 132, 199, 0.15);
      transition: transform 120ms ease;
    }
    input[type=range]::-moz-range-thumb {
      width: 18px;
      height: 18px;
      border-radius: 50%;
      background: #0284c7;
      cursor: pointer;
      box-shadow: 0 0 0 4px rgba(2, 132, 199, 0.15);
      transition: transform 120ms ease;
    }
    input[type=range]:active::-webkit-slider-thumb {
      transform: scale(1.15);
    }
    input[type=range]:active::-moz-range-thumb {
      transform: scale(1.15);
    }
  `;

  const backgroundStyles = `
    ${sliderThumbStyles}
    @keyframes float {
      0%, 100% { transform: translateY(0px) rotate(0deg); }
      50% { transform: translateY(-20px) rotate(5deg); }
    }
    @keyframes pulse {
      0%, 100% { opacity: 0.5; transform: scale(1); }
      50% { opacity: 0.9; transform: scale(1.05); }
    }
    @keyframes shimmer {
      0% { background-position: -200% center; }
      100% { background-position: 200% center; }
    }
    @keyframes gradientShift {
      0% { background-position: 0% 50%; }
      50% { background-position: 100% 50%; }
      100% { background-position: 0% 50%; }
    }
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(20px); }
      to { opacity: 1; transform: translateY(0); }
    }
    @keyframes slideIn {
      from { opacity: 0; transform: translateX(-20px); }
      to { opacity: 1; transform: translateX(0); }
    }
    @keyframes rotate {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
    main {
      background-size: 100% 100%, 100% 100%, 100% 100%, 100% 100%, 40px 40px, 40px 40px;
      animation: gradientShift 20s ease infinite;
    }
    main::before {
      content: '';
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: 
        radial-gradient(circle at 15% 25%, rgba(255, 255, 255, 0.15) 0%, transparent 40%),
        radial-gradient(circle at 85% 75%, rgba(255, 255, 255, 0.15) 0%, transparent 40%),
        radial-gradient(circle at 50% 50%, rgba(255, 255, 255, 0.1) 0%, transparent 60%),
        radial-gradient(circle at 25% 70%, rgba(139, 116, 249, 0.2) 0%, transparent 45%),
        radial-gradient(circle at 75% 30%, rgba(147, 51, 234, 0.2) 0%, transparent 45%),
        radial-gradient(circle at 90% 10%, rgba(99, 102, 241, 0.15) 0%, transparent 40%),
        radial-gradient(circle at 10% 90%, rgba(120, 119, 198, 0.15) 0%, transparent 40%);
      pointer-events: none;
      z-index: 0;
      animation: pulse 12s ease-in-out infinite;
    }
    main::after {
      content: '';
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: 
        repeating-conic-gradient(
          from 0deg at 50% 50%,
          transparent 0deg,
          rgba(255, 255, 255, 0.03) 2deg,
          transparent 4deg,
          rgba(255, 255, 255, 0.03) 6deg
        ),
        radial-gradient(
          circle,
          transparent 20%,
          rgba(255, 255, 255, 0.05) 21%,
          rgba(255, 255, 255, 0.05) 22%,
          transparent 23%
        );
      background-size: 100% 100%, 200px 200px;
      pointer-events: none;
      z-index: 0;
      animation: shimmer 25s linear infinite;
      opacity: 0.7;
    }
    main > * {
      position: relative;
      z-index: 1;
    }
  `;

  // Show loading state while checking authentication
  if (authLoading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
        }}
      >
        <div
          style={{
            backgroundColor: "rgba(255, 255, 255, 0.98)",
            borderRadius: 24,
            padding: "40px",
            textAlign: "center",
          }}
        >
          <p style={{ fontSize: 16, color: "#64748b" }}>Loading...</p>
        </div>
      </div>
    );
  }

  // Don't render if not authenticated (will redirect)
  if (!isAuthenticated) {
    return null;
  }

  return (
    <>
      <style>{backgroundStyles}</style>
      <main style={appStyles}>
        <section style={cardStyles}>
          <header style={{ textAlign: "center", marginBottom: 30 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16, flexWrap: "wrap", gap: 12 }}>
              {user && (
                <div style={{ fontSize: 14, color: "#64748b", fontWeight: 500 }}>
                  👤 {user.name}
                </div>
              )}
              <h1 style={{ 
                fontSize: 48, 
                fontWeight: 800, 
                marginBottom: 8, 
                flex: 1, 
                textAlign: "center",
                fontFamily: "'Playfair Display', serif",
                background: "linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
                letterSpacing: "-0.02em",
                textShadow: "0 0 30px rgba(102, 126, 234, 0.3)",
              }}>
                💡 Quote Generator
              </h1>
              <button
                onClick={handleLogout}
                style={{
                  padding: "10px 18px",
                  borderRadius: 12,
                  border: "none",
                  fontSize: 14,
                  fontWeight: 600,
                  cursor: "pointer",
                  backgroundColor: "rgba(248, 113, 113, 0.18)",
                  color: "#b45309",
                  transition: "all 0.2s ease",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = "rgba(248, 113, 113, 0.3)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "rgba(248, 113, 113, 0.18)";
                }}
              >
                🚪 Logout
              </button>
            </div>
            <p style={{ 
              fontSize: 18, 
              fontWeight: 500, 
              color: "#64748b", 
              marginBottom: 32,
              fontFamily: "'Poppins', sans-serif",
              letterSpacing: "0.01em",
            }}>
              Discover, save, and share inspiring quotes
            </p>
            
            {/* Tab Navigation */}
            <div
              style={{
                display: "flex",
                gap: 8,
                flexWrap: "wrap",
                justifyContent: "center",
                marginBottom: 24,
              }}
            >
              {[
                { id: "home", label: "🏠 Home", icon: "🏠" },
                { id: "search", label: "🔍 Search", icon: "🔍" },
                { id: "browse", label: "📚 Browse", icon: "📚" },
                { id: "submit", label: "✍️ Submit", icon: "✍️" },
                { id: "authors", label: "👥 Authors", icon: "👥" },
                { id: "stats", label: "📊 Stats", icon: "📊" },
                { id: "favorites", label: "⭐ Favorites", icon: "⭐" },
                { id: "settings", label: "⚙️ Settings", icon: "⚙️" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id);
                    if (tab.id === "browse") {
                      void fetchAllQuotes(1, 10);
                    } else if (tab.id === "authors") {
                      void fetchAuthors();
                    } else if (tab.id === "stats") {
                      void fetchStats();
                    }
                  }}
                  style={{
                    padding: "12px 20px",
                    borderRadius: 12,
                    border: "none",
                    fontSize: 14,
                    fontWeight: 600,
                    cursor: "pointer",
                    transition: "all 0.2s ease",
                    backgroundColor:
                      activeTab === tab.id
                        ? "rgba(255, 255, 255, 0.95)"
                        : "rgba(255, 255, 255, 0.2)",
                    color:
                      activeTab === tab.id ? "#11998e" : "white",
                    boxShadow:
                      activeTab === tab.id
                        ? "0 4px 12px rgba(0, 0, 0, 0.15)"
                        : "none",
                  }}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </header>

          {/* Home Tab - Main Quote Display */}
          {activeTab === "home" && (
            <div>
              <article style={quoteCardStyles}>
                <span
                  aria-hidden="true"
                  style={{
                    fontSize: 72,
                    position: "absolute",
                    top: -20,
                    left: 32,
                    opacity: 0.15,
                    fontWeight: 700,
                  }}
                >
                  "
                </span>
                <p style={quoteTextStyles}>
                  {loading ? "Fetching quote..." : quote.text}
                </p>
                {quote.author && (
                  <p style={quoteAuthorStyles}>— {quote.author}</p>
                )}
              </article>

              {error && (
                <p
                  style={{
                    backgroundColor: "rgba(248, 113, 113, 0.18)",
                    color: "#b45309",
                    borderRadius: 14,
                    padding: "12px 18px",
                    fontSize: 14,
                    marginTop: 20,
                    textAlign: "center",
                  }}
                >
                  {error}
                </p>
              )}

              <div
                style={{
                  display: "flex",
                  gap: 16,
                  flexWrap: "wrap",
                  justifyContent: "center",
                  marginTop: 24,
                }}
              >
                <button
                  onClick={() => void getQuote()}
                  disabled={loading}
                  style={{
                    ...buttonStyles.base,
                    ...buttonStyles.primary,
                    opacity: loading ? 0.65 : 1,
                  }}
                >
                  {loading ? "Loading..." : "🎲 New Quote"}
                </button>
                <button
                  onClick={() => void copyQuote()}
                  disabled={loading}
                  style={{
                    ...buttonStyles.base,
                    ...buttonStyles.secondary,
                  }}
                >
                  {copied ? "✓ Copied!" : "📋 Copy"}
                </button>
                <button
                  onClick={() => (isSpeaking ? stopSpeaking() : speakQuote())}
                  disabled={loading || !speechSupport || isDefaultQuote}
                  style={{
                    ...buttonStyles.base,
                    ...buttonStyles.secondary,
                    backgroundColor: isSpeaking ? "#facc15" : "white",
                    opacity: speechSupport ? 1 : 0.6,
                  }}
                >
                  {speechSupport
                    ? isSpeaking
                      ? "⏸️ Stop"
                      : "🔊 Listen"
                    : "🔇 Unavailable"}
                </button>
                <button
                  onClick={() => void shareQuote()}
                  disabled={loading}
                  style={{
                    ...buttonStyles.base,
                    ...buttonStyles.secondary,
                  }}
                >
                  📤 Share
                </button>
                <button
                  onClick={() => addFavorite()}
                  disabled={loading || isDefaultQuote || isFavorite}
                  style={{
                    ...buttonStyles.base,
                    ...buttonStyles.secondary,
                    backgroundColor: isFavorite ? "#22c55e" : "white",
                    color: isFavorite ? "white" : "#0f172a",
                  }}
                >
                  {isFavorite ? "✓ Saved" : "⭐ Save"}
                </button>
              </div>

              {history.length > 0 && (
                <aside
                  style={{
                    marginTop: 24,
                    textAlign: "left",
                    backgroundColor: "rgba(255, 255, 255, 0.9)",
                    padding: "20px 22px",
                    borderRadius: 22,
                  }}
                >
                  <p
                    style={{
                      fontSize: 15,
                      marginBottom: 14,
                      fontWeight: 900,
                      color: "#000000",
                    }}
                  >
                    📜 Recently Viewed
                  </p>
                  <ul
                    style={{
                      listStyle: "none",
                      display: "grid",
                      gap: 14,
                      padding: 0,
                      margin: 0,
                    }}
                  >
                    {history.map((item) => (
                      <li
                        key={item.id}
                        style={{
                          backgroundColor: "white",
                          padding: "16px 18px",
                          borderRadius: 16,
                          boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
                        }}
                      >
                        <p
                          style={{
                            fontSize: 15,
                            marginBottom: 8,
                            color: "#0f172a",
                          }}
                        >
                          {item.text}
                        </p>
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            gap: 12,
                          }}
                        >
                          <span style={{ fontSize: 13, color: "#64748b" }}>
                            — {item.author}
                          </span>
                          <button
                            onClick={() => restoreQuote(item)}
                            style={{
                              ...buttonStyles.base,
                              ...buttonStyles.outline,
                              minWidth: 0,
                              padding: "8px 16px",
                              fontSize: 13,
                            }}
                          >
                            View
                          </button>
                        </div>
                      </li>
                    ))}
                  </ul>
                </aside>
              )}
            </div>
          )}

          {/* Search Tab */}
          {activeTab === "search" && (
            <div>
              <form onSubmit={handleSearchSubmit}>
                <div
                  style={{
                    display: "flex",
                    gap: 12,
                    flexWrap: "wrap",
                    marginBottom: 20,
                  }}
                >
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search quotes by text, author, or category..."
                    style={{
                      flex: 1,
                      minWidth: 200,
                      padding: "14px 18px",
                      borderRadius: 12,
                      border: "1px solid rgba(148, 163, 184, 0.35)",
                      fontSize: 15,
                      backgroundColor: "white",
                      outline: "none",
                    }}
                  />
                  <select
                    value={searchField}
                    onChange={(e) => setSearchField(e.target.value)}
                    style={{
                      padding: "14px 18px",
                      borderRadius: 12,
                      border: "1px solid rgba(148, 163, 184, 0.35)",
                      fontSize: 15,
                      backgroundColor: "white",
                      cursor: "pointer",
                    }}
                  >
                    <option value="all">All Fields</option>
                    <option value="text">Text Only</option>
                    <option value="author">Author Only</option>
                    <option value="category">Category Only</option>
                  </select>
                  <button
                    type="submit"
                    disabled={searchLoading || !searchQuery.trim()}
                    style={{
                      ...buttonStyles.base,
                      ...buttonStyles.primary,
                      minWidth: 120,
                      opacity: searchLoading || !searchQuery.trim() ? 0.6 : 1,
                    }}
                  >
                    {searchLoading ? "Searching..." : "🔍 Search"}
                  </button>
                </div>
              </form>

              {searchError && (
                <p
                  style={{
                    backgroundColor: "rgba(248, 113, 113, 0.18)",
                    color: "#b45309",
                    borderRadius: 12,
                    padding: "12px 16px",
                    fontSize: 14,
                    marginBottom: 20,
                  }}
                >
                  {searchError}
                </p>
              )}

              {searchResults.length > 0 && (
                <div>
                  <p
                    style={{
                      fontSize: 14,
                      fontWeight: 900,
                      color: "#000000",
                      marginBottom: 16,
                    }}
                  >
                    Found {searchPagination?.total || searchResults.length} result
                    {searchPagination?.total !== 1 ? "s" : ""}
                  </p>
                  <div
                    style={{
                      display: "grid",
                      gap: 14,
                      gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
                    }}
                  >
                    {searchResults.map((result) => (
                      <div
                        key={result.id}
                        onClick={() => {
                          handleSearchResultClick(result);
                          setActiveTab("home");
                        }}
                        style={{
                          backgroundColor: "white",
                          borderRadius: 16,
                          padding: "18px 20px",
                          boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
                          cursor: "pointer",
                          transition: "transform 0.2s ease",
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.transform = "translateY(-2px)";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.transform = "translateY(0)";
                        }}
                      >
                        <p
                          style={{
                            fontSize: 15,
                            lineHeight: 1.6,
                            color: "#0f172a",
                            marginBottom: 12,
                            fontWeight: 500,
                          }}
                        >
                          "{result.text}"
                        </p>
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            flexWrap: "wrap",
                            gap: 8,
                          }}
                        >
                          <span
                            style={{
                              fontSize: 13,
                              color: "#475569",
                              fontStyle: "italic",
                            }}
                          >
                            — {result.author}
                          </span>
                          <span
                            style={{
                              fontSize: 11,
                              padding: "4px 10px",
                              borderRadius: 12,
                              backgroundColor: "rgba(148, 163, 184, 0.15)",
                              color: "#64748b",
                              textTransform: "capitalize",
                            }}
                          >
                            {result.category}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>

                  {searchPagination && searchPagination.totalPages > 1 && (
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        gap: 12,
                        marginTop: 24,
                      }}
                    >
                      <button
                        onClick={() => {
                          if (searchPagination.hasPreviousPage) {
                            void searchQuotes(
                              searchQuery,
                              searchField,
                              searchPage - 1,
                            );
                          }
                        }}
                        disabled={!searchPagination.hasPreviousPage}
                        style={{
                          ...buttonStyles.base,
                          ...buttonStyles.outline,
                          minWidth: 100,
                          opacity: searchPagination.hasPreviousPage ? 1 : 0.5,
                        }}
                      >
                        ← Previous
                      </button>
                      <span style={{ fontSize: 14, fontWeight: 900, color: "#000000" }}>
                        Page {searchPagination.page} of {searchPagination.totalPages}
                      </span>
                      <button
                        onClick={() => {
                          if (searchPagination.hasNextPage) {
                            void searchQuotes(
                              searchQuery,
                              searchField,
                              searchPage + 1,
                            );
                          }
                        }}
                        disabled={!searchPagination.hasNextPage}
                        style={{
                          ...buttonStyles.base,
                          ...buttonStyles.outline,
                          minWidth: 100,
                          opacity: searchPagination.hasNextPage ? 1 : 0.5,
                        }}
                      >
                        Next →
                      </button>
                    </div>
                  )}
                </div>
              )}

              {!searchLoading &&
                searchResults.length === 0 &&
                searchQuery.trim().length > 0 && (
                  <p
                    style={{
                      fontSize: 14,
                      color: "#475569",
                      textAlign: "center",
                      padding: "40px",
                    }}
                  >
                    No quotes found matching "{searchQuery}". Try a different search term.
                  </p>
                )}
            </div>
          )}

          {/* Browse Tab */}
          {activeTab === "browse" && (
            <div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: 20,
                }}
              >
                <h2 style={{ fontSize: 24, fontWeight: 900, color: "#000000" }}>
                  Browse All Quotes
                </h2>
                <button
                  onClick={() => void fetchAllQuotes(1, 10)}
                  disabled={quotesLoading}
                  style={{
                    ...buttonStyles.base,
                    ...buttonStyles.secondary,
                    minWidth: 120,
                  }}
                >
                  {quotesLoading ? "Loading..." : "🔄 Refresh"}
                </button>
              </div>

              {quotesLoading && (
                <p style={{ textAlign: "center", padding: "40px", color: "#64748b" }}>
                  Loading quotes...
                </p>
              )}

              {!quotesLoading && allQuotes.length > 0 && (
                <div>
                  <div
                    style={{
                      display: "grid",
                      gap: 16,
                      gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
                      marginBottom: 24,
                    }}
                  >
                    {allQuotes.map((q) => (
                      <div
                        key={q.id}
                        onClick={() => {
                          setQuote({ text: q.text, author: q.author });
                          setActiveTab("home");
                        }}
                        style={{
                          backgroundColor: "white",
                          borderRadius: 16,
                          padding: "20px",
                          boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
                          cursor: "pointer",
                          transition: "transform 0.2s ease",
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.transform = "translateY(-2px)";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.transform = "translateY(0)";
                        }}
                      >
                        <p
                          style={{
                            fontSize: 15,
                            lineHeight: 1.6,
                            color: "#0f172a",
                            marginBottom: 12,
                          }}
                        >
                          "{q.text}"
                        </p>
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                          }}
                        >
                          <span
                            style={{
                              fontSize: 13,
                              color: "#64748b",
                              fontStyle: "italic",
                            }}
                          >
                            — {q.author}
                          </span>
                          <span
                            style={{
                              fontSize: 11,
                              padding: "4px 10px",
                              borderRadius: 12,
                              backgroundColor: "rgba(17, 153, 142, 0.15)",
                              color: "#11998e",
                              textTransform: "capitalize",
                            }}
                          >
                            {q.category}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>

                  {quotesPagination && quotesPagination.totalPages > 1 && (
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        gap: 12,
                      }}
                    >
                      <button
                        onClick={() => {
                          if (quotesPagination.hasPreviousPage) {
                            void fetchAllQuotes(quotesPage - 1, 10);
                          }
                        }}
                        disabled={!quotesPagination.hasPreviousPage}
                        style={{
                          ...buttonStyles.base,
                          ...buttonStyles.outline,
                          minWidth: 100,
                        }}
                      >
                        ← Previous
                      </button>
                      <span style={{ fontSize: 14, fontWeight: 900, color: "#000000" }}>
                        Page {quotesPagination.page} of {quotesPagination.totalPages}
                      </span>
                      <button
                        onClick={() => {
                          if (quotesPagination.hasNextPage) {
                            void fetchAllQuotes(quotesPage + 1, 10);
                          }
                        }}
                        disabled={!quotesPagination.hasNextPage}
                        style={{
                          ...buttonStyles.base,
                          ...buttonStyles.outline,
                          minWidth: 100,
                        }}
                      >
                        Next →
                      </button>
                    </div>
                  )}
                </div>
              )}

              {!quotesLoading && allQuotes.length === 0 && (
                <p style={{ textAlign: "center", padding: "40px", color: "#64748b" }}>
                  No quotes found. Click "Refresh" to load quotes.
                </p>
              )}
            </div>
          )}

          {/* Submit Tab */}
          {activeTab === "submit" && (
            <div>
              <h2 style={{ fontSize: 24, fontWeight: 900, marginBottom: 24, color: "#000000" }}>
                Submit New Quote
              </h2>
              <form onSubmit={submitNewQuote}>
                <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                  <div>
                    <label
                      style={{
                        display: "block",
                        fontSize: 14,
                        fontWeight: 900,
                        color: "#000000",
                        marginBottom: 8,
                      }}
                    >
                      Quote Text *
                    </label>
                    <textarea
                      value={newQuoteText}
                      onChange={(e) => {
                        setNewQuoteText(e.target.value);
                        setSubmitError(null);
                      }}
                      placeholder="Enter your inspiring quote here..."
                      rows={4}
                      maxLength={500}
                      style={{
                        width: "100%",
                        padding: "14px 18px",
                        borderRadius: 12,
                        border: "1px solid rgba(148, 163, 184, 0.35)",
                        fontSize: 15,
                        fontFamily: "inherit",
                        backgroundColor: "white",
                        outline: "none",
                        resize: "vertical",
                      }}
                    />
                    <p
                      style={{
                        fontSize: 12,
                        color: "#64748b",
                        marginTop: 6,
                        textAlign: "right",
                      }}
                    >
                      {newQuoteText.length}/500 characters
                    </p>
                  </div>

                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                      gap: 20,
                    }}
                  >
                    <div>
                      <label
                        style={{
                          display: "block",
                          fontSize: 14,
                          fontWeight: 900,
                          color: "#000000",
                          marginBottom: 8,
                        }}
                      >
                        Author *
                      </label>
                      <input
                        type="text"
                        value={newQuoteAuthor}
                        onChange={(e) => {
                          setNewQuoteAuthor(e.target.value);
                          setSubmitError(null);
                        }}
                        placeholder="Author name..."
                        maxLength={100}
                        style={{
                          width: "100%",
                          padding: "14px 18px",
                          borderRadius: 12,
                          border: "1px solid rgba(148, 163, 184, 0.35)",
                          fontSize: 15,
                          backgroundColor: "white",
                          outline: "none",
                        }}
                      />
                    </div>

                    <div>
                      <label
                        style={{
                          display: "block",
                          fontSize: 14,
                          fontWeight: 900,
                          color: "#000000",
                          marginBottom: 8,
                        }}
                      >
                        Category
                      </label>
                      <select
                        value={newQuoteCategory}
                        onChange={(e) => {
                          setNewQuoteCategory(e.target.value);
                          setSubmitError(null);
                        }}
                        style={{
                          width: "100%",
                          padding: "14px 18px",
                          borderRadius: 12,
                          border: "1px solid rgba(148, 163, 184, 0.35)",
                          fontSize: 15,
                          backgroundColor: "white",
                          cursor: "pointer",
                          outline: "none",
                        }}
                      >
                        <option value="general">General</option>
                        <option value="motivation">Motivation</option>
                        <option value="wisdom">Wisdom</option>
                        <option value="perseverance">Perseverance</option>
                        <option value="success">Success</option>
                        <option value="leadership">Leadership</option>
                        <option value="inspiration">Inspiration</option>
                      </select>
                    </div>
                  </div>

                  {submitError && (
                    <p
                      style={{
                        fontSize: 13,
                        color: "#b45309",
                        backgroundColor: "rgba(248, 113, 113, 0.18)",
                        padding: "12px 16px",
                        borderRadius: 12,
                      }}
                    >
                      {submitError}
                    </p>
                  )}

                  {submitSuccess && (
                    <p
                      style={{
                        fontSize: 13,
                        color: "#166534",
                        backgroundColor: "rgba(134, 239, 172, 0.3)",
                        padding: "12px 16px",
                        borderRadius: 12,
                      }}
                    >
                      ✓ Quote submitted successfully!
                    </p>
                  )}

                  <button
                    type="submit"
                    disabled={submitLoading || !newQuoteText.trim() || !newQuoteAuthor.trim()}
                    style={{
                      ...buttonStyles.base,
                      ...buttonStyles.primary,
                      width: "100%",
                      opacity:
                        submitLoading || !newQuoteText.trim() || !newQuoteAuthor.trim()
                          ? 0.6
                          : 1,
                    }}
                  >
                    {submitLoading ? "Submitting..." : "✍️ Submit Quote"}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Authors Tab */}
          {activeTab === "authors" && (
            <div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: 24,
                }}
              >
                <h2 style={{ fontSize: 24, fontWeight: 900, color: "#000000" }}>
                  All Authors
                </h2>
                <button
                  onClick={() => void fetchAuthors()}
                  disabled={authorsLoading}
                  style={{
                    ...buttonStyles.base,
                    ...buttonStyles.secondary,
                    minWidth: 120,
                  }}
                >
                  {authorsLoading ? "Loading..." : "🔄 Refresh"}
                </button>
              </div>

              {authorsError && (
                <p
                  style={{
                    fontSize: 13,
                    color: "#b45309",
                    backgroundColor: "rgba(248, 113, 113, 0.18)",
                    padding: "12px 16px",
                    borderRadius: 12,
                    marginBottom: 20,
                  }}
                >
                  {authorsError}
                </p>
              )}

              {authorsLoading && (
                <p style={{ textAlign: "center", padding: "40px", color: "#64748b" }}>
                  Loading authors...
                </p>
              )}

              {!authorsLoading && authors.length > 0 && (
                <div
                  style={{
                    display: "grid",
                    gap: 16,
                    gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))",
                  }}
                >
                  {authors.map((author) => (
                    <div
                      key={author.name}
                      style={{
                        backgroundColor: "white",
                        borderRadius: 16,
                        padding: "20px",
                        boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "flex-start",
                          marginBottom: 12,
                        }}
                      >
                        <p
                          style={{
                            fontSize: 18,
                            fontWeight: 600,
                            color: "#0f172a",
                            margin: 0,
                          }}
                        >
                          {author.name}
                        </p>
                        <span
                          style={{
                            fontSize: 12,
                            padding: "6px 12px",
                            borderRadius: 12,
                            backgroundColor: "rgba(17, 153, 142, 0.15)",
                            color: "#11998e",
                            fontWeight: 600,
                          }}
                        >
                          {author.quoteCount} quote{author.quoteCount !== 1 ? "s" : ""}
                        </span>
                      </div>
                      {author.categories && author.categories.length > 0 && (
                        <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                          {author.categories.map((category) => (
                            <span
                              key={category}
                              style={{
                                fontSize: 11,
                                padding: "4px 10px",
                                borderRadius: 8,
                                backgroundColor: "rgba(148, 163, 184, 0.15)",
                                color: "#64748b",
                                textTransform: "capitalize",
                              }}
                            >
                              {category}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {!authorsLoading && authors.length === 0 && (
                <p style={{ textAlign: "center", padding: "40px", color: "#64748b" }}>
                  No authors found. Click "Refresh" to load authors.
                </p>
              )}
            </div>
          )}

          {/* Stats Tab */}
          {activeTab === "stats" && (
            <div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: 24,
                }}
              >
                <h2 style={{ fontSize: 24, fontWeight: 900, color: "#000000" }}>
                  App Statistics
                </h2>
                <button
                  onClick={() => void fetchStats()}
                  disabled={statsLoading}
                  style={{
                    ...buttonStyles.base,
                    ...buttonStyles.secondary,
                    minWidth: 120,
                  }}
                >
                  {statsLoading ? "Loading..." : "🔄 Refresh"}
                </button>
              </div>

              {statsError && (
                <p
                  style={{
                    fontSize: 13,
                    color: "#b45309",
                    backgroundColor: "rgba(248, 113, 113, 0.18)",
                    padding: "12px 16px",
                    borderRadius: 12,
                    marginBottom: 20,
                  }}
                >
                  {statsError}
                </p>
              )}

              {statsLoading && (
                <p style={{ textAlign: "center", padding: "40px", color: "#64748b" }}>
                  Loading statistics...
                </p>
              )}

              {!statsLoading && stats && (
                <div>
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
                      gap: 16,
                      marginBottom: 24,
                    }}
                  >
                    <div
                      style={{
                        backgroundColor: "white",
                        borderRadius: 16,
                        padding: "24px",
                        textAlign: "center",
                        boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
                      }}
                    >
                      <p
                        style={{
                          fontSize: 36,
                          fontWeight: 700,
                          color: "#11998e",
                          margin: "0 0 8px 0",
                        }}
                      >
                        {stats.overview.totalQuotes}
                      </p>
                      <p style={{ fontSize: 13, fontWeight: 900, color: "#000000", margin: 0 }}>
                        Total Quotes
                      </p>
                    </div>
                    <div
                      style={{
                        backgroundColor: "white",
                        borderRadius: 16,
                        padding: "24px",
                        textAlign: "center",
                        boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
                      }}
                    >
                      <p
                        style={{
                          fontSize: 36,
                          fontWeight: 700,
                          color: "#11998e",
                          margin: "0 0 8px 0",
                        }}
                      >
                        {stats.overview.totalAuthors}
                      </p>
                      <p style={{ fontSize: 13, fontWeight: 900, color: "#000000", margin: 0 }}>
                        Authors
                      </p>
                    </div>
                    <div
                      style={{
                        backgroundColor: "white",
                        borderRadius: 16,
                        padding: "24px",
                        textAlign: "center",
                        boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
                      }}
                    >
                      <p
                        style={{
                          fontSize: 36,
                          fontWeight: 700,
                          color: "#11998e",
                          margin: "0 0 8px 0",
                        }}
                      >
                        {stats.overview.totalCategories}
                      </p>
                      <p style={{ fontSize: 13, fontWeight: 900, color: "#000000", margin: 0 }}>
                        Categories
                      </p>
                    </div>
                    <div
                      style={{
                        backgroundColor: "white",
                        borderRadius: 16,
                        padding: "24px",
                        textAlign: "center",
                        boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
                      }}
                    >
                      <p
                        style={{
                          fontSize: 36,
                          fontWeight: 700,
                          color: "#11998e",
                          margin: "0 0 8px 0",
                        }}
                      >
                        {stats.overview.averageQuoteLength}
                      </p>
                      <p style={{ fontSize: 13, fontWeight: 900, color: "#000000", margin: 0 }}>
                        Avg Length
                      </p>
                    </div>
                  </div>

                  {stats.categoryBreakdown && stats.categoryBreakdown.length > 0 && (
                    <div style={{ marginBottom: 24 }}>
                      <h3
                        style={{
                          fontSize: 18,
                          fontWeight: 900,
                          color: "#000000",
                          marginBottom: 16,
                        }}
                      >
                        Category Breakdown
                      </h3>
                      <div
                        style={{
                          display: "grid",
                          gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
                          gap: 12,
                        }}
                      >
                        {stats.categoryBreakdown.map((cat) => (
                          <div
                            key={cat.name}
                            style={{
                              backgroundColor: "white",
                              borderRadius: 12,
                              padding: "16px",
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "center",
                              boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
                            }}
                          >
                            <span
                              style={{
                                fontSize: 14,
                                color: "#0f172a",
                                textTransform: "capitalize",
                              }}
                            >
                              {cat.name}
                            </span>
                            <span
                              style={{
                                fontSize: 14,
                                fontWeight: 600,
                                color: "#11998e",
                              }}
                            >
                              {cat.count}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {stats.topAuthors && stats.topAuthors.length > 0 && (
                    <div>
                      <h3
                        style={{
                          fontSize: 18,
                          fontWeight: 900,
                          color: "#000000",
                          marginBottom: 16,
                        }}
                      >
                        Top Authors
                      </h3>
                      <div
                        style={{
                          display: "grid",
                          gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
                          gap: 12,
                        }}
                      >
                        {stats.topAuthors.map((author, index) => (
                          <div
                            key={author.name}
                            style={{
                              backgroundColor: "white",
                              borderRadius: 12,
                              padding: "16px",
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "center",
                              boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
                            }}
                          >
                            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                              <span
                                style={{
                                  fontSize: 12,
                                  fontWeight: 600,
                                  color: "#94a3b8",
                                }}
                              >
                                #{index + 1}
                              </span>
                              <span style={{ fontSize: 14, color: "#0f172a" }}>
                                {author.name}
                              </span>
                            </div>
                            <span
                              style={{
                                fontSize: 14,
                                fontWeight: 600,
                                color: "#11998e",
                              }}
                            >
                              {author.count}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {!statsLoading && !stats && (
                <p style={{ textAlign: "center", padding: "40px", color: "#64748b" }}>
                  Click "Refresh" to load statistics.
                </p>
              )}
            </div>
          )}

          {/* Favorites Tab */}
          {activeTab === "favorites" && (
            <div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: 20,
                }}
              >
                <h2 style={{ fontSize: 24, fontWeight: 900, color: "#000000" }}>
                  My Favorites ({favorites.length})
                </h2>
                {favorites.length > 0 && (
                  <button
                    onClick={() => setFavorites([])}
                    style={{
                      ...buttonStyles.base,
                      ...buttonStyles.outline,
                      minWidth: 0,
                      padding: "10px 18px",
                      fontSize: 14,
                    }}
                  >
                    🗑️ Clear All
                  </button>
                )}
              </div>

              <input
                type="search"
                value={favoriteQuery}
                onChange={(event) => setFavoriteQuery(event.target.value)}
                placeholder="Filter favorites by keyword or author..."
                style={{
                  width: "100%",
                  padding: "14px 18px",
                  borderRadius: 12,
                  border: "1px solid rgba(148, 163, 184, 0.35)",
                  marginBottom: 20,
                  fontSize: 15,
                  backgroundColor: "white",
                  outline: "none",
                }}
              />

              {favorites.length === 0 ? (
                <p
                  style={{
                    textAlign: "center",
                    padding: "60px 20px",
                    color: "#64748b",
                    fontSize: 16,
                  }}
                >
                  No favorites yet. Save quotes from the Home tab to see them here!
                </p>
              ) : visibleFavorites.length === 0 ? (
                <p
                  style={{
                    textAlign: "center",
                    padding: "40px",
                    color: "#64748b",
                  }}
                >
                  No favorites matched your search. Try a different keyword.
                </p>
              ) : (
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
                    gap: 16,
                  }}
                >
                  {visibleFavorites.map((fav) => (
                    <div
                      key={fav.id}
                      style={{
                        backgroundColor: "white",
                        borderRadius: 16,
                        padding: "20px",
                        boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
                        display: "flex",
                        flexDirection: "column",
                        gap: 12,
                      }}
                    >
                      <p
                        style={{
                          fontSize: 15,
                          lineHeight: 1.6,
                          color: "#0f172a",
                          minHeight: 60,
                        }}
                      >
                        {fav.text}
                      </p>
                      <span
                        style={{
                          fontSize: 13,
                          color: "#64748b",
                          fontStyle: "italic",
                        }}
                      >
                        — {fav.author}
                      </span>
                      <div style={{ display: "flex", gap: 10 }}>
                        <button
                          onClick={() => {
                            restoreQuote(fav);
                            setActiveTab("home");
                          }}
                          style={{
                            ...buttonStyles.base,
                            ...buttonStyles.outline,
                            minWidth: 0,
                            padding: "8px 16px",
                            fontSize: 13,
                          }}
                        >
                          👁️ View
                        </button>
                        <button
                          onClick={() => removeFavorite(fav.id)}
                          style={{
                            ...buttonStyles.base,
                            ...buttonStyles.outline,
                            minWidth: 0,
                            padding: "8px 16px",
                            fontSize: 13,
                          }}
                        >
                          🗑️ Remove
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Settings Tab */}
          {activeTab === "settings" && (
            <div>
              <h2 style={{ fontSize: 24, fontWeight: 900, marginBottom: 24, color: "#000000" }}>
                Settings
              </h2>

              <div
                style={{
                  display: "grid",
                  gap: 24,
                  gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
                }}
              >
                <div
                  style={{
                    backgroundColor: "white",
                    borderRadius: 16,
                    padding: "24px",
                    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
                  }}
                >
                  <h3
                    style={{
                      fontSize: 18,
                      fontWeight: 900,
                      marginBottom: 16,
                      color: "#000000",
                    }}
                  >
                    🎨 Theme & Appearance
                  </h3>
                  <p
                    style={{
                      fontSize: 14,
                      fontWeight: 900,
                      color: "#000000",
                      marginBottom: 16,
                    }}
                  >
                    Current palette: {paletteFriendlyName}
                  </p>
                  <button
                    onClick={cyclePalette}
                    style={{
                      ...buttonStyles.base,
                      ...buttonStyles.secondary,
                      width: "100%",
                    }}
                  >
                    Switch Theme
                  </button>
                </div>

                <div
                  style={{
                    backgroundColor: "white",
                    borderRadius: 16,
                    padding: "24px",
                    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
                  }}
                >
                  <h3
                    style={{
                      fontSize: 18,
                      fontWeight: 900,
                      marginBottom: 16,
                      color: "#000000",
                    }}
                  >
                    ⏱️ Auto-Refresh
                  </h3>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginBottom: 16,
                    }}
                  >
                    <span style={{ fontSize: 14, fontWeight: 900, color: "#000000" }}>
                      {autoPlay ? `Active (${countdown}s)` : "Manual mode"}
                    </span>
                    <button
                      onClick={toggleAutoPlay}
                      style={{
                        ...buttonStyles.base,
                        ...buttonStyles.outline,
                        backgroundColor: autoPlay ? "#11998e" : "transparent",
                        color: autoPlay ? "white" : "#0f172a",
                        minWidth: 120,
                      }}
                    >
                      {autoPlay ? "Turn off" : "Start auto"}
                    </button>
                  </div>
                  <label
                    style={{
                      display: "block",
                      fontSize: 13,
                      fontWeight: 900,
                      color: "#000000",
                      marginBottom: 8,
                    }}
                  >
                    Refresh every {autoPlaySeconds} seconds
                  </label>
                  <input
                    type="range"
                    min="5"
                    max="60"
                    step="5"
                    value={autoPlaySeconds}
                    onChange={(event) =>
                      setAutoPlaySeconds(Number(event.target.value))
                    }
                    style={sliderTrackStyles}
                  />
                </div>

                <div
                  style={{
                    backgroundColor: "white",
                    borderRadius: 16,
                    padding: "24px",
                    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
                  }}
                >
                  <h3
                    style={{
                      fontSize: 18,
                      fontWeight: 900,
                      marginBottom: 16,
                      color: "#000000",
                    }}
                  >
                    🔤 Reading Comfort
                  </h3>
                  <label
                    style={{
                      display: "block",
                      fontSize: 13,
                      fontWeight: 900,
                      color: "#000000",
                      marginBottom: 12,
                    }}
                  >
                    Font size: {fontSize}px
                  </label>
                  <input
                    type="range"
                    min="16"
                    max="36"
                    step="1"
                    value={fontSize}
                    onChange={(event) => setFontSize(Number(event.target.value))}
                    style={sliderTrackStyles}
                  />
                  <button
                    onClick={() => setReadingMode((prev) => !prev)}
                    style={{
                      ...buttonStyles.base,
                      ...buttonStyles.outline,
                      backgroundColor: readingMode ? "#11998e" : "transparent",
                      color: readingMode ? "white" : "#0f172a",
                      width: "100%",
                      marginTop: 16,
                    }}
                  >
                    {readingMode ? "Disable focus mode" : "Enable focus mode"}
                  </button>
                </div>
              </div>

              <div
                style={{
                  backgroundColor: "white",
                  borderRadius: 16,
                  padding: "24px",
                  marginTop: 24,
                  boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
                }}
              >
                <h3
                  style={{
                    fontSize: 18,
                    fontWeight: 900,
                    marginBottom: 12,
                    color: "#000000",
                  }}
                >
                  📊 App Info
                </h3>
                <div
                  style={{
                    display: "flex",
                    flexWrap: "wrap",
                    gap: 12,
                  }}
                >
                  <span
                    style={{
                      padding: "8px 16px",
                      borderRadius: 12,
                      backgroundColor: "rgba(17, 153, 142, 0.15)",
                      color: "#11998e",
                      fontSize: 13,
                      fontWeight: 500,
                    }}
                  >
                    Quotes fetched: {fetchCount}
                  </span>
                  <span
                    style={{
                      padding: "8px 16px",
                      borderRadius: 12,
                      backgroundColor: "rgba(17, 153, 142, 0.15)",
                      color: "#11998e",
                      fontSize: 13,
                      fontWeight: 500,
                    }}
                  >
                    Favorites: {favorites.length}
                  </span>
                  <span
                    style={{
                      padding: "8px 16px",
                      borderRadius: 12,
                      backgroundColor: speechSupport
                        ? "rgba(134, 239, 172, 0.3)"
                        : "rgba(248, 113, 113, 0.18)",
                      color: speechSupport ? "#166534" : "#b45309",
                      fontSize: 13,
                      fontWeight: 500,
                    }}
                  >
                    Voice: {speechSupport ? "Ready" : "Not supported"}
                  </span>
                </div>
              </div>
            </div>
          )}

          <footer
            style={{
              fontSize: 13,
              color: "#475569",
              marginTop: 24,
              textAlign: "center",
              padding: "20px",
            }}
          >
            💡 Tip: Use the tabs above to navigate between different features. Enable auto-refresh in Settings for continuous inspiration!
          </footer>
        </section>
      </main>
    </>
  );
}
