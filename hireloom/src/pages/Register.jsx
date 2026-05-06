import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { registerEmployee, clearError } from "../redux/authSlice";
import { useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

// ── Design tokens ──────────────────────────────────────────────
const ink    = "#0F1F15";   // deep forest
const paper  = "#F7FAF8";   // soft green-white
const sage   = "#4D7C5F";   // sage green accent
const mist   = "#EBF2EE";   // pale green tint
const warm   = "#6B7C6E";   // muted text
const border = "#D4E3DA";
const easeOut = [0.22, 1, 0.36, 1];

// ── Animated background blobs ──────────────────────────────────
const BlobBg = () => (
  <div className="absolute inset-0 overflow-hidden pointer-events-none">
    <motion.div
      animate={{ scale: [1, 1.08, 1], rotate: [0, 8, 0] }}
      transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
      className="absolute -top-24 -left-24 w-80 h-80 rounded-full"
      style={{ background: `${sage}18` }}
    />
    <motion.div
      animate={{ scale: [1, 1.12, 1], rotate: [0, -10, 0] }}
      transition={{ duration: 18, repeat: Infinity, ease: "easeInOut", delay: 2 }}
      className="absolute -bottom-20 -right-20 w-96 h-96 rounded-full"
      style={{ background: `${sage}10` }}
    />
    <motion.div
      animate={{ y: [0, -20, 0], x: [0, 12, 0] }}
      transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 1 }}
      className="absolute top-1/2 left-1/4 w-40 h-40 rounded-full"
      style={{ background: `${sage}0C` }}
    />
    {/* Dot grid */}
    <div className="absolute inset-0 opacity-30"
      style={{
        backgroundImage: `radial-gradient(circle, ${sage}30 1px, transparent 1px)`,
        backgroundSize: "28px 28px",
      }}
    />
  </div>
);

// ── Password strength ──────────────────────────────────────────
const getStrength = (pw) => {
  if (!pw) return 0;
  if (pw.length < 6) return 1;
  const has = (r) => r.test(pw);
  const score = [has(/[A-Z]/), has(/[0-9]/), has(/[^A-Za-z0-9]/), pw.length >= 10].filter(Boolean).length;
  return score >= 3 ? 4 : score >= 2 ? 3 : 2;
};
const strengthLabel = ["", "Too short", "Weak", "Good", "Strong"];
const strengthColor = ["", "#EF4444", "#F59E0B", "#10B981", "#059669"];

// ── Floating label input ───────────────────────────────────────
const FloatInput = ({ label, name, type = "text", value, onChange, error, right, hint }) => {
  const [focused, setFocused] = useState(false);
  const lifted = focused || value?.length > 0;

  return (
    <div className="mb-5">
      <div
        className="relative rounded-2xl transition-all duration-200"
        style={{
          border: `1.5px solid ${error ? "#EF4444" : focused ? sage : border}`,
          boxShadow: focused ? `0 0 0 3px ${sage}22` : "none",
          background: "#fff",
        }}
      >
        <label
          className="absolute left-4 pointer-events-none select-none transition-all duration-200 font-medium"
          style={{
            top: lifted ? "8px" : "50%",
            transform: lifted ? "translateY(0)" : "translateY(-50%)",
            fontSize: lifted ? "9.5px" : "13.5px",
            color: error ? "#EF4444" : focused ? sage : warm,
            letterSpacing: lifted ? "0.1em" : "0",
            textTransform: lifted ? "uppercase" : "none",
            fontWeight: lifted ? 700 : 500,
          }}
        >
          {label}
        </label>
        <input
          type={type} name={name} value={value} onChange={onChange}
          onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
          required
          style={{
            width: "100%",
            padding: "26px 16px 10px",
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
      {hint && !error && <p className="text-[11px] mt-1.5 ml-1" style={{ color: warm }}>{hint}</p>}
      {error && (
        <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }}
          className="text-[11px] font-semibold mt-1.5 ml-1" style={{ color: "#EF4444" }}>
          {error}
        </motion.p>
      )}
    </div>
  );
};

// ── Main ───────────────────────────────────────────────────────
const Register = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { loading, error, isAuthenticated } = useSelector((s) => s.auth);

  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [confirmPass, setConfirmPass] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [localErrors, setLocalErrors] = useState({});
  const [registered, setRegistered] = useState(false);

  const strength = getStrength(form.password);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (localErrors[e.target.name]) setLocalErrors((p) => ({ ...p, [e.target.name]: "" }));
    console.log("FORM SUBMITTED");
  };

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = "Full name is required";
    if (!form.email.trim()) e.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = "Enter a valid email";
    if (!form.password) e.password = "Password is required";
    else if (form.password.length < 6) e.password = "Minimum 6 characters";
    if (confirmPass !== form.password) e.confirmPass = "Passwords don't match";
    return e;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setLocalErrors(errs); return; }

    const formattedData = { ...form };
    console.log("DISPATCHING DATA:", formattedData);
    dispatch(registerEmployee(formattedData));
  };

  useEffect(() => {
    if (isAuthenticated) {
      setRegistered(true);
      setTimeout(() => navigate("/dashboard"), 900);
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => () => { dispatch(clearError()); }, [dispatch]);

  const EyeBtn = ({ show, toggle }) => (
    <button type="button" tabIndex={-1} onClick={toggle} style={{ color: warm, padding: "4px" }}>
      {show ? (
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
  );

  return (
    <div className="min-h-screen flex" style={{ fontFamily: "'DM Sans', system-ui, sans-serif", background: paper }}>

      {/* ═══ LEFT — illustration panel ═══ */}
      <aside
        className="hidden lg:flex w-[400px] xl:w-[460px] shrink-0 flex-col justify-between px-12 py-14 relative overflow-hidden"
        style={{ background: ink }}
      >
        <BlobBg />

        {/* Brand */}
        <div className="relative flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center font-black text-sm"
            style={{ background: sage, color: "#fff" }}>T</div>
          <span className="text-white font-bold text-lg tracking-tight">TalentHub</span>
        </div>

        {/* Hero text */}
        <div className="relative">
          <motion.div
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, duration: 0.55, ease: easeOut }}
          >
            <p className="font-black leading-none mb-5 text-white"
              style={{ fontSize: "clamp(2.2rem,3.5vw,3rem)", letterSpacing: "-0.03em" }}>
              Launch your<br />
              <span style={{ color: `${sage}CC` }}>career</span><br />
              today.
            </p>
            <p className="text-sm leading-relaxed mb-10" style={{ color: "#6B7C6E" }}>
              Join thousands of professionals who found their dream role through TalentHub.
            </p>

            {/* Feature list */}
            {[
              "Access curated job listings daily",
              "AI-matched opportunities for your skills",
              "Direct messaging with hiring managers",
              "Free forever — no hidden fees",
            ].map((item, i) => (
              <motion.div
                key={item}
                initial={{ opacity: 0, x: -14 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + i * 0.08, duration: 0.35, ease: easeOut }}
                className="flex items-center gap-3 mb-3.5"
              >
                <div className="w-5 h-5 rounded-full flex items-center justify-center shrink-0"
                  style={{ background: `${sage}30`, border: `1px solid ${sage}50` }}>
                  <svg width="9" height="9" viewBox="0 0 10 10" fill="none">
                    <path d="M2 5l2 2 4-4" stroke={sage} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <span className="text-sm" style={{ color: "#8FA893" }}>{item}</span>
              </motion.div>
            ))}
          </motion.div>
        </div>

        {/* Footer */}
        <p className="relative text-xs" style={{ color: "#2D4035" }}>© 2026 TalentHub Inc.</p>
      </aside>

      {/* ═══ RIGHT — form ═══ */}
      <main className="flex-1 flex items-start justify-center px-4 sm:px-8 py-10 overflow-y-auto">
        <div className="w-full max-w-[400px]">

          {/* Mobile brand */}
          <div className="flex items-center gap-2.5 mb-8 lg:hidden">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center font-black text-sm"
              style={{ background: sage, color: "#fff" }}>T</div>
            <span className="font-bold text-base" style={{ color: ink }}>TalentHub</span>
          </div>

          {/* Heading */}
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: easeOut }}
            className="mb-7"
          >
            <h1 className="font-black mb-1.5" style={{ fontSize: "1.75rem", color: ink, letterSpacing: "-0.03em" }}>
              Create your account
            </h1>
            <p className="text-sm" style={{ color: warm }}>
              Already have one?{" "}
              <Link to="/login" className="font-bold hover:underline" style={{ color: sage }}>Sign in →</Link>
            </p>
          </motion.div>

          {/* Error banner */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.22 }}
                className="flex items-center gap-3 rounded-2xl px-4 py-3 mb-5 text-sm font-semibold text-red-700"
                style={{ background: "#FEF2F2", border: "1.5px solid #FECACA" }}
              >
                <svg width="14" height="14" viewBox="0 0 16 16" fill="none" className="shrink-0">
                  <circle cx="8" cy="8" r="7" stroke="#EF4444" strokeWidth="1.5"/>
                  <path d="M8 5v3.5M8 10.5v.5" stroke="#EF4444" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
                {error}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Success banner */}
          <AnimatePresence>
            {registered && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                className="flex items-center gap-3 rounded-2xl px-4 py-3 mb-5 text-sm font-semibold text-emerald-700"
                style={{ background: "#ECFDF5", border: "1.5px solid #A7F3D0" }}
              >
                <svg width="14" height="14" viewBox="0 0 16 16" fill="none" className="shrink-0">
                  <circle cx="8" cy="8" r="7" stroke="#10b981" strokeWidth="1.5"/>
                  <path d="M5 8l2 2 4-4" stroke="#10b981" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Account created — redirecting…
              </motion.div>
            )}
          </AnimatePresence>

          {/* Form */}
          <motion.form
            onSubmit={handleSubmit} noValidate
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.4, ease: easeOut }}
            className="space-y-0"
          >
            {/* Section label */}
            <p className="text-[10px] font-bold tracking-[0.15em] uppercase mb-4" style={{ color: warm }}>
              Personal details
            </p>

            <FloatInput
              label="Full name" name="name" value={form.name}
              onChange={handleChange} error={localErrors.name}
            />

            <FloatInput
              label="Email address" name="email" type="email" value={form.email}
              onChange={handleChange} error={localErrors.email}
            />

            <p className="text-[10px] font-bold tracking-[0.15em] uppercase mb-4 mt-2" style={{ color: warm }}>
              Account security
            </p>

            <FloatInput
              label="Password" name="password" type={showPass ? "text" : "password"}
              value={form.password} onChange={handleChange} error={localErrors.password}
              right={<EyeBtn show={showPass} toggle={() => setShowPass((p) => !p)} />}
            />

            {/* Password strength bar */}
            {form.password.length > 0 && (
              <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} className="-mt-3 mb-5">
                <div className="flex gap-1 mb-1.5">
                  {[1, 2, 3, 4].map((lvl) => (
                    <motion.div key={lvl}
                      className="h-1 flex-1 rounded-full transition-all duration-300"
                      animate={{ backgroundColor: lvl <= strength ? strengthColor[strength] : "#E5E7EB" }}
                    />
                  ))}
                </div>
                <p className="text-[11px] font-semibold ml-0.5" style={{ color: strengthColor[strength] || warm }}>
                  {strengthLabel[strength]}
                </p>
              </motion.div>
            )}

            <div className="relative mb-5 -mt-1">
              <div
                className="relative rounded-2xl transition-all duration-200"
                style={{ border: `1.5px solid ${localErrors.confirmPass ? "#EF4444" : border}`, background: "#fff" }}
              >
                <label
                  className="absolute left-4 pointer-events-none select-none transition-all duration-200"
                  style={{
                    top: confirmPass.length > 0 ? "8px" : "50%",
                    transform: confirmPass.length > 0 ? "translateY(0)" : "translateY(-50%)",
                    fontSize: confirmPass.length > 0 ? "9.5px" : "13.5px",
                    color: localErrors.confirmPass ? "#EF4444" : warm,
                    letterSpacing: confirmPass.length > 0 ? "0.1em" : "0",
                    textTransform: confirmPass.length > 0 ? "uppercase" : "none",
                    fontWeight: confirmPass.length > 0 ? 700 : 500,
                  }}
                >
                  Confirm password
                </label>
                <input
                  type={showConfirm ? "text" : "password"} value={confirmPass}
                  onChange={(e) => { setConfirmPass(e.target.value); setLocalErrors((p) => ({ ...p, confirmPass: "" })); }}
                  style={{ width: "100%", padding: "26px 44px 10px 16px", background: "transparent", border: "none", outline: "none", fontSize: "14px", color: ink, fontFamily: "inherit" }}
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  <EyeBtn show={showConfirm} toggle={() => setShowConfirm((p) => !p)} />
                </div>
              </div>
              {localErrors.confirmPass && (
                <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }}
                  className="text-[11px] font-semibold mt-1.5 ml-1" style={{ color: "#EF4444" }}>
                  {localErrors.confirmPass}
                </motion.p>
              )}
            </div>

            {/* Terms */}
            <div className="flex items-start gap-2.5 mb-6">
              <input type="checkbox" id="terms" required
                className="mt-0.5 w-4 h-4 cursor-pointer rounded"
                style={{ accentColor: sage }} />
              <label htmlFor="terms" className="text-xs leading-relaxed cursor-pointer" style={{ color: warm }}>
                By registering I agree to the{" "}
                <a href="#" className="font-semibold hover:underline" style={{ color: sage }}>Terms of Service</a>{" "}
                and{" "}
                <a href="#" className="font-semibold hover:underline" style={{ color: sage }}>Privacy Policy</a>.
              </label>
            </div>

            {/* Submit */}
            <motion.button
              type="submit" disabled={loading || registered} whileTap={{ scale: 0.97 }}
              className="w-full flex items-center justify-center gap-2.5 font-bold text-sm py-3.5 rounded-2xl transition-all duration-200"
              style={{
                background: loading || registered ? "#D4E3DA" : sage,
                color: "#fff",
                cursor: loading || registered ? "not-allowed" : "pointer",
                boxShadow: loading || registered ? "none" : `0 6px 24px ${sage}44`,
                letterSpacing: "0.01em",
              }}
            >
              {loading ? (
                <>
                  <svg className="animate-spin" width="15" height="15" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="10" stroke="white" strokeOpacity="0.3" strokeWidth="3"/>
                    <path d="M22 12a10 10 0 0 0-10-10" stroke="white" strokeWidth="3" strokeLinecap="round"/>
                  </svg>
                  Creating account…
                </>
              ) : registered ? (
                <>
                  <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                    <path d="M3 8l3 3 7-7" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  Redirecting…
                </>
              ) : "Create account →"}
            </motion.button>
          </motion.form>

          {/* Divider */}
          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-px" style={{ background: border }}/>
            <span className="text-[11px] font-semibold" style={{ color: warm }}>or</span>
            <div className="flex-1 h-px" style={{ background: border }}/>
          </div>

          {/* Google */}
          <motion.button
            type="button" whileTap={{ scale: 0.97 }}
            className="w-full flex items-center justify-center gap-2.5 text-sm font-semibold py-3 rounded-2xl transition-all duration-150"
            style={{ background: mist, border: `1.5px solid ${border}`, color: ink }}
            onMouseEnter={(e) => e.currentTarget.style.borderColor = sage}
            onMouseLeave={(e) => e.currentTarget.style.borderColor = border}
          >
            <svg width="17" height="17" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Sign up with Google
          </motion.button>

          <p className="text-center text-sm mt-6" style={{ color: warm }}>
            Hiring instead?{" "}
            <Link to="/register" className="font-bold hover:underline" style={{ color: sage }}>
              Employer register →
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
};

export default Register;
