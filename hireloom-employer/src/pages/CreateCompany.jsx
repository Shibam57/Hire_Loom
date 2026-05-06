import React, { useState, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { createCompany, clearCompanyState } from "../redux/companySlice";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

// ─────────────────────────────────────────────────────────────
//  Design tokens — warm editorial palette
// ─────────────────────────────────────────────────────────────
const ink    = "#1C1917";
const warm   = "#78716C";
const mist   = "#F5F0EB";
const accent = "#D97706";
const sage   = "#6B7C5C";
const border = "#E7E0D8";
const paper  = "#FDFAF7";

const easeOut = [0.22, 1, 0.36, 1];

// ─────────────────────────────────────────────────────────────
//  Tiny helpers
// ─────────────────────────────────────────────────────────────
const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07 } },
};
const rowIn = {
  hidden: { opacity: 0, y: 14 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.38, ease: easeOut } },
};

const INDUSTRIES = [
  "Technology","Finance & Banking","Healthcare","Education",
  "Retail & E-commerce","Manufacturing","Media & Entertainment",
  "Marketing & Advertising","Logistics & Supply Chain",
  "Real Estate","Hospitality & Tourism","Other",
];

const SIZE_OPTIONS = [
  { label: "1–10",   val: 10   },
  { label: "11–50",  val: 50   },
  { label: "51–200", val: 200  },
  { label: "201–500",val: 500  },
  { label: "501–1k", val: 1000 },
  { label: "1k+",    val: 5000 },
];

const STEPS = ["Identity", "Online", "Details", "Review"];

// ─────────────────────────────────────────────────────────────
//  Micro-components
// ─────────────────────────────────────────────────────────────
const Label = ({ children, required, hint }) => (
  <div className="flex items-center justify-between mb-2">
    <span className="text-[10px] font-bold tracking-[0.14em] uppercase" style={{ color: warm }}>
      {children}{required && <span style={{ color: accent }}> *</span>}
    </span>
    {hint && <span className="text-[10px]" style={{ color: warm }}>{hint}</span>}
  </div>
);

const inputCls = (err) =>
  `w-full py-3 bg-transparent border-0 border-b text-sm outline-none transition-all duration-200 placeholder-stone-300
   ${err ? "border-red-400 text-red-500 focus:border-red-400" : "border-stone-200 text-stone-800 focus:border-amber-500"}`;

const Err = ({ msg }) => msg ? (
  <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }}
    className="text-[11px] text-red-500 font-medium mt-1.5">{msg}</motion.p>
) : null;

const StepDot = ({ n, current, done }) => (
  <motion.div
    animate={{
      backgroundColor: done ? sage : n - 1 === current ? ink : "transparent",
      borderColor:     done ? sage : n - 1 === current ? ink : border,
      color:           done || n - 1 === current ? "#fff" : warm,
    }}
    transition={{ duration: 0.3 }}
    className="w-7 h-7 rounded-full border-2 flex items-center justify-center text-xs font-bold shrink-0"
  >
    {done ? "✓" : n}
  </motion.div>
);

const ReviewRow = ({ label, value }) => (
  <motion.div variants={rowIn} className="flex gap-5 py-3.5" style={{ borderBottom: `1px solid ${border}` }}>
    <span className="text-[10px] font-bold uppercase tracking-[0.13em] w-24 shrink-0 mt-0.5" style={{ color: warm }}>
      {label}
    </span>
    <span className="text-sm" style={{ color: value ? ink : border, fontStyle: value ? "normal" : "italic" }}>
      {value || "Not provided"}
    </span>
  </motion.div>
);

// ─────────────────────────────────────────────────────────────
//  Main
// ─────────────────────────────────────────────────────────────
const CreateCompany = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const fileRef  = useRef(null);

  const { myCompany, success, loading, error } = useSelector((s) => s.company);

  const [step, setStep]         = useState(0);
  const [dir,  setDir]          = useState(1);
  const [preview, setPreview]   = useState(null);
  const [logoFile, setLogoFile] = useState(null);
  const [errors,   setErrors]   = useState({});
  const [formError, setFormError] = useState("");

  const [form, setForm] = useState({
    name: "", location: "", domain: "", industry: "",
    website: "", description: "", foundedYear: "",
    employeesCount: "", linkedin: "",
  });

  // ── change ──────────────────────────────────────────────────
  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "logo") {
      const file = files[0];
      setLogoFile(file);
      setPreview(URL.createObjectURL(file));
    } else {
      setForm((p) => ({ ...p, [name]: value }));
      if (errors[name]) setErrors((p) => ({ ...p, [name]: "" }));
    }
  };

  // ── validate ────────────────────────────────────────────────
  const validate = () => {
    const e = {};
    if (step === 0) {
      if (!form.name.trim())     e.name     = "Company name is required";
      if (!form.location.trim()) e.location = "Location is required";
      if (form.domain && !/^[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(form.domain.trim()))
        e.domain = "Enter a valid domain (e.g. google.com)";
    }
    if (step === 1) {
      if (form.website  && !/^https?:\/\/.+/.test(form.website.trim()))
        e.website  = "URL must start with https://";
      if (form.linkedin && !/linkedin\.com/.test(form.linkedin))
        e.linkedin = "Enter a valid LinkedIn URL";
    }
    if (step === 2) {
      const yr = Number(form.foundedYear);
      if (form.foundedYear && (yr < 1800 || yr > new Date().getFullYear()))
        e.foundedYear = `Year must be between 1800 and ${new Date().getFullYear()}`;
    }
    return e;
  };

  const go = (next) => {
    if (next > step) {
      const e = validate();
      if (Object.keys(e).length) { setErrors(e); return; }
    }
    setErrors({});
    setDir(next > step ? 1 : -1);
    setStep(next);
  };

  // ── submit ──────────────────────────────────────────────────
  const handleSubmit = (e) => {
    e?.preventDefault();
    if (!form.name || !form.location) return setFormError("Company Name and Location are required");
    setFormError("");
    const data = new FormData();
    Object.keys(form).forEach((k) => { if (form[k]) data.append(k, form[k]); });
    if (logoFile) data.append("logo", logoFile);
    dispatch(createCompany(data));
  };

  useEffect(() => {
    if (success && myCompany) {
      navigate(`/company/${myCompany._id}`);
      dispatch(clearCompanyState());
    }
  }, [success, myCompany, navigate, dispatch]);

  // ─────────────────────────────────────────────────────────
  //  Step panels
  // ─────────────────────────────────────────────────────────
  const panels = [

    // 0 — Identity
    <motion.div key="s0" variants={stagger} initial="hidden" animate="show" className="space-y-8">
      {/* Live preview chip */}
      <motion.div variants={rowIn}
        className="flex items-center gap-4 p-4 rounded-2xl cursor-pointer"
        style={{ background: mist, border: `1px solid ${border}` }}
        onClick={() => fileRef.current?.click()}
      >
        {preview
          ? <img src={preview} alt="logo" className="w-14 h-14 rounded-xl object-contain" />
          : <div className="w-14 h-14 rounded-xl flex items-center justify-center text-xl font-bold"
              style={{ background: `${ink}14`, color: ink }}>
              {form.name?.slice(0,2).toUpperCase() || "🏢"}
            </div>
        }
        <div>
          <p className="font-bold text-sm" style={{ color: ink }}>{form.name || "Company name"}</p>
          <p className="text-xs font-mono mt-0.5" style={{ color: warm }}>{form.domain || "domain.com"}</p>
          <p className="text-[11px] mt-1.5 font-medium" style={{ color: accent }}>Click to upload logo</p>
        </div>
        <input ref={fileRef} type="file" name="logo" accept="image/*" onChange={handleChange} className="hidden" />
      </motion.div>

      <motion.div variants={rowIn}>
        <Label required>Company name</Label>
        <input name="name" value={form.name} onChange={handleChange} placeholder="e.g. Tata Consultancy Services"
          className={inputCls(errors.name)} style={{ fontFamily: "inherit" }} />
        <Err msg={errors.name} />
      </motion.div>

      <motion.div variants={rowIn}>
        <Label required>Head office location</Label>
        <input name="location" value={form.location} onChange={handleChange} placeholder="e.g. Mumbai, India"
          className={inputCls(errors.location)} style={{ fontFamily: "inherit" }} />
        <Err msg={errors.location} />
      </motion.div>

      <motion.div variants={rowIn}>
        <Label hint="e.g. tcs.com">Domain</Label>
        <input name="domain" value={form.domain} onChange={handleChange} placeholder="yourcompany.com"
          className={inputCls(errors.domain)} style={{ fontFamily: "inherit" }} />
        <Err msg={errors.domain} />
      </motion.div>

      <motion.div variants={rowIn}>
        <Label>Industry</Label>
        <div className="relative">
          <select name="industry" value={form.industry} onChange={handleChange}
            className={inputCls(false) + " pr-6 cursor-pointer appearance-none"}
            style={{ fontFamily: "inherit" }}>
            <option value="">Select industry…</option>
            {INDUSTRIES.map((i) => <option key={i}>{i}</option>)}
          </select>
          <span className="pointer-events-none absolute right-0 top-3.5 text-[10px]" style={{ color: warm }}>▾</span>
        </div>
      </motion.div>
    </motion.div>,

    // 1 — Online
    <motion.div key="s1" variants={stagger} initial="hidden" animate="show" className="space-y-8">
      <motion.div variants={rowIn}>
        <Label>Website URL</Label>
        <input name="website" value={form.website} onChange={handleChange} placeholder="https://www.yourcompany.com"
          className={inputCls(errors.website)} style={{ fontFamily: "inherit" }} />
        <Err msg={errors.website} />
      </motion.div>

      <motion.div variants={rowIn}>
        <Label>LinkedIn page</Label>
        <input name="linkedin" value={form.linkedin} onChange={handleChange} placeholder="https://linkedin.com/company/yourcompany"
          className={inputCls(errors.linkedin)} style={{ fontFamily: "inherit" }} />
        <Err msg={errors.linkedin} />
      </motion.div>

      <motion.div variants={rowIn}>
        <Label hint={`${form.description.length} chars`}>Company description</Label>
        <textarea name="description" value={form.description} onChange={handleChange} rows={6}
          placeholder="Tell the world what makes your company exceptional — mission, culture, values…"
          className={inputCls(false) + " resize-none"} style={{ fontFamily: "inherit" }} />
      </motion.div>
    </motion.div>,

    // 2 — Details
    <motion.div key="s2" variants={stagger} initial="hidden" animate="show" className="space-y-8">
      <motion.div variants={rowIn}>
        <Label>Founded year</Label>
        <input type="number" name="foundedYear" value={form.foundedYear} onChange={handleChange}
          placeholder={`e.g. ${new Date().getFullYear() - 15}`} min="1800" max={new Date().getFullYear()}
          className={inputCls(errors.foundedYear)} style={{ fontFamily: "inherit" }} />
        <Err msg={errors.foundedYear} />
      </motion.div>

      <motion.div variants={rowIn}>
        <Label hint="Approximate is fine">Number of employees</Label>
        <div className="grid grid-cols-3 gap-2 mt-2">
          {SIZE_OPTIONS.map(({ label, val }) => (
            <motion.button key={val} type="button" whileTap={{ scale: 0.93 }}
              onClick={() => setForm((p) => ({ ...p, employeesCount: val }))}
              className="py-2.5 text-xs font-bold rounded-xl border-2 transition-all duration-150"
              style={{
                borderColor: Number(form.employeesCount) === val ? accent : border,
                background:  Number(form.employeesCount) === val ? accent : "transparent",
                color:       Number(form.employeesCount) === val ? "#fff" : warm,
              }}>
              {label}
            </motion.button>
          ))}
        </div>
      </motion.div>
    </motion.div>,

    // 3 — Review
    <motion.div key="s3" variants={stagger} initial="hidden" animate="show">
      {/* Card preview */}
      <motion.div variants={rowIn}
        className="flex items-center gap-4 rounded-2xl p-5 mb-7"
        style={{ background: mist, border: `1px solid ${border}` }}>
        {preview
          ? <img src={preview} alt="logo" className="w-14 h-14 object-contain rounded-xl" />
          : <div className="w-14 h-14 rounded-xl flex items-center justify-center text-xl font-bold"
              style={{ background: `${ink}14`, color: ink }}>
              {form.name?.slice(0,2).toUpperCase() || "—"}
            </div>
        }
        <div>
          <p className="font-bold text-base" style={{ color: ink }}>{form.name || "—"}</p>
          <p className="text-xs font-mono mt-0.5" style={{ color: warm }}>{form.domain || "—"}</p>
          {form.industry && (
            <span className="inline-block mt-1.5 text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full"
              style={{ background: `${accent}18`, color: accent }}>{form.industry}</span>
          )}
        </div>
      </motion.div>

      {[
        ["Location",    form.location],
        ["Website",     form.website],
        ["LinkedIn",    form.linkedin],
        ["Founded",     form.foundedYear],
        ["Employees",   form.employeesCount ? `${Number(form.employeesCount).toLocaleString()}+` : ""],
        ["Description", form.description?.slice(0,120) + (form.description?.length > 120 ? "…" : "")],
      ].map(([l, v]) => <ReviewRow key={l} label={l} value={v} />)}

      {(error || formError) && (
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          className="text-red-500 text-sm font-medium pt-5 text-center">
          {error || formError}
        </motion.p>
      )}
    </motion.div>,
  ];

  // ─────────────────────────────────────────────────────────
  //  Render
  // ─────────────────────────────────────────────────────────
  const isLast = step === STEPS.length - 1;

  return (
    <div className="min-h-screen flex" style={{ background: paper, fontFamily: "'DM Sans', system-ui, sans-serif" }}>

      {/* ═══ LEFT — dark editorial panel ═══ */}
      <aside className="hidden lg:flex w-72 xl:w-[340px] shrink-0 flex-col justify-between px-10 py-12 relative overflow-hidden"
        style={{ background: ink }}>

        {/* Noise grain */}
        <div className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4'/%3E%3C/filter%3E%3Crect width='300' height='300' filter='url(%23n)' opacity='0.07'/%3E%3C/svg%3E")`,
          }}
        />
        {/* Accent glow */}
        <div className="absolute -top-16 -right-16 w-64 h-64 rounded-full opacity-10 blur-3xl"
          style={{ background: accent }} />

        <div className="relative">
          {/* Brand */}
          <div className="flex items-center gap-3 mb-14">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold"
              style={{ background: accent, color: "#fff" }}>T</div>
            <span className="text-white font-semibold tracking-tight">TalentHub</span>
          </div>

          <h1 className="text-white leading-[1.12] mb-4" style={{ fontSize: "2rem", fontWeight: 800, letterSpacing: "-0.02em" }}>
            Build your<br />
            <span style={{ color: accent }}>company</span><br />
            profile.
          </h1>
          <p className="text-sm leading-relaxed mb-14" style={{ color: "#A8A29E" }}>
            A great company page attracts the right talent. Take 3 minutes to set yours up.
          </p>

          {/* Steps list */}
          <div className="space-y-3">
            {STEPS.map((label, i) => (
              <div key={i} className="flex items-center gap-3.5">
                <StepDot n={i + 1} current={step} done={i < step} />
                <span className="text-sm font-semibold"
                  style={{ color: i === step ? "#fff" : i < step ? sage : "#57534E" }}>
                  {label}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Progress bar */}
        <div className="relative">
          <div className="flex justify-between mb-1.5" style={{ color: "#57534E", fontSize: "10px", fontWeight: 700, letterSpacing: "0.1em" }}>
            <span>PROGRESS</span>
            <span>{Math.round((step / (STEPS.length - 1)) * 100)}%</span>
          </div>
          <div className="h-0.5 rounded-full" style={{ background: "#292524" }}>
            <motion.div className="h-full rounded-full"
              style={{ background: accent }}
              animate={{ width: `${(step / (STEPS.length - 1)) * 100}%` }}
              transition={{ duration: 0.4, ease: easeOut }}
            />
          </div>
        </div>
      </aside>

      {/* ═══ RIGHT — form ═══ */}
      <main className="flex-1 flex flex-col min-h-screen">

        {/* Top bar */}
        <div className="px-6 lg:px-14 py-5 flex items-center justify-between shrink-0"
          style={{ borderBottom: `1px solid ${border}` }}>
          <button onClick={() => navigate(-1)}
            className="text-sm font-medium transition-colors"
            style={{ color: warm }}>
            ← Back
          </button>

          {/* Mobile dots */}
          <div className="flex gap-1.5 lg:hidden">
            {STEPS.map((_, i) => (
              <div key={i} className="h-1.5 rounded-full transition-all duration-300"
                style={{ width: i === step ? "24px" : "10px", background: i <= step ? accent : border }} />
            ))}
          </div>

          <span className="text-xs font-bold tracking-widest uppercase" style={{ color: warm }}>
            {step + 1} / {STEPS.length}
          </span>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto px-6 lg:px-14 xl:px-20 py-10">
          <div className="max-w-lg mx-auto">

            {/* Step heading (animated) */}
            <AnimatePresence mode="wait">
              <motion.div key={`h${step}`}
                initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.26 }}
                className="mb-10"
              >
                <p className="text-[10px] font-bold tracking-[0.18em] uppercase mb-2" style={{ color: accent }}>
                  Step {step + 1} of {STEPS.length}
                </p>
                <h2 className="text-2xl font-bold mb-1.5" style={{ color: ink }}>
                  {["Company identity","Online presence","Size & history","Review & publish"][step]}
                </h2>
                <p className="text-sm leading-relaxed" style={{ color: warm }}>
                  {[
                    "Core details that define your brand.",
                    "Where can candidates find you online?",
                    "Help candidates understand your scale and roots.",
                    "Everything correct? Go ahead and publish.",
                  ][step]}
                </p>
              </motion.div>
            </AnimatePresence>

            {/* Panel (slide transition) */}
            <AnimatePresence mode="wait" custom={dir}>
              <motion.div key={`p${step}`}
                custom={dir}
                initial={{ opacity: 0, x: dir > 0 ? 44 : -44 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: dir > 0 ? -44 : 44 }}
                transition={{ duration: 0.32, ease: easeOut }}
              >
                {panels[step]}
              </motion.div>
            </AnimatePresence>

            {/* Nav buttons */}
            <div className="flex items-center justify-between mt-14 pb-8">
              {step > 0 ? (
                <button type="button" onClick={() => go(step - 1)}
                  className="text-sm font-semibold transition-colors"
                  style={{ color: warm }}>
                  ← Previous
                </button>
              ) : <div />}

              {!isLast ? (
                <motion.button type="button" whileTap={{ scale: 0.97 }}
                  onClick={() => go(step + 1)}
                  className="flex items-center gap-2 text-sm font-bold px-7 py-3 rounded-xl transition-colors duration-200"
                  style={{ background: ink, color: "#fff" }}
                  onMouseEnter={(e) => e.currentTarget.style.background = accent}
                  onMouseLeave={(e) => e.currentTarget.style.background = ink}
                >
                  Continue →
                </motion.button>
              ) : (
                <motion.button type="button" whileTap={{ scale: 0.97 }}
                  onClick={handleSubmit}
                  disabled={loading}
                  className="flex items-center gap-2.5 text-sm font-bold px-7 py-3 rounded-xl transition-all duration-200"
                  style={{
                    background: loading ? "#D6D3D1" : accent,
                    color: "#fff",
                    cursor: loading ? "not-allowed" : "pointer",
                    boxShadow: loading ? "none" : `0 6px 20px ${accent}40`,
                  }}
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin" width="14" height="14" viewBox="0 0 24 24" fill="none">
                        <circle cx="12" cy="12" r="10" stroke="white" strokeOpacity="0.3" strokeWidth="3" />
                        <path d="M22 12a10 10 0 0 0-10-10" stroke="white" strokeWidth="3" strokeLinecap="round" />
                      </svg>
                      Publishing…
                    </>
                  ) : "Publish company ✦"}
                </motion.button>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default CreateCompany;
