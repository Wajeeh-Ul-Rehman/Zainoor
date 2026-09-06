import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuthStore } from "@/stores/authStore";
import { useUIStore } from "@/stores/uiStore";
import { Eye, EyeOff, AlertTriangle } from "lucide-react";

declare global {
  interface Window {
    google?: any;
  }
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PK_PHONE_RE = /^03\d{9}$/;

function passwordStrength(pw: string) {
  if (!pw) return { label: "", color: "bg-neutral-200" };
  if (pw.length < 8) return { label: "Too short", color: "bg-rose-500" };
  if (/[A-Z]/.test(pw) && /\d/.test(pw) && /[^A-Za-z0-9]/.test(pw)) {
    return { label: "Strong", color: "bg-emerald-500" };
  }
  return { label: "Medium", color: "bg-amber-500" };
}

function Field({ label, children, error }: { label: string; children: React.ReactNode; error?: string }) {
  return (
    <div className="space-y-1.5">
      <label className="block font-body text-xs uppercase tracking-wider text-neutral-600">
        {label}
      </label>
      {children}
      {error && (
        <p className="font-body text-xs text-rose-600 flex items-center gap-1 mt-1">
          <AlertTriangle size={12} className="shrink-0" />
          <span>{error}</span>
        </p>
      )}
    </div>
  );
}

function PasswordInput({
  value,
  onChange,
  show,
  setShow,
  placeholder,
}: {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  show: boolean;
  setShow: React.Dispatch<React.SetStateAction<boolean>>;
  placeholder?: string;
}) {
  return (
    <div className="relative">
      <input
        type={show ? "text" : "password"}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full border border-neutral-300 px-4 py-2.5 pr-10 font-body text-sm outline-none focus:border-black transition-colors"
      />
      <button
        type="button"
        onClick={() => setShow((s) => !s)}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-black"
      >
        {show ? <EyeOff size={18} /> : <Eye size={18} />}
      </button>
    </div>
  );
}

export default function Login() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialMode = searchParams.get('mode') === 'signup' ? 'signup' : 'login';
  const [mode, setMode] = useState<'login' | 'signup' | 'forgot' | 'reset'>(initialMode);

  const { login, signup, forgotPassword, resetPassword, googleLogin } = useAuthStore() as any;
  const { addToast } = useUIStore();

  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [showLoginPw, setShowLoginPw] = useState(false);

  const [fullName, setFullName] = useState("");
  const [signupEmail, setSignupEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showSignupPw, setShowSignupPw] = useState(false);
  const [showConfirmPw, setShowConfirmPw] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);

  const [forgotEmail, setForgotEmail] = useState("");
  const [resetCode, setResetCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [showNewPw, setShowNewPw] = useState(false);

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const switchMode = (m: 'login' | 'signup' | 'forgot' | 'reset') => {
    setMode(m);
    setErrors({});
  };

  const validateLogin = () => {
    const e: Record<string, string> = {};
    if (!loginEmail.trim()) e.email = "Enter your email.";
    else if (!EMAIL_RE.test(loginEmail)) e.email = "That email doesn't look right.";
    if (!loginPassword) e.password = "Enter your password.";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const validateSignup = () => {
    const e: Record<string, string> = {};
    if (!fullName.trim()) e.fullName = "Enter your full name.";
    if (!signupEmail.trim()) e.email = "Enter your email.";
    else if (!EMAIL_RE.test(signupEmail)) e.email = "That email doesn't look right.";
    if (phone.trim() && !PK_PHONE_RE.test(phone.trim())) e.phone = "Use a Pakistani mobile number, e.g. 03xxxxxxxxx.";
    if (!signupPassword) e.password = "Choose a password.";
    else if (signupPassword.length < 8) e.password = "Use at least 8 characters.";
    if (confirmPassword !== signupPassword) e.confirmPassword = "Passwords don't match.";
    if (!agreeTerms) e.terms = "You'll need to accept the terms to continue.";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const submitLogin = async (ev: React.FormEvent) => {
    ev.preventDefault();
    if (!validateLogin()) return;
    setLoading(true);
    const res = await login(loginEmail, loginPassword);
    setLoading(false);
    if (res.success) {
      addToast("Logged in successfully", "success");
      navigate("/dashboard");
    } else {
      addToast(res.error || "Login failed", "error");
    }
  };

  const submitSignup = async (ev: React.FormEvent) => {
    ev.preventDefault();
    if (!validateSignup()) return;
    setLoading(true);
    const res = await signup({ fullName, email: signupEmail, phone, password: signupPassword });
    setLoading(false);
    if (res.success) {
      addToast("Account created successfully", "success");
      navigate("/dashboard");
    } else {
      addToast(res.error || "Signup failed", "error");
    }
  };

  const submitForgot = async (ev: React.FormEvent) => {
    ev.preventDefault();
    if (!forgotEmail.trim() || !EMAIL_RE.test(forgotEmail)) {
      setErrors({ forgot: "Enter a valid email." });
      return;
    }
    setLoading(true);
    const res = await forgotPassword(forgotEmail);
    setLoading(false);
    if (res.success) {
      addToast("Reset code sent to your email", "success");
      switchMode("reset");
    } else {
      addToast(res.error || "Failed to send reset code", "error");
    }
  };

  const submitResetCode = async (ev: React.FormEvent) => {
    ev.preventDefault();
    const e: Record<string, string> = {};
    if (!resetCode || resetCode.length !== 5) e.code = "Please enter the 5-digit code.";
    if (!newPassword || newPassword.length < 8) e.newPassword = "Password must be at least 8 characters.";
    setErrors(e);
    if (Object.keys(e).length > 0) return;

    setLoading(true);
    const res = await resetPassword(forgotEmail, resetCode, newPassword);
    setLoading(false);
    if (res.success) {
      addToast("Password reset successfully", "success");
      switchMode("login");
    } else {
      addToast(res.error || "Failed to reset password", "error");
    }
  };

  useEffect(() => {
    if (window.google) {
      window.google.accounts.id.initialize({
        client_id: "YOUR_GOOGLE_CLIENT_ID",
        callback: async (response: any) => {
          setLoading(true);
          const res = await googleLogin(response.credential);
          setLoading(false);
          if (res.success) {
            addToast("Logged in with Google", "success");
            navigate("/dashboard");
          } else {
            addToast(res.error || "Google login failed", "error");
          }
        },
      });
    }
  }, [googleLogin, navigate, addToast]);

  const triggerGoogleLogin = () => {
    if (window.google) {
      window.google.accounts.id.prompt();
    } else {
      addToast("Google Sign-In is not available", "error");
    }
  };

  function SocialRow() {
    return (
      <div className="mt-6">
        <div className="relative flex py-2 items-center">
          <div className="flex-grow border-t border-neutral-200"></div>
          <span className="flex-shrink mx-4 font-body text-xs uppercase tracking-wider text-neutral-400">Or continue with</span>
          <div className="flex-grow border-t border-neutral-200"></div>
        </div>
        <button
          type="button"
          onClick={triggerGoogleLogin}
          className="w-full mt-3 border border-neutral-300 py-2.5 font-body text-sm flex items-center justify-center gap-2 hover:bg-neutral-50 transition-colors"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24">
            <path
              fill="#EA4335"
              d="M12 5c1.6 0 3 .6 4.1 1.6l3.1-3.1C17.3 1.8 14.8 1 12 1 7.5 1 3.7 3.6 1.8 7.3l3.7 2.9C6.4 7.2 9 5 12 5z"
            />
            <path
              fill="#4285F4"
              d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.8z"
            />
            <path
              fill="#FBBC05"
              d="M5.5 14.8c-.2-.7-.4-1.5-.4-2.3s.2-1.6.4-2.3L1.8 7.3C.7 9.5 0 10.7 0 12s.7 2.5 1.8 4.7l3.7-2.9z"
            />
            <path
              fill="#34A853"
              d="M12 23c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3 0-5.6-2.2-6.5-5.2L1.8 16c1.9 3.7 5.7 7 10.2 7z"
            />
          </svg>
          Google
        </button>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-white pt-32 lg:pt-40 pb-20">
      <div className="container-main max-w-md mx-auto">
        {mode === 'login' && (
          <div>
            <h1 className="font-display text-4xl mb-2">Welcome Back</h1>
            <p className="font-body text-sm text-neutral-500 mb-8">Sign in to manage your orders and wishlist.</p>

            <form onSubmit={submitLogin} className="space-y-4">
              <Field label="Email" error={errors.email}>
                <input
                  type="email"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full border border-neutral-300 px-4 py-2.5 font-body text-sm outline-none focus:border-black transition-colors"
                />
              </Field>

              <Field label="Password" error={errors.password}>
                <PasswordInput
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  show={showLoginPw}
                  setShow={setShowLoginPw}
                  placeholder="••••••••"
                />
              </Field>

              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => switchMode('forgot')}
                  className="font-body text-xs text-neutral-600 hover:text-black underline"
                >
                  Forgot password?
                </button>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-black text-white font-body text-xs uppercase tracking-widest py-3.5 hover:bg-neutral-800 transition-colors disabled:opacity-50"
              >
                {loading ? 'Signing in...' : 'Sign In'}
              </button>
            </form>

            <SocialRow />

            <p className="font-body text-sm text-center text-neutral-600 mt-8">
              Don't have an account?{' '}
              <button onClick={() => switchMode('signup')} className="text-black font-semibold underline">
                Sign up
              </button>
            </p>
          </div>
        )}

        {mode === 'signup' && (
          <div>
            <h1 className="font-display text-4xl mb-2">Create Account</h1>
            <p className="font-body text-sm text-neutral-500 mb-8">Join Zainoor for exclusive benefits.</p>

            <form onSubmit={submitSignup} className="space-y-4">
              <Field label="Full name" error={errors.fullName}>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="John Doe"
                  className="w-full border border-neutral-300 px-4 py-2.5 font-body text-sm outline-none focus:border-black transition-colors"
                />
              </Field>

              <Field label="Email" error={errors.email}>
                <input
                  type="email"
                  value={signupEmail}
                  onChange={(e) => setSignupEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full border border-neutral-300 px-4 py-2.5 font-body text-sm outline-none focus:border-black transition-colors"
                />
              </Field>

              <Field label="Phone (optional)" error={errors.phone}>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="03xxxxxxxxx"
                  className="w-full border border-neutral-300 px-4 py-2.5 font-body text-sm outline-none focus:border-black transition-colors"
                />
              </Field>

              <Field label="Password" error={errors.password}>
                <PasswordInput
                  value={signupPassword}
                  onChange={(e) => setSignupPassword(e.target.value)}
                  show={showSignupPw}
                  setShow={setShowSignupPw}
                  placeholder="At least 8 characters"
                />
                {signupPassword && (
                  <div className="flex items-center gap-2 mt-2">
                    <div className={`h-1 flex-1 rounded ${passwordStrength(signupPassword).color}`} />
                    <span className="font-body text-xs text-neutral-500">{passwordStrength(signupPassword).label}</span>
                  </div>
                )}
              </Field>

              <Field label="Confirm password" error={errors.confirmPassword}>
                <PasswordInput
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  show={showConfirmPw}
                  setShow={setShowConfirmPw}
                  placeholder="Re-enter password"
                />
              </Field>

              <div className="space-y-1">
                <label className="flex items-start gap-2 font-body text-xs text-neutral-600 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={agreeTerms}
                    onChange={(e) => setAgreeTerms(e.target.checked)}
                    className="mt-0.5 accent-black"
                  />
                  <span>I agree to the Terms of Service and Privacy Policy</span>
                </label>
                {errors.terms && (
                  <p className="font-body text-xs text-rose-600 flex items-center gap-1">
                    <AlertTriangle size={12} className="shrink-0" /> <span>{errors.terms}</span>
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-black text-white font-body text-xs uppercase tracking-widest py-3.5 hover:bg-neutral-800 transition-colors disabled:opacity-50"
              >
                {loading ? 'Creating account...' : 'Create Account'}
              </button>
            </form>

            <SocialRow />

            <p className="font-body text-sm text-center text-neutral-600 mt-8">
              Already have an account?{' '}
              <button onClick={() => switchMode('login')} className="text-black font-semibold underline">
                Sign in
              </button>
            </p>
          </div>
        )}

        {mode === 'forgot' && (
          <div>
            <h1 className="font-display text-4xl mb-2">Reset Password</h1>
            <p className="font-body text-sm text-neutral-500 mb-8">Enter your email to receive a recovery code.</p>

            <form onSubmit={submitForgot} className="space-y-4">
              <Field label="Email" error={errors.forgot}>
                <input
                  type="email"
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full border border-neutral-300 px-4 py-2.5 font-body text-sm outline-none focus:border-black transition-colors"
                />
              </Field>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-black text-white font-body text-xs uppercase tracking-widest py-3.5 hover:bg-neutral-800 transition-colors disabled:opacity-50"
              >
                {loading ? 'Sending code...' : 'Send Reset Code'}
              </button>
            </form>

            <div className="text-center mt-6">
              <button onClick={() => switchMode('login')} className="font-body text-sm text-neutral-600 underline">
                Back to Sign In
              </button>
            </div>
          </div>
        )}

        {mode === 'reset' && (
          <div>
            <h1 className="font-display text-4xl mb-2">Enter New Password</h1>
            <p className="font-body text-sm text-neutral-500 mb-8">Enter the 5-digit code sent to your email.</p>

            <form onSubmit={submitResetCode} className="space-y-4">
              <Field label="5-Digit Code" error={errors.code}>
                <input
                  type="text"
                  maxLength={5}
                  value={resetCode}
                  onChange={(e) => setResetCode(e.target.value)}
                  placeholder="12345"
                  className="w-full border border-neutral-300 px-4 py-2.5 font-body text-sm outline-none focus:border-black transition-colors tracking-widest text-center font-mono text-lg"
                />
              </Field>

              <Field label="New Password" error={errors.newPassword}>
                <PasswordInput
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  show={showNewPw}
                  setShow={setShowNewPw}
                  placeholder="At least 8 characters"
                />
              </Field>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-black text-white font-body text-xs uppercase tracking-widest py-3.5 hover:bg-neutral-800 transition-colors disabled:opacity-50"
              >
                {loading ? 'Resetting...' : 'Reset Password'}
              </button>
            </form>

            <div className="text-center mt-6">
              <button onClick={() => switchMode('login')} className="font-body text-sm text-neutral-600 underline">
                Back to Sign In
              </button>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}