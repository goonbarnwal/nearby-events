import React, { useState } from 'react';
import { X, Mail, Lock, User, Loader2, KeyRound, CheckCircle2, ArrowLeft } from 'lucide-react';
import { User as UserType } from '../types';
import { loginUser, registerUser, googleAuthUser, requestPasswordReset, resetPassword } from '../services/api';

interface AuthModalProps {
  onClose: () => void;
  onLoginSuccess: (user: UserType) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ onClose, onLoginSuccess }) => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [showGooglePicker, setShowGooglePicker] = useState(false);
  const [customGoogleName, setCustomGoogleName] = useState('');
  const [customGoogleEmail, setCustomGoogleEmail] = useState('');
  const [isCustomGoogleAccount, setIsCustomGoogleAccount] = useState(false);

  // Forgot Password / OTP state
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [resetStep, setResetStep] = useState<'request' | 'verify'>('request');
  const [resetEmail, setResetEmail] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Saved user helper
  const getSavedUser = (): { name: string; email: string } | null => {
    try {
      const raw = localStorage.getItem('nearevent_saved_user');
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (isSignUp && password !== confirmPassword) {
      setError('Passwords do not match. Please verify your password.');
      return;
    }

    setLoading(true);

    try {
      if (isSignUp) {
        const { token, user } = await registerUser({
          name: name || email.split('@')[0],
          email,
          password,
        });
        localStorage.setItem('nearevent_jwt', token);
        localStorage.setItem('nearevent_saved_user', JSON.stringify({ name: user.name, email: user.email }));
        onLoginSuccess(user);
      } else {
        const { token, user } = await loginUser({ email, password });
        localStorage.setItem('nearevent_jwt', token);
        localStorage.setItem('nearevent_saved_user', JSON.stringify({ name: user.name, email: user.email }));
        onLoginSuccess(user);
      }
    } catch (err: any) {
      setError(err.message || 'Authentication failed. Please check credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);
    setLoading(true);

    try {
      await requestPasswordReset(resetEmail.trim());
      setSuccessMsg('A 6-digit OTP code has been sent to your email address!');
      setResetStep('verify');
      setOtpCode('');
      setNewPassword('');
      setConfirmNewPassword('');
    } catch (err: any) {
      setError(err.message || 'Failed to request OTP code. Please verify email.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    if (newPassword !== confirmNewPassword) {
      setError('New passwords do not match. Please verify your new password.');
      return;
    }

    setLoading(true);

    try {
      const res = await resetPassword({
        email: resetEmail.trim(),
        otp: otpCode.trim(),
        newPassword,
      });
      setSuccessMsg(res.message || 'Password reset successfully!');
      setTimeout(() => {
        setIsForgotPassword(false);
        setIsSignUp(false);
        setEmail(resetEmail);
        setPassword('');
        setConfirmPassword('');
        setSuccessMsg(null);
        setError(null);
      }, 1500);
    } catch (err: any) {
      setError(err.message || 'Failed to reset password. Please check your OTP code.');
    } finally {
      setLoading(false);
    }
  };

  const handleExecuteGoogleLogin = async (accountName: string, accountEmail: string) => {
    setError(null);
    setLoading(true);

    try {
      const { token, user } = await googleAuthUser({
        name: accountName,
        email: accountEmail,
      });
      localStorage.setItem('nearevent_jwt', token);
      localStorage.setItem('nearevent_saved_user', JSON.stringify({ name: user.name, email: user.email }));
      onLoginSuccess(user);
    } catch (err: any) {
      setError(err.message || 'Google login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-slate-100 relative">
        
        <button
          id="btn-close-auth-modal"
          onClick={onClose}
          className="absolute top-6 right-6 p-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {isForgotPassword ? (
          /* ==================================================== */
          /* FORGOT PASSWORD / OTP RESET SCREEN */
          /* ==================================================== */
          <div>
            <div className="mb-6">
              <button
                type="button"
                onClick={() => {
                  setIsForgotPassword(false);
                  setError(null);
                  setSuccessMsg(null);
                }}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-800 mb-3 transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back to Login</span>
              </button>
              <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
                <KeyRound className="w-6 h-6 text-blue-600" />
                Reset Password
              </h2>
              <p className="text-xs font-medium text-slate-500 mt-1">
                {resetStep === 'request'
                  ? 'Enter your registered email address to receive a 6-digit OTP code.'
                  : 'Enter the 6-digit OTP code sent to your email and your new password.'}
              </p>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-xl text-xs font-semibold">
                {error}
              </div>
            )}

            {successMsg && (
              <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl text-xs font-semibold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{successMsg}</span>
              </div>
            )}

            {resetStep === 'request' ? (
              <form onSubmit={handleRequestOtp} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Registered Email</label>
                  <div className="relative flex items-center">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3" />
                    <input
                      type="email"
                      required
                      value={resetEmail}
                      onChange={(e) => setResetEmail(e.target.value)}
                      placeholder="Enter registered email"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2.5 text-sm font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-xl transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                  <span>Get 6-Digit OTP</span>
                </button>
              </form>
            ) : (
              <form onSubmit={handleVerifyResetPassword} className="space-y-3.5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">6-Digit OTP Code</label>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value)}
                    placeholder="Enter 6-digit OTP code"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-center text-lg font-bold tracking-widest focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">New Password</label>
                  <div className="relative flex items-center">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3" />
                    <input
                      type="password"
                      required
                      minLength={6}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Enter new password"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2.5 text-sm font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Confirm New Password</label>
                  <div className="relative flex items-center">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3" />
                    <input
                      type="password"
                      required
                      minLength={6}
                      value={confirmNewPassword}
                      onChange={(e) => setConfirmNewPassword(e.target.value)}
                      placeholder="Confirm new password"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2.5 text-sm font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded-xl transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                  <span>Reset & Save Password</span>
                </button>
              </form>
            )}
          </div>
        ) : showGooglePicker ? (
          /* ==================================================== */
          /* GOOGLE ACCOUNT SELECTOR SCREEN */
          /* ==================================================== */
          <div>
            <div className="text-center mb-4">
              <svg className="w-8 h-8 mx-auto mb-2" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
              </svg>
              <h2 className="text-xl font-bold text-slate-900">Sign in with Google</h2>
              <p className="text-xs text-slate-500 mt-1">Choose an account to continue to <strong className="text-slate-800">NearEvent</strong></p>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-xl text-xs font-semibold">
                {error}
              </div>
            )}

            {/* Quick Google Account Selection Card if saved on this browser */}
            {(() => {
              const savedUser = getSavedUser();
              if (!savedUser) return null;
              return (
                <>
                  <div className="mb-3 space-y-1">
                    <div className="flex items-center justify-between px-1">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Saved Account</span>
                      <button
                        type="button"
                        onClick={() => {
                          localStorage.removeItem('nearevent_saved_user');
                          setError(null);
                        }}
                        className="text-[10px] font-bold text-slate-400 hover:text-red-600 transition-colors"
                      >
                        Remove
                      </button>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleExecuteGoogleLogin(savedUser.name, savedUser.email)}
                      disabled={loading}
                      className="w-full p-3 bg-slate-50 hover:bg-blue-50/70 border border-slate-200 hover:border-blue-300 rounded-2xl flex items-center gap-3 transition-all text-left group"
                    >
                      <div className="w-9 h-9 rounded-full bg-blue-600 text-white font-bold text-xs flex items-center justify-center shrink-0">
                        {savedUser.name ? savedUser.name.charAt(0).toUpperCase() : 'U'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-slate-800 group-hover:text-blue-700 truncate">{savedUser.name}</p>
                        <p className="text-[11px] text-slate-500 truncate">{savedUser.email}</p>
                      </div>
                      <span className="text-[10px] font-extrabold text-blue-600 bg-blue-100 px-2 py-0.5 rounded-full">
                        Sign In
                      </span>
                    </button>
                  </div>

                  <div className="relative my-3 flex items-center justify-center">
                    <div className="border-t border-slate-200 w-full" />
                    <span className="bg-white px-2.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider absolute">
                      Or Use Another Account
                    </span>
                  </div>
                </>
              );
            })()}

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
              className="space-y-3 mt-2"
            >
              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Google Name</label>
                <div className="relative flex items-center">
                  <User className="w-4 h-4 text-slate-400 absolute left-3" />
                  <input
                    type="text"
                    required
                    value={customGoogleName}
                    onChange={(e) => setCustomGoogleName(e.target.value)}
                    placeholder="Enter full name"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3.5 py-2 text-xs font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Google Email Address</label>
                <div className="relative flex items-center">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3" />
                  <input
                    type="email"
                    required
                    value={customGoogleEmail}
                    onChange={(e) => setCustomGoogleEmail(e.target.value)}
                    placeholder="Enter email address"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3.5 py-2 text-xs font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowGooglePicker(false)}
                  className="w-1/3 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-all"
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-2/3 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl transition-all shadow-md flex items-center justify-center gap-1.5 disabled:opacity-50"
                >
                  {loading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>Sign In with Google</span>
                </button>
              </div>
            </form>
          </div>
        ) : (
          /* ==================================================== */
          /* STANDARD LOGIN / SIGNUP SCREEN WITH TABS */
          /* ==================================================== */
          <div>
            {/* Brand Header & Tagline */}
            <div className="text-center mb-5">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center mx-auto mb-2 shadow-md">
                <span className="font-black text-xl tracking-tight">NE</span>
              </div>
              <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">NearEvent</h2>
              <p className="text-[11px] font-bold text-blue-600 uppercase tracking-wider">Connect, Create & Collaborate</p>
            </div>

            {/* Navigation Tabs (Sign In / Register) */}
            <div className="flex bg-slate-100 p-1 rounded-2xl mb-5">
              <button
                type="button"
                onClick={() => {
                  setError(null);
                  setIsSignUp(false);
                }}
                className={`flex-1 py-2 text-xs font-extrabold rounded-xl transition-all ${
                  !isSignUp
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => {
                  setError(null);
                  setIsSignUp(true);
                }}
                className={`flex-1 py-2 text-xs font-extrabold rounded-xl transition-all ${
                  isSignUp
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Register
              </button>
            </div>

            <div className="mb-4">
              <h3 className="text-lg font-bold text-slate-900">
                {isSignUp ? 'Create your account' : 'Welcome Back'}
              </h3>
              <p className="text-xs text-slate-500">
                {isSignUp
                  ? 'Start your journey with NearEvent platform'
                  : 'Sign in to access your saved & created events'}
              </p>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-xl text-xs font-semibold">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-3">
              {isSignUp && (
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-[11px] font-bold text-slate-700 uppercase">Full Name / Username</label>
                    {name.trim().length >= 3 && (
                      <span className="text-[10px] font-bold text-emerald-600 flex items-center gap-0.5">
                        <CheckCircle2 className="w-3 h-3" />
                        Username is available
                      </span>
                    )}
                  </div>
                  <div className="relative flex items-center">
                    <User className="w-4 h-4 text-slate-400 absolute left-3" />
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Enter full name"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Email Address</label>
                <div className="relative flex items-center">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter email address"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-[11px] font-bold text-slate-700 uppercase">Password</label>
                  {!isSignUp && (
                    <button
                      type="button"
                      id="btn-forgot-password"
                      onClick={() => {
                        setResetEmail(email || '');
                        setResetStep('request');
                        setOtpCode('');
                        setNewPassword('');
                        setConfirmNewPassword('');
                        setError(null);
                        setSuccessMsg(null);
                        setIsForgotPassword(true);
                      }}
                      className="text-xs font-semibold text-blue-600 hover:text-blue-700 hover:underline"
                    >
                      Forgot Password?
                    </button>
                  )}
                </div>
                <div className="relative flex items-center">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter password"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>
              </div>

              {isSignUp && (
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Confirm Password</label>
                  <div className="relative flex items-center">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3" />
                    <input
                      type="password"
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Confirm password"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    />
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl transition-all shadow-md mt-2 flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                <span>{isSignUp ? 'Create Account' : 'Sign In'}</span>
              </button>
            </form>

            <div className="relative my-4 flex items-center justify-center">
              <div className="border-t border-slate-200 w-full" />
              <span className="bg-white px-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider absolute">
                Or Continue With
              </span>
            </div>

            {/* Google OAuth Button */}
            <button
              type="button"
              onClick={() => {
                const cleanEmail = email.trim();
                const cleanName = name.trim();
                if (cleanEmail && cleanEmail.includes('@')) {
                  // Direct Google Login if user already entered email in form
                  handleExecuteGoogleLogin(cleanName || cleanEmail.split('@')[0], cleanEmail);
                } else {
                  // Otherwise open Google account selector prompt with clean inputs
                  setCustomGoogleEmail('');
                  setCustomGoogleName(cleanName || '');
                  setShowGooglePicker(true);
                }
              }}
              disabled={loading}
              className="w-full py-2.5 px-4 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition-all shadow-2xs flex items-center justify-center gap-2.5 disabled:opacity-50"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
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
            </button>

            {/* Footer Links */}
            <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-center gap-3 text-[11px] text-slate-400 font-medium">
              <a href="#terms" onClick={(e) => e.preventDefault()} className="hover:text-slate-600 transition-colors">
                Terms of Service
              </a>
              <span>•</span>
              <a href="#privacy" onClick={(e) => e.preventDefault()} className="hover:text-slate-600 transition-colors">
                Privacy Policy
              </a>
              <span>•</span>
              <a href="#support" onClick={(e) => e.preventDefault()} className="hover:text-slate-600 transition-colors">
                Support
              </a>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
