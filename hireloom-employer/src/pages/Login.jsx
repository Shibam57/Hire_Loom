import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { loginEmployer } from "../redux/authSlice";
import { useNavigate, Link } from "react-router-dom";

export default function Login() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { loading, error, isAuthenticated } = useSelector((state) => state.auth);

  const [form, setForm] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [serverMessage, setServerMessage] = useState("");
  const [loginSuccess, setLoginSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // ================= VALIDATION =================
  const validate = () => {
    const e = {};
    if (!form.email?.trim()) e.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = "Enter a valid email";
    if (!form.password?.trim()) e.password = "Password is required";
    return e;
  };

  // ================= HANDLE CHANGE =================
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (errors[e.target.name]) setErrors((p) => ({ ...p, [e.target.name]: "" }));
    if (serverMessage) setServerMessage("");
  };

  // ================= SUBMIT =================
  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) { setErrors(validationErrors); return; }

    const result = await dispatch(loginEmployer(form));

    if (result.meta.requestStatus === "fulfilled") {
      setLoginSuccess(true);
      setServerMessage("Login successful!");
      setTimeout(() => navigate("/Dashboard"), 900);
    } else {
      setServerMessage(result.payload || "Login failed. Please try again.");
    }
  };

  // ================= ERROR HANDLING =================
  useEffect(() => { if (error) setServerMessage(error); }, [error]);

  // ================= AUTO REDIRECT =================
  useEffect(() => { if (isAuthenticated) navigate("/Dashboard"); }, [isAuthenticated, navigate]);

  const inputBase =
    "w-full px-4 py-2.5 rounded-lg text-sm bg-white border outline-none transition-all duration-200 text-gray-900 placeholder-gray-400 focus:ring-2";
  const inputOk = "border-gray-200 focus:border-indigo-500 focus:ring-indigo-100";
  const inputErr = "border-red-400 focus:border-red-400 focus:ring-red-100";

  return (
    <div className="min-h-screen flex bg-slate-50 font-sans">

      {/* ── Left decorative panel ── */}
      <aside className="hidden lg:flex w-400px shrink-0 flex-col justify-between bg-slate-900 px-10 py-12">
        <div>
          {/* Brand */}
          <div className="flex items-center gap-3 mb-16">
            <div className="w-9 h-9 rounded-xl bg-indigo-500 flex items-center justify-center">
              <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
                <path d="M10 2a5 5 0 1 1 0 10A5 5 0 0 1 10 2z" stroke="white" strokeWidth="1.5" fill="white" fillOpacity="0.15" />
                <path d="M3 18c0-3.314 3.134-6 7-6s7 2.686 7 6" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </div>
            <span className="text-white font-semibold text-lg tracking-tight">Hireloom</span>
          </div>

          {/* Headline */}
          <h2 className="text-white text-3xl font-semibold leading-snug mb-4">
            Welcome back.<br />
            <span className="text-indigo-400">Your next hire awaits.</span>
          </h2>
          <p className="text-slate-400 text-sm leading-relaxed mb-12">
            Sign in to manage your job listings, review candidates, and grow your team.
          </p>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-4">
            {[
              { label: "Active employers", value: "12,400+" },
              { label: "Jobs posted", value: "98,000+" },
              { label: "Hires made", value: "54,000+" },
              { label: "Avg. time to hire", value: "9 days" },
            ].map((s) => (
              <div key={s.label} className="bg-slate-800 rounded-xl px-4 py-4">
                <p className="text-indigo-300 text-lg font-semibold">{s.value}</p>
                <p className="text-slate-500 text-xs mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
        <p className="text-slate-600 text-xs">© 2026 Hireloom Inc. All rights reserved.</p>
      </aside>

      {/* ── Right form panel ── */}
      <main className="flex-1 flex items-center justify-center px-4 sm:px-8 py-12">
        <div className="w-full max-w-[420px]">

          {/* Mobile brand */}
          <div className="flex items-center gap-2 mb-8 lg:hidden">
            <div className="w-8 h-8 rounded-lg bg-indigo-500 flex items-center justify-center">
              <svg width="16" height="16" viewBox="0 0 20 20" fill="none">
                <path d="M10 2a5 5 0 1 1 0 10A5 5 0 0 1 10 2z" stroke="white" strokeWidth="1.5" />
                <path d="M3 18c0-3.314 3.134-6 7-6s7 2.686 7 6" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </div>
            <span className="font-semibold text-gray-900">Hireloom</span>
          </div>

          {/* Heading */}
          <div className="mb-8">
            <h1 className="text-2xl font-semibold text-gray-900 mb-1">Employer sign in</h1>
            <p className="text-sm text-gray-500">
              Don't have an account?{" "}
              <Link to="/register" className="text-indigo-600 font-medium hover:underline">
                Register for free
              </Link>
            </p>
          </div>

          {/* Success banner */}
          {loginSuccess && (
            <div className="flex gap-3 items-center bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3 mb-6 text-sm text-emerald-800">
              <svg className="shrink-0" width="15" height="15" viewBox="0 0 16 16" fill="none">
                <circle cx="8" cy="8" r="7" stroke="#10b981" strokeWidth="1.5" />
                <path d="M5 8l2 2 4-4" stroke="#10b981" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              {serverMessage}
            </div>
          )}

          {/* Error banner */}
          {serverMessage && !loginSuccess && (
            <div className="flex gap-3 items-center bg-red-50 border border-red-200 rounded-xl px-4 py-3 mb-6 text-sm text-red-700">
              <svg className="shrink-0" width="15" height="15" viewBox="0 0 16 16" fill="none">
                <circle cx="8" cy="8" r="7" stroke="#ef4444" strokeWidth="1.5" />
                <path d="M8 5v3M8 11v.5" stroke="#ef4444" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
              {serverMessage}
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate className="space-y-4">

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5" htmlFor="email">
                Work email address
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                  <svg width="15" height="15" viewBox="0 0 20 20" fill="none">
                    <path d="M2 5.5A1.5 1.5 0 0 1 3.5 4h13A1.5 1.5 0 0 1 18 5.5v9a1.5 1.5 0 0 1-1.5 1.5h-13A1.5 1.5 0 0 1 2 14.5v-9z" stroke="currentColor" strokeWidth="1.4" />
                    <path d="M2 6l8 5 8-5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
                  </svg>
                </span>
                <input
                  id="email" name="email" type="email" placeholder="alex@acme.com"
                  value={form.email} onChange={handleChange} autoComplete="email"
                  className={`${inputBase} pl-9 ${errors.email ? inputErr : inputOk}`}
                />
              </div>
              {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-sm font-medium text-gray-700" htmlFor="password">
                  Password
                </label>
                <Link to="/forgot-password" className="text-xs text-indigo-500 hover:underline">
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                  <svg width="15" height="15" viewBox="0 0 20 20" fill="none">
                    <rect x="3" y="9" width="14" height="10" rx="2" stroke="currentColor" strokeWidth="1.4" />
                    <path d="M7 9V6a3 3 0 0 1 6 0v3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
                  </svg>
                </span>
                <input
                  id="password" name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Your password"
                  value={form.password} onChange={handleChange} autoComplete="current-password"
                  className={`${inputBase} pl-9 pr-10 ${errors.password ? inputErr : inputOk}`}
                />
                <button
                  type="button" tabIndex={-1}
                  onClick={() => setShowPassword((p) => !p)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showPassword ? (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19M1 1l22 22" />
                    </svg>
                  ) : (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  )}
                </button>
              </div>
              {errors.password && <p className="text-xs text-red-500 mt-1">{errors.password}</p>}
            </div>

            {/* Remember me */}
            <div className="flex items-center gap-2 pt-1">
              <input
                id="remember" type="checkbox"
                className="w-4 h-4 accent-indigo-600 rounded cursor-pointer"
              />
              <label htmlFor="remember" className="text-sm text-gray-600 cursor-pointer select-none">
                Keep me signed in for 30 days
              </label>
            </div>

            {/* Submit */}
            <button
              type="submit" disabled={loading || loginSuccess}
              className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold text-white transition-all duration-200 mt-1
                ${loading || loginSuccess
                  ? "bg-indigo-300 cursor-not-allowed"
                  : "bg-indigo-600 hover:bg-indigo-700 active:scale-[0.98]"
                }`}
            >
              {loading ? (
                <>
                  <svg className="animate-spin" width="15" height="15" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="10" stroke="white" strokeOpacity="0.3" strokeWidth="3" />
                    <path d="M22 12a10 10 0 0 0-10-10" stroke="white" strokeWidth="3" strokeLinecap="round" />
                  </svg>
                  Signing in…
                </>
              ) : loginSuccess ? (
                <>
                  <svg width="15" height="15" viewBox="0 0 16 16" fill="none">
                    <path d="M3 8l3.5 3.5L13 4" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  Redirecting…
                </>
              ) : (
                <>
                  Sign in to dashboard
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <path d="M3 7h8M8 4l3 3-3 3" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-px bg-gray-200" />
            <span className="text-xs text-gray-400">or continue with</span>
            <div className="flex-1 h-px bg-gray-200" />
          </div>

          {/* Google OAuth placeholder */}
          <button
            type="button"
            className="w-full flex items-center justify-center gap-2.5 py-2.5 rounded-xl text-sm font-medium text-gray-700 bg-white border border-gray-200 hover:bg-gray-50 active:scale-[0.98] transition-all duration-150"
          >
            <svg width="17" height="17" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            Continue with Google
          </button>

          <p className="text-center text-xs text-gray-400 mt-7">
            By signing in you agree to our{" "}
            <a href="#" className="text-indigo-500 hover:underline">Terms of Service</a> and{" "}
            <a href="#" className="text-indigo-500 hover:underline">Privacy Policy</a>.
          </p>
        </div>
      </main>
    </div>
  );
}
