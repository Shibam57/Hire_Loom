import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { Link } from "react-router-dom";

const Home = () => {
  return (
    <>
      <Navbar />

      {/* ================= HERO ================= */}
      <section
        style={{
          textAlign: "center",
          padding: "80px 20px",
          background: "#f5f5f5",
        }}
      >
        <h1>Find Your Dream Job 🚀</h1>
        <p>Thousands of jobs from top companies</p>

        <div style={{ marginTop: "20px" }}>
          <Link to="/jobs">
            <button style={btnPrimary}>Browse Jobs</button>
          </Link>

          <Link to="/register">
            <button style={btnSecondary}>Get Started</button>
          </Link>
        </div>
      </section>

      {/* ================= FEATURES ================= */}
      <section style={{ padding: "50px 20px", textAlign: "center" }}>
        <h2>Why Choose Us?</h2>

        <div
          style={{
            display: "flex",
            justifyContent: "center",
            gap: "30px",
            marginTop: "30px",
          }}
        >
          <div style={featureCard}>
            <h3>💼 Easy Apply</h3>
            <p>Apply to jobs in one click</p>
          </div>

          <div style={featureCard}>
            <h3>📊 Track Applications</h3>
            <p>Monitor your job status</p>
          </div>

          <div style={featureCard}>
            <h3>🏢 Top Companies</h3>
            <p>Work with best employers</p>
          </div>
        </div>
      </section>

      {/* ================= CTA ================= */}
      <section
        style={{
          textAlign: "center",
          padding: "50px",
          background: "#222",
          color: "#fff",
        }}
      >
        <h2>Start Your Career Journey Today</h2>
        <Link to="/register">
          <button style={btnPrimary}>Join Now</button>
        </Link>
      </section>

      <Footer />
    </>
  );
};

// ================= STYLES =================
const btnPrimary = {
  padding: "10px 20px",
  marginRight: "10px",
  background: "blue",
  color: "white",
  border: "none",
  borderRadius: "5px",
};

const btnSecondary = {
  padding: "10px 20px",
  background: "gray",
  color: "white",
  border: "none",
  borderRadius: "5px",
};

const featureCard = {
  border: "1px solid #ccc",
  padding: "20px",
  borderRadius: "10px",
  width: "200px",
};

export default Home;