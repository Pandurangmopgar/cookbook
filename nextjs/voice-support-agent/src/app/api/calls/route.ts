import { NextResponse } from 'next/server';
import { getAllActiveCalls, getCallHistory, getDailyStats } from '@/lib/redis';

export async function GET() {
  try {
    const [activeCalls, history, stats] = await Promise.all([
      getAllActiveCalls(),
      getCallHistory(20),
      getDailyStats(),
    ]);

    return NextResponse.json({
      active: activeCalls,
      history,
      stats: {
        activeCount: activeCalls.length,
        totalToday: stats.totalCalls,
        avgDuration: stats.avgDuration,
        memoriesStored: stats.memoriesStored,
      },
    });
  } catch (error) {
    console.error('Error fetching calls:', error);
    return NextResponse.json({
      active: [],
      history: [],
      stats: { activeCount: 0, totalToday: 0, avgDuration: 0, memoriesStored: 0 },
    });
  }
}
