import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { Link } from "react-router-dom";
import Hero from "../components/Hero";
import JobListing from "../components/JobListing";
import CallToAction from "../components/Calltoaction";

const Home = () => {
  return (
    <>
      <Navbar />
      <Hero />
      <JobListing />
      <CallToAction />
      <Footer />
    </>
  );
};

export default Home;