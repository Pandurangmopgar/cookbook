# AlgoTutor Live (Next.js)

AI-powered coding tutor with voice and text modes for algorithm problems.

## ✨ Features

### Dual Tutor Modes
- **Voice Mode**: Real-time voice conversation with AI tutor using Gemini Live API
- **Text Mode**: Real-time code analysis with progressive hints

### Authentication & Progress
- **Clerk Authentication**: Secure sign-in with email/password or Google OAuth
- **Auto-save**: Code automatically saves every 3 seconds
- **Progress Tracking**: Track solved problems and solution reveals
- **User Profiles**: Automatic profile creation in database

### Code Editor
- **Monaco Editor**: Professional code editor with syntax highlighting
- **E2B Execution**: Secure code execution with test validation
- **Multiple Problems**: Arrays, Two Pointers, Stack, Binary Search, and more

### AI Features
- **Real-time Feedback**: Instant code analysis as you type
- **Progressive Hints**: Socratic-style hints that guide without giving answers
- **Solution Reveal**: View optimal solutions with explanations (tracked)
- **Voice Interaction**: Natural conversation with AI tutor

## 🚀 Quick Start

See **[SETUP_GUIDE.md](./SETUP_GUIDE.md)** for complete setup instructions.

### Prerequisites
- Node.js 18+
- Clerk account (authentication)
- Supabase account (database)
- Google Gemini API key
- E2B API key (code execution)

### Installation

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Set up environment variables**:
   Create `.env.local` with:
   ```env
   # Clerk Authentication
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_key
   CLERK_SECRET_KEY=your_clerk_secret
   
   # Google Gemini API
   NEXT_PUBLIC_GOOGLE_API_KEY=your_gemini_key
   
   # E2B Code Execution
   E2B_API_KEY=your_e2b_key
   
   # Supabase Database
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_key
   ```

3. **Set up database**:
   Run the SQL migrations in Supabase (see [SETUP_GUIDE.md](./SETUP_GUIDE.md))

4. **Run the app**:
   ```bash
   npm run dev
   ```

5. **Open browser**:
   Navigate to http://localhost:3000

## 📚 Documentation

- **[SETUP_GUIDE.md](./SETUP_GUIDE.md)** - Complete setup instructions
- **[CLERK_SETUP.md](./CLERK_SETUP.md)** - Clerk authentication setup
- **[MIGRATION_GUIDE.md](./MIGRATION_GUIDE.md)** - Migration from Supabase Auth

## 🎯 How to Use

### Getting Started
1. Sign in with Clerk (email/password or Google)
2. Choose a problem from the sidebar
3. Select Voice or Text mode
4. Start coding!

### Voice Mode
1. Click "Start Tutor" to begin voice session
2. Speak naturally: "Can you explain this problem?"
3. AI can read your code and run tests
4. Click "End" to stop the session

### Text Mode
1. Start typing your solution
2. AI analyzes code in real-time (2-second delay)
3. Click "Get Hint" for progressive hints
4. Click "Run Tests" to validate solution
5. Click "Reveal Solution" if stuck (tracked)

## 🏗️ Architecture

### Authentication Flow
```
User → Clerk Auth → AuthContext → User Profile (Supabase)
```

### Code Execution Flow
```
Editor → API Route → E2B Sandbox → Test Results
```

### Voice Mode Flow
```
Microphone → Gemini Live API → Audio Response
                ↓
         Function Calls (read code, run tests)
```

### Text Mode Flow
```
Code Changes → Debounce (2s) → API Route → Gemini Analysis → Feedback
```

## 🔧 Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Editor**: Monaco Editor
- **AI**: Google Gemini (gemini-2.5-flash, Gemini Live API)
- **Auth**: Clerk
- **Database**: Supabase (PostgreSQL)
- **Code Execution**: E2B Sandboxes
- **Memory**: MemoryStack (optional)

## 🔐 Security

- API keys stored server-side only
- Clerk handles authentication securely
- E2B sandboxes isolate code execution
- Supabase RLS policies protect user data

## 🎨 Customization

### Adding New Problems
Edit `src/constants.ts`:
```typescript
{
  id: 'unique-id',
  title: 'Problem Title',
  difficulty: 'Easy',
  description: '...',
  starterCode: '...',
  testCases: [...],
  solution: '...'
}
```

### Customizing AI Behavior
Edit `GET_SYSTEM_INSTRUCTION` in `src/constants.ts`

## 🐛 Troubleshooting

See [SETUP_GUIDE.md](./SETUP_GUIDE.md#troubleshooting) for common issues and solutions.

## 📝 Database Schema

```sql
-- User Profiles (auto-created on sign-in)
CREATE TABLE user_profiles (
  id UUID PRIMARY KEY,
  user_id TEXT UNIQUE NOT NULL,  -- Clerk user ID
  email TEXT,
  display_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);

-- User Progress (code saves, solutions revealed)
CREATE TABLE user_progress (
  id UUID PRIMARY KEY,
  user_id TEXT NOT NULL,
  problem_id TEXT NOT NULL,
  last_code TEXT,
  solved BOOLEAN DEFAULT FALSE,
  attempts INTEGER DEFAULT 0,
  solution_revealed BOOLEAN DEFAULT FALSE,
  revealed_at TIMESTAMP,
  created_at TIMESTAMP,
  updated_at TIMESTAMP,
  UNIQUE(user_id, problem_id)
);
```

## 🚀 Deployment

### Vercel (Recommended)
1. Push to GitHub
2. Import in Vercel
3. Add environment variables
4. Deploy

### Environment Variables
Set all required variables in your hosting platform:
- Clerk keys (production)
- Google API key
- E2B API key
- Supabase credentials

## 📄 License

MIT

## 🤝 Contributing

Contributions welcome! Please open an issue or PR.

## 📧 Support

- Check documentation files
- Open GitHub issue
- Contact support

## 🎓 Resources

- [Clerk Docs](https://clerk.com/docs)
- [Next.js Docs](https://nextjs.org/docs)
- [Supabase Docs](https://supabase.com/docs)
- [Gemini API](https://ai.google.dev/docs)
- [E2B Docs](https://e2b.dev/docs)
