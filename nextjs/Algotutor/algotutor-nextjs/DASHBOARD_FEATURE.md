# AlgoTutor Dashboard Feature

## Overview
The dashboard provides users with a comprehensive view of their coding progress, including statistics, achievements, and recent activity.

## Features

### 📊 Statistics Cards
- **Problems Solved**: Total number of problems completed with completion rate
- **Total Attempts**: Number of attempts made across all problems with average per problem
- **Current Streak**: Days of consecutive activity to encourage daily practice
- **Total Problems**: Available problems in the platform

### 📈 Progress Tracking
- **Difficulty Breakdown**: Visual progress bars showing completion by difficulty (Easy, Medium, Hard)
- **Category Progress**: Grid view of progress across different problem categories (Binary Search, Hash Map, Stack, etc.)

### 🕐 Recent Activity
- Timeline of recent problem attempts
- Shows problem title, attempt count, solved status, and last updated date
- Visual indicators for solved vs. in-progress problems

### 🔥 Streak Calculation
- Tracks consecutive days of activity
- Encourages daily practice
- Resets if more than 1 day gap

## File Structure

```
src/
├── app/
│   ├── dashboard/
│   │   └── page.tsx                    # Main dashboard page
│   └── api/
│       └── dashboard/
│           └── stats/
│               └── route.ts            # API endpoint for dashboard stats
└── hooks/
    └── useCodeProgress.ts              # Hook for tracking user progress (existing)
```

## API Endpoint

### GET `/api/dashboard/stats`
Returns comprehensive dashboard statistics for the authenticated user.

**Response:**
```json
{
  "totalProblems": 10,
  "solvedProblems": 5,
  "totalAttempts": 15,
  "averageAttempts": 3.0,
  "easyCompleted": 3,
  "mediumCompleted": 2,
  "hardCompleted": 0,
  "categoryProgress": [
    {
      "category": "Binary Search",
      "solved": 1,
      "total": 2
    }
  ],
  "recentActivity": [
    {
      "problem_id": "binary-search",
      "problem_title": "Binary Search",
      "solved": true,
      "attempts": 3,
      "last_updated": "2024-01-15T10:30:00Z"
    }
  ],
  "streak": 5
}
```

## Usage

### Accessing the Dashboard
1. Sign in to AlgoTutor
2. Click on your profile avatar in the top right
3. Select "Dashboard" from the dropdown menu

### Navigation
- Click "Back to Problems" button to return to the main coding interface
- Dashboard automatically redirects to home if user is not authenticated

## Database Schema

The dashboard uses the existing `user_progress` table:

```sql
user_progress (
  clerk_user_id TEXT,
  problem_id TEXT,
  last_code TEXT,
  solved BOOLEAN,
  attempts INTEGER,
  solution_revealed BOOLEAN,
  updated_at TIMESTAMP,
  PRIMARY KEY (clerk_user_id, problem_id)
)
```

## Styling

- Follows the same dark theme as the main AlgoTutor interface
- Uses Tailwind CSS with slate color palette
- Responsive design with mobile-first approach
- Smooth transitions and hover effects

## Future Enhancements

Potential features to add:
- [ ] Weekly/Monthly progress charts
- [ ] Achievement badges and milestones
- [ ] Comparison with other users (leaderboard)
- [ ] Time spent per problem tracking
- [ ] Difficulty progression recommendations
- [ ] Export progress as PDF/CSV
- [ ] Social sharing of achievements
- [ ] Calendar heatmap of activity
- [ ] Problem recommendation engine based on progress

## Dependencies

- Next.js 14+ (App Router)
- Clerk (Authentication)
- Supabase (Database)
- Tailwind CSS (Styling)
- Lucide React (Icons)
