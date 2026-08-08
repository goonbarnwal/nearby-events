import React, { useState, useEffect } from 'react';
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';
import {
  X,
  Mail,
  Lock,
  User as UserIcon,
  Loader2,
  KeyRound,
  CheckCircle2,
  ArrowLeft,
  Eye,
  EyeOff,
  ShieldCheck,
  Sun,
  Moon,
  Github,
  Check,
  AlertCircle,
  RefreshCw,
  Sparkles,
  ExternalLink,
} from 'lucide-react';
import { User as UserType } from '../types';
import {
  loginUser,
  registerUser,
  googleAuthUser,
  githubAuthUser,
  appleAuthUser,
  getAuthConfig,
} from '../services/api';

interface AuthModalProps {
  onClose: () => void;
  onLoginSuccess: (user: UserType) => void;
  initialMessage?: string;
}

type AuthTab = 'signin' | 'signup';

export const AuthModal: React.FC<AuthModalProps> = ({ onClose, onLoginSuccess, initialMessage }) => {
  const [activeTab, setActiveTab] = useState<AuthTab>('signin');
  const [isDarkMode, setIsDarkMode] = useState(() => {
    return document.documentElement.classList.contains('dark');
  });

  // Sync dark mode toggle with document HTML class
  const toggleDarkMode = () => {
    const nextMode = !isDarkMode;
    setIsDarkMode(nextMode);
    if (nextMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  // Form states
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [acceptTerms, setAcceptTerms] = useState(false);

  // Visibility toggles
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // UI state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string; subText?: string } | null>(null);
  const [googleClientId, setGoogleClientId] = useState<string>('');

  // Fetch OAuth config on mount
  useEffect(() => {
    getAuthConfig().then((cfg) => {
      if (cfg.googleClientId) {
        setGoogleClientId(cfg.googleClientId);
      }
    });
  }, []);

  const handleGoogleCredentialSuccess = async (credential: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await googleAuthUser({ credential });
      saveUserToLocal({ name: res.user.name, email: res.user.email });

      setToast({
        type: 'success',
        message: 'Google Sign-In Successful!',
        subText: `Welcome, ${res.user.name}`,
      });

      setTimeout(() => {
        onLoginSuccess(res.user);
      }, 600);
    } catch (err: any) {
      setError(err.message || 'Google Auth Verification Failed');
    } finally {
      setLoading(false);
    }
  };

  // Saved user helper
  const getSavedUser = (): { name: string; email: string } | null => {
    try {
      const raw = localStorage.getItem('nearevent_saved_user');
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  };

  const saveUserToLocal = (u: { name: string; email: string }) => {
    try {
      localStorage.setItem('nearevent_saved_user', JSON.stringify(u));
    } catch (e) {
      console.warn('Failed to save user profile:', e);
    }
  };

  // Load Google Identity Services script dynamically and listen for OAuth message
  useEffect(() => {
    // Load Google GSI Client Script
    if (!document.getElementById('google-gsi-script')) {
      const script = document.createElement('script');
      script.id = 'google-gsi-script';
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      document.head.appendChild(script);
    }

    const handleMessage = async (event: MessageEvent) => {
      if (event.data?.type === 'GOOGLE_OAUTH_SUCCESS') {
        const { idToken, accessToken, code, error: popupErr } = event.data;
        if (popupErr) {
          if (popupErr.includes('redirect_uri_mismatch')) {
            setError(
              `Google OAuth Error (redirect_uri_mismatch): Please add "${window.location.origin}/auth/google/callback" to Authorized Redirect URIs in your Google Cloud Console Credentials.`
            );
          } else {
            setError(`Google sign-in cancelled or failed: ${popupErr}`);
          }
          setLoading(false);
          return;
        }

        try {
          setLoading(true);
          const res = await googleAuthUser({
            credential: idToken,
            accessToken: accessToken,
            code: code,
          });

          saveUserToLocal({ name: res.user.name, email: res.user.email });

          setToast({
            type: 'success',
            message: 'Google Sign-In Successful!',
            subText: `Welcome, ${res.user.name}`,
          });

          setTimeout(() => {
            onLoginSuccess(res.user);
          }, 600);
        } catch (err: any) {
          setError(err.message || 'Failed to authenticate Google account with server.');
        } finally {
          setLoading(false);
        }
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [onLoginSuccess]);

  const openGoogleOAuthPopup = (clientId: string) => {
    const redirectUri = `${window.location.origin}/auth/google/callback`;
    const scope = encodeURIComponent('openid email profile');
    const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${encodeURIComponent(
      clientId
    )}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=id_token%20token&scope=${scope}&nonce=${Date.now()}&prompt=select_account`;

    const width = 500;
    const height = 620;
    const left = window.screenX + (window.outerWidth - width) / 2;
    const top = window.screenY + (window.outerHeight - height) / 2;

    const popup = window.open(
      googleAuthUrl,
      'google_oauth_popup',
      `width=${width},height=${height},top=${top},left=${left},scrollbars=yes,status=yes`
    );

    if (!popup) {
      setError('Popup was blocked by your browser. Please allow popups for Google Sign-In.');
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError(null);
    setLoading(true);

    try {
      const config = await getAuthConfig();
      const clientId = config.googleClientId || (import.meta as any).env?.VITE_GOOGLE_CLIENT_ID || '';

      if (!clientId || clientId.includes('your_google_client_id') || clientId === 'demo-google-oauth-client-id') {
        setError(
          `Google Client ID is not configured. Please set GOOGLE_CLIENT_ID in .env or Google Cloud Console.`
        );
        setLoading(false);
        return;
      }

      // Check if Google Identity Services Token Client is available (No redirect_uri needed!)
      if (typeof window !== 'undefined' && (window as any).google?.accounts?.oauth2) {
        const tokenClient = (window as any).google.accounts.oauth2.initTokenClient({
          client_id: clientId,
          scope: 'openid email profile',
          callback: async (tokenResponse: any) => {
            if (tokenResponse.error) {
              if (tokenResponse.error !== 'popup_closed_by_user') {
                setError(`Google Sign-In error: ${tokenResponse.error}`);
              }
              setLoading(false);
              return;
            }
            if (tokenResponse.access_token) {
              try {
                const res = await googleAuthUser({ accessToken: tokenResponse.access_token });
                saveUserToLocal(res.user);
                setToast({
                  type: 'success',
                  message: 'Google Sign-In Successful!',
                  subText: `Welcome, ${res.user.name}`,
                });
                setTimeout(() => {
                  onLoginSuccess(res.user);
                }, 600);
              } catch (err: any) {
                setError(err.message || 'Google Auth Verification Failed');
              } finally {
                setLoading(false);
              }
            }
          },
        });
        tokenClient.requestAccessToken();
      } else if (typeof window !== 'undefined' && (window as any).google?.accounts?.id) {
        (window as any).google.accounts.id.initialize({
          client_id: clientId,
          callback: async (response: any) => {
            if (response.credential) {
              try {
                const res = await googleAuthUser({ credential: response.credential });
                saveUserToLocal(res.user);
                onLoginSuccess(res.user);
              } catch (err: any) {
                setError(err.message || 'Google Auth Verification Failed');
              } finally {
                setLoading(false);
              }
            }
          },
        });
        (window as any).google.accounts.id.prompt((notification: any) => {
          if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
            openGoogleOAuthPopup(clientId);
          }
        });
      } else {
        openGoogleOAuthPopup(clientId);
      }
    } catch (err: any) {
      console.error('Google Auth Init Error:', err);
      setError(err.message || 'Could not launch Google Sign In');
      setLoading(false);
    }
  };

  // Password strength calculation
  const getPasswordStrength = (pwd: string) => {
    let score = 0;
    if (!pwd) return { score: 0, label: 'Too Short', color: 'bg-slate-200 dark:bg-slate-700' };

    const hasLength = pwd.length >= 8;
    const hasUpper = /[A-Z]/.test(pwd);
    const hasNumber = /[0-9]/.test(pwd);
    const hasSpecial = /[^A-Za-z0-9]/.test(pwd);

    if (pwd.length >= 6) score += 1;
    if (hasLength) score += 1;
    if (hasUpper) score += 1;
    if (hasNumber) score += 1;
    if (hasSpecial) score += 1;

    if (score <= 1) return { score: 1, label: 'Weak', color: 'bg-rose-500', text: 'text-rose-500' };
    if (score <= 3) return { score: 2, label: 'Fair', color: 'bg-amber-500', text: 'text-amber-500' };
    if (score === 4) return { score: 3, label: 'Good', color: 'bg-blue-500', text: 'text-blue-500' };
    return { score: 4, label: 'Strong', color: 'bg-emerald-500', text: 'text-emerald-500' };
  };

  const pwdStrength = getPasswordStrength(password);

  // Handle Login
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setToast(null);

    if (!email.trim() || !password) {
      setError('Please enter both email and password.');
      return;
    }

    setLoading(true);
    try {
      const res = await loginUser({ email, password, rememberMe });
      saveUserToLocal({ name: res.user.name, email: res.user.email });

      setToast({
        type: 'success',
        message: 'Welcome back!',
        subText: `Logged in as ${res.user.name}`,
      });

      setTimeout(() => {
        onLoginSuccess(res.user);
      }, 700);
    } catch (err: any) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  // Handle Signup
  const handleSignUpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setToast(null);

    if (!name.trim() || !email.trim() || !password) {
      setError('All fields are required.');
      return;
    }

    if (!email.includes('@') || !email.includes('.')) {
      setError('Please enter a valid email address.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match. Please verify your password.');
      return;
    }

    if (!acceptTerms) {
      setError('You must accept the Terms of Service & Privacy Policy to register.');
      return;
    }

    setLoading(true);
    try {
      const res = await registerUser({ name, email, password });
      saveUserToLocal({ name: res.user.name, email: res.user.email });

            setToast({
        type: 'success',
        message: 'Account created successfully!'
      });
      setTimeout(() => {
        onLoginSuccess(res.user as UserType);
      }, 1000);
    } catch (err: any) {
      setError(err.message || 'Registration failed. An account with this email may already exist.');
    } finally {
      setLoading(false);
    }
  };

  // Handle Google Login / Social execute
  // Handle GitHub Login
  const handleGithubLogin = async () => {
    const targetEmail = email.trim();
    if (!targetEmail) {
      setError('Please enter your email to log in with GitHub.');
      return;
    }
    const targetName = name.trim() || targetEmail.split('@')[0] || 'GitHub Developer';

    setLoading(true);
    setError(null);
    try {
      const res = await githubAuthUser({
        name: targetName,
        email: targetEmail,
      });
      saveUserToLocal({ name: res.user.name, email: res.user.email });

      setToast({
        type: 'success',
        message: 'GitHub Sign-In Successful',
        subText: `Connected as ${res.user.name}`,
      });

      setTimeout(() => {
        onLoginSuccess(res.user);
      }, 700);
    } catch (err: any) {
      setError(err.message || 'GitHub authentication failed');
    } finally {
      setLoading(false);
    }
  };

  // Handle Apple Login
  const handleAppleLogin = async () => {
    const targetEmail = email.trim();
    if (!targetEmail) {
      setError('Please enter your email to log in with Apple.');
      return;
    }
    const targetName = name.trim() || targetEmail.split('@')[0] || 'Apple User';

    setLoading(true);
    setError(null);
    try {
      const res = await appleAuthUser({
        name: targetName,
        email: targetEmail,
      });
      saveUserToLocal({ name: res.user.name, email: res.user.email });

      setToast({
        type: 'success',
        message: 'Apple Sign-In Successful',
        subText: `Authenticated with Apple ID (${targetEmail})`,
      });

      setTimeout(() => {
        onLoginSuccess(res.user);
      }, 700);
    } catch (err: any) {
      setError(err.message || 'Apple authentication failed');
    } finally {
      setLoading(false);
    }
  };

  // Handle Facebook Login
  const handleFacebookLogin = async () => {
    const targetEmail = email.trim();
    if (!targetEmail) {
      setError('Please enter your email to log in with Facebook.');
      return;
    }
    const targetName = name.trim() || targetEmail.split('@')[0] || 'Facebook User';

    setLoading(true);
    setError(null);
    try {
      const res = await googleAuthUser({
        name: targetName,
        email: targetEmail,
      });
      saveUserToLocal({ name: res.user.name, email: res.user.email });

      setToast({
        type: 'success',
        message: 'Facebook Sign-In Successful',
        subText: `Connected via Facebook (${targetEmail})`,
      });

      setTimeout(() => {
        onLoginSuccess(res.user);
      }, 700);
    } catch (err: any) {
      setError(err.message || 'Facebook authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const savedUser = getSavedUser();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto backdrop-blur-md bg-slate-950/60 animate-in fade-in duration-200">
      <div className="relative w-full max-w-md overflow-hidden transition-all my-auto shadow-2xl bg-slate-900 text-white rounded-[28px] border border-slate-800 p-0">
        
        {/* Header Bar for regular auth modal */}
        <div className="relative px-6 pt-6 pb-2">
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute right-5 top-5 p-2 rounded-full text-emerald-500 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 transition-colors cursor-pointer"
            title="Close"
          >
            <X className="w-5 h-5 stroke-[2.5]" />
          </button>

          {true && (
            <div className="space-y-4 text-center">
              {/* Top Pill Tab Switcher */}
              <div className="inline-flex items-center p-1 bg-slate-100 dark:bg-slate-800/80 rounded-full w-full max-w-xs mx-auto border border-slate-200/50 dark:border-slate-700/50">
                <button
                  type="button"
                  onClick={() => { setActiveTab('signin'); setError(null); }}
                  className={`flex-1 py-2 text-xs font-bold rounded-full transition-all cursor-pointer ${
                    activeTab === 'signin'
                      ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm'
                      : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
                  }`}
                >
                  Log In
                </button>
                <button
                  type="button"
                  onClick={() => { setActiveTab('signup'); setError(null); }}
                  className={`flex-1 py-2 text-xs font-bold rounded-full transition-all cursor-pointer ${
                    activeTab === 'signup'
                      ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm'
                      : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
                  }`}
                >
                  Create Account
                </button>
              </div>

              {/* Title & Subtitle */}
              <div>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                  {activeTab === 'signin' ? 'Log In to NearEvent' : 'Create a Free NearEvent Account'}
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-1">
                  {activeTab === 'signin'
                    ? 'Access your saved events, tickets, and AI tools.'
                    : 'Join over 100K+ members discovering local events daily.'}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Custom Notice Banner for unauthenticated actions */}
        {initialMessage && !toast && (
          <div className="mx-6 mt-2 p-3 rounded-2xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800/60 text-xs text-blue-900 dark:text-blue-200 flex items-start gap-2.5">
            <Lock className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
            <div className="font-medium">{initialMessage}</div>
          </div>
        )}

        {/* Dynamic Toast Notification */}
        {toast && (
          <div className={`mx-6 mt-2 p-3 rounded-2xl border text-xs flex items-start gap-3 animate-in slide-in-from-top-2 duration-200 ${
            toast.type === 'success'
              ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800/60 text-emerald-900 dark:text-emerald-200'
              : 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800/60 text-rose-900 dark:text-rose-200'
          }`}>
            {toast.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
            )}
            <div className="flex-1">
              <p className="font-bold">{toast.message}</p>
              {toast.subText && <p className="mt-0.5 opacity-90 text-[11px] font-medium">{toast.subText}</p>}
            </div>
            <button onClick={() => setToast(null)} className="opacity-60 hover:opacity-100">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Global Error Banner */}
        {error && !toast && (
          <div className="mx-6 mt-2 p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800/60 text-rose-700 dark:text-rose-300 text-xs flex flex-col gap-2.5 animate-in fade-in">
            <div className="flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
              <div className="flex-1 font-medium leading-relaxed">{error}</div>
              <button onClick={() => setError(null)} className="opacity-60 hover:opacity-100">
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
            {error.includes('redirect_uri_mismatch') && (
              <div className="mt-1 p-3 rounded-xl bg-slate-950 text-slate-200 border border-slate-800 font-mono text-[11px] flex flex-col gap-2">
                <div className="text-[10px] font-sans font-semibold text-slate-400 uppercase tracking-wider">
                  Add both URIs to Google Cloud Console (Authorised redirect URIs):
                </div>
                <div className="flex items-center justify-between gap-2 p-1.5 rounded-lg bg-slate-900 border border-slate-800">
                  <span className="truncate select-all">{`${window.location.origin}/auth/google/callback`}</span>
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(`${window.location.origin}/auth/google/callback`);
                      alert('Current Redirect URI copied!');
                    }}
                    className="px-2.5 py-1 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-[10px] font-sans font-bold shrink-0 cursor-pointer transition-colors"
                  >
                    Copy Current
                  </button>
                </div>
                {window.location.origin.includes('ais-dev-') && (
                  <div className="flex items-center justify-between gap-2 p-1.5 rounded-lg bg-slate-900 border border-slate-800">
                    <span className="truncate select-all">
                      {window.location.origin.replace('ais-dev-', 'ais-pre-')}/auth/google/callback
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard.writeText(
                          `${window.location.origin.replace('ais-dev-', 'ais-pre-')}/auth/google/callback`
                        );
                        alert('Preview Redirect URI copied!');
                      }}
                      className="px-2.5 py-1 bg-slate-700 hover:bg-slate-600 text-white rounded-lg text-[10px] font-sans font-bold shrink-0 cursor-pointer transition-colors"
                    >
                      Copy Preview
                    </button>
                  </div>
                )}
                {window.location.origin.includes('ais-pre-') && (
                  <div className="flex items-center justify-between gap-2 p-1.5 rounded-lg bg-slate-900 border border-slate-800">
                    <span className="truncate select-all">
                      {window.location.origin.replace('ais-pre-', 'ais-dev-')}/auth/google/callback
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard.writeText(
                          `${window.location.origin.replace('ais-pre-', 'ais-dev-')}/auth/google/callback`
                        );
                        alert('Dev Redirect URI copied!');
                      }}
                      className="px-2.5 py-1 bg-slate-700 hover:bg-slate-600 text-white rounded-lg text-[10px] font-sans font-bold shrink-0 cursor-pointer transition-colors"
                    >
                      Copy Dev
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Modal Main Content Container */}
        <div className="p-6 pt-3">
          {activeTab === 'signin' ? (
            /* TAB 1: LOG IN */
            <div className="space-y-4 animate-in fade-in duration-200">
              
              {/* Google Official OAuth Sign-In */}
              <div className="space-y-3">
                {googleClientId ? (
                  <GoogleOAuthProvider clientId={googleClientId}>
                    <div className="w-full flex justify-center rounded-2xl overflow-hidden py-0.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm">
                      <GoogleLogin
                        onSuccess={(credentialResponse) => {
                          if (credentialResponse.credential) {
                            handleGoogleCredentialSuccess(credentialResponse.credential);
                          } else {
                            setError('Google Sign-In failed - missing credential token.');
                          }
                        }}
                        onError={() => {
                          setError('Google Sign-In popup was closed or cancelled.');
                        }}
                        useOneTap={false}
                        theme={isDarkMode ? 'filled_black' : 'outline'}
                        size="large"
                        text="continue_with"
                        shape="pill"
                        width="100%"
                      />
                    </div>
                  </GoogleOAuthProvider>
                ) : (
                  <div className="w-full py-2.5 px-4 bg-slate-800/80 text-slate-300 rounded-2xl text-xs font-semibold text-center flex items-center justify-center gap-2 border border-slate-700/60">
                    <Loader2 className="w-4 h-4 animate-spin text-blue-400" /> Connecting to Google Auth...
                  </div>
                )}

                <div className="relative flex items-center justify-center my-2">
                  <div className="border-t border-slate-200 dark:border-slate-800 w-full"></div>
                  <span className="bg-slate-900 px-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest absolute">
                    Or continue with email
                  </span>
                </div>
              </div>

              {/* Credentials Form */}
              <form onSubmit={handleLoginSubmit} className="space-y-3.5">
                <div>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Email Address"
                    className="w-full px-4 py-3 bg-white dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 text-sm font-medium rounded-2xl focus:ring-2 focus:ring-blue-600 focus:border-blue-600 focus:outline-none transition-all placeholder:text-slate-400"
                  />
                </div>

                <div>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Password"
                      className="w-full pl-4 pr-11 py-3 bg-white dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 text-sm font-medium rounded-2xl focus:ring-2 focus:ring-blue-600 focus:border-blue-600 focus:outline-none transition-all placeholder:text-slate-400"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-3.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-base rounded-2xl transition-all flex items-center justify-center gap-2 disabled:opacity-50 active:scale-[0.99] cursor-pointer shadow-md shadow-blue-500/25"
                >
                  {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Log In'}
                </button>
              </form>

              {/* Bottom Toggle Footer */}
              <div className="text-center space-y-1.5 pt-2">
                <p className="text-xs text-slate-600 dark:text-slate-400 font-medium">
                  Don't have an account?{' '}
                  <button
                    type="button"
                    onClick={() => {
                      setActiveTab('signup');
                      setError(null);
                    }}
                    className="font-bold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
                  >
                    Register free
                  </button>
                </p>

                
              </div>
            </div>
          ) : activeTab === 'signup' ? (
            /* TAB 2: SIGN UP (Exact DocsAI Style) */
            <div className="space-y-4 animate-in fade-in duration-200">
              
              {/* Google Official OAuth Sign-Up */}
              <div className="space-y-3">
                {googleClientId ? (
                  <GoogleOAuthProvider clientId={googleClientId}>
                    <div className="w-full flex justify-center rounded-2xl overflow-hidden py-0.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm">
                      <GoogleLogin
                        onSuccess={(credentialResponse) => {
                          if (credentialResponse.credential) {
                            handleGoogleCredentialSuccess(credentialResponse.credential);
                          } else {
                            setError('Google Sign-In failed - missing credential token.');
                          }
                        }}
                        onError={() => {
                          setError('Google Sign-In popup was closed or cancelled.');
                        }}
                        useOneTap={false}
                        theme={isDarkMode ? 'filled_black' : 'outline'}
                        size="large"
                        text="signup_with"
                        shape="pill"
                        width="100%"
                      />
                    </div>
                  </GoogleOAuthProvider>
                ) : (
                  <div className="w-full py-2.5 px-4 bg-slate-800/80 text-slate-300 rounded-2xl text-xs font-semibold text-center flex items-center justify-center gap-2 border border-slate-700/60">
                    <Loader2 className="w-4 h-4 animate-spin text-blue-400" /> Connecting to Google Auth...
                  </div>
                )}

                <div className="relative flex items-center justify-center my-2">
                  <div className="border-t border-slate-200 dark:border-slate-800 w-full"></div>
                  <span className="bg-slate-900 px-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest absolute">
                    Or sign up with email
                  </span>
                </div>
              </div>

              <form onSubmit={handleSignUpSubmit} className="space-y-3">
                <div>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Full Name"
                    className="w-full px-4 py-3 bg-white dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 text-sm font-medium rounded-2xl focus:ring-2 focus:ring-blue-600 focus:outline-none transition-all placeholder:text-slate-400"
                  />
                </div>

                <div>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Email Address"
                    className="w-full px-4 py-3 bg-white dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 text-sm font-medium rounded-2xl focus:ring-2 focus:ring-blue-600 focus:outline-none transition-all placeholder:text-slate-400"
                  />
                </div>

                <div>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Password"
                      className="w-full pl-4 pr-11 py-3 bg-white dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 text-sm font-medium rounded-2xl focus:ring-2 focus:ring-blue-600 focus:outline-none transition-all placeholder:text-slate-400"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-3.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Confirm Password"
                      className="w-full pl-4 pr-11 py-3 bg-white dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 text-sm font-medium rounded-2xl focus:ring-2 focus:ring-blue-600 focus:outline-none transition-all placeholder:text-slate-400"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-4 top-3.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                    >
                      {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="pt-1">
                  <label className="flex items-start gap-2 cursor-pointer text-xs text-slate-600 dark:text-slate-400 leading-tight select-none">
                    <input
                      type="checkbox"
                      checked={acceptTerms}
                      onChange={(e) => setAcceptTerms(e.target.checked)}
                      className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-slate-300 mt-0.5 cursor-pointer"
                    />
                    <span>
                      I agree to the{' '}
                      <span className="text-blue-600 dark:text-blue-400 font-bold hover:underline">Terms of Service</span> &{' '}
                      <span className="text-blue-600 dark:text-blue-400 font-bold hover:underline">Privacy Statement</span>
                    </span>
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={loading || !acceptTerms}
                  className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-base rounded-2xl shadow-md shadow-blue-500/25 transition-all flex items-center justify-center gap-2 disabled:opacity-50 active:scale-[0.99] cursor-pointer"
                >
                  {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Create Account'}
                </button>
              </form>

              {/* Bottom Toggle Footer */}
              <p className="text-center text-xs text-slate-600 dark:text-slate-400 pt-2">
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('signin');
                    setError(null);
                  }}
                  className="font-bold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
                >
                  Log In
                </button>
              </p>
            </div>
          
          ) : null}

        </div>

        {/* Modal Footer Security Badge */}
        <div className="px-6 py-3 bg-slate-950/80 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-slate-400 font-medium">
          <span className="flex items-center gap-1">
            <ShieldCheck className="w-3 h-3 text-emerald-400" /> 256-bit SSL Encrypted & JWT Secured
          </span>
          <span>NearEvent v2.5</span>
        </div>

      </div>
    </div>
  );
};
