# AlgoTutor Setup Guide

Complete setup guide for AlgoTutor - an AI-powered coding tutor with voice and text modes.

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ installed
- A Clerk account (for authentication)
- A Supabase account (for database)
- Google Gemini API key
- E2B API key (for code execution)

### 1. Clone and Install

```bash
cd cookbook/nextjs/Algotutor/algotutor-nextjs
npm install
```

### 2. Set Up Environment Variables

Create a `.env.local` file with the following:

```env
# Clerk Authentication (Required)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
CLERK_SECRET_KEY=your_clerk_secret_key

# Google Gemini API Key (Required)
GOOGLE_API_KEY=your_google_api_key
NEXT_PUBLIC_GOOGLE_API_KEY=your_google_api_key
GEMINI_API_KEY=your_google_api_key

# E2B API Key (Required for code execution)
E2B_API_KEY=your_e2b_api_key

# Supabase Configuration (Required for database)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# MemoryStack API Key (Optional - for AI memory features)
MEMORYSTACK_API_KEY=your_memorystack_api_key
```

### 3. Set Up Clerk Authentication

1. Go to https://clerk.com and create an account
2. Create a new application
3. Enable authentication methods:
   - Email/Password
   - Google OAuth (recommended)
4. Copy your API keys to `.env.local`

See [CLERK_SETUP.md](./CLERK_SETUP.md) for detailed instructions.

### 4. Set Up Supabase Database

1. Create a new Supabase project at https://supabase.com
2. Run the following SQL in the SQL Editor:

```sql
-- User Profiles Table
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id TEXT UNIQUE NOT NULL,
  email TEXT,
  display_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_user_profiles_user_id ON user_profiles(user_id);

-- User Progress Table
CREATE TABLE IF NOT EXISTS user_progress (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id TEXT NOT NULL,
  problem_id TEXT NOT NULL,
  last_code TEXT,
  solved BOOLEAN DEFAULT FALSE,
  attempts INTEGER DEFAULT 0,
  solution_revealed BOOLEAN DEFAULT FALSE,
  revealed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, problem_id)
);

CREATE INDEX idx_user_progress_user_id ON user_progress(user_id);
CREATE INDEX idx_user_progress_problem_id ON user_progress(problem_id);
```

3. Copy your Supabase URL and anon key to `.env.local`

### 5. Get API Keys

#### Google Gemini API
1. Go to https://makersuite.google.com/app/apikey
2. Create a new API key
3. Add to `.env.local`

#### E2B API
1. Go to https://e2b.dev
2. Sign up and get your API key
3. Add to `.env.local`

### 6. Run the Application

```bash
npm run dev
```

Open http://localhost:3000 in your browser.

## 📚 Features

### Authentication
- ✅ Email/password sign-in
- ✅ Google OAuth
- ✅ Automatic profile creation
- ✅ Secure session management

### Code Editor
- ✅ Monaco editor with syntax highlighting
- ✅ Auto-save (every 3 seconds when signed in)
- ✅ Code persistence across sessions
- ✅ Multiple programming problems

### AI Tutor Modes

#### Voice Mode
- Real-time voice conversation with AI tutor
- Audio visualization
- Function calling for code analysis
- Automatic test running

#### Text Mode
- Real-time code analysis
- Progressive hints system
- Instant feedback on code changes
- Solution reveal with tracking

### Code Execution
- Secure code execution via E2B
- Test case validation
- Detailed error messages
- Performance metrics

### Progress Tracking
- Save code for each problem
- Track solved problems
- Count solution reveals
- Attempt history

## 🎯 Usage

### Getting Started

1. **Sign In**: Click the "Sign In" button in the top-right
2. **Choose a Problem**: Select from the sidebar (Arrays, Strings, etc.)
3. **Choose Mode**: Toggle between Voice and Text mode
4. **Start Coding**: Write your solution in the editor

### Voice Mode

1. Click "Start Tutor" to begin voice session
2. Speak naturally to the AI tutor
3. Ask questions like:
   - "Can you explain this problem?"
   - "What's wrong with my code?"
   - "Run the tests"
   - "Give me a hint"
4. Click "End" to stop the session

### Text Mode

1. Start typing your solution
2. AI analyzes your code in real-time (2-second delay)
3. Click "Get Hint" for progressive hints
4. Click "Run Tests" to validate your solution
5. Click "Reveal Solution" if you're stuck (tracked)

### Problem Navigation

- Click categories to expand/collapse
- Click a problem to switch (voice session will end)
- Your code is auto-saved per problem
- Green checkmark shows solved problems

## 🔧 Configuration

### Adding New Problems

Edit `src/constants.ts` to add new problems:

```typescript
{
  id: 'unique-id',
  title: 'Problem Title',
  difficulty: 'Easy' | 'Medium' | 'Hard',
  description: 'Problem description...',
  starterCode: 'function solution() {\n  // Your code here\n}',
  testCases: [
    { input: [1, 2, 3], expected: 6 },
  ],
  solution: 'function solution() { ... }',
  solutionExplanation: 'Explanation...',
  timeComplexity: 'O(n)',
  spaceComplexity: 'O(1)'
}
```

### Customizing AI Behavior

Edit `src/constants.ts` to modify the system instruction:

```typescript
export const GET_SYSTEM_INSTRUCTION = (problem: Problem) => {
  return `You are an expert coding tutor...`;
};
```

## 🐛 Troubleshooting

### Authentication Issues

**Problem**: "Clerk keys not found"
- Solution: Check `.env.local` has both Clerk keys
- Restart dev server after adding keys

**Problem**: Profile not created in database
- Solution: Check Supabase connection
- Verify `user_profiles` table exists
- Check browser console for errors

### Voice Mode Issues

**Problem**: "Microphone permission denied"
- Solution: Allow microphone access in browser settings
- Try a different browser (Chrome recommended)

**Problem**: Voice not connecting
- Solution: Check Google API key is valid
- Ensure you're using HTTPS or localhost
- Check browser console for errors

### Code Execution Issues

**Problem**: Tests not running
- Solution: Verify E2B API key is correct
- Check E2B account has credits
- Look for error messages in console

### Database Issues

**Problem**: Code not saving
- Solution: Check Supabase connection
- Verify user is signed in
- Check `user_progress` table exists

## 📦 Project Structure

```
algotutor-nextjs/
├── src/
│   ├── app/
│   │   ├── layout.tsx          # Root layout with ClerkProvider
│   │   └── page.tsx            # Main application
│   ├── components/
│   │   ├── AuthModal.tsx       # Clerk authentication modal
│   │   ├── ProblemPane.tsx     # Problem description
│   │   ├── TextTutorPanel.tsx  # Text mode AI tutor
│   │   ├── SolutionReveal.tsx  # Solution reveal component
│   │   └── ...
│   ├── contexts/
│   │   └── AuthContext.tsx     # Clerk auth wrapper
│   ├── hooks/
│   │   └── useCodeProgress.ts  # Code persistence hook
│   ├── lib/
│   │   └── supabase.ts         # Supabase client
│   ├── services/
│   │   ├── codeRunner.ts       # E2B code execution
│   │   └── textTutor.ts        # AI text tutor
│   ├── constants.ts            # Problems and config
│   └── types.ts                # TypeScript types
├── middleware.ts               # Clerk middleware
├── .env.local                  # Environment variables
└── package.json
```

## 🚀 Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import project in Vercel
3. Add environment variables
4. Deploy

### Environment Variables for Production

Make sure to set all environment variables in your hosting platform:
- Clerk keys (production keys)
- Google API key
- E2B API key
- Supabase URL and key

### Clerk Production Setup

1. Create a production Clerk application
2. Configure allowed domains
3. Update environment variables
4. Test authentication flow

## 📝 License

MIT

## 🤝 Contributing

Contributions welcome! Please open an issue or PR.

## 📧 Support

For issues or questions:
- Check [CLERK_SETUP.md](./CLERK_SETUP.md) for auth setup
- Open an issue on GitHub
- Contact support

## 🎓 Learning Resources

- [Clerk Documentation](https://clerk.com/docs)
- [Next.js Documentation](https://nextjs.org/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [Google Gemini API](https://ai.google.dev/docs)
- [E2B Documentation](https://e2b.dev/docs)
