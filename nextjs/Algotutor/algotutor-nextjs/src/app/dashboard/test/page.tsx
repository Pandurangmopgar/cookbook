'use client';

import { useAuth } from '@/contexts/AuthContext';

export default function DashboardTestPage() {
  const { user, loading } = useAuth();

  return (
    <div className="min-h-screen bg-slate-950 text-white p-8">
      <h1 className="text-2xl font-bold mb-4">Dashboard Test Page</h1>
      <div className="bg-slate-900 p-6 rounded-lg">
        <p className="mb-2">Loading: {loading ? 'Yes' : 'No'}</p>
        <p className="mb-2">User: {user ? 'Authenticated' : 'Not authenticated'}</p>
        {user && (
          <div className="mt-4">
            <p>User ID: {user.id}</p>
            <p>Email: {user.email}</p>
          </div>
        )}
      </div>
      <a href="/dashboard" className="mt-4 inline-block px-4 py-2 bg-violet-600 rounded">
        Go to Dashboard
      </a>
    </div>
  );
}
