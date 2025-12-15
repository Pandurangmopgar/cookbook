import { SignIn } from '@clerk/nextjs';

export default function SignInPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-900">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Welcome Back</h1>
          <p className="text-slate-400">Sign in to continue your coding journey</p>
        </div>
        <SignIn 
          routing="hash"
          appearance={{
            elements: {
              rootBox: "mx-auto",
              card: "bg-slate-800 border border-slate-700 shadow-2xl",
              headerTitle: "text-white",
              headerSubtitle: "text-slate-300",
              socialButtonsBlockButton: "bg-slate-700 border-slate-600 text-white hover:bg-slate-600",
              socialButtonsBlockButtonText: "text-white",
              dividerLine: "bg-slate-600",
              dividerText: "text-slate-400",
              formFieldLabel: "text-slate-200",
              formFieldInput: "bg-slate-900 border-slate-600 text-white placeholder:text-slate-500",
              formButtonPrimary: "bg-purple-600 hover:bg-purple-700",
              footerActionLink: "text-purple-400 hover:text-purple-300",
              identityPreviewText: "text-white",
              identityPreviewEditButton: "text-purple-400",
            },
          }}
        />
      </div>
    </div>
  );
}
