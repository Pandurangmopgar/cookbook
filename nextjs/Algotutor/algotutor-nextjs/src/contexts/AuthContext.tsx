'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useUser, useClerk } from '@clerk/nextjs';
import { supabase } from '@/lib/supabase';

interface ClerkUser {
  id: string;
  email: string | null;
  firstName: string | null;
  lastName: string | null;
  imageUrl: string | null;
}

interface AuthContextType {
  user: ClerkUser | null;
  loading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { user: clerkUser, isLoaded } = useUser();
  const { signOut: clerkSignOut } = useClerk();
  const [user, setUser] = useState<ClerkUser | null>(null);

  // Create user profile in database when user signs in
  const createUserProfile = async (clerkUser: any) => {
    try {
      const email = clerkUser.primaryEmailAddress?.emailAddress || clerkUser.emailAddresses?.[0]?.emailAddress;
      const displayName = [clerkUser.firstName, clerkUser.lastName].filter(Boolean).join(' ') || email?.split('@')[0] || 'User';
      
      // Upsert profile (create if not exists, update if exists)
      const { error } = await supabase
        .from('user_profiles')
        .upsert({
          clerk_user_id: clerkUser.id,
          email: email,
          display_name: displayName,
          avatar_url: clerkUser.imageUrl || null,
          updated_at: new Date().toISOString(),
        }, {
          onConflict: 'clerk_user_id',
        });

      if (error) {
        console.error('Error upserting user profile:', error);
      } else {
        console.log('User profile synced for:', clerkUser.id);
      }
    } catch (error) {
      console.error('Error creating user profile:', error);
    }
  };

  useEffect(() => {
    if (isLoaded && clerkUser) {
      const email = clerkUser.primaryEmailAddress?.emailAddress || clerkUser.emailAddresses?.[0]?.emailAddress || null;
      
      setUser({
        id: clerkUser.id,
        email: email,
        firstName: clerkUser.firstName,
        lastName: clerkUser.lastName,
        imageUrl: clerkUser.imageUrl,
      });

      // Create profile in database
      createUserProfile(clerkUser);
    } else if (isLoaded && !clerkUser) {
      setUser(null);
    }
  }, [clerkUser, isLoaded]);

  const signOut = async () => {
    await clerkSignOut();
  };

  return (
    <AuthContext.Provider value={{ user, loading: !isLoaded, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
