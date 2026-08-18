import React from 'react';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { useAuth } from './hooks/useAuth';
import { GoogleLogin } from './components/Auth/GoogleLogin';
import { Dashboard } from './components/Layout/Dashboard';

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';

export function App() {
  const { user, isAuthenticated, isLoading, login, loginWithGitHub, logout } = useAuth();

  if (!isAuthenticated || !user) {
    return (
      <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
        <GoogleLogin onLoginSuccess={login} onGitHubLoginSuccess={loginWithGitHub} isLoading={isLoading} />
      </GoogleOAuthProvider>
    );
  }

  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <Dashboard user={user} onLogout={logout} />
    </GoogleOAuthProvider>
  );
}

export default App;
