import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { supabase } from '@/lib/supabase';
import { CATEGORIES } from '@/constants';

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Fetch all user progress
    const { data: progressData, error: progressError } = await supabase
      .from('user_progress')
      .select('*')
      .eq('clerk_user_id', userId);

    if (progressError) {
      console.error('Error fetching progress:', progressError);
      return NextResponse.json({ error: 'Failed to fetch progress' }, { status: 500 });
    }

    const progress = progressData || [];

    // Get all problems from CATEGORIES
    const allProblems = CATEGORIES.flatMap(cat => 
      cat.problems.map(p => ({ ...p, categoryName: cat.name, categoryId: cat.id }))
    );

    // Calculate stats
    const totalProblems = allProblems.length;
    const solvedIds = new Set(progress.filter(p => p.solved).map(p => p.problem_id));
    const solvedProblems = solvedIds.size;
    const totalAttempts = progress.reduce((sum, p) => sum + (p.attempts || 0), 0);
    const averageAttempts = solvedProblems > 0 ? totalAttempts / solvedProblems : 0;

    // Difficulty breakdown
    const easyProblems = allProblems.filter(p => p.difficulty === 'Easy');
    const mediumProblems = allProblems.filter(p => p.difficulty === 'Medium');
    const hardProblems = allProblems.filter(p => p.difficulty === 'Hard');

    const easyCompleted = easyProblems.filter(p => solvedIds.has(p.id)).length;
    const mediumCompleted = mediumProblems.filter(p => solvedIds.has(p.id)).length;
    const hardCompleted = hardProblems.filter(p => solvedIds.has(p.id)).length;

    // Category progress
    const categoryProgress = CATEGORIES.map(cat => ({
      category: cat.name,
      categoryId: cat.id,
      solved: cat.problems.filter(p => solvedIds.has(p.id)).length,
      total: cat.problems.length
    }));

    // Recent activity (last 10)
    const recentActivity = progress
      .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
      .slice(0, 10)
      .map(p => {
        const problem = allProblems.find(prob => prob.id === p.problem_id);
        return {
          problem_id: p.problem_id,
          problem_title: problem?.title || p.problem_id,
          solved: p.solved,
          attempts: p.attempts || 0,
          last_updated: p.updated_at,
          difficulty: problem?.difficulty || 'Unknown'
        };
      });

    // Calculate streak (days with activity)
    const uniqueDays = new Set(
      progress.map(p => new Date(p.updated_at).toDateString())
    );
    const streak = calculateStreak(Array.from(uniqueDays).map(d => new Date(d)));

    return NextResponse.json({
      totalProblems,
      solvedProblems,
      totalAttempts,
      averageAttempts,
      easyTotal: easyProblems.length,
      mediumTotal: mediumProblems.length,
      hardTotal: hardProblems.length,
      easyCompleted,
      mediumCompleted,
      hardCompleted,
      categoryProgress,
      recentActivity,
      streak
    });

  } catch (error) {
    console.error('Dashboard stats error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

function calculateStreak(dates: Date[]): number {
  if (dates.length === 0) return 0;

  const sortedDates = dates.sort((a, b) => b.getTime() - a.getTime());
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const mostRecent = new Date(sortedDates[0]);
  mostRecent.setHours(0, 0, 0, 0);
  
  const daysDiff = Math.floor((today.getTime() - mostRecent.getTime()) / (1000 * 60 * 60 * 24));
  if (daysDiff > 1) return 0;
  
  let streak = 1;
  let currentDate = new Date(mostRecent);
  
  for (let i = 1; i < sortedDates.length; i++) {
    const prevDate = new Date(sortedDates[i]);
    prevDate.setHours(0, 0, 0, 0);
    
    const expectedDate = new Date(currentDate);
    expectedDate.setDate(expectedDate.getDate() - 1);
    
    if (prevDate.getTime() === expectedDate.getTime()) {
      streak++;
      currentDate = prevDate;
    } else if (prevDate.getTime() < expectedDate.getTime()) {
      break;
    }
  }
  
  return streak;
}
