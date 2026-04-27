import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { createJob } from "../redux/jobSlice";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

// ─── Step config ───────────────────────────────────────────────
const STEPS = [
  { id: 1, label: "Basics",      icon: "✦" },
  { id: 2, label: "Details",     icon: "◈" },
  { id: 3, label: "Skills",      icon: "◎" },
  { id: 4, label: "Review",      icon: "◉" },
];

const slideVariants = {
  enter: (dir) => ({ x: dir > 0 ? 60 : -60, opacity: 0 }),
  center: { x: 0, opacity: 1, transition: { duration: 0.38, ease: [0.22, 1, 0.36, 1] } },
  exit: (dir) => ({ x: dir > 0 ? -60 : 60, opacity: 0, transition: { duration: 0.25, ease: [0.22, 1, 0.36, 1] } }),
};

const JOB_TYPES     = ["Full-time", "Part-time", "Internship", "Remote", "Contract"];
const EXPERIENCE    = ["Fresher", "1–2 years", "3–5 years", "5+ years"];
const CATEGORIES    = ["Engineering", "Design", "Marketing", "Sales", "Finance", "Operations", "Customer Support", "Other"];

// ─── Field components ──────────────────────────────────────────
const Label = ({ children, hint }) => (
  <div className="flex items-baseline justify-between mb-2">
    <label className="text-xs font-semibold tracking-[0.08em] uppercase text-slate-500">{children}</label>
    {hint && <span className="text-[11px] text-slate-400">{hint}</span>}
  </div>
);

const Input = ({ error, ...props }) => (
  <input
    {...props}
    className={`w-full bg-slate-50 border-0 border-b-2 px-0 py-3 text-sm text-slate-900 placeholder-slate-300
      outline-none transition-all duration-200 focus:bg-white focus:border-violet-500
      ${error ? "border-rose-400" : "border-slate-200"}`}
  />
);

const Textarea = ({ error, ...props }) => (
  <textarea
    {...props}
    className={`w-full bg-slate-50 border-0 border-b-2 px-0 py-3 text-sm text-slate-900 placeholder-slate-300
      outline-none transition-all duration-200 focus:bg-white focus:border-violet-500 resize-none
      ${error ? "border-rose-400" : "border-slate-200"}`}
  />
);

const Select = ({ error, children, ...props }) => (
  <select
    {...props}
    className={`w-full bg-slate-50 border-0 border-b-2 px-0 py-3 text-sm text-slate-900
      outline-none transition-all duration-200 focus:bg-white focus:border-violet-500 cursor-pointer appearance-none
      ${error ? "border-rose-400" : "border-slate-200"}`}
  >
    {children}
  </select>
);

const FieldError = ({ msg }) =>
  msg ? <p className="mt-1.5 text-[11px] text-rose-500 font-medium">{msg}</p> : null;

// ─── Skill tag component ───────────────────────────────────────
const SkillTag = ({ skill, onRemove }) => (
  <motion.span
    initial={{ scale: 0.7, opacity: 0 }}
    animate={{ scale: 1, opacity: 1 }}
    exit={{ scale: 0.7, opacity: 0 }}
    className="inline-flex items-center gap-1.5 bg-violet-100 text-violet-700 text-xs font-semibold
      px-3 py-1.5 rounded-full border border-violet-200"
  >
    {skill}
    <button
      type="button"
      onClick={() => onRemove(skill)}
      className="text-violet-400 hover:text-violet-700 transition-colors leading-none"
    >
      ×
    </button>
  </motion.span>
);

// ─── Review row ────────────────────────────────────────────────
const ReviewRow = ({ label, value }) => (
  <div className="flex gap-4 py-3 border-b border-slate-100 last:border-0">
    <span className="text-[11px] font-semibold uppercase tracking-widest text-slate-400 w-32 shrink-0 mt-0.5">{label}</span>
    <span className="text-sm text-slate-800 font-medium flex-1">{value || <span className="text-slate-300 italic">Not provided</span>}</span>
  </div>
);

// ─── Main component ────────────────────────────────────────────
export default function PostAJob() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [step, setStep]       = useState(1);
  const [dir, setDir]         = useState(1);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errors, setErrors]   = useState({});
  const [skillInput, setSkillInput] = useState("");
  const [skillList, setSkillList]   = useState([]);

  const [form, setForm] = useState({
    title: "", description: "", location: "",
    category: "", jobType: "Full-time",
    salary: "", experienceRequired: "Fresher",
  });

  const go = (next) => {
    setDir(next > step ? 1 : -1);
    setStep(next);
    setErrors({});
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (errors[e.target.name]) setErrors((p) => ({ ...p, [e.target.name]: "" }));
  };

  const addSkill = (e) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      const val = skillInput.trim().replace(/,$/, "");
      if (val && !skillList.includes(val)) setSkillList((p) => [...p, val]);
      setSkillInput("");
    }
  };

  const removeSkill = (s) => setSkillList((p) => p.filter((x) => x !== s));

  // Per-step validation
  const validate = () => {
    const e = {};
    if (step === 1) {
      if (!form.title.trim()) e.title = "Job title is required";
      if (!form.description.trim()) e.description = "Description is required";
    }
    if (step === 2) {
      if (!form.location.trim()) e.location = "Location is required";
      if (!form.category.trim()) e.category = "Category is required";
    }
    return e;
  };

  const next = () => {
    const e = validate();
    if (Object.keys(e).length > 0) { setErrors(e); return; }
    go(step + 1);
  };

  const back = () => go(step - 1);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const jobData = {
        ...form,
        skills: skillList,
      };
      await dispatch(createJob(jobData)).unwrap();
      setSuccess(true);
      setTimeout(() => navigate("/employer/dashboard"), 2000);
    } catch (err) {
      console.error(err);
      setErrors({ submit: err || "Something went wrong" });
    } finally {
      setLoading(false);
    }
  };

  const progress = ((step - 1) / (STEPS.length - 1)) * 100;

  return (
    <div className="min-h-screen bg-white flex" style={{ fontFamily: "'DM Sans', system-ui, sans-serif" }}>

      {/* ── Left accent panel ── */}
      <aside className="hidden lg:flex w-72 xl:w-80 shrink-0 bg-slate-950 flex-col justify-between px-8 py-10 relative overflow-hidden">

        {/* Decorative blobs */}
        <div className="absolute top-0 right-0 w-56 h-56 bg-violet-600 rounded-full opacity-10 blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-40 h-40 bg-fuchsia-500 rounded-full opacity-10 blur-2xl translate-y-1/2 -translate-x-1/2" />

        <div className="relative">
          {/* Brand */}
          <div className="flex items-center gap-2.5 mb-16">
            <div className="w-8 h-8 rounded-lg bg-violet-500 flex items-center justify-center text-white text-sm font-bold">T</div>
            <span className="text-white font-semibold tracking-tight">TalentHub</span>
          </div>

          <p className="text-white/40 text-[11px] font-semibold tracking-[0.15em] uppercase mb-6">Steps</p>

          {/* Step list */}
          <div className="space-y-1">
            {STEPS.map((s) => (
              <motion.button
                key={s.id}
                type="button"
                onClick={() => s.id < step && go(s.id)}
                animate={{
                  opacity: s.id === step ? 1 : s.id < step ? 0.6 : 0.25,
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-colors
                  ${s.id === step ? "bg-white/10 text-white" : "text-white/40 hover:text-white/60"}`}
              >
                <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs shrink-0
                  ${s.id === step ? "bg-violet-500 text-white" :
                    s.id < step ? "bg-emerald-500/30 text-emerald-400" : "bg-white/5 text-white/20"}`}>
                  {s.id < step ? "✓" : s.icon}
                </span>
                <span className="text-sm font-medium">{s.label}</span>
              </motion.button>
            ))}
          </div>
        </div>

        {/* Progress */}
        <div className="relative">
          <p className="text-white/30 text-xs mb-2">Completion</p>
          <div className="h-1 bg-white/10 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-violet-500 rounded-full"
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.4, ease: "easeOut" }}
            />
          </div>
          <p className="text-white/20 text-xs mt-1.5">{Math.round(progress)}% complete</p>
        </div>
      </aside>

      {/* ── Main content ── */}
      <main className="flex-1 flex flex-col">

        {/* Top bar */}
        <div className="px-6 lg:px-12 py-5 flex items-center justify-between border-b border-slate-100">
          <button
            onClick={() => navigate("/employer/dashboard")}
            className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-800 transition-colors"
          >
            ← Back to dashboard
          </button>

          {/* Mobile step indicator */}
          <div className="flex items-center gap-2 lg:hidden">
            {STEPS.map((s) => (
              <div key={s.id}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  s.id === step ? "w-6 bg-violet-500" :
                  s.id < step  ? "w-3 bg-violet-300" : "w-3 bg-slate-200"
                }`}
              />
            ))}
          </div>

          <span className="text-xs font-semibold text-slate-400">
            Step {step} of {STEPS.length}
          </span>
        </div>

        {/* Form area */}
        <div className="flex-1 px-6 lg:px-16 xl:px-24 py-10 max-w-2xl mx-auto w-full">

          {/* Success state */}
          <AnimatePresence>
            {success && (
              <motion.div
                initial={{ scale: 0.85, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="flex flex-col items-center justify-center h-64 text-center"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  className="w-20 h-20 rounded-full bg-emerald-100 flex items-center justify-center text-4xl mb-5"
                >
                  ✓
                </motion.div>
                <h3 className="text-xl font-bold text-slate-900">Job Posted!</h3>
                <p className="text-sm text-slate-500 mt-1">Redirecting to dashboard…</p>
              </motion.div>
            )}
          </AnimatePresence>

          {!success && (
            <form onSubmit={handleSubmit}>
              <AnimatePresence mode="wait" custom={dir}>
                {/* ── STEP 1: Basics ── */}
                {step === 1 && (
                  <motion.div key="step1" custom={dir} variants={slideVariants} initial="enter" animate="center" exit="exit">
                    <StepHeading icon="✦" title="Job basics" subtitle="Start with the essentials — what's the role and what does it involve?" />

                    <div className="space-y-7">
                      <div>
                        <Label>Job title</Label>
                        <Input name="title" placeholder="e.g. Senior React Developer" value={form.title} onChange={handleChange} error={errors.title} />
                        <FieldError msg={errors.title} />
                      </div>

                      <div>
                        <Label hint="Min. 80 characters recommended">Job description</Label>
                        <Textarea name="description" rows={6} placeholder="Describe the role, responsibilities, and what makes this opportunity exciting…" value={form.description} onChange={handleChange} error={errors.description} />
                        <FieldError msg={errors.description} />
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* ── STEP 2: Details ── */}
                {step === 2 && (
                  <motion.div key="step2" custom={dir} variants={slideVariants} initial="enter" animate="center" exit="exit">
                    <StepHeading icon="◈" title="Role details" subtitle="Help candidates understand the scope, location, and compensation." />

                    <div className="space-y-7">
                      <div className="grid grid-cols-2 gap-6">
                        <div>
                          <Label>Location</Label>
                          <Input name="location" placeholder="e.g. Kolkata / Remote" value={form.location} onChange={handleChange} error={errors.location} />
                          <FieldError msg={errors.location} />
                        </div>
                        <div>
                          <Label>Category</Label>
                          <div className="relative">
                            <Select name="category" value={form.category} onChange={handleChange} error={errors.category}>
                              <option value="">Select…</option>
                              {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
                            </Select>
                            <span className="pointer-events-none absolute right-0 top-3.5 text-slate-400 text-xs">▾</span>
                          </div>
                          <FieldError msg={errors.category} />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-6">
                        <div>
                          <Label>Job type</Label>
                          <div className="relative">
                            <Select name="jobType" value={form.jobType} onChange={handleChange}>
                              {JOB_TYPES.map((t) => <option key={t}>{t}</option>)}
                            </Select>
                            <span className="pointer-events-none absolute right-0 top-3.5 text-slate-400 text-xs">▾</span>
                          </div>
                        </div>
                        <div>
                          <Label>Experience</Label>
                          <div className="relative">
                            <Select name="experienceRequired" value={form.experienceRequired} onChange={handleChange}>
                              {EXPERIENCE.map((e) => <option key={e}>{e}</option>)}
                            </Select>
                            <span className="pointer-events-none absolute right-0 top-3.5 text-slate-400 text-xs">▾</span>
                          </div>
                        </div>
                      </div>

                      <div className="w-1/2 pr-3">
                        <Label hint="Annual (₹)">Salary</Label>
                        <Input type="number" name="salary" placeholder="e.g. 800000" value={form.salary} onChange={handleChange} />
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* ── STEP 3: Skills ── */}
                {step === 3 && (
                  <motion.div key="step3" custom={dir} variants={slideVariants} initial="enter" animate="center" exit="exit">
                    <StepHeading icon="◎" title="Skills required" subtitle="Add the skills candidates should have. Press Enter or comma to add each one." />

                    <div>
                      <Label hint={`${skillList.length} added`}>Skills</Label>
                      <Input
                        placeholder="React, Node.js, MongoDB… (press Enter)"
                        value={skillInput}
                        onChange={(e) => setSkillInput(e.target.value)}
                        onKeyDown={addSkill}
                      />

                      <div className="flex flex-wrap gap-2 mt-4 min-h-[40px]">
                        <AnimatePresence>
                          {skillList.map((s) => (
                            <SkillTag key={s} skill={s} onRemove={removeSkill} />
                          ))}
                        </AnimatePresence>
                        {skillList.length === 0 && (
                          <p className="text-xs text-slate-300 italic mt-1">No skills added yet</p>
                        )}
                      </div>
                    </div>

                    {/* Suggested skills */}
                    <div className="mt-8">
                      <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-3">Quick add</p>
                      <div className="flex flex-wrap gap-2">
                        {["JavaScript", "TypeScript", "React", "Node.js", "MongoDB", "Python", "AWS", "Docker", "Figma", "SQL"].map((s) => (
                          <button
                            key={s} type="button"
                            onClick={() => !skillList.includes(s) && setSkillList((p) => [...p, s])}
                            className={`text-xs px-3 py-1.5 rounded-full border transition-all duration-150 ${
                              skillList.includes(s)
                                ? "bg-violet-500 border-violet-500 text-white"
                                : "border-slate-200 text-slate-500 hover:border-violet-300 hover:text-violet-600"
                            }`}
                          >
                            {s}
                          </button>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* ── STEP 4: Review ── */}
                {step === 4 && (
                  <motion.div key="step4" custom={dir} variants={slideVariants} initial="enter" animate="center" exit="exit">
                    <StepHeading icon="◉" title="Review & publish" subtitle="Everything looks good? Hit publish to make your job listing live." />

                    <div className="bg-slate-50 rounded-2xl border border-slate-100 overflow-hidden">
                      <div className="px-5 py-4 bg-white border-b border-slate-100">
                        <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest">Job preview</p>
                      </div>
                      <div className="px-5">
                        <ReviewRow label="Title"       value={form.title} />
                        <ReviewRow label="Description" value={form.description?.slice(0, 120) + (form.description?.length > 120 ? "…" : "")} />
                        <ReviewRow label="Location"    value={form.location} />
                        <ReviewRow label="Category"    value={form.category} />
                        <ReviewRow label="Type"        value={form.type} />
                        <ReviewRow label="Experience"  value={form.experienceRequired} />
                        <ReviewRow label="Salary"      value={form.salary ? `₹${Number(form.salary).toLocaleString("en-IN")}` : ""} />
                        <ReviewRow
                          label="Skills"
                          value={skillList.length > 0 ? skillList.join(", ") : null}
                        />
                      </div>
                    </div>

                    {errors.submit && (
                      <p className="mt-4 text-sm text-rose-500 font-medium">{errors.submit}</p>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* ── Navigation buttons ── */}
              <div className="flex items-center justify-between mt-12">
                {step > 1 ? (
                  <button
                    type="button"
                    onClick={back}
                    className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-800 transition-colors"
                  >
                    ← Back
                  </button>
                ) : <div />}

                {step < STEPS.length ? (
                  <motion.button
                    type="button"
                    onClick={next}
                    whileTap={{ scale: 0.97 }}
                    className="flex items-center gap-2.5 bg-slate-900 hover:bg-violet-600 text-white text-sm font-semibold
                      px-7 py-3 rounded-xl transition-colors duration-200"
                  >
                    Continue
                    <span className="text-white/60 text-xs">→</span>
                  </motion.button>
                ) : (
                  <motion.button
                    type="submit"
                    disabled={loading}
                    whileTap={{ scale: 0.97 }}
                    className={`flex items-center gap-2.5 text-sm font-semibold px-7 py-3 rounded-xl transition-all duration-200
                      ${loading ? "bg-violet-300 cursor-not-allowed text-white" : "bg-violet-600 hover:bg-violet-700 text-white"}`}
                  >
                    {loading ? (
                      <>
                        <svg className="animate-spin" width="14" height="14" viewBox="0 0 24 24" fill="none">
                          <circle cx="12" cy="12" r="10" stroke="white" strokeOpacity="0.3" strokeWidth="3" />
                          <path d="M22 12a10 10 0 0 0-10-10" stroke="white" strokeWidth="3" strokeLinecap="round" />
                        </svg>
                        Publishing…
                      </>
                    ) : (
                      <>Publish job ✦</>
                    )}
                  </motion.button>
                )}
              </div>
            </form>
          )}
        </div>
      </main>
    </div>
  );
}

// ── Step heading sub-component ─────────────────────────────────
function StepHeading({ icon, title, subtitle }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-10"
    >
      <span className="inline-block text-2xl text-violet-500 mb-3">{icon}</span>
      <h1 className="text-2xl font-bold text-slate-900 mb-1.5">{title}</h1>
      <p className="text-sm text-slate-400 leading-relaxed">{subtitle}</p>
    </motion.div>
  );
}
