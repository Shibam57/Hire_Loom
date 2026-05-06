import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { logoutEmployee, getCurrentEmployee } from "../redux/authSlice";
import { motion, AnimatePresence } from "framer-motion";

// ── Design tokens (matches Dashboard/Profile palette) ──────────
const C = {
  ink:    "#0D0D0D",
  paper:  "#FAFAF8",
  cream:  "#F5F0E8",
  gold:   "#C9A84C",
  goldL:  "#E8D5A0",
  muted:  "#8A8680",
  border: "#E4DDD4",
  card:   "#FFFFFF",
  sage:   "#4D7C5F",
  red:    "#D94F3D",
};

const ease = [0.22, 1, 0.36, 1];

// ── Avatar initials ────────────────────────────────────────────
const Avatar = ({ name, size = 34 }) => {
  const initials = name?.split(" ").slice(0, 2).map((w) => w[0]).join("").toUpperCase() || "?";
  return (
    <div
      className="rounded-xl flex items-center justify-center font-black shrink-0 select-none"
      style={{
        width: size, height: size,
        background: `linear-gradient(135deg, ${C.gold}50, ${C.ink}20)`,
        border: `1.5px solid ${C.goldL}`,
        fontSize: size * 0.3,
        color: C.ink,
        letterSpacing: "-0.02em",
      }}
    >
      {initials}
    </div>
  );
};

// ── Nav link ───────────────────────────────────────────────────
const NavLink = ({ to, label, active, onClick }) => (
  <button
    onClick={onClick}
    className="relative text-sm font-semibold px-1 py-0.5 transition-colors duration-150"
    style={{ color: active ? C.ink : C.muted }}
  >
    {label}
    {active && (
      <motion.div
        layoutId="navUnderline"
        className="absolute -bottom-0.5 left-0 right-0 h-0.5 rounded-full"
        style={{ background: C.gold }}
        transition={{ duration: 0.28, ease }}
      />
    )}
  </button>
);

// ── Main Navbar ────────────────────────────────────────────────
export default function Navbar() {
  const navigate  = useNavigate();
  const location  = useLocation();
  const dispatch  = useDispatch();
  const dropRef   = useRef(null);

  const { user } = useSelector((s) => s.auth || {});

  const [scrolled,    setScrolled]    = useState(false);
  const [mobileOpen,  setMobileOpen]  = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  // Scroll shadow
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 6);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (dropRef.current && !dropRef.current.contains(e.target)) setProfileOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Close mobile menu on route change
  useEffect(() => { setMobileOpen(false); setProfileOpen(false); }, [location.pathname]);

  const handleLogout = () => {
    dispatch(logoutEmployee());
    navigate("/");
  };

  useEffect(() => {
    dispatch(getCurrentEmployee());
  }, [dispatch]);


  const isActive = (path) => location.pathname === path || location.pathname.startsWith(path + "/");

  // ── Employee nav links ──────────────────────────────────────
  const employeeLinks = [
    { to: "/jobs",         label: "Jobs"            },
    { to: "/applications", label: "My Applications" },
    { to: "/profile",      label: "Profile"         },
  ];

  return (
    <>
      <motion.nav
        initial={{ y: -64, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.45, ease }}
        className="sticky top-0 z-50 w-full"
        style={{
          background: scrolled ? "rgba(250,250,248,0.92)" : C.card,
          backdropFilter: scrolled ? "blur(16px)" : "none",
          borderBottom: `1px solid ${scrolled ? C.border : C.border}`,
          boxShadow: scrolled ? "0 2px 20px rgba(0,0,0,0.07)" : "none",
          transition: "box-shadow 0.25s, background 0.25s",
        }}
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-10 h-16 flex items-center justify-between gap-4">

          {/* ── Logo ── */}
          <motion.button
            onClick={() => navigate("/")}
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.97 }}
            className="flex items-center gap-2.5 shrink-0"
          >
            <div
              className="w-8 h-8 rounded-xl flex items-center justify-center font-black text-xs"
              style={{ background: C.ink, color: C.gold }}
            >
              T
            </div>
            <span
              className="font-black text-base tracking-tight hidden sm:block"
              style={{ color: C.ink, letterSpacing: "-0.03em" }}
            >
              Talent<span style={{ color: C.gold }}>Hub</span>
            </span>
          </motion.button>

          {/* ── Desktop nav ── */}
          <div className="hidden md:flex items-center gap-6 flex-1 justify-center">
            {/* Before login */}
            {!user && (
              <div className="flex items-center gap-6">
                <NavLink to="/login"          label="Employee Login"  active={isActive("/login")}          onClick={() => navigate("/login")} />
                <NavLink to="/employer/login" label="Employer Login"  active={isActive("/employer/login")} onClick={() => navigate("/employer/login")} />
              </div>
            )}

            {/* Employee links */}
            {user?.role === "employee" && (
              <div className="flex items-center gap-6">
                {employeeLinks.map((l) => (
                  <NavLink key={l.to} to={l.to} label={l.label} active={isActive(l.to)} onClick={() => navigate(l.to)} />
                ))}
              </div>
            )}
          </div>

          {/* ── Right side ── */}
          <div className="flex items-center gap-3 shrink-0">

            {/* Notification bell (when logged in) */}
            {user && (
              <motion.button
                whileTap={{ scale: 0.93 }}
                className="relative p-2 rounded-xl transition-colors hover:bg-stone-100"
                style={{ color: C.muted }}
              >
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round">
                  <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 0 1-3.46 0"/>
                </svg>
                <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full" style={{ background: C.red }} />
              </motion.button>
            )}

            {/* Not logged in — CTA buttons */}
            {!user && (
              <div className="hidden md:flex items-center gap-2">
                <motion.button
                  whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                  onClick={() => navigate("/register")}
                  className="text-sm font-bold px-4 py-2 rounded-xl border transition-colors"
                  style={{ borderColor: C.border, color: C.ink }}
                  onMouseEnter={(e) => { e.currentTarget.style.borderColor = C.gold; e.currentTarget.style.color = C.gold; }}
                  onMouseLeave={(e) => { e.currentTarget.style.borderColor = C.border; e.currentTarget.style.color = C.ink; }}
                >
                  Register
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                  onClick={() => navigate("/login")}
                  className="text-sm font-bold px-4 py-2 rounded-xl"
                  style={{ background: C.ink, color: "#fff" }}
                  onMouseEnter={(e) => e.currentTarget.style.background = C.gold}
                  onMouseLeave={(e) => e.currentTarget.style.background = C.ink}
                >
                  Sign in
                </motion.button>
              </div>
            )}

            {/* Profile dropdown */}
            {user && (
              <div className="relative" ref={dropRef}>
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setProfileOpen((p) => !p)}
                  className="flex items-center gap-2 px-2 py-1.5 rounded-xl transition-colors hover:bg-stone-50"
                  style={{ border: `1px solid ${profileOpen ? C.gold : "transparent"}` }}
                >
                  <Avatar name={user.name} size={34} />
                  <div className="hidden sm:block text-left">
                    <p className="text-xs font-black leading-tight" style={{ color: C.ink }}>{user.name}</p>
                    <p className="text-[10px] capitalize font-semibold" style={{ color: C.muted }}>{user.role}</p>
                  </div>
                  <motion.svg
                    animate={{ rotate: profileOpen ? 180 : 0 }}
                    transition={{ duration: 0.22 }}
                    width="12" height="12" viewBox="0 0 12 12" fill="none"
                    style={{ color: C.muted }}
                  >
                    <path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </motion.svg>
                </motion.button>

                {/* Dropdown */}
                <AnimatePresence>
                  {profileOpen && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.94, y: -8 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.94, y: -8 }}
                      transition={{ duration: 0.2, ease }}
                      className="absolute right-0 mt-2 w-52 rounded-2xl overflow-hidden"
                      style={{
                        background: C.card,
                        border: `1px solid ${C.border}`,
                        boxShadow: "0 16px 48px rgba(0,0,0,0.12)",
                        transformOrigin: "top right",
                      }}
                    >
                      {/* User info header */}
                      <div className="px-4 py-3.5" style={{ borderBottom: `1px solid ${C.border}` }}>
                        <p className="text-sm font-black" style={{ color: C.ink }}>{user.name}</p>
                        <p className="text-xs truncate mt-0.5" style={{ color: C.muted }}>{user.email}</p>
                      </div>

                      {/* Menu items */}
                      <div className="py-1.5">
                        {user.role === "employee" && employeeLinks.map((l) => (
                          <button
                            key={l.to}
                            onClick={() => navigate(l.to)}
                            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-semibold text-left transition-colors"
                            style={{ color: isActive(l.to) ? C.gold : C.ink }}
                            onMouseEnter={(e) => e.currentTarget.style.background = C.cream}
                            onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
                          >
                            <span className="text-base">
                              {l.to === "/jobs" ? "🔍" : l.to === "/applications" ? "📋" : "👤"}
                            </span>
                            {l.label}
                            {isActive(l.to) && (
                              <span className="ml-auto text-[10px] font-black px-1.5 py-0.5 rounded-full"
                                style={{ background: `${C.gold}18`, color: C.gold }}>
                                Active
                              </span>
                            )}
                          </button>
                        ))}
                      </div>

                      {/* Logout */}
                      <div className="px-2 pb-2" style={{ borderTop: `1px solid ${C.border}` }}>
                        <motion.button
                          whileTap={{ scale: 0.97 }}
                          onClick={handleLogout}
                          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold mt-1 transition-colors"
                          style={{ color: C.red }}
                          onMouseEnter={(e) => e.currentTarget.style.background = `${C.red}10`}
                          onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
                        >
                          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9"/>
                          </svg>
                          Sign out
                        </motion.button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}

            {/* Mobile hamburger */}
            <motion.button
              whileTap={{ scale: 0.93 }}
              onClick={() => setMobileOpen((p) => !p)}
              className="md:hidden p-2 rounded-xl transition-colors"
              style={{ color: C.ink }}
            >
              <motion.svg
                width="20" height="20" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="2" strokeLinecap="round"
              >
                {mobileOpen ? (
                  <>
                    <motion.path key="x1" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} d="M18 6L6 18"/>
                    <motion.path key="x2" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} d="M6 6L18 18"/>
                  </>
                ) : (
                  <>
                    <motion.path key="l1" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} d="M3 6h18"/>
                    <motion.path key="l2" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} d="M3 12h18"/>
                    <motion.path key="l3" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} d="M3 18h18"/>
                  </>
                )}
              </motion.svg>
            </motion.button>
          </div>
        </div>

        {/* ── Mobile menu ── */}
        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.28, ease }}
              className="overflow-hidden border-t md:hidden"
              style={{ borderColor: C.border, background: C.card }}
            >
              <div className="px-4 py-4 space-y-1">
                {/* Logged out */}
                {!user && (
                  <>
                    {[
                      { label: "Employee Login",  to: "/login"          },
                      { label: "Employer Login",  to: "/employer/login" },
                      { label: "Register",        to: "/register"       },
                    ].map((item) => (
                      <button key={item.to}
                        onClick={() => navigate(item.to)}
                        className="w-full text-left px-4 py-3 rounded-xl text-sm font-semibold transition-colors"
                        style={{ color: C.ink }}
                        onMouseEnter={(e) => e.currentTarget.style.background = C.cream}
                        onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
                      >
                        {item.label}
                      </button>
                    ))}
                  </>
                )}

                {/* Employee links */}
                {user?.role === "employee" && employeeLinks.map((l) => (
                  <button key={l.to}
                    onClick={() => navigate(l.to)}
                    className="w-full text-left px-4 py-3 rounded-xl text-sm font-semibold transition-colors"
                    style={{
                      color: isActive(l.to) ? C.gold : C.ink,
                      background: isActive(l.to) ? `${C.gold}10` : "transparent",
                    }}
                  >
                    {l.label}
                  </button>
                ))}

                {/* Logout */}
                {user && (
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-3 rounded-xl text-sm font-bold mt-2"
                    style={{ color: C.red, background: `${C.red}08` }}
                  >
                    Sign out
                  </button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>
    </>
  );
}