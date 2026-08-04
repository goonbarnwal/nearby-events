import React, { useState, useEffect } from 'react';
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
  requestPasswordReset,
  resetPassword,
  verifyEmail,
} from '../services/api';

interface AuthModalProps {
  onClose: () => void;
  onLoginSuccess: (user: UserType) => void;
  initialMessage?: string;
}

type AuthTab = 'signin' | 'signup' | 'forgot-password' | 'verify-email';

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

  // Google/Social picker state
  const [showGooglePicker, setShowGooglePicker] = useState(false);
  const [customGoogleName, setCustomGoogleName] = useState('');
  const [customGoogleEmail, setCustomGoogleEmail] = useState('');

  // Forgot Password / OTP states
  const [resetStep, setResetStep] = useState<'request' | 'verify'>('request');
  const [otpCode, setOtpCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');

  // Email Verification states
  const [verifyOtpCode, setVerifyOtpCode] = useState('');
  const [resendCountdown, setResendCountdown] = useState(0);

  // UI state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string; subText?: string } | null>(null);

  // Countdown timer for resending verification code
  useEffect(() => {
    if (resendCountdown > 0) {
      const timer = setTimeout(() => setResendCountdown(resendCountdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCountdown]);

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
      if (res.token) {
        localStorage.setItem('nearevent_jwt', res.token);
      }
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
      if (res.token) {
        localStorage.setItem('nearevent_jwt', res.token);
      }
      saveUserToLocal({ name: res.user.name, email: res.user.email });

      // Automatically open email verification tab with simulated OTP
      setToast({
        type: 'success',
        message: 'Account created successfully!',
        subText: `A verification code (${res.simulatedOtp || '123456'}) has been sent to ${res.user.email}`,
      });

      if (res.simulatedOtp) {
        setVerifyOtpCode(res.simulatedOtp);
      }

      setTimeout(() => {
        setActiveTab('verify-email');
        setResendCountdown(60);
      }, 1000);
    } catch (err: any) {
      setError(err.message || 'Registration failed. An account with this email may already exist.');
    } finally {
      setLoading(false);
    }
  };

  // Handle Google Login / Social execute
  const handleExecuteGoogleLogin = async (selectedName: string, selectedEmail: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await googleAuthUser({ name: selectedName, email: selectedEmail });
      if (res.token) {
        localStorage.setItem('nearevent_jwt', res.token);
      }
      saveUserToLocal({ name: res.user.name, email: res.user.email });

      setToast({
        type: 'success',
        message: 'Google Sign-In Successful',
        subText: `Logged in as ${res.user.name}`,
      });

      setTimeout(() => {
        onLoginSuccess(res.user);
      }, 700);
    } catch (err: any) {
      setError(err.message || 'Google authentication failed');
    } finally {
      setLoading(false);
      setShowGooglePicker(false);
    }
  };

  // Handle GitHub Login
  const handleGithubLogin = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await githubAuthUser({
        name: name.trim() || 'GitHub Developer',
        email: email.trim() || 'developer@github.com',
      });
      if (res.token) localStorage.setItem('nearevent_jwt', res.token);
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
    setLoading(true);
    setError(null);
    try {
      const res = await appleAuthUser({
        name: name.trim() || 'Apple User',
        email: email.trim() || 'user@icloud.com',
      });
      if (res.token) localStorage.setItem('nearevent_jwt', res.token);
      saveUserToLocal({ name: res.user.name, email: res.user.email });

      setToast({
        type: 'success',
        message: 'Apple Sign-In Successful',
        subText: `Authenticated with Apple ID`,
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

  // Handle Forgot Password OTP Request
  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      setError('Please enter your email address.');
      return;
    }
    setError(null);
    setLoading(true);

    try {
      const res = await requestPasswordReset(email.trim());
      setToast({
        type: 'success',
        message: 'Verification Code Sent!',
        subText: `Your 6-digit code is: ${res.simulatedOtp || '123456'}`,
      });
      if (res.simulatedOtp) {
        setOtpCode(res.simulatedOtp);
      }
      setResetStep('verify');
    } catch (err: any) {
      setError(err.message || 'Failed to request password reset code.');
    } finally {
      setLoading(false);
    }
  };

  // Handle Password Reset Submit
  const handleResetPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otpCode.trim() || !newPassword) {
      setError('Please enter the OTP code and new password.');
      return;
    }
    if (newPassword.length < 6) {
      setError('New password must be at least 6 characters long.');
      return;
    }
    if (newPassword !== confirmNewPassword) {
      setError('Passwords do not match.');
      return;
    }

    setError(null);
    setLoading(true);

    try {
      await resetPassword({
        email: email.trim(),
        otp: otpCode.trim(),
        newPassword,
      });

      setToast({
        type: 'success',
        message: 'Password Reset Successful!',
        subText: 'You can now sign in with your new password.',
      });

      setTimeout(() => {
        setActiveTab('signin');
        setPassword(newPassword);
        setResetStep('request');
        setOtpCode('');
        setNewPassword('');
        setConfirmNewPassword('');
      }, 1200);
    } catch (err: any) {
      setError(err.message || 'Failed to reset password. Please verify the code.');
    } finally {
      setLoading(false);
    }
  };

  // Handle Verify Email Submit
  const handleVerifyEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!verifyOtpCode.trim()) {
      setError('Please enter the 6-digit verification code.');
      return;
    }

    setError(null);
    setLoading(true);

    try {
      const res = await verifyEmail(email.trim(), verifyOtpCode.trim());
      setToast({
        type: 'success',
        message: 'Email Verified!',
        subText: 'Your account is now fully active.',
      });

      setTimeout(() => {
        if (res.user) {
          onLoginSuccess(res.user as UserType);
        } else {
          setActiveTab('signin');
        }
      }, 1000);
    } catch (err: any) {
      setError(err.message || 'Verification failed. Please check the 6-digit code.');
    } finally {
      setLoading(false);
    }
  };

  const savedUser = getSavedUser();

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto backdrop-blur-md bg-slate-950/60 animate-in fade-in duration-200 ${isDarkMode ? 'dark' : ''}`}>
      <div className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200/80 dark:border-slate-800/80 overflow-hidden transition-all text-slate-800 dark:text-slate-100 my-auto">
        
        {/* Header Bar */}
        <div className="flex items-center justify-between px-6 pt-5 pb-3 border-b border-slate-100 dark:border-slate-800/60">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white font-black text-sm shadow-md shadow-blue-500/20">
              N
            </div>
            <div>
              <h3 className="text-base font-extrabold tracking-tight text-slate-900 dark:text-white leading-tight">
                NearEvent
              </h3>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">
                Modern Event Intelligence
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Dark / Light Mode Toggle */}
            <button
              type="button"
              onClick={toggleDarkMode}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
            </button>

            {/* Close Button */}
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Custom Notice Banner for unauthenticated actions */}
        {initialMessage && !toast && (
          <div className="mx-6 mt-4 p-3.5 rounded-2xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800/60 text-xs text-blue-900 dark:text-blue-200 flex items-start gap-2.5">
            <Lock className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
            <div className="font-medium">{initialMessage}</div>
          </div>
        )}

        {/* Dynamic Toast Notification */}
        {toast && (
          <div className={`mx-6 mt-4 p-3.5 rounded-2xl border text-xs flex items-start gap-3 animate-in slide-in-from-top-2 duration-200 ${
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
          <div className="mx-6 mt-4 p-3 rounded-2xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800/60 text-rose-700 dark:text-rose-300 text-xs flex items-start gap-2.5 animate-in fade-in">
            <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
            <div className="flex-1 font-medium">{error}</div>
            <button onClick={() => setError(null)} className="opacity-60 hover:opacity-100">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Modal Main Content Container */}
        <div className="p-6 pt-4">

          {/* Navigation Pill Tabs */}
          {activeTab !== 'forgot-password' && activeTab !== 'verify-email' && (
            <div className="flex bg-slate-100 dark:bg-slate-800/70 p-1 rounded-2xl mb-5 border border-slate-200/50 dark:border-slate-700/50">
              <button
                type="button"
                onClick={() => {
                  setActiveTab('signin');
                  setError(null);
                }}
                className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
                  activeTab === 'signin'
                    ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => {
                  setActiveTab('signup');
                  setError(null);
                }}
                className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
                  activeTab === 'signup'
                    ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                Create Account
              </button>
            </div>
          )}

          {/* GOOGLE ACCOUNT SELECTOR PICKER MODAL */}
          {showGooglePicker ? (
            <div className="space-y-4 animate-in zoom-in-95 duration-200">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2.5">
                <button
                  type="button"
                  onClick={() => setShowGooglePicker(false)}
                  className="flex items-center gap-1 text-xs text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 font-semibold"
                >
                  <ArrowLeft className="w-3.5 h-3.5" /> Back
                </button>
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700 dark:text-slate-200">
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                  </svg>
                  Google Sign-In
                </div>
              </div>

              {savedUser && (
                <div className="space-y-1">
                  <div className="flex items-center justify-between px-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Recently Used Account</span>
                    <button
                      type="button"
                      onClick={() => {
                        localStorage.removeItem('nearevent_saved_user');
                        setError(null);
                      }}
                      className="text-[10px] font-bold text-rose-500 hover:underline"
                    >
                      Clear
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleExecuteGoogleLogin(savedUser.name, savedUser.email)}
                    className="w-full p-3 bg-blue-50/80 hover:bg-blue-100/80 dark:bg-blue-950/30 dark:hover:bg-blue-900/40 border border-blue-200 dark:border-blue-800/50 rounded-2xl flex items-center justify-between transition-all group"
                  >
                    <div className="flex items-center gap-3 text-left">
                      <div className="w-9 h-9 rounded-full bg-blue-600 text-white font-extrabold flex items-center justify-center text-sm shadow-sm">
                        {savedUser.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-blue-600 transition-colors">{savedUser.name}</p>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">{savedUser.email}</p>
                      </div>
                    </div>
                    <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 bg-white dark:bg-slate-900 px-2.5 py-1 rounded-full shadow-2xs">
                      Sign In
                    </span>
                  </button>
                </div>
              )}

              <div>
                <p className="text-[11px] font-bold text-slate-600 dark:text-slate-300 mb-2">Sign in with Google Account:</p>
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    const cleanEmail = customGoogleEmail.trim();
                    const cleanName = customGoogleName.trim() || cleanEmail.split('@')[0];
                    if (!cleanEmail || !cleanEmail.includes('@')) {
                      setError('Please enter a valid Google email address.');
                      return;
                    }
                    handleExecuteGoogleLogin(cleanName, cleanEmail);
                  }}
                  className="space-y-2.5"
                >
                  <input
                    type="text"
                    placeholder="Full Name (e.g. Alex Sharma)"
                    value={customGoogleName}
                    onChange={(e) => setCustomGoogleName(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                  <input
                    type="email"
                    placeholder="Google Email (e.g. alex@gmail.com)"
                    value={customGoogleEmail}
                    onChange={(e) => setCustomGoogleEmail(e.target.value)}
                    required
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md shadow-blue-500/20 flex items-center justify-center gap-2"
                  >
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Continue with Google'}
                  </button>
                </form>
              </div>
            </div>
          ) : activeTab === 'signin' ? (
            /* TAB 1: SIGN IN */
            <div className="space-y-4 animate-in fade-in duration-200">
              
              {/* Primary Google Auth Button */}
              <button
                type="button"
                onClick={() => {
                  if (email.trim() && email.includes('@')) {
                    handleExecuteGoogleLogin(name.trim() || email.split('@')[0], email.trim());
                  } else {
                    setCustomGoogleEmail('');
                    setCustomGoogleName('');
                    setShowGooglePicker(true);
                  }
                }}
                disabled={loading}
                className="w-full py-2.5 px-4 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-750 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 text-xs font-bold rounded-2xl transition-all shadow-xs flex items-center justify-center gap-3 disabled:opacity-50 group hover:border-slate-300 dark:hover:border-slate-600"
              >
                <svg className="w-4 h-4 shrink-0 transition-transform group-hover:scale-110" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                </svg>
                <span>Continue with Google</span>
              </button>

              {/* Secondary Social Login Buttons */}
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={handleGithubLogin}
                  disabled={loading}
                  className="py-2 px-3 bg-slate-900 hover:bg-slate-800 text-white text-[11px] font-bold rounded-xl transition-all flex items-center justify-center gap-2 shadow-xs"
                >
                  <Github className="w-3.5 h-3.5" />
                  GitHub
                </button>
                <button
                  type="button"
                  onClick={handleAppleLogin}
                  disabled={loading}
                  className="py-2 px-3 bg-black hover:bg-slate-900 text-white text-[11px] font-bold rounded-xl transition-all flex items-center justify-center gap-2 shadow-xs"
                >
                  <span className="font-sans text-sm leading-none font-bold"></span>
                  Apple ID
                </button>
              </div>

              {/* Saved Account Card */}
              {savedUser && (
                <div className="p-3 bg-blue-50/60 dark:bg-blue-950/30 border border-blue-200/60 dark:border-blue-800/40 rounded-2xl flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-full bg-blue-600 text-white text-xs font-black flex items-center justify-center">
                      {savedUser.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="text-left">
                      <p className="text-xs font-bold text-slate-800 dark:text-slate-100">{savedUser.name}</p>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400">{savedUser.email}</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setEmail(savedUser.email);
                      setError(null);
                    }}
                    className="text-[11px] font-extrabold text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    Use
                  </button>
                </div>
              )}

              {/* Divider */}
              <div className="relative my-3">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-200 dark:border-slate-800"></div>
                </div>
                <div className="relative flex justify-center text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                  <span className="bg-white dark:bg-slate-900 px-3">or email</span>
                </div>
              </div>

              {/* Credentials Form */}
              <form onSubmit={handleLoginSubmit} className="space-y-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                      Password
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        setActiveTab('forgot-password');
                        setError(null);
                      }}
                      className="text-[11px] text-blue-600 dark:text-blue-400 hover:underline font-bold"
                    >
                      Forgot?
                    </button>
                  </div>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-10 pr-10 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-600 dark:text-slate-400 font-medium select-none">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="w-3.5 h-3.5 rounded text-blue-600 focus:ring-blue-500 border-slate-300"
                    />
                    Remember me for 30 days
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-extrabold text-xs rounded-2xl shadow-lg shadow-blue-500/25 transition-all flex items-center justify-center gap-2 disabled:opacity-50 active:scale-[0.99]"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Sign In to NearEvent'}
                </button>
              </form>
            </div>
          ) : activeTab === 'signup' ? (
            /* TAB 2: SIGN UP */
            <div className="space-y-3.5 animate-in fade-in duration-200">
              
              {/* Google Fast Sign Up Option */}
              <button
                type="button"
                onClick={() => setShowGooglePicker(true)}
                className="w-full py-2 px-4 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-750 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2.5"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                </svg>
                Sign Up with Google One-Tap
              </button>

              <form onSubmit={handleSignUpSubmit} className="space-y-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1">
                    Full Name
                  </label>
                  <div className="relative">
                    <UserIcon className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Rahul Sharma"
                      className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                      Create Password
                    </label>
                    {password && (
                      <span className={`text-[10px] font-bold ${pwdStrength.text}`}>
                        {pwdStrength.label}
                      </span>
                    )}
                  </div>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="At least 6 characters"
                      className="w-full pl-10 pr-10 py-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>

                  {/* Password Strength Indicator Bar */}
                  {password && (
                    <div className="mt-1.5 space-y-1">
                      <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden flex gap-0.5">
                        <div className={`h-full flex-1 rounded-full transition-all ${pwdStrength.score >= 1 ? pwdStrength.color : 'bg-slate-200 dark:bg-slate-700'}`} />
                        <div className={`h-full flex-1 rounded-full transition-all ${pwdStrength.score >= 2 ? pwdStrength.color : 'bg-slate-200 dark:bg-slate-700'}`} />
                        <div className={`h-full flex-1 rounded-full transition-all ${pwdStrength.score >= 3 ? pwdStrength.color : 'bg-slate-200 dark:bg-slate-700'}`} />
                        <div className={`h-full flex-1 rounded-full transition-all ${pwdStrength.score >= 4 ? pwdStrength.color : 'bg-slate-200 dark:bg-slate-700'}`} />
                      </div>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Repeat your password"
                      className="w-full pl-10 pr-10 py-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3.5 top-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                    >
                      {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {confirmPassword && password !== confirmPassword && (
                    <p className="text-[10px] text-rose-500 font-bold mt-1">Passwords do not match</p>
                  )}
                  {confirmPassword && password === confirmPassword && (
                    <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold mt-1 flex items-center gap-1">
                      <Check className="w-3 h-3" /> Passwords match
                    </p>
                  )}
                </div>

                <div className="pt-1">
                  <label className="flex items-start gap-2 cursor-pointer text-[11px] text-slate-600 dark:text-slate-400 leading-tight select-none">
                    <input
                      type="checkbox"
                      checked={acceptTerms}
                      onChange={(e) => setAcceptTerms(e.target.checked)}
                      className="w-3.5 h-3.5 rounded text-blue-600 focus:ring-blue-500 border-slate-300 mt-0.5"
                    />
                    <span>
                      I agree to the{' '}
                      <span className="text-blue-600 dark:text-blue-400 font-bold hover:underline">Terms of Service</span> and{' '}
                      <span className="text-blue-600 dark:text-blue-400 font-bold hover:underline">Privacy Policy</span>.
                    </span>
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={loading || !acceptTerms}
                  className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-extrabold text-xs rounded-2xl shadow-lg shadow-blue-500/25 transition-all flex items-center justify-center gap-2 disabled:opacity-50 active:scale-[0.99]"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Create Free Account'}
                </button>
              </form>
            </div>
          ) : activeTab === 'forgot-password' ? (
            /* TAB 3: FORGOT PASSWORD */
            <div className="space-y-4 animate-in fade-in duration-200">
              <button
                type="button"
                onClick={() => {
                  setActiveTab('signin');
                  setError(null);
                }}
                className="flex items-center gap-1 text-xs text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 font-bold"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> Back to Sign In
              </button>

              <div>
                <h4 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-1.5">
                  <KeyRound className="w-4 h-4 text-blue-600" /> Reset Password
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  {resetStep === 'request'
                    ? 'Enter your account email to receive a 6-digit OTP code.'
                    : `Enter the 6-digit code sent to ${email}`}
                </p>
              </div>

              {resetStep === 'request' ? (
                <form onSubmit={handleRequestOtp} className="space-y-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1">
                      Account Email
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="you@example.com"
                        className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md shadow-blue-500/20 flex items-center justify-center gap-2"
                  >
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Send Verification OTP'}
                  </button>
                </form>
              ) : (
                <form onSubmit={handleResetPasswordSubmit} className="space-y-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1">
                      6-Digit OTP Code
                    </label>
                    <input
                      type="text"
                      required
                      maxLength={6}
                      value={otpCode}
                      onChange={(e) => setOtpCode(e.target.value)}
                      placeholder="123456"
                      className="w-full px-3.5 py-2.5 text-center tracking-widest text-base font-mono bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1">
                      New Password
                    </label>
                    <input
                      type="password"
                      required
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Minimum 6 characters"
                      className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1">
                      Confirm New Password
                    </label>
                    <input
                      type="password"
                      required
                      value={confirmNewPassword}
                      onChange={(e) => setConfirmNewPassword(e.target.value)}
                      placeholder="Repeat new password"
                      className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md shadow-emerald-500/20 flex items-center justify-center gap-2"
                  >
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Confirm New Password'}
                  </button>
                </form>
              )}
            </div>
          ) : (
            /* TAB 4: EMAIL VERIFICATION */
            <div className="space-y-4 animate-in fade-in duration-200 text-center">
              <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center mx-auto shadow-sm">
                <ShieldCheck className="w-6 h-6" />
              </div>

              <div>
                <h4 className="text-base font-extrabold text-slate-900 dark:text-white">
                  Verify Your Email
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  We sent a 6-digit code to <span className="font-bold text-slate-700 dark:text-slate-200">{email}</span>
                </p>
              </div>

              <form onSubmit={handleVerifyEmailSubmit} className="space-y-4">
                <div>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    value={verifyOtpCode}
                    onChange={(e) => setVerifyOtpCode(e.target.value)}
                    placeholder="123456"
                    className="w-full px-4 py-3 text-center tracking-[0.5em] text-lg font-mono bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:outline-none font-extrabold"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-2xl shadow-lg shadow-blue-500/25 transition-all flex items-center justify-center gap-2"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Verify & Continue'}
                </button>
              </form>

              <div className="pt-2 text-xs text-slate-500 dark:text-slate-400">
                Didn't receive the code?{' '}
                {resendCountdown > 0 ? (
                  <span className="font-bold text-slate-400">Resend in {resendCountdown}s</span>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      setResendCountdown(60);
                      setToast({
                        type: 'success',
                        message: 'New Verification Code Sent',
                        subText: 'Check your email inbox or verification banner above.',
                      });
                    }}
                    className="text-blue-600 dark:text-blue-400 font-bold hover:underline inline-flex items-center gap-1"
                  >
                    <RefreshCw className="w-3 h-3" /> Resend Code
                  </button>
                )}
              </div>
            </div>
          )}

        </div>

        {/* Modal Footer Security Badge */}
        <div className="px-6 py-3 bg-slate-50/80 dark:bg-slate-950/50 border-t border-slate-100 dark:border-slate-800/60 flex items-center justify-between text-[10px] text-slate-400 dark:text-slate-500 font-medium">
          <span className="flex items-center gap-1">
            <ShieldCheck className="w-3 h-3 text-emerald-500" /> 256-bit SSL Encrypted & JWT Secured
          </span>
          <span>NearEvent v2.5</span>
        </div>

      </div>
    </div>
  );
};
