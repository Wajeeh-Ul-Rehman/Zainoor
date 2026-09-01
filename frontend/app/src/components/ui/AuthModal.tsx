import React, { useEffect, useState } from 'react';
import { useUIStore } from '@/stores/uiStore';
import { useAuthStore } from '@/stores/authStore';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function AuthModal() {
  const { isAuthModalOpen, authModalMode, openAuthModal, closeAuthModal, addToast } = useUIStore();
  const { login, register } = useAuthStore();

  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  // login fields
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // signup fields
  const [name, setName] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [signupPassword, setSignupPassword] = useState('');

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (isAuthModalOpen) {
      setErrors({});
      setFormError('');
    }
  }, [isAuthModalOpen]);

  useEffect(() => {
    if (!isAuthModalOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && closeAuthModal();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isAuthModalOpen, closeAuthModal]);

  if (!isAuthModalOpen) return null;

  const validateLogin = () => {
    const e: Record<string, string> = {};
    if (!loginEmail.trim()) e.email = 'Enter your email.';
    else if (!EMAIL_RE.test(loginEmail)) e.email = "That email doesn't look right.";
    if (!loginPassword) e.password = 'Enter your password.';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const validateSignup = () => {
    const e: Record<string, string> = {};
    if (!name.trim()) e.name = 'Enter your full name.';
    if (!signupEmail.trim()) e.email = 'Enter your email.';
    else if (!EMAIL_RE.test(signupEmail)) e.email = "That email doesn't look right.";
    if (!phone.trim()) e.phone = 'Enter your phone number.';
    if (!signupPassword) e.password = 'Choose a password.';
    else if (signupPassword.length < 6) e.password = 'Min. 6 characters.';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const submitLogin = async (ev: React.FormEvent) => {
    ev.preventDefault();
    if (!validateLogin()) return;
    setSubmitting(true);
    setFormError('');
    const result = await login(loginEmail, loginPassword);
    setSubmitting(false);

    if (!result.success) {
      setFormError(result.error || 'Invalid credentials.');
      addToast(result.error || 'Invalid credentials.', 'error');
      return;
    }

    addToast('Logged in successfully', 'success');
    closeAuthModal();
  };

  const submitSignup = async (ev: React.FormEvent) => {
    ev.preventDefault();
    if (!validateSignup()) return;
    setSubmitting(true);
    setFormError('');
    
    // Pass fullName (mapped from name state) and clear out the trailing error
    const result = await register({ 
      fullName: name, 
      email: signupEmail, 
      phone, 
      password: signupPassword 
    });
    
    setSubmitting(false);

    if (!result.success) {
      setFormError(result.error || 'Could not create your account.');
      addToast(result.error || 'Could not create your account.', 'error');
      return;
    }

    addToast('Account created — welcome to ZaiNoor', 'success');
    closeAuthModal();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={closeAuthModal} />
      <div className="relative bg-white w-full max-w-md max-h-[90vh] overflow-y-auto p-10">
        <button
          onClick={closeAuthModal}
          className="absolute right-4 top-4 text-neutral-400 hover:text-black"
          aria-label="Close"
        >
          ✕
        </button>

        <h2 className="font-display text-2xl text-black mb-1">
          {authModalMode === 'login' ? 'Welcome Back' : 'Create Account'}
        </h2>
        <p className="font-body text-sm text-neutral-500 mb-6">
          {authModalMode === 'login' ? 'Sign in to access your account' : 'Join ZaiNoor for a faster checkout'}
        </p>

        {formError && <p className="text-rose-700 text-xs mb-4">{formError}</p>}

        {authModalMode === 'login' ? (
          <form onSubmit={submitLogin}>
            <label className="block font-body text-[11px] tracking-[0.12em] uppercase text-neutral-500 mb-1.5">Email</label>
            <input
              type="email"
              value={loginEmail}
              onChange={(e) => setLoginEmail(e.target.value)}
              placeholder="your@email.com"
              className="w-full border-b border-neutral-300 pb-2 mb-1 font-body text-sm focus:outline-none focus:border-black"
            />
            {errors.email && <p className="text-rose-700 text-xs mb-3">{errors.email}</p>}

            <label className="block font-body text-[11px] tracking-[0.12em] uppercase text-neutral-500 mb-1.5 mt-4">Password</label>
            <input
              type="password"
              value={loginPassword}
              onChange={(e) => setLoginPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full border-b border-neutral-300 pb-2 mb-1 font-body text-sm focus:outline-none focus:border-black"
            />
            {errors.password && <p className="text-rose-700 text-xs mb-3">{errors.password}</p>}

            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-black text-white font-body text-sm tracking-wide py-3 mt-6 hover:bg-neutral-800 disabled:opacity-50"
            >
              {submitting ? 'Logging in…' : 'Log In'}
            </button>

            <p className="text-center font-body text-sm text-neutral-500 mt-6">
              Don't have an account?{' '}
              <button type="button" onClick={() => openAuthModal('signup')} className="text-black underline">
                Sign Up
              </button>
            </p>
          </form>
        ) : (
          <form onSubmit={submitSignup}>
            <label className="block font-body text-[11px] tracking-[0.12em] uppercase text-neutral-500 mb-1.5">Full name</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full border-b border-neutral-300 pb-2 mb-1 font-body text-sm focus:outline-none focus:border-black"
            />
            {errors.name && <p className="text-rose-700 text-xs mb-3">{errors.name}</p>}

            <label className="block font-body text-[11px] tracking-[0.12em] uppercase text-neutral-500 mb-1.5 mt-4">Email</label>
            <input
              type="email"
              value={signupEmail}
              onChange={(e) => setSignupEmail(e.target.value)}
              className="w-full border-b border-neutral-300 pb-2 mb-1 font-body text-sm focus:outline-none focus:border-black"
            />
            {errors.email && <p className="text-rose-700 text-xs mb-3">{errors.email}</p>}

            <label className="block font-body text-[11px] tracking-[0.12em] uppercase text-neutral-500 mb-1.5 mt-4">Phone</label>
            <input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="03xxxxxxxxx"
              className="w-full border-b border-neutral-300 pb-2 mb-1 font-body text-sm focus:outline-none focus:border-black"
            />
            {errors.phone && <p className="text-rose-700 text-xs mb-3">{errors.phone}</p>}

            <label className="block font-body text-[11px] tracking-[0.12em] uppercase text-neutral-500 mb-1.5 mt-4">Password</label>
            <input
              type="password"
              value={signupPassword}
              onChange={(e) => setSignupPassword(e.target.value)}
              placeholder="Min. 6 characters"
              className="w-full border-b border-neutral-300 pb-2 mb-1 font-body text-sm focus:outline-none focus:border-black"
            />
            {errors.password && <p className="text-rose-700 text-xs mb-3">{errors.password}</p>}

            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-black text-white font-body text-sm tracking-wide py-3 mt-6 hover:bg-neutral-800 disabled:opacity-50"
            >
              {submitting ? 'Creating account…' : 'Sign Up'}
            </button>

            <p className="text-center font-body text-sm text-neutral-500 mt-6">
              Already have an account?{' '}
              <button type="button" onClick={() => openAuthModal('login')} className="text-black underline">
                Log In
              </button>
            </p>
          </form>
        )}
      </div>
    </div>
  );
}