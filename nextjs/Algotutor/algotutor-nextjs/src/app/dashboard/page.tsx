'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { 
  Trophy, Target, Code2, Clock, CheckCircle, BarChart3, 
  Loader2, ArrowLeft, Flame, Star, Zap, Award, Lock
} from 'lucide-react';

interface DashboardStats {
  totalProblems: number;
  solvedProblems: number;
  totalAttempts: number;
  averageAttempts: number;
  easyTotal: number;
  mediumTotal: number;
  hardTotal: number;
  easyCompleted: number;
  mediumCompleted: number;
  hardCompleted: number;
  recentActivity: Array<{
    problem_id: string;
    problem_title: string;
    solved: boolean;
    attempts: number;
    last_updated: string;
    difficulty: string;
  }>;
  categoryProgress: Array<{
    category: string;
    categoryId: string;
    solved: number;
    total: number;
  }>;
  streak: number;
}

const achievements = [
  { id: 'first-solve', title: 'First Steps', desc: 'Solve your first problem', icon: Star, check: (s: DashboardStats) => s.solvedProblems >= 1 },
  { id: 'five-streak', title: 'On Fire', desc: '5-day streak', icon: Flame, check: (s: DashboardStats) => s.streak >= 5 },
  { id: 'ten-solved', title: 'Problem Solver', desc: 'Solve 10 problems', icon: Target, check: (s: DashboardStats) => s.solvedProblems >= 10 },
  { id: 'easy-master', title: 'Easy Master', desc: 'Complete all Easy', icon: Trophy, check: (s: DashboardStats) => s.easyCompleted >= s.easyTotal && s.easyTotal > 0 },
  { id: 'medium-warrior', title: 'Medium Warrior', desc: 'Solve 5 Medium', icon: Zap, check: (s: DashboardStats) => s.mediumCompleted >= 5 },
  { id: 'hard-conqueror', title: 'Hard Conqueror', desc: 'Solve a Hard problem', icon: Award, check: (s: DashboardStats) => s.hardCompleted >= 1 },
];

function StatCard({ icon: Icon, iconColor, bgColor, value, label, sub }: {
  icon: React.ElementType; iconColor: string; bgColor: string; value: number; label: string; sub: string;
}) {
  return (
    <div className="bg-[#161b22] border border-gray-800 rounded-xl p-4">
      <div className="flex items-center gap-3">
        <div className={`w-10 h-10 rounded-lg ${bgColor} flex items-center justify-center`}>
          <Icon className={`w-5 h-5 ${iconColor}`} />
        </div>
        <div>
          <div className="text-2xl font-bold">{value}</div>
          <div className="text-xs text-gray-400">{label}</div>
        </div>
      </div>
      <div className="text-xs text-gray-500 mt-2">{sub}</div>
    </div>
  );
}

function DifficultyBar({ label, completed, total, color }: { label: string; completed: number; total: number; color: string; }) {
  const pct = total > 0 ? (completed / total) * 100 : 0;
  return (
    <div>
      <div className="flex justify-between text-sm mb-1">
        <span className="text-gray-300">{label}</span>
        <span className="text-gray-400">{completed}/{total}</span>
      </div>
      <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
        <div className={`h-full ${color} rounded-full transition-all`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

function CategoryCard({ name, solved, total }: { name: string; solved: number; total: number; }) {
  const pct = total > 0 ? Math.round((solved / total) * 100) : 0;
  return (
    <div className="bg-gray-800/50 rounded-lg p-3 hover:bg-gray-800 transition-colors">
      <div className="text-sm font-medium text-white truncate">{name}</div>
      <div className="text-xs text-gray-400 mt-1">{solved}/{total} solved</div>
      <div className="h-1.5 bg-gray-700 rounded-full mt-2 overflow-hidden">
        <div className="h-full bg-violet-500 rounded-full" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user && !authLoading) {
      fetchDashboardStats();
    }
  }, [user, authLoading]);

  const fetchDashboardStats = async () => {
    try {
      const response = await fetch('/api/dashboard/stats');
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || loading || !user) {
    return (
      <div className="min-h-screen bg-[#0d1117] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-violet-500 animate-spin" />
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="min-h-screen bg-[#0d1117] flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-400 mb-4">Failed to load dashboard</p>
          <button onClick={() => { setLoading(true); fetchDashboardStats(); }}
            className="px-4 py-2 bg-violet-600 hover:bg-violet-700 rounded-lg text-white">
            Retry
          </button>
        </div>
      </div>
    );
  }

  const solveRate = stats.totalProblems > 0 ? Math.round((stats.solvedProblems / stats.totalProblems) * 100) : 0;

  return (
    <div className="min-h-screen bg-[#0d1117] text-white">
      {/* Header */}
      <header className="border-b border-gray-800 bg-[#161b22]">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => router.push('/')} className="p-2 hover:bg-gray-800 rounded-lg text-gray-400 hover:text-white">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="text-xl font-bold">Dashboard</h1>
          </div>
          <span className="text-sm text-gray-400">{user.email}</span>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-6 space-y-6">
        {/* Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard icon={CheckCircle} iconColor="text-green-400" bgColor="bg-green-500/10"
            value={stats.solvedProblems} label="Solved" sub={`${solveRate}% of ${stats.totalProblems}`} />
          <StatCard icon={Target} iconColor="text-blue-400" bgColor="bg-blue-500/10"
            value={stats.totalAttempts} label="Attempts" sub={`${stats.averageAttempts.toFixed(1)} avg`} />
          <StatCard icon={Flame} iconColor="text-orange-400" bgColor="bg-orange-500/10"
            value={stats.streak} label="Day Streak" sub="Keep it up!" />
          <StatCard icon={Code2} iconColor="text-violet-400" bgColor="bg-violet-500/10"
            value={stats.totalProblems} label="Total Problems" sub="Available" />
        </div>

        {/* Difficulty + Categories */}
        <div className="grid md:grid-cols-3 gap-4">
          {/* Difficulty */}
          <div className="bg-[#161b22] border border-gray-800 rounded-xl p-5">
            <h2 className="text-sm font-semibold text-gray-400 mb-4 flex items-center gap-2">
              <BarChart3 className="w-4 h-4" /> By Difficulty
            </h2>
            <div className="space-y-4">
              <DifficultyBar label="Easy" completed={stats.easyCompleted} total={stats.easyTotal} color="bg-green-500" />
              <DifficultyBar label="Medium" completed={stats.mediumCompleted} total={stats.mediumTotal} color="bg-yellow-500" />
              <DifficultyBar label="Hard" completed={stats.hardCompleted} total={stats.hardTotal} color="bg-red-500" />
            </div>
          </div>

          {/* Categories */}
          <div className="md:col-span-2 bg-[#161b22] border border-gray-800 rounded-xl p-5">
            <h2 className="text-sm font-semibold text-gray-400 mb-4">Category Progress</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-[280px] overflow-y-auto pr-2">
              {stats.categoryProgress.map((cat) => (
                <CategoryCard key={cat.categoryId} name={cat.category} solved={cat.solved} total={cat.total} />
              ))}
            </div>
          </div>
        </div>

        {/* Achievements */}
        <div className="bg-[#161b22] border border-gray-800 rounded-xl p-5">
          <h2 className="text-sm font-semibold text-gray-400 mb-4 flex items-center gap-2">
            <Trophy className="w-4 h-4" /> Achievements
          </h2>
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-4">
            {achievements.map((ach) => {
              const unlocked = ach.check(stats);
              const Icon = ach.icon;
              return (
                <div key={ach.id} className="group relative flex flex-col items-center">
                  <div className={`w-14 h-14 rounded-xl flex items-center justify-center transition-all ${
                    unlocked 
                      ? 'bg-gradient-to-br from-violet-500 to-purple-600 shadow-lg shadow-violet-500/30' 
                      : 'bg-gray-800 border border-gray-700'
                  }`}>
                    {unlocked ? (
                      <Icon className="w-6 h-6 text-white" />
                    ) : (
                      <Lock className="w-5 h-5 text-gray-600" />
                    )}
                  </div>
                  <span className={`text-xs mt-2 text-center ${unlocked ? 'text-white' : 'text-gray-500'}`}>
                    {ach.title}
                  </span>
                  {/* Tooltip */}
                  <div className="absolute bottom-full mb-2 hidden group-hover:block z-10">
                    <div className="bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-xs whitespace-nowrap">
                      {ach.desc}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-[#161b22] border border-gray-800 rounded-xl p-5">
          <h2 className="text-sm font-semibold text-gray-400 mb-4 flex items-center gap-2">
            <Clock className="w-4 h-4" /> Recent Activity
          </h2>
          {stats.recentActivity.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Code2 className="w-10 h-10 mx-auto mb-2 opacity-50" />
              <p>No activity yet. Start solving problems!</p>
            </div>
          ) : (
            <div className="space-y-2">
              {stats.recentActivity.map((activity, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg hover:bg-gray-800 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                      activity.solved ? 'bg-green-500/20' : 'bg-gray-700'
                    }`}>
                      {activity.solved ? (
                        <CheckCircle className="w-4 h-4 text-green-400" />
                      ) : (
                        <Code2 className="w-4 h-4 text-gray-400" />
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-medium">{activity.problem_title}</p>
                      <p className="text-xs text-gray-500">{activity.attempts} attempt{activity.attempts !== 1 ? 's' : ''}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`text-xs px-2 py-0.5 rounded ${
                      activity.difficulty === 'Easy' ? 'bg-green-500/20 text-green-400' :
                      activity.difficulty === 'Medium' ? 'bg-yellow-500/20 text-yellow-400' :
                      'bg-red-500/20 text-red-400'
                    }`}>
                      {activity.difficulty}
                    </span>
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(activity.last_updated).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
