// Shared quotes data for all API endpoints
export const quotes = [
  {
    id: 1,
    text: "The best way to get started is to quit talking and begin doing.",
    author: "Walt Disney",
    category: "motivation",
  },
  {
    id: 2,
    text: "Don't let yesterday take up too much of today.",
    author: "Will Rogers",
    category: "wisdom",
  },
  {
    id: 3,
    text: "It's not whether you get knocked down, it's whether you get up.",
    author: "Vince Lombardi",
    category: "perseverance",
  },
  {
    id: 4,
    text: "If you are working on something exciting, it will keep you motivated.",
    author: "Steve Jobs",
    category: "motivation",
  },
  {
    id: 5,
    text: "Success is not in what you have, but who you are.",
    author: "Bo Bennett",
    category: "success",
  },
  {
    id: 6,
    text: "Juttu unnappude mudesukovaali, juttu lekapothe mudesukunedhe undadhu.",
    author: "Jagan",
    category: "wisdom",
  },
  {
    id: 7,
    text: "The only way to do great work is to love what you do.",
    author: "Steve Jobs",
    category: "motivation",
  },
  {
    id: 8,
    text: "Innovation distinguishes between a leader and a follower.",
    author: "Steve Jobs",
    category: "leadership",
  },
  {
    id: 9,
    text: "Life is what happens to you while you're busy making other plans.",
    author: "John Lennon",
    category: "wisdom",
  },
  {
    id: 10,
    text: "The future belongs to those who believe in the beauty of their dreams.",
    author: "Eleanor Roosevelt",
    category: "inspiration",
  },
  {
    id: 11,
    text: "It is during our darkest moments that we must focus to see the light.",
    author: "Aristotle",
    category: "wisdom",
  },
  {
    id: 12,
    text: "The only impossible journey is the one you never begin.",
    author: "Tony Robbins",
    category: "motivation",
  },
  {
    id: 13,
    text: "In the middle of difficulty lies opportunity.",
    author: "Albert Einstein",
    category: "wisdom",
  },
  {
    id: 14,
    text: "The way to get started is to quit talking and begin doing.",
    author: "Walt Disney",
    category: "motivation",
  },
  {
    id: 15,
    text: "Don't be afraid to give up the good to go for the great.",
    author: "John D. Rockefeller",
    category: "success",
  },
  {
    id: 16,
    text: "The only person you are destined to become is the person you decide to be.",
    author: "Ralph Waldo Emerson",
    category: "motivation",
  },
  {
    id: 17,
    text: "It does not matter how slowly you go as long as you do not stop.",
    author: "Confucius",
    category: "perseverance",
  },
  {
    id: 18,
    text: "Be yourself; everyone else is already taken.",
    author: "Oscar Wilde",
    category: "wisdom",
  },
  {
    id: 19,
    text: "The greatest glory in living lies not in never falling, but in rising every time we fall.",
    author: "Nelson Mandela",
    category: "perseverance",
  },
  {
    id: 20,
    text: "Your time is limited, don't waste it living someone else's life.",
    author: "Steve Jobs",
    category: "inspiration",
  },
  {
    id: 21,
    text: "If you want to lift yourself up, lift up someone else.",
    author: "Booker T. Washington",
    category: "leadership",
  },
  {
    id: 22,
    text: "Success is not just about making money, it's about making a difference.",
    author: "Oprah Winfrey",
    category: "success",
  },
  {
    id: 23,
    text: "Life is really simple, but we insist on making it complicated.",
    author: "Confucius",
    category: "wisdom",
  },
  {
    id: 24,
    text: "The future depends on what you do today.",
    author: "Mahatma Gandhi",
    category: "motivation",
  },
  {
    id: 25,
    text: "You must be the change you wish to see in the world.",
    author: "Mahatma Gandhi",
    category: "inspiration",
  },
];

// Helper function to format quote for backward compatibility
export function formatQuoteForLegacy(quote) {
  return `${quote.text} – ${quote.author}`;
}

