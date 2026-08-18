import React, { useState } from 'react';
import { Database, Loader2, Github } from 'lucide-react';
import { useGoogleLogin } from '@react-oauth/google';

interface GoogleLoginProps {
  onLoginSuccess: (userOrCredential: any) => void;
  onGitHubLoginSuccess?: (codeOrProfile: any) => void;
  isLoading?: boolean;
}

export const GoogleLogin: React.FC<GoogleLoginProps> = ({ onLoginSuccess, onGitHubLoginSuccess, isLoading }) => {
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [activeProvider, setActiveProvider] = useState<'google' | 'github' | null>(null);

  const triggerGoogleLogin = useGoogleLogin({
    onSuccess: (tokenResponse) => {
      setErrorMsg(null);
      setActiveProvider('google');
      onLoginSuccess(tokenResponse);
    },
    onError: (error) => {
      console.error('Google Sign-In Error:', error);
      setActiveProvider(null);
      setErrorMsg('Google authentication failed. Please try again.');
    },
  });

  const handleGoogleClick = () => {
    setErrorMsg(null);
    setActiveProvider('google');
    triggerGoogleLogin();
  };

  const handleGitHubClick = () => {
    setErrorMsg(null);
    const githubClientId = import.meta.env.VITE_GITHUB_CLIENT_ID;
    if (githubClientId && githubClientId.trim() !== '' && githubClientId !== 'your-github-client-id') {
      setActiveProvider('github');
      window.location.href = `https://github.com/login/oauth/authorize?client_id=${githubClientId}&scope=user:email`;
    } else {
      setErrorMsg('GitHub Client ID is not configured. Please set VITE_GITHUB_CLIENT_ID in your environment variables.');
    }
  };

  const isAnyLoading = isLoading || activeProvider !== null;
  const isGoogleLoading = activeProvider === 'google';
  const isGithubLoading = activeProvider === 'github';

  return (
    <div className="min-h-screen w-full bg-slate-950 text-slate-100 flex items-center justify-center p-4 relative overflow-hidden font-sans">
      {/* Background glow effects */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-brand-600/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md glass-panel p-8 rounded-2xl border border-slate-800/80 shadow-2xl relative z-10">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center p-3 bg-brand-500/10 border border-brand-500/30 rounded-2xl mb-4 text-brand-500 shadow-lg shadow-brand-500/10">
            <Database className="w-9 h-9" />
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">Welcome</h1>
          <p className="text-sm text-slate-400 mt-1.5 font-medium">Login to your account</p>
        </div>

        {/* Error Alert */}
        {errorMsg && (
          <div className="mb-6 p-3.5 bg-rose-500/10 border border-rose-500/30 rounded-xl text-xs text-rose-400 text-center animate-fade-in font-medium">
            {errorMsg}
          </div>
        )}

        <div className="space-y-3.5">
          {/* GitHub Login Button (Top) */}
          <button
            onClick={handleGitHubClick}
            disabled={isAnyLoading}
            className="w-full py-3.5 px-4 bg-slate-900 hover:bg-slate-850 active:bg-slate-800 text-white font-semibold rounded-xl transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-3 border border-slate-700/80 active:scale-[0.99] disabled:opacity-75 disabled:cursor-not-allowed"
          >
            {isGithubLoading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin text-white" />
                <span>Connecting to GitHub...</span>
              </>
            ) : (
              <>
                <Github className="w-5 h-5 text-white" />
                <span>Continue with GitHub</span>
              </>
            )}
          </button>

          {/* Google Login Button (Bottom) */}
          <button
            onClick={handleGoogleClick}
            disabled={isAnyLoading}
            className="w-full py-3.5 px-4 bg-white hover:bg-slate-100 active:bg-slate-200 text-slate-900 font-semibold rounded-xl transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-3 border border-slate-300 active:scale-[0.99] disabled:opacity-75 disabled:cursor-not-allowed"
          >
            {isGoogleLoading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin text-brand-600" />
                <span>Connecting to Google...</span>
              </>
            ) : (
              <>
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                <span>Continue with Google</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
