import React from "react";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { logoutEmployee } from "../redux/authSlice";

export default function Navbar() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { user, role } = useSelector((state) => state.auth || {});

  const handleLogout = () => {
    dispatch(logoutEmployee());
    navigate("/");
  };

  return (
    <nav className="bg-white shadow-md px-6 py-4 flex justify-between items-center">

      {/* LOGO */}
      <h1
        onClick={() => navigate("/")}
        className="text-xl font-bold text-indigo-600 cursor-pointer"
      >
        TalentHub
      </h1>

      {/* NAV LINKS */}
      <div className="flex items-center gap-6">

        {/* ================= BEFORE LOGIN ================= */}
        {!user && (
          <>
            <button
              onClick={() => navigate("/employee/login")}
              className="text-gray-600 hover:text-indigo-600"
            >
              Employee Login
            </button>

            <button
              onClick={() => navigate("/employer/login")}
              className="text-gray-600 hover:text-indigo-600"
            >
              Employer Login
            </button>
          </>
        )}

        {/* ================= EMPLOYEE ================= */}
        {user && role === "employee" && (
          <>
            <button onClick={() => navigate("/jobs")}>
              Jobs
            </button>

            <button onClick={() => navigate("/applications")}>
              My Applications
            </button>

            <button onClick={() => navigate("/profile")}>
              Profile
            </button>
          </>
        )}

        {/* ================= EMPLOYER ================= */}
        {user && role === "employer" && (
          <>
            <button onClick={() => navigate("/dashboard")}>
              Dashboard
            </button>

            <button onClick={() => navigate("/post-job")}>
              Post Job
            </button>

            <button onClick={() => navigate("/employer/applications")}>
              Applications
            </button>
          </>
        )}

        {/* ================= LOGOUT ================= */}
        {user && (
          <button
            onClick={handleLogout}
            className="bg-red-500 text-white px-4 py-2 rounded-lg"
          >
            Logout
          </button>
        )}
      </div>
    </nav>
  );
}