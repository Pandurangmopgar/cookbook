# AI Code Reviewer 🔍

An intelligent code review assistant that learns your coding patterns and provides personalized feedback.

## Features

- 🔍 **Smart Code Analysis** - Security, performance, quality, and best practices
- 🧠 **Pattern Learning** - Remembers your coding style via MemoryStack
- 🔎 **Search Past Reviews** - Find similar issues from your history
- 🚨 **Severity Classification** - Error, warning, info, and suggestion levels

## Supported Languages

JavaScript, TypeScript, Python, Java, Go, Rust

## Setup

```bash
npm install
cp .env.example .env.local
# Add your API keys:
# MEMORYSTACK_API_KEY=mem_live_your_key_here
# GOOGLE_API_KEY=your-gemini-api-key-here
npm run dev
```

Open http://localhost:3000

## How It Works

1. **Paste Code** - Submit code in any supported language
2. **AI Analysis** - Gemini analyzes for security, performance, quality issues
3. **Personalized Review** - Feedback tailored to your coding patterns
4. **Memory Storage** - Reviews stored for future reference
5. **Search** - Find similar past issues

## Review Categories

- 🚨 **Error** - Critical issues, security vulnerabilities
- ⚠️ **Warning** - Performance issues, potential bugs
- 💡 **Suggestion** - Best practices, optimizations
- ℹ️ **Info** - General observations

## Tech Stack

- Next.js 14 (App Router)
- Tailwind CSS
- Google Gemini AI
- MemoryStack API
