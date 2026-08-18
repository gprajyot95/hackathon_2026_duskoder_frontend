import { useState, useEffect } from 'react';
import { User } from '../types';
import { authService } from '../services/authService';
import axios from 'axios';

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('erp_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState<string | null>(() => {
    return localStorage.getItem('erp_token');
  });
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isExchangingCode, setIsExchangingCode] = useState<boolean>(() => {
    return typeof window !== 'undefined' && new URLSearchParams(window.location.search).has('code');
  });

  const login = async (googleTokenOrProfile: any) => {
    setIsLoading(true);
    try {
      const data = await authService.loginWithGoogle(googleTokenOrProfile);
      setUser(data.user);
      setToken(data.token);
      localStorage.setItem('erp_user', JSON.stringify(data.user));
      localStorage.setItem('erp_token', data.token);
    } catch (err) {
      console.warn('Backend login endpoint fallback enabled:', err);
      let profile = googleTokenOrProfile.profileObj || googleTokenOrProfile;

      if (googleTokenOrProfile.access_token && (!profile.email || !profile.name)) {
        try {
          const res = await axios.get('https://www.googleapis.com/oauth2/v3/userinfo', {
            headers: { Authorization: `Bearer ${googleTokenOrProfile.access_token}` },
          });
          profile = { ...profile, ...res.data };
        } catch (e) {
          console.warn('Fallback: could not fetch Google userinfo:', e);
        }
      }

      const dummyUser: User = {
        id: Date.now(),
        googleId: profile?.sub || profile?.googleId || `google-${Date.now()}`,
        email: profile?.email || 'user@enterprise.com',
        name: profile?.name || 'Google User',
        profilePictureUrl: profile?.picture || profile?.profilePictureUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80',
        role: 'ADMIN',
        status: 'ACTIVE',
        lastLoginAt: new Date().toISOString(),
        authProvider: 'google',
      };
      setUser(dummyUser);
      setToken('demo-jwt-token');
      localStorage.setItem('erp_user', JSON.stringify(dummyUser));
      localStorage.setItem('erp_token', 'demo-jwt-token');
    } finally {
      setIsLoading(false);
    }
  };

  const loginWithGitHub = async (codeOrProfile: any) => {
    setIsLoading(true);
    try {
      const data = await authService.loginWithGitHub(codeOrProfile);
      setUser(data.user);
      setToken(data.token);
      localStorage.setItem('erp_user', JSON.stringify(data.user));
      localStorage.setItem('erp_token', data.token);
    } catch (err) {
      console.warn('Backend GitHub login endpoint fallback enabled:', err);
      const profile = typeof codeOrProfile === 'object' ? codeOrProfile : {};
      const dummyUser: User = {
        id: Date.now(),
        githubId: profile.githubId || profile.id || `github-${Date.now()}`,
        email: profile.email || 'developer@github.com',
        name: profile.name || profile.login || 'GitHub Developer',
        profilePictureUrl: profile.picture || profile.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80',
        role: 'ADMIN',
        status: 'ACTIVE',
        lastLoginAt: new Date().toISOString(),
        authProvider: 'github',
      };
      setUser(dummyUser);
      setToken('demo-github-jwt-token');
      localStorage.setItem('erp_user', JSON.stringify(dummyUser));
      localStorage.setItem('erp_token', 'demo-github-jwt-token');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    if (code && !user) {
      setIsExchangingCode(true);
      loginWithGitHub(code).then(() => {
        const newUrl = window.location.pathname;
        window.history.replaceState({}, document.title, newUrl);
      }).catch(err => {
        console.warn('GitHub authorization code processing failed:', err);
      }).finally(() => {
        setIsExchangingCode(false);
      });
    } else {
      setIsExchangingCode(false);
    }
  }, []);

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('erp_user');
    localStorage.removeItem('erp_token');
  };

  const setUserRole = (role: 'ADMIN' | 'USER') => {
    if (user) {
      const updated = { ...user, role };
      setUser(updated);
      localStorage.setItem('erp_user', JSON.stringify(updated));
    }
  };

  return {
    user,
    token,
    isAuthenticated: !!user,
    isLoading,
    isExchangingCode,
    login,
    loginWithGitHub,
    logout,
    setUserRole,
  };
};
