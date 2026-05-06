import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  getCurrentEmployee,
  addEmployeeSkills,
  // updateProfile,
} from "../redux/authSlice";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";

// ── Tokens ────────────────────────────────────────────────────
const C = {
  ink:    "#0D0D0D",
  paper:  "#FAFAF8",
  cream:  "#F5F0E8",
  gold:   "#C9A84C",
  goldL:  "#E8D5A0",
  muted:  "#8A8680",
  border: "#E4DDD4",
  card:   "#FFFFFF",
  red:    "#D94F3D",
};

const ease = [0.22, 1, 0.36, 1];

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07 } },
};
const rowUp = {
  hidden: { opacity: 0, y: 16 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.4, ease } },
};

// ── Level config ──────────────────────────────────────────────
const LEVELS = ["Beginner", "Intermediate", "Advanced"];
const levelData = {
  Beginner:     { w: "33%",  color: C.muted,  label: "Beginner"     },
  Intermediate: { w: "66%",  color: C.gold,   label: "Intermediate" },
  Advanced:     { w: "100%", color: C.ink,    label: "Advanced"     },
};

// ── Skeleton ──────────────────────────────────────────────────
const Skel = ({ w = "w-full", h = "h-4", r = "rounded-lg" }) => (
  <div className={`${w} ${h} ${r} animate-pulse`} style={{ background: C.border }} />
);

// ── Luxury input ──────────────────────────────────────────────
const LuxInput = ({ label, error, multiline, ...props }) => {
  const [focused, setFocused] = useState(false);
  const Tag = multiline ? "textarea" : "input";
  return (
    <div className="mb-5">
      <label className="block text-[10px] font-black uppercase tracking-[0.18em] mb-2"
        style={{ color: focused ? C.gold : C.muted }}>
        {label}
      </label>
      <Tag
        {...props}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        className={multiline ? "resize-none" : ""}
        style={{
          width: "100%",
          background: focused ? C.cream : C.paper,
          border: `1.5px solid ${error ? C.red : focused ? C.gold : C.border}`,
          borderRadius: "12px",
          padding: multiline ? "14px 16px" : "12px 16px",
          fontSize: "14px",
          color: C.ink,
          outline: "none",
          fontFamily: "inherit",
          transition: "all 0.2s",
          boxShadow: focused ? `0 0 0 3px ${C.gold}20` : "none",
        }}
      />
      {error && <p className="text-[11px] font-semibold mt-1.5 ml-1" style={{ color: C.red }}>{error}</p>}
    </div>
  );
};

// ── Section heading ───────────────────────────────────────────
const SectionHead = ({ children }) => (
  <div className="flex items-center gap-3 mb-5">
    <span className="text-[10px] font-black uppercase tracking-[0.2em]" style={{ color: C.muted }}>{children}</span>
    <div className="flex-1 h-px" style={{ background: C.border }} />
  </div>
);

// ── Info row ──────────────────────────────────────────────────
const InfoRow = ({ icon, label, value }) => (
  <motion.div variants={rowUp}
    className="flex items-start gap-4 py-3.5"
    style={{ borderBottom: `1px solid ${C.border}` }}>
    <span className="text-base mt-0.5 shrink-0">{icon}</span>
    <div className="flex-1 min-w-0">
      <p className="text-[10px] font-black uppercase tracking-widest mb-0.5" style={{ color: C.muted }}>{label}</p>
      <p className="text-sm font-semibold truncate" style={{ color: value ? C.ink : C.border }}>
        {value || "—"}
      </p>
    </div>
  </motion.div>
);

// ── Skill chip ────────────────────────────────────────────────
const SkillChip = ({ name, level }) => {
  const d = levelData[level] || levelData.Beginner;
  return (
    <motion.div
      initial={{ scale: 0.75, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0.75, opacity: 0 }}
      whileHover={{ y: -2 }}
      className="group relative rounded-xl border overflow-hidden cursor-default"
      style={{ borderColor: C.border, background: C.card, minWidth: "120px" }}
    >
      <div className="px-4 pt-3 pb-2.5">
        <p className="text-sm font-bold" style={{ color: C.ink }}>{name}</p>
        <p className="text-[10px] font-semibold uppercase tracking-wider mt-0.5" style={{ color: C.muted }}>{level}</p>
      </div>
      <div className="h-0.5 w-full" style={{ background: C.border }}>
        <motion.div
          className="h-full"
          initial={{ width: 0 }}
          animate={{ width: d.w }}
          transition={{ delay: 0.1, duration: 0.5, ease }}
          style={{ background: d.color }}
        />
      </div>
    </motion.div>
  );
};

// ── Tabs ──────────────────────────────────────────────────────
const TABS = [
  { id: "overview",  label: "Overview",  icon: "◈" },
  { id: "education", label: "Education", icon: "✦" },
  { id: "skills",    label: "Skills",    icon: "◎" },
];

// ── Avatar ────────────────────────────────────────────────────
const Avatar = ({ name, size = 80 }) => {
  const initials = name?.split(" ").slice(0, 2).map((w) => w[0]).join("").toUpperCase() || "?";
  return (
    <div
      className="rounded-3xl flex items-center justify-center font-black"
      style={{
        width: size, height: size, flexShrink: 0,
        background: `linear-gradient(135deg, ${C.gold}40, ${C.ink}20)`,
        border: `2px solid ${C.goldL}`,
        fontSize: size * 0.28,
        color: C.ink,
        letterSpacing: "-0.02em",
      }}
    >
      {initials}
    </div>
  );
};

// ── Main component ────────────────────────────────────────────
const Profile = () => {
  const dispatch = useDispatch();
  const { user, loading } = useSelector((s) => s.auth);

  const [tab,       setTab]       = useState("overview");
  const [formData,  setFormData]  = useState({ name: "", bio: "" });
  const [skill,     setSkill]     = useState("");
  const [level,     setLevel]     = useState("Beginner");
  const [skillErr,  setSkillErr]  = useState("");
  const [saved,     setSaved]     = useState(false);

  useEffect(() => { dispatch(getCurrentEmployee()); }, [dispatch]);

  useEffect(() => {
    if (user) setFormData({ name: user.name || "", bio: user.bio || "" });
  }, [user]);

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleUpdate = (e) => {
    e.preventDefault();
    dispatch(updateProfile(formData));
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleAddSkill = () => {
    if (!skill.trim()) { setSkillErr("Enter a skill name"); return; }
    dispatch(addEmployeeSkills([{ name: skill.trim(), level }]));
    setSkill(""); setLevel("Beginner"); setSkillErr("");
  };

  // ── Loading skeleton ──────────────────────────────────────
  if (loading && !user) return (
    <div className="min-h-screen" style={{ background: C.paper, fontFamily: "'DM Sans', system-ui, sans-serif" }}>
      <div className="max-w-5xl mx-auto px-6 py-12 animate-pulse space-y-6">
        <div className="flex gap-6 items-center">
          <div className="w-20 h-20 rounded-3xl" style={{ background: C.border }} />
          <div className="space-y-2 flex-1">
            <Skel w="w-1/4" h="h-6" />
            <Skel w="w-1/3" h="h-4" />
          </div>
        </div>
        <div className="grid grid-cols-3 gap-4">
          {[1,2,3].map(n => <div key={n} className="h-24 rounded-2xl" style={{ background: C.border }}/>)}
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen" style={{ background: C.paper, fontFamily: "'DM Sans', system-ui, sans-serif" }}>

      {/* ── Navbar ── */}
      <nav className="sticky top-0 z-30 bg-white border-b px-6 lg:px-10 py-4 flex items-center justify-between"
        style={{ borderColor: C.border }}>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center font-black text-xs"
            style={{ background: C.ink, color: "#fff" }}>T</div>
          <span className="font-bold tracking-tight" style={{ color: C.ink }}>TalentHub</span>
        </div>
        <Link to="/edit-profile" className="text-sm font-semibold hover:underline" style={{ color: C.muted }}>
          Edit Profile 
        </Link>
      </nav>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-10 py-10">

        {/* ── Profile hero ── */}
        <motion.div
          variants={rowUp} initial="hidden" animate="show"
          className="relative overflow-hidden rounded-3xl mb-8 px-8 py-8"
          style={{ background: C.ink }}
        >
          {/* Gold accent blobs */}
          <div className="absolute -top-16 -right-16 w-56 h-56 rounded-full opacity-10 blur-3xl"
            style={{ background: C.gold }} />
          <div className="absolute bottom-0 left-1/3 w-32 h-32 rounded-full opacity-5 blur-2xl"
            style={{ background: C.gold }} />
          {/* Dot grid */}
          <div className="absolute inset-0 opacity-10"
            style={{
              backgroundImage: `radial-gradient(circle, ${C.gold} 1px, transparent 1px)`,
              backgroundSize: "26px 26px",
            }} />

          <div className="relative flex flex-col sm:flex-row sm:items-center gap-6">
            <motion.div
              initial={{ scale: 0.7, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 260, damping: 20 }}
            >
              <Avatar name={user?.name} size={80} />
            </motion.div>

            <div className="flex-1 min-w-0">
              <motion.p
                initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1, duration: 0.4, ease }}
                className="font-black leading-tight mb-1"
                style={{ fontSize: "clamp(1.4rem,3vw,2rem)", color: "#fff", letterSpacing: "-0.03em" }}
              >
                {user?.name || "Your Name"}
              </motion.p>
              <motion.div
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
                className="flex flex-wrap gap-3 mt-2"
              >
                {user?.location && (
                  <span className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full"
                    style={{ background: `${C.gold}22`, color: C.goldL }}>
                    📍 {user.location}
                  </span>
                )}
                {user?.experience !== undefined && (
                  <span className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full"
                    style={{ background: "#ffffff14", color: "#fff8" }}>
                    💼 {user.experience} yr{user.experience !== 1 ? "s" : ""} experience
                  </span>
                )}
                {user?.skills?.length > 0 && (
                  <span className="text-xs font-semibold px-3 py-1 rounded-full"
                    style={{ background: "#ffffff14", color: "#fff8" }}>
                    ⚡ {user.skills.length} skills
                  </span>
                )}
              </motion.div>
            </div>
          </div>
        </motion.div>

        {/* ── Tabs ── */}
        <motion.div
          variants={rowUp} initial="hidden" animate="show"
          className="flex gap-1 p-1 rounded-2xl mb-7 w-fit"
          style={{ background: C.cream, border: `1px solid ${C.border}` }}
        >
          {TABS.map((t) => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className="relative flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all duration-200"
              style={{ color: tab === t.id ? C.ink : C.muted }}
            >
              {tab === t.id && (
                <motion.div layoutId="tabBg"
                  className="absolute inset-0 rounded-xl"
                  style={{ background: C.card, border: `1px solid ${C.border}`, boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}
                />
              )}
              <span className="relative z-10 text-base">{t.icon}</span>
              <span className="relative z-10">{t.label}</span>
            </button>
          ))}
        </motion.div>

        {/* ── Tab content ── */}
        <AnimatePresence mode="wait">

          {/* ═══ OVERVIEW ═══ */}
          {tab === "overview" && (
            <motion.div key="overview"
              initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -14 }}
              transition={{ duration: 0.28, ease }}
              className="grid grid-cols-1 lg:grid-cols-5 gap-6"
            >
              {/* Left — edit form */}
              <div className="lg:col-span-3 bg-white rounded-2xl border p-6"
                style={{ borderColor: C.border }}>
                <SectionHead>Edit profile</SectionHead>
                <form onSubmit={handleUpdate}>
                  <LuxInput label="Full name" name="name" value={formData.name} onChange={handleChange} />
                  <LuxInput label="Bio / tagline" name="bio" value={formData.bio} onChange={handleChange} multiline rows={4}
                    placeholder="Frontend developer passionate about building great products…" />

                  <motion.button
                    type="submit" whileTap={{ scale: 0.97 }}
                    className="flex items-center gap-2.5 text-sm font-bold px-6 py-3 rounded-xl transition-all duration-200"
                    style={{
                      background: saved ? "#059669" : C.ink,
                      color: "#fff",
                      boxShadow: saved ? "0 4px 16px #05996940" : `0 4px 20px ${C.ink}30`,
                    }}
                  >
                    {saved ? (
                      <>
                        <svg width="13" height="13" viewBox="0 0 16 16" fill="none">
                          <path d="M3 8l3 3 7-7" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                        Saved
                      </>
                    ) : "Save changes"}
                  </motion.button>
                </form>
              </div>

              {/* Right — contact details */}
              <div className="lg:col-span-2 bg-white rounded-2xl border p-6"
                style={{ borderColor: C.border }}>
                <SectionHead>Contact & details</SectionHead>
                <motion.div variants={stagger} initial="hidden" animate="show">
                  <InfoRow icon="✉️" label="Email"      value={user?.email}                      />
                  <InfoRow icon="📞" label="Phone"      value={user?.phone}                      />
                  <InfoRow icon="📍" label="Location"   value={user?.location}                   />
                  <InfoRow icon="💼" label="Experience" value={user?.experience !== undefined ? `${user.experience} years` : null} />
                </motion.div>
              </div>
            </motion.div>
          )}

          {/* ═══ EDUCATION ═══ */}
          {tab === "education" && (
            <motion.div key="education"
              initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -14 }}
              transition={{ duration: 0.28, ease }}
              className="bg-white rounded-2xl border p-6 max-w-2xl"
              style={{ borderColor: C.border }}
            >
              <SectionHead>Education background</SectionHead>

              {user?.education ? (
                <motion.div variants={stagger} initial="hidden" animate="show">
                  <InfoRow icon="🎓" label="Degree"         value={user.education.degree}        />
                  <InfoRow icon="🔬" label="Branch / Major" value={user.education.branch}        />
                  <InfoRow icon="🏛️" label="College"        value={user.education.college}       />
                  <InfoRow icon="📅" label="Graduation year" value={user.education.graduationYear} />
                </motion.div>
              ) : (
                <div className="flex flex-col items-center justify-center py-14 text-center">
                  <div className="text-5xl mb-4">🎓</div>
                  <p className="text-sm font-semibold" style={{ color: C.muted }}>No education details added</p>
                  <p className="text-xs mt-1" style={{ color: C.border }}>Complete your profile to attract employers</p>
                </div>
              )}
            </motion.div>
          )}

          {/* ═══ SKILLS ═══ */}
          {tab === "skills" && (
            <motion.div key="skills"
              initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -14 }}
              transition={{ duration: 0.28, ease }}
            >
              {/* Add skill */}
              <div className="bg-white rounded-2xl border p-6 mb-6" style={{ borderColor: C.border }}>
                <SectionHead>Add a skill</SectionHead>

                <div className="flex flex-col sm:flex-row gap-3">
                  {/* Skill name */}
                  <div className="flex-1">
                    <input
                      type="text"
                      placeholder="e.g. React, Node.js, Figma…"
                      value={skill}
                      onChange={(e) => { setSkill(e.target.value); setSkillErr(""); }}
                      onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleAddSkill())}
                      style={{
                        width: "100%", padding: "11px 16px", fontSize: "14px",
                        border: `1.5px solid ${skillErr ? C.red : C.border}`,
                        borderRadius: "12px", background: C.paper, color: C.ink,
                        outline: "none", fontFamily: "inherit",
                      }}
                    />
                    {skillErr && <p className="text-[11px] text-red-500 font-semibold mt-1.5 ml-1">{skillErr}</p>}
                  </div>

                  {/* Level picker */}
                  <div className="flex gap-1 p-1 rounded-xl shrink-0" style={{ background: C.cream, border: `1px solid ${C.border}` }}>
                    {LEVELS.map((l) => (
                      <button key={l} type="button" onClick={() => setLevel(l)}
                        className="text-xs font-bold px-3 py-2 rounded-lg transition-all duration-150"
                        style={{
                          background: level === l ? C.ink : "transparent",
                          color: level === l ? "#fff" : C.muted,
                        }}>
                        {l}
                      </button>
                    ))}
                  </div>

                  {/* Add button */}
                  <motion.button
                    type="button" onClick={handleAddSkill} whileTap={{ scale: 0.96 }}
                    className="flex items-center gap-2 text-sm font-bold px-5 py-2.5 rounded-xl shrink-0 transition-colors duration-150"
                    style={{ background: C.gold, color: C.ink }}
                    onMouseEnter={(e) => e.currentTarget.style.background = C.goldL}
                    onMouseLeave={(e) => e.currentTarget.style.background = C.gold}
                  >
                    <svg width="12" height="12" viewBox="0 0 14 14" fill="none">
                      <path d="M7 1v12M1 7h12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                    </svg>
                    Add skill
                  </motion.button>
                </div>
              </div>

              {/* Skill grid */}
              <div className="bg-white rounded-2xl border p-6" style={{ borderColor: C.border }}>
                <SectionHead>Your skills ({user?.skills?.length ?? 0})</SectionHead>

                {!user?.skills?.length ? (
                  <div className="flex flex-col items-center justify-center py-14 text-center">
                    <div className="text-5xl mb-4">⚡</div>
                    <p className="text-sm font-semibold" style={{ color: C.muted }}>No skills added yet</p>
                    <p className="text-xs mt-1" style={{ color: C.border }}>Add skills to stand out to employers</p>
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-3">
                    <AnimatePresence>
                      {user.skills.map((s, i) => (
                        <SkillChip key={`${s.name}-${i}`} name={s.name} level={s.level} />
                      ))}
                    </AnimatePresence>
                  </div>
                )}
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </div>
  );
};

export default Profile;
