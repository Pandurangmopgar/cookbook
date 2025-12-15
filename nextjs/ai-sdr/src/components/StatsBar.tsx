'use client';

import { DashboardStats } from '@/lib/types';
import { Users, Mail, Phone, Calendar, TrendingUp } from 'lucide-react';

interface StatsBarProps {
  stats: DashboardStats;
}

export function StatsBar({ stats }: StatsBarProps) {
  const items = [
    { label: 'Total Leads', value: stats.totalLeads, icon: Users, color: 'text-blue-600' },
    { label: 'Contacted', value: stats.leadsContacted, icon: Mail, color: 'text-green-600' },
    { label: 'Emails Sent', value: stats.emailsSent, icon: Mail, color: 'text-purple-600' },
    { label: 'Calls Made', value: stats.callsMade, icon: Phone, color: 'text-orange-600' },
    { label: 'Meetings', value: stats.meetingsBooked, icon: Calendar, color: 'text-pink-600' },
    { label: 'Response Rate', value: `${stats.responseRate}%`, icon: TrendingUp, color: 'text-emerald-600' },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
      {items.map((item) => (
        <div
          key={item.label}
          className="bg-white rounded-lg border border-gray-200 p-4"
        >
          <div className="flex items-center gap-2">
            <item.icon className={`w-5 h-5 ${item.color}`} />
            <span className="text-sm text-gray-500">{item.label}</span>
          </div>
          <p className="mt-1 text-2xl font-bold text-gray-900">{item.value}</p>
        </div>
      ))}
    </div>
  );
}
