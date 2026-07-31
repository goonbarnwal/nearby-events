import React, { useState } from 'react';
import { X, Mail, Lock, User, Loader2 } from 'lucide-react';
import { User as UserType } from '../types';
import { loginUser, registerUser, googleAuthUser } from '../services/api';

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
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (isSignUp) {
        const { token, user } = await registerUser({
          name: name || email.split('@')[0],
          email,
          password,
        });
        localStorage.setItem('nearevent_jwt', token);
        onLoginSuccess(user);
      } else {
        const { token, user } = await loginUser({ email, password });
        localStorage.setItem('nearevent_jwt', token);
        onLoginSuccess(user);
      }
    } catch (err: any) {
      setError(err.message || 'Authentication failed. Please check credentials.');
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

        {showGooglePicker ? (
          /* ==================================================== */
          /* GOOGLE ACCOUNT SELECTOR SCREEN */
          /* ==================================================== */
          <div>
            <div className="text-center mb-6">
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

            {!isCustomGoogleAccount ? (
              <div className="space-y-3">
                {/* Account 1: Goon Barnwal */}
                <button
                  onClick={() => handleExecuteGoogleLogin('Goon Barnwal', 'barnwalgoon@gmail.com')}
                  disabled={loading}
                  className="w-full p-3.5 bg-slate-50 hover:bg-blue-50/60 border border-slate-200 hover:border-blue-300 rounded-2xl flex items-center gap-3.5 transition-all text-left group"
                >
                  <div className="w-10 h-10 rounded-full bg-blue-600 text-white font-extrabold text-base flex items-center justify-center shrink-0 shadow-xs">
                    G
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-slate-900 group-hover:text-blue-600 transition-colors truncate">
                      Goon Barnwal
                    </p>
                    <p className="text-xs text-slate-500 truncate">barnwalgoon@gmail.com</p>
                  </div>
                  {loading && <Loader2 className="w-4 h-4 animate-spin text-blue-600" />}
                </button>

                {/* Option 2: Use another Google account */}
                <button
                  onClick={() => setIsCustomGoogleAccount(true)}
                  disabled={loading}
                  className="w-full p-3.5 bg-white hover:bg-slate-50 border border-dashed border-slate-300 rounded-2xl flex items-center gap-3.5 transition-all text-left"
                >
                  <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-600 font-bold text-base flex items-center justify-center shrink-0">
                    +
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-800">Use another Google Account</p>
                    <p className="text-xs text-slate-500">Sign in with custom name and email</p>
                  </div>
                </button>

                <button
                  onClick={() => setShowGooglePicker(false)}
                  className="w-full mt-2 py-2 text-xs font-bold text-slate-500 hover:text-slate-800 transition-colors"
                >
                  ← Back to standard login
                </button>
              </div>
            ) : (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (customGoogleName && customGoogleEmail) {
                    handleExecuteGoogleLogin(customGoogleName.trim(), customGoogleEmail.trim());
                  }
                }}
                className="space-y-3.5"
              >
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Google Profile Name</label>
                  <input
                    type="text"
                    required
                    value={customGoogleName}
                    onChange={(e) => setCustomGoogleName(e.target.value)}
                    placeholder="e.g. Rahul Sharma"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-sm font-medium focus:bg-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Google Account Email</label>
                  <input
                    type="email"
                    required
                    value={customGoogleEmail}
                    onChange={(e) => setCustomGoogleEmail(e.target.value)}
                    placeholder="e.g. rahul.sharma@gmail.com"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-sm font-medium focus:bg-white focus:outline-none"
                  />
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsCustomGoogleAccount(false)}
                    className="w-1/2 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-all"
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-1/2 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl transition-all shadow-md flex items-center justify-center gap-1.5 disabled:opacity-50"
                  >
                    {loading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                    <span>Continue</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        ) : (
          /* ==================================================== */
          /* STANDARD LOGIN / SIGNUP SCREEN */
          /* ==================================================== */
          <div>
            <div className="mb-6">
              <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
                {isSignUp ? 'Create an Account' : 'Welcome to NearEvent'}
              </h2>
              <p className="text-xs font-medium text-slate-500 mt-1">
                Discover events happening around you with personalized AI suggestions.
              </p>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-xl text-xs font-semibold">
                {error}
              </div>
            )}

            {/* Google OAuth Button */}
            <button
              onClick={() => setShowGooglePicker(true)}
              disabled={loading}
              className="w-full py-2.5 px-4 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs sm:text-sm font-semibold rounded-xl transition-all shadow-2xs flex items-center justify-center gap-2.5 mb-4 disabled:opacity-50"
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

            <div className="relative my-4 flex items-center justify-center">
              <div className="border-t border-slate-200 w-full" />
              <span className="bg-white px-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider absolute">
                Or Email
              </span>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3.5">
              {isSignUp && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Full Name</label>
                  <div className="relative flex items-center">
                    <User className="w-4 h-4 text-slate-400 absolute left-3" />
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Goon Barnwal"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-sm font-medium focus:bg-white focus:outline-none"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Email Address</label>
                <div className="relative flex items-center">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@domain.com"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-sm font-medium focus:bg-white focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Password</label>
                <div className="relative flex items-center">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-sm font-medium focus:bg-white focus:outline-none"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-xl transition-all shadow-md mt-2 flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                <span>{isSignUp ? 'Create Account' : 'Sign In'}</span>
              </button>
            </form>

            <div className="mt-4 text-center">
              <button
                onClick={() => {
                  setError(null);
                  setIsSignUp(!isSignUp);
                }}
                className="text-xs font-semibold text-blue-600 hover:text-blue-700"
              >
                {isSignUp ? 'Already have an account? Sign In' : 'New to NearEvent? Create account'}
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
