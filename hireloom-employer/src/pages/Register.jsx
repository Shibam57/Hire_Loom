import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { registerEmployer } from "../redux/authSlice";
import { useNavigate } from "react-router-dom";


export default function Register() {
  const [form, setForm] = useState({ name: "", email: "", password: ""});
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState("idle"); // idle | loading | success | error
  const [serverMessage, setServerMessage] = useState("");
  const dispatch = useDispatch();
  const navigate = useNavigate();


    const { loading, error, isAuthenticated } = useSelector(
        (state) => state.auth
    );


  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = "Full name is required";
    // if (!form.companyName.trim()) e.companyName = "Company name is required";
    if (!form.email.trim()) e.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = "Enter a valid email address";
    if (!form.password.trim()) e.password = "Password is required";
    else if (form.password.length < 8) e.password = "Must be at least 8 characters";
    if (!confirmPassword) e.confirmPassword = "Please confirm your password";
    else if (confirmPassword !== form.password) e.confirmPassword = "Passwords do not match";
    return e;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
    if (errors[name]) setErrors((p) => ({ ...p, [name]: "" }));
  };

  const handleSubmit = async (e) => {
  e.preventDefault();

  const validationErrors = validate();
  if (Object.keys(validationErrors).length > 0) {
    setErrors(validationErrors);
    return;
  }

  setStatus("loading");

  const result = await dispatch(
    registerEmployer({
      name: form.name.trim(),
      email: form.email.trim(),
      password: form.password,
      // companyName: form.companyName.trim(),
    })
  );
  console.log("result", result);

  if (result.meta.requestStatus === "fulfilled") {
    setStatus("success");
    setServerMessage("Employer registered successfully!");

    // ✅ redirect after success
    setTimeout(() => {
      navigate("/company_search");
    }, 1000);
  } else {
    setStatus("error");
    setServerMessage(result.payload || "Registration failed");
  }
};

  const getStrength = (pw) => {
    if (pw.length < 6) return 1;
    const hasUpper = /[A-Z]/.test(pw);
    const hasNum = /[0-9]/.test(pw);
    const hasSym = /[^A-Za-z0-9]/.test(pw);
    if (pw.length >= 10 && hasUpper && hasNum && hasSym) return 4;
    if (pw.length >= 8 && hasUpper && hasNum) return 3;
    return 2;
  };

  const strengthLabel = ["", "Too short", "Weak", "Good", "Strong"];
  const strengthColor = ["", "bg-red-400", "bg-amber-400", "bg-yellow-400", "bg-emerald-500"];
  const strength = form.password ? getStrength(form.password) : 0;

  const inputBase =
    "w-full px-4 py-2.5 rounded-lg text-sm bg-white border outline-none transition-all duration-200 text-gray-900 placeholder-gray-400 focus:ring-2";
  const inputOk = "border-gray-200 focus:border-indigo-500 focus:ring-indigo-100";
  const inputErr = "border-red-400 focus:border-red-400 focus:ring-red-100";

  const EyeIcon = ({ open }) =>
    open ? (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19M1 1l22 22" />
      </svg>
    ) : (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
        <circle cx="12" cy="12" r="3" />
      </svg>
    );

  const features = [
    "Post unlimited job listings across all industries",
    "AI-powered candidate matching and screening",
    "Integrated ATS to manage your hiring pipeline",
    "Real-time analytics and hiring insights",
  ];

  return (
    <div className="min-h-screen flex bg-slate-50 font-sans">

      {/* ── Left Panel ── */}
      <aside className="hidden lg:flex w-[360px] xl:w-[400px] shrink-0 flex-col justify-between bg-slate-900 px-10 py-12">
        <div>
          {/* Brand */}
          <div className="flex items-center gap-3 mb-12">
            <div className="w-9 h-9 rounded-xl bg-indigo-500 flex items-center justify-center">
              <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
                <path d="M10 2a5 5 0 1 1 0 10A5 5 0 0 1 10 2z" stroke="white" strokeWidth="1.5" fill="white" fillOpacity="0.15" />
                <path d="M3 18c0-3.314 3.134-6 7-6s7 2.686 7 6" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </div>
            <span className="text-white font-semibold text-lg tracking-tight">Hireloom</span>
          </div>

          <h2 className="text-white text-[28px] font-semibold leading-snug mb-3">
            Hire smarter,<br />
            <span className="text-indigo-400">not harder.</span>
          </h2>
          <p className="text-slate-400 text-sm leading-relaxed mb-10">
            Join thousands of employers who find top talent faster with Hireloom.
          </p>

          <ul className="space-y-4">
            {features.map((f, i) => (
              <li key={i} className="flex items-start gap-3">
                <span className="mt-0.5 w-5 h-5 rounded-full bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center shrink-0">
                  <svg width="9" height="9" viewBox="0 0 10 10" fill="none">
                    <path d="M2 5l2.5 2.5L8 3" stroke="#818cf8" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </span>
                <span className="text-slate-300 text-sm leading-relaxed">{f}</span>
              </li>
            ))}
          </ul>
        </div>
        <p className="text-slate-600 text-xs">© 2026 Hireloom Inc. All rights reserved.</p>
      </aside>

      {/* ── Right Panel ── */}
      <main className="flex-1 flex items-start justify-center px-4 sm:px-8 py-12 overflow-y-auto">
        <div className="w-full max-w-[480px]">

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
          <div className="mb-7">
            <h1 className="text-2xl font-semibold text-gray-900 mb-1">Create your employer account</h1>
            <p className="text-sm text-gray-500">
              Already have an account?{" "}
              <a href="/login" className="text-indigo-600 font-medium hover:underline">Sign in</a>
            </p>
          </div>

          {/* Banners */}
          {status === "success" && (
            <div className="flex gap-3 items-start bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3 mb-6 text-sm text-emerald-800">
              <svg className="shrink-0 mt-0.5" width="15" height="15" viewBox="0 0 16 16" fill="none">
                <circle cx="8" cy="8" r="7" stroke="#10b981" strokeWidth="1.5" />
                <path d="M5 8l2 2 4-4" stroke="#10b981" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              {serverMessage}
            </div>
          )}
          {status === "error" && serverMessage && (
            <div className="flex gap-3 items-start bg-red-50 border border-red-200 rounded-xl px-4 py-3 mb-6 text-sm text-red-700">
              <svg className="shrink-0 mt-0.5" width="15" height="15" viewBox="0 0 16 16" fill="none">
                <circle cx="8" cy="8" r="7" stroke="#ef4444" strokeWidth="1.5" />
                <path d="M8 5v3M8 10.5v.5" stroke="#ef4444" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
              {serverMessage}
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate className="space-y-5">

            {/* Section: Personal */}
            <p className="text-[10.5px] font-semibold uppercase tracking-widest text-gray-400 border-b border-gray-100 pb-1.5">
              Personal details
            </p>

            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5" htmlFor="name">Full name</label>
              <input
                id="name" name="name" type="text" placeholder="Alex Johnson"
                value={form.name} onChange={handleChange}
                className={`${inputBase} ${errors.name ? inputErr : inputOk}`}
              />
              {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5" htmlFor="email">Work email address</label>
              <input
                id="email" name="email" type="email" placeholder="alex@acme.com"
                value={form.email} onChange={handleChange}
                className={`${inputBase} ${errors.email ? inputErr : inputOk}`}
              />
              {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
            </div>

            {/* Section: Company
            <p className="text-[10.5px] font-semibold uppercase tracking-widest text-gray-400 border-b border-gray-100 pb-1.5 pt-1">
              Company details
            </p>

            {/* Company Name */}
            {/*<div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5" htmlFor="companyName">Company name</label>
              <input
                id="companyName" name="companyName" type="text" placeholder="Acme Corporation"
                value={form.companyName} onChange={handleChange}
                className={`${inputBase} ${errors.companyName ? inputErr : inputOk}`}
              />
              {errors.companyName && <p className="text-xs text-red-500 mt-1">{errors.companyName}</p>}
            </div>

            {/* Section: Security */}
            {/* <p className="text-[10.5px] font-semibold uppercase tracking-widest text-gray-400 border-b border-gray-100 pb-1.5 pt-1">
              Account security
            </p> */}

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5" htmlFor="password">Password</label>
              <div className="relative">
                <input
                  id="password" name="password" type={showPassword ? "text" : "password"}
                  placeholder="Min. 8 characters" value={form.password} onChange={handleChange}
                  className={`${inputBase} pr-10 ${errors.password ? inputErr : inputOk}`}
                />
                <button type="button" tabIndex={-1} onClick={() => setShowPassword((p) => !p)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors">
                  <EyeIcon open={showPassword} />
                </button>
              </div>
              {errors.password && <p className="text-xs text-red-500 mt-1">{errors.password}</p>}

              {/* Strength bar */}
              {form.password.length > 0 && (
                <div className="mt-2 space-y-1">
                  <div className="flex gap-1">
                    {[1, 2, 3, 4].map((lvl) => (
                      <div key={lvl}
                        className={`h-1 flex-1 rounded-full transition-all duration-300 ${lvl <= strength ? strengthColor[strength] : "bg-gray-200"}`}
                      />
                    ))}
                  </div>
                  <p className="text-xs text-gray-400">{strengthLabel[strength]}</p>
                </div>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5" htmlFor="confirmPassword">Confirm password</label>
              <div className="relative">
                <input
                  id="confirmPassword" name="confirmPassword"
                  type={showConfirm ? "text" : "password"} placeholder="Repeat password"
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    if (errors.confirmPassword) setErrors((p) => ({ ...p, confirmPassword: "" }));
                  }}
                  className={`${inputBase} pr-10 ${errors.confirmPassword ? inputErr : inputOk}`}
                />
                <button type="button" tabIndex={-1} onClick={() => setShowConfirm((p) => !p)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors">
                  <EyeIcon open={showConfirm} />
                </button>
              </div>
              {errors.confirmPassword && <p className="text-xs text-red-500 mt-1">{errors.confirmPassword}</p>}
            </div>

            {/* Submit */}
            <button
              type="submit" disabled={status === "loading"}
              className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold text-white transition-all duration-150
                ${status === "loading" ? "bg-indigo-300 cursor-not-allowed" : "bg-indigo-600 hover:bg-indigo-700 active:scale-[0.98]"}`}
            >
              {status === "loading" ? (
                <>
                  <svg className="animate-spin" width="15" height="15" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="10" stroke="white" strokeOpacity="0.3" strokeWidth="3" />
                    <path d="M22 12a10 10 0 0 0-10-10" stroke="white" strokeWidth="3" strokeLinecap="round" />
                  </svg>
                  Creating account…
                </>
              ) : (
                <>
                  Create employer account
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <path d="M3 7h8M8 4l3 3-3 3" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </>
              )}
            </button>
          </form>

          <p className="text-center text-xs text-gray-400 mt-6">
            By registering you agree to our{" "}
            <a href="#" className="text-indigo-500 hover:underline">Terms of Service</a> and{" "}
            <a href="#" className="text-indigo-500 hover:underline">Privacy Policy</a>.
          </p>
        </div>
      </main>
    </div>
  );
}
