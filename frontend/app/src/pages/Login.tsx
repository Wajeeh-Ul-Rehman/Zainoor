import React, { useState, useEffect } from "react";
import { Eye, EyeOff, AlertTriangle, CheckCircle2, ArrowLeft, ArrowRight } from "lucide-react";
import { useAuthStore } from '@/stores/authStore';
import { useNavigate } from 'react-router-dom';
/* ---------------------------------------------------------------------- */
/*  Helpers                                                                 */
/* ---------------------------------------------------------------------- */

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PK_PHONE_RE = /^(\+92|0)?3\d{9}$/;

function passwordStrength(pw) {
  if (!pw) return { score: 0, label: "", cls: "" };
  let score = 0;
  if (pw.length >= 8) score++;
  if (/[A-Z]/.test(pw)) score++;
  if (/[0-9]/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  const map = [
    { label: "Too short", cls: "bg-rose-600" },
    { label: "Weak", cls: "bg-rose-600" },
    { label: "Fair", cls: "bg-amber-500" },
    { label: "Good", cls: "bg-amber-500" },
    { label: "Strong", cls: "bg-emerald-600" },
  ];
  return { score, ...map[score] };
}

const inputBase = "w-full border border-neutral-300 px-3 py-2.5 pr-10 font-body text-sm text-neutral-900 bg-white focus:outline-none focus:ring-2 focus:ring-neutral-900";

function Field({ label, children, error }) {
  return (
    <div className="mb-4">
      <label className="block font-body text-[11px] tracking-[0.12em] uppercase text-neutral-500 mb-1.5">{label}</label>
      {children}
      {error && (
        <div className="flex items-center gap-1.5 text-rose-700 text-xs mt-1.5">
          <AlertTriangle size={12} className="shrink-0" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}

function PasswordInput({ value, onChange, show, setShow, placeholder }) {
  return (
    <div className="relative">
      <input
        type={show ? "text" : "password"}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={inputBase}
        autoComplete="current-password"
      />
      <button
        type="button"
        onClick={() => setShow((s) => !s)}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-700"
        aria-label={show ? "Hide password" : "Show password"}
      >
        {show ? <EyeOff size={16} /> : <Eye size={16} />}
      </button>
    </div>
  );
}

/* ---------------------------------------------------------------------- */
/*  Main component                                                         */
/* ---------------------------------------------------------------------- */

export default function ZainoorAuthPage() {
  const { login } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
  e.preventDefault();
  const result = await login(email, password);
  if (result.success) {
    navigate('/dashboard');
  } else {
    alert('Invalid email or password');
  }
};

  const [mode, setMode] = useState("login"); // 'login' | 'signup'
  const [view, setView] = useState("form"); // 'form' | 'forgot' | 'success'
  const [submitting, setSubmitting] = useState(false);

  // login state
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [remember, setRemember] = useState(true);
  const [showLoginPw, setShowLoginPw] = useState(false);

  // signup state
  const [fullName, setFullName] = useState("");
  const [signupEmail, setSignupEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [showSignupPw, setShowSignupPw] = useState(false);
  const [showConfirmPw, setShowConfirmPw] = useState(false);

  // forgot password
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotSent, setForgotSent] = useState(false);

  const [errors, setErrors] = useState({});

  const switchMode = (m) => {
    setMode(m);
    setView("form");
    setErrors({});
  };

  /* ---------- validation ---------- */
  const validateLogin = () => {
    const e = {};
    if (!loginEmail.trim()) e.email = "Enter your email.";
    else if (!EMAIL_RE.test(loginEmail)) e.email = "That email doesn't look right.";
    if (!loginPassword) e.password = "Enter your password.";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const validateSignup = () => {
    const e = {};
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

  const submitLogin = async (ev) => {
    ev.preventDefault();
    if (!validateLogin()) return;

    setSubmitting(true);
    const result = await login(loginEmail, loginPassword);
    setSubmitting(false);

    if (result.success && result.user) {
      // Routes based on the database isAdmin flag
      if (result.user.isAdmin) {
        navigate('/admin');
      } else {
        navigate('/dashboard'); // Or your standard user route
      }
    } else {
      setErrors({ email: result.error || "Invalid email or password" });
    }
};

  const submitSignup = (ev) => {
    ev.preventDefault();
    if (!validateSignup()) return;
    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      setView("success");
    }, 900);
  };

  const submitForgot = (ev) => {
    ev.preventDefault();
    if (!forgotEmail.trim() || !EMAIL_RE.test(forgotEmail)) {
      setErrors({ forgot: "Enter a valid email to reset your password." });
      return;
    }
    setErrors({});
    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      setForgotSent(true);
    }, 900);
  };

  const strength = passwordStrength(signupPassword);

  const quote =
    mode === "login"
      ? "Your wardrobe, wherever you left it."
      : "Considered pieces, made to be worn for years.";

  /* ---------------------------------------------------------------------- */

  return (
    <div className="min-h-screen bg-neutral-50 flex">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,500;0,600;1,400&family=DM+Sans:wght@400;500;700&display=swap');
        .font-display { font-family: 'Cormorant Garamond', serif; font-weight: 600; }
        .font-body { font-family: 'DM Sans', sans-serif; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: translateY(0); } }
        .fade-in { animation: fadeIn 0.35s ease both; }
      `}</style>

      {/* Editorial image panel */}
      <div className="hidden lg:block lg:w-[44%] relative overflow-hidden">
        <img
          src="https://picsum.photos/seed/zainoor-editorial/900/1400"
          alt=""
          className="absolute inset-0 w-full h-full object-cover"
          style={{ filter: "grayscale(1) contrast(1.08)" }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-neutral-900/80 via-neutral-900/10 to-neutral-900/30" />
        <div className="absolute top-10 left-10">
          <div className="font-display text-3xl tracking-[0.18em] text-white">ZAINOOR</div>
        </div>
        <div key={mode} className="absolute bottom-12 left-10 right-10 fade-in">
          <p className="font-display italic text-2xl text-white leading-snug">{quote}</p>
          <p className="font-body text-xs tracking-[0.14em] uppercase text-neutral-300 mt-4">300+ cities across Pakistan</p>
        </div>
      </div>

      {/* Form panel */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm">
          <div className="lg:hidden text-center mb-8">
            <div className="font-display text-2xl tracking-[0.18em] text-neutral-900">ZAINOOR</div>
          </div>

          {view === "form" && (
            <>
              {/* Tabs */}
              <div className="flex border-b border-neutral-200 mb-8">
                <button
                  onClick={() => switchMode("login")}
                  className={`flex-1 pb-3 font-body text-sm tracking-wide border-b-2 -mb-px ${mode === "login" ? "border-neutral-900 text-neutral-900" : "border-transparent text-neutral-400 hover:text-neutral-600"}`}
                >
                  Log in
                </button>
                <button
                  onClick={() => switchMode("signup")}
                  className={`flex-1 pb-3 font-body text-sm tracking-wide border-b-2 -mb-px ${mode === "signup" ? "border-neutral-900 text-neutral-900" : "border-transparent text-neutral-400 hover:text-neutral-600"}`}
                >
                  Create account
                </button>
              </div>

              {mode === "login" ? (
                <form key="login" onSubmit={submitLogin} className="fade-in">
                  <h1 className="font-display text-2xl text-neutral-900 mb-1">Welcome back</h1>
                  <p className="font-body text-sm text-neutral-500 mb-6">Log in to track orders and check out faster.</p>

                  <Field label="Email" error={errors.email}>
                    <input
                      type="email"
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      placeholder="you@example.com"
                      className={inputBase.replace("pr-10", "pr-3")}
                      autoComplete="email"
                    />
                  </Field>

                  <Field label="Password" error={errors.password}>
                    <PasswordInput value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)} show={showLoginPw} setShow={setShowLoginPw} placeholder="••••••••" />
                  </Field>

                  <div className="flex items-center justify-between mb-6">
                    <label className="flex items-center gap-2 font-body text-sm text-neutral-600">
                      <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} className="w-4 h-4" />
                      Remember me
                    </label>
                    <button type="button" onClick={() => setView("forgot")} className="font-body text-sm text-neutral-500 hover:text-neutral-900 underline underline-offset-2">
                      Forgot password?
                    </button>
                  </div>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full bg-neutral-900 text-white font-body text-sm tracking-wide py-3 hover:bg-neutral-800 disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {submitting ? "Logging in…" : "Log in"}
                  </button>

                  <SocialRow />

                  <p className="text-center font-body text-sm text-neutral-500 mt-6">
                    New to ZaiNoor?{" "}
                    <button type="button" onClick={() => switchMode("signup")} className="text-neutral-900 underline underline-offset-2">
                      Create an account
                    </button>
                  </p>
                </form>
              ) : (
                <form key="signup" onSubmit={submitSignup} className="fade-in">
                  <h1 className="font-display text-2xl text-neutral-900 mb-1">Create your account</h1>
                  <p className="font-body text-sm text-neutral-500 mb-6">Save addresses, track orders, and check out faster next time.</p>

                  <Field label="Full name" error={errors.fullName}>
                    <input value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Ayesha Khan" className={inputBase.replace("pr-10", "pr-3")} autoComplete="name" />
                  </Field>

                  <Field label="Email" error={errors.email}>
                    <input type="email" value={signupEmail} onChange={(e) => setSignupEmail(e.target.value)} placeholder="you@example.com" className={inputBase.replace("pr-10", "pr-3")} autoComplete="email" />
                  </Field>

                  <Field label="Phone (optional)" error={errors.phone}>
                    <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="03xxxxxxxxx" className={inputBase.replace("pr-10", "pr-3")} autoComplete="tel" />
                  </Field>

                  <Field label="Password" error={errors.password}>
                    <PasswordInput value={signupPassword} onChange={(e) => setSignupPassword(e.target.value)} show={showSignupPw} setShow={setShowSignupPw} placeholder="At least 8 characters" />
                    {signupPassword && (
                      <div className="mt-2">
                        <div className="h-1 w-full bg-neutral-100 flex gap-1">
                          {[0, 1, 2, 3].map((i) => (
                            <div key={i} className={`flex-1 ${i < strength.score ? strength.cls : "bg-neutral-100"}`} />
                          ))}
                        </div>
                        <div className="font-body text-xs text-neutral-500 mt-1">{strength.label}</div>
                      </div>
                    )}
                  </Field>

                  <Field label="Confirm password" error={errors.confirmPassword}>
                    <PasswordInput value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} show={showConfirmPw} setShow={setShowConfirmPw} placeholder="Re-enter password" />
                  </Field>

                  <div className="mb-6">
                    <label className="flex items-start gap-2 font-body text-sm text-neutral-600">
                      <input type="checkbox" checked={agreeTerms} onChange={(e) => setAgreeTerms(e.target.checked)} className="w-4 h-4 mt-0.5" />
                      <span>I agree to the Terms of Service and Privacy Policy.</span>
                    </label>
                    {errors.terms && (
                      <div className="flex items-center gap-1.5 text-rose-700 text-xs mt-1.5">
                        <AlertTriangle size={12} className="shrink-0" /> <span>{errors.terms}</span>
                      </div>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full bg-neutral-900 text-white font-body text-sm tracking-wide py-3 hover:bg-neutral-800 disabled:opacity-50"
                  >
                    {submitting ? "Creating account…" : "Create account"}
                  </button>

                  <SocialRow />

                  <p className="text-center font-body text-sm text-neutral-500 mt-6">
                    Already have an account?{" "}
                    <button type="button" onClick={() => switchMode("login")} className="text-neutral-900 underline underline-offset-2">
                      Log in
                    </button>
                  </p>
                </form>
              )}
            </>
          )}

          {view === "forgot" && (
            <div className="fade-in">
              <button onClick={() => { setView("form"); setForgotSent(false); }} className="flex items-center gap-1.5 font-body text-sm text-neutral-500 hover:text-neutral-900 mb-6">
                <ArrowLeft size={14} /> Back to log in
              </button>

              {!forgotSent ? (
                <form onSubmit={submitForgot}>
                  <h1 className="font-display text-2xl text-neutral-900 mb-1">Reset your password</h1>
                  <p className="font-body text-sm text-neutral-500 mb-6">Enter the email on your account and we'll send a reset link.</p>
                  <Field label="Email" error={errors.forgot}>
                    <input type="email" value={forgotEmail} onChange={(e) => setForgotEmail(e.target.value)} placeholder="you@example.com" className={inputBase.replace("pr-10", "pr-3")} />
                  </Field>
                  <button type="submit" disabled={submitting} className="w-full bg-neutral-900 text-white font-body text-sm tracking-wide py-3 hover:bg-neutral-800 disabled:opacity-50">
                    {submitting ? "Sending…" : "Send reset link"}
                  </button>
                </form>
              ) : (
                <div className="text-center py-6">
                  <CheckCircle2 size={36} className="text-emerald-700 mx-auto mb-4" strokeWidth={1.5} />
                  <h2 className="font-display text-xl text-neutral-900 mb-1">Check your inbox</h2>
                  <p className="font-body text-sm text-neutral-500">If an account exists for {forgotEmail}, a reset link is on its way.</p>
                </div>
              )}
            </div>
          )}

          {view === "success" && (
            <div className="fade-in text-center py-8">
              <CheckCircle2 size={40} className="text-emerald-700 mx-auto mb-5" strokeWidth={1.5} />
              <h1 className="font-display text-2xl text-neutral-900 mb-2">
                {mode === "login" ? "Welcome back" : "Account created"}
              </h1>
              <p className="font-body text-sm text-neutral-500 mb-8 max-w-xs mx-auto">
                {mode === "login"
                  ? `You're logged in as ${loginEmail}.`
                  : `A verification link has been sent to ${signupEmail}. Confirm it to activate your account.`}
              </p>
              <button
                onClick={() => { setView("form"); setMode("login"); }}
                className="inline-flex items-center gap-2 bg-neutral-900 text-white font-body text-sm px-5 py-2.5 hover:bg-neutral-800"
              >
                Continue shopping <ArrowRight size={14} />
              </button>
            </div>
          )}

          {view === "form" && (
            <p className="text-center font-body text-[11px] text-neutral-400 mt-8 leading-relaxed">
              This page validates and simulates auth in the browser only. Wire the submit handlers to a real
              auth provider (e.g. Supabase/Firebase Auth) to actually create sessions and send emails.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

function SocialRow() {
  const { googleLogin } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    /* global google */
    if (window.google) {
      google.accounts.id.initialize({
        client_id: "YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com", // Replace with your Google Cloud Console Client ID
        callback: async (response: any) => {
          const result = await googleLogin(response.credential);
          if (result.success && result.user) {
            if (result.user.isAdmin) {
              navigate('/admin-dashboard');
            } else {
              navigate('/dashboard/orders');
            }
          } else {
            alert(result.error || "Google login failed");
          }
        },
      });
    }
  }, [googleLogin, navigate]);

  const handleGoogleClick = () => {
    if (window.google) {
      google.accounts.id.prompt(); // Opens Google One Tap / Sign-in popup
    } else {
      alert("Google script is still loading. Please try again.");
    }
  };

  return (
    <div className="mt-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="h-px flex-1 bg-neutral-200" />
        <span className="font-body text-xs text-neutral-400">or continue with</span>
        <div className="h-px flex-1 bg-neutral-200" />
      </div>
      <button
        type="button"
        onClick={handleGoogleClick}
        className="w-full flex items-center justify-center gap-2 border border-neutral-300 py-2.5 font-body text-sm text-neutral-700 hover:border-neutral-900 hover:text-neutral-900 transition-colors"
      >
        <span className="font-display text-base leading-none">G</span> Continue with Google
      </button>
    </div>
  );
}