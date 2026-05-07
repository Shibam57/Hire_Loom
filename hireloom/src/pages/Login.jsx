import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { loginEmployee, clearError } from "../redux/authSlice";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

// ── Design tokens ──────────────────────────────────────────────
const ink    = "#0F0D0B";
const paper  = "#FDFAF7";
const amber  = "#D97706";
const mist   = "#F5F0EB";
const stone  = "#78716C";
const border = "#E7E0D8";
const easeOut = [0.22, 1, 0.36, 1];

// ── Floating label input ───────────────────────────────────────
const FloatInput = ({ label, name, type = "text", value, onChange, error, right }) => {
  const [focused, setFocused] = useState(false);
  const lifted = focused || value?.length > 0;

  return (
    <div className="relative mb-5">
      <div
        className="relative rounded-xl overflow-hidden transition-all duration-200"
        style={{
          border: `1.5px solid ${error ? "#EF4444" : focused ? amber : border}`,
          boxShadow: focused ? `0 0 0 3px ${amber}22` : "none",
          background: paper,
        }}
      >
        <label
          className="absolute left-4 transition-all duration-200 pointer-events-none font-medium select-none"
          style={{
            top: lifted ? "8px" : "50%",
            transform: lifted ? "translateY(0)" : "translateY(-50%)",
            fontSize: lifted ? "10px" : "14px",
            color: error ? "#EF4444" : focused ? amber : stone,
            letterSpacing: lifted ? "0.1em" : "0",
            textTransform: lifted ? "uppercase" : "none",
            fontWeight: lifted ? 700 : 500,
          }}
        >
          {label}
        </label>
        <input
          type={type}
          name={name}
          value={value}
          onChange={onChange}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          required
          style={{
            width: "100%",
            padding: "28px 16px 10px",
            paddingRight: right ? "44px" : "16px",
            background: "transparent",
            border: "none",
            outline: "none",
            fontSize: "14px",
            color: ink,
            fontFamily: "inherit",
          }}
        />
        {right && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">{right}</div>
        )}
      </div>
      {error && (
        <motion.p
          initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }}
          className="text-[11px] text-red-500 font-semibold mt-1.5 ml-1"
        >
          {error}
        </motion.p>
      )}
    </div>
  );
};

// ── Geometric accent SVG ───────────────────────────────────────
const GeoAccent = () => (
  <svg width="100%" height="100%" viewBox="0 0 400 600" fill="none" xmlns="http://www.w3.org/2000/svg"
    className="absolute inset-0 w-full h-full">
    <circle cx="320" cy="80"  r="180" fill={`${amber}12`} />
    <circle cx="60"  cy="500" r="120" fill={`${amber}08`} />
    <circle cx="340" cy="420" r="60"  fill={`${amber}10`} />
    <line x1="0" y1="300" x2="400" y2="200" stroke={`${amber}18`} strokeWidth="0.5" />
    <line x1="100" y1="0" x2="300" y2="600" stroke={`${amber}12`} strokeWidth="0.5" />
    <rect x="30" y="120" width="40" height="40" rx="8" fill="none" stroke={`${amber}20`} strokeWidth="1" transform="rotate(20 50 140)" />
    <rect x="320" y="300" width="60" height="60" rx="12" fill="none" stroke={`${amber}15`} strokeWidth="1" transform="rotate(-15 350 330)" />
    <polygon points="200,40 230,90 170,90" fill="none" stroke={`${amber}20`} strokeWidth="1" />
  </svg>
);

// ── Main ───────────────────────────────────────────────────────
const Login = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const { loading, error, isAuthenticated } = useSelector((s) => s.auth);
  const redirect = searchParams.get("redirect");

  const [form, setForm] = useState({ email: "", password: "" });
  const [showPass, setShowPass] = useState(false);
  const [loginOk, setLoginOk] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = (e) => {
    e.preventDefault();
    dispatch(loginEmployee(form));
  };

  useEffect(() => {
    if (isAuthenticated) {
      setLoginOk(true);
      setTimeout(() => navigate(redirect || "/dashboard"), 900);
    }
  }, [isAuthenticated, navigate, redirect]);

  useEffect(() => () => { dispatch(clearError()); }, [dispatch]);

  return (
    <div
      className="min-h-screen flex"
      style={{ fontFamily: "'DM Sans', system-ui, sans-serif", background: paper }}
    >
      {/* ═══ LEFT — dark hero panel ═══ */}
      <aside
        className="hidden lg:flex w-[420px] xl:w-[480px] shrink-0 flex-col justify-between px-12 py-14 relative overflow-hidden"
        style={{ background: ink }}
      >
        <GeoAccent />

        {/* Brand */}
        <div className="relative flex items-center gap-3">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center font-black text-sm"
            style={{ background: amber, color: "#fff" }}
          >H</div>
          <span className="text-white font-bold text-lg tracking-tight">Hireloom</span>
        </div>

        {/* Hero copy */}
        <div className="relative">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, duration: 0.6, ease: easeOut }}
          >
            <p
              className="font-black leading-none mb-4"
              style={{ fontSize: "clamp(2.4rem, 4vw, 3.4rem)", color: "#fff", letterSpacing: "-0.03em" }}
            >
              Your next<br />
              <span style={{ color: amber }}>career move</span><br />
              starts here.
            </p>
            <p className="text-sm leading-relaxed" style={{ color: "#78716C" }}>
              Sign in to explore thousands of curated opportunities matched to your skills and ambitions.
            </p>
          </motion.div>

          {/* Floating stat cards */}
          <div className="flex gap-3 mt-10">
            {[
              { val: "54k+", label: "Positions" },
              { val: "12k+", label: "Companies" },
              { val: "9d",   label: "Avg. hire" },
            ].map((s, i) => (
              <motion.div
                key={s.label}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + i * 0.08, duration: 0.4, ease: easeOut }}
                className="flex-1 rounded-2xl px-4 py-3"
                style={{ background: "#1C1917", border: `1px solid #292524` }}
              >
                <p className="font-black text-lg" style={{ color: amber, letterSpacing: "-0.02em" }}>{s.val}</p>
                <p className="text-[11px] font-semibold" style={{ color: "#57534E" }}>{s.label}</p>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <p className="relative text-xs" style={{ color: "#3C3632" }}>
          © 2026 Hireloom Inc. All rights reserved.
        </p>
      </aside>

      {/* ═══ RIGHT — form panel ═══ */}
      <main className="flex-1 flex items-center justify-center px-4 sm:px-8 py-12">
        <div className="w-full max-w-[400px]">

          {/* Mobile brand */}
          <div className="flex items-center gap-2.5 mb-10 lg:hidden">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center font-black text-sm"
              style={{ background: amber, color: "#fff" }}>H</div>
            <span className="font-bold text-base" style={{ color: ink }}>Hireloom</span>
          </div>

          {/* Heading */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: easeOut }}
            className="mb-8"
          >
            <h1 className="font-black mb-1.5" style={{ fontSize: "1.75rem", color: ink, letterSpacing: "-0.03em" }}>
              Welcome back
            </h1>
            <p className="text-sm" style={{ color: stone }}>
              Sign in to your employee account to continue.
            </p>
          </motion.div>

          {/* Error banner */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -8, height: 0 }}
                animate={{ opacity: 1, y: 0, height: "auto" }}
                exit={{ opacity: 0, y: -8, height: 0 }}
                transition={{ duration: 0.25 }}
                className="flex items-center gap-3 rounded-xl px-4 py-3 mb-5 text-sm font-semibold text-red-700"
                style={{ background: "#FEF2F2", border: "1.5px solid #FECACA" }}
              >
                <svg width="15" height="15" viewBox="0 0 16 16" fill="none" className="shrink-0">
                  <circle cx="8" cy="8" r="7" stroke="#EF4444" strokeWidth="1.5" />
                  <path d="M8 5v3.5M8 10.5v.5" stroke="#EF4444" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
                {error}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Success banner */}
          <AnimatePresence>
            {loginOk && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex items-center gap-3 rounded-xl px-4 py-3 mb-5 text-sm font-semibold text-emerald-700"
                style={{ background: "#ECFDF5", border: "1.5px solid #A7F3D0" }}
              >
                <svg width="15" height="15" viewBox="0 0 16 16" fill="none" className="shrink-0">
                  <circle cx="8" cy="8" r="7" stroke="#10b981" strokeWidth="1.5" />
                  <path d="M5 8l2 2 4-4" stroke="#10b981" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                Logged in — redirecting…
              </motion.div>
            )}
          </AnimatePresence>

          {/* Form */}
          <motion.form
            onSubmit={handleSubmit}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.4, ease: easeOut }}
          >
            <FloatInput
              label="Email address"
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
            />

            <FloatInput
              label="Password"
              name="password"
              type={showPass ? "text" : "password"}
              value={form.password}
              onChange={handleChange}
              right={
                <button
                  type="button"
                  tabIndex={-1}
                  onClick={() => setShowPass((p) => !p)}
                  style={{ color: stone, padding: "4px" }}
                >
                  {showPass ? (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19M1 1l22 22"/>
                    </svg>
                  ) : (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                      <circle cx="12" cy="12" r="3"/>
                    </svg>
                  )}
                </button>
              }
            />

            {/* Forgot password */}
            <div className="flex justify-end -mt-2 mb-6">
              <Link to="/forgot-password" className="text-xs font-semibold hover:underline"
                style={{ color: amber }}>
                Forgot password?
              </Link>
            </div>

            {/* Submit */}
            <motion.button
              type="submit"
              disabled={loading || loginOk}
              whileTap={{ scale: 0.97 }}
              className="w-full flex items-center justify-center gap-2.5 font-bold text-sm py-3.5 rounded-xl transition-all duration-200"
              style={{
                background: loading || loginOk ? "#D6D3D1" : ink,
                color: "#fff",
                cursor: loading || loginOk ? "not-allowed" : "pointer",
                letterSpacing: "0.01em",
              }}
              onMouseEnter={(e) => { if (!loading && !loginOk) e.currentTarget.style.background = amber; }}
              onMouseLeave={(e) => { if (!loading && !loginOk) e.currentTarget.style.background = ink; }}
            >
              {loading ? (
                <>
                  <svg className="animate-spin" width="15" height="15" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="10" stroke="white" strokeOpacity="0.3" strokeWidth="3" />
                    <path d="M22 12a10 10 0 0 0-10-10" stroke="white" strokeWidth="3" strokeLinecap="round" />
                  </svg>
                  Signing in…
                </>
              ) : loginOk ? (
                <>
                  <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                    <path d="M3 8l3 3 7-7" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  Redirecting…
                </>
              ) : "Sign in →"}
            </motion.button>
          </motion.form>

          {/* Divider */}
          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-px" style={{ background: border }} />
            <span className="text-[11px] font-semibold" style={{ color: stone }}>or</span>
            <div className="flex-1 h-px" style={{ background: border }} />
          </div>

          {/* Google */}
          <motion.button
            type="button" whileTap={{ scale: 0.97 }}
            className="w-full flex items-center justify-center gap-2.5 text-sm font-semibold py-3 rounded-xl transition-all duration-150"
            style={{ background: mist, border: `1.5px solid ${border}`, color: ink }}
            onMouseEnter={(e) => e.currentTarget.style.borderColor = amber}
            onMouseLeave={(e) => e.currentTarget.style.borderColor = border}
          >
            <svg width="17" height="17" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Continue with Google
          </motion.button>

          {/* Register link */}
          <p className="text-center text-sm mt-7" style={{ color: stone }}>
            Don't have an account?{" "}
            <Link to="/register" className="font-bold hover:underline" style={{ color: ink }}>
              Register free →
            </Link>
          </p>

          {/* Employer login */}
          <p className="text-center text-xs mt-3" style={{ color: stone }}>
            Hiring?{" "}
            <Link to="/login" className="font-semibold hover:underline" style={{ color: amber }}>
              Employer sign-in
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
};

export default Login;
