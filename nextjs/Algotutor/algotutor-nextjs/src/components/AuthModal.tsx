'use client';

import React from 'react';
import { X } from 'lucide-react';
import { SignIn, SignUp } from '@clerk/nextjs';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  mode?: 'signin' | 'signup';
}

export default function AuthModal({ isOpen, onClose, mode = 'signin' }: AuthModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-[#1e1e1e] border border-[#333] rounded-xl p-6 w-full max-w-md mx-4 shadow-2xl relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1 hover:bg-[#333] rounded text-[#808080] hover:text-white transition-colors z-10"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Clerk Auth Component */}
        <div className="clerk-modal-wrapper">
          {mode === 'signin' ? (
            <SignIn 
              appearance={{
                elements: {
                  rootBox: "w-full",
                  card: "bg-transparent shadow-none",
                }
              }}
              afterSignInUrl="/"
              afterSignUpUrl="/"
            />
          ) : (
            <SignUp 
              appearance={{
                elements: {
                  rootBox: "w-full",
                  card: "bg-transparent shadow-none",
                }
              }}
              afterSignInUrl="/"
              afterSignUpUrl="/"
            />
          )}
        </div>
      </div>
    </div>
  );
}
