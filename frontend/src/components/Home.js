import React, { useEffect } from "react";
import { useLocation, Link, useNavigate } from "react-router-dom";
import "./Home.css";
import caparidaImg from "../assets/images/caparida.png";
import yongcoImg from "../assets/images/yongco2.jpeg";
import caparasImg from "../assets/images/caparas.jpeg";
import montillaImg from "../assets/images/montilla.jpg";
import toringImg from "../assets/images/toring2.jpeg";
import lapisImg from "../assets/images/lapis.jpeg";

const Home = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const teamMembers = [
    { name: "Jan Niño Caparida", role: "Project Manager", img: caparidaImg },
    { name: "Quennie Hazen Yongco", role: "Assistant Project Manager", img: yongcoImg },
    { name: "Joahness M. Caparas", role: "Lead Programmer", img: caparasImg },
    { name: "Kate Montilla", role: "Assistant Programmer", img: montillaImg },
    { name: "Jeremiah Toring", role: "System Analyst", img: toringImg },
    { name: "John Kinon Lapis", role: "Tester", img: lapisImg }
  ];

  // Scroll to section if state.scrollTo is set (when navigating from navbar)
  useEffect(() => {
    if (location.state && location.state.scrollTo) {
      const el = document.getElementById(location.state.scrollTo);
      if (el) {
        setTimeout(() => {
          el.scrollIntoView({ behavior: "smooth" });
        }, 100);
      }
    }
  }, [location]);

  return (
    <div className="home-root">
      {/* Hero Section */}
      <section className="hero" id="hero">
        <div className="hero-content">
          <h1>
            Welcome to <span className="brand">ResearchHub</span>
          </h1>
          <p className="hero-subtitle">
            Centralize your research.
            <br />
            Empower your future.
          </p>
          <button onClick={() => navigate("/role-selection")} className="hero-btn">
            Get Started
          </button>
        </div>
      </section>

      {/* About Section */}
      <section className="about" id="about">
        <h2>About Us</h2>
        <div className="about-bar"></div>
        <div className="about-content">
          <div className="about-text">
            <p>
              ResearchHub is a digital repository for final research projects, papers, and manuscripts.
              Our platform enables students to upload their completed research work and provides easy access for faculty and peers to browse, reference, and review studies.
              ResearchHub streamlines research management, supports long-term storage, and promotes collaboration within our academic community.
            </p>
            <ul>
              <li>
                <b>For Students:</b> Upload your final research papers and access a growing library of studies for reference.
              </li>
              <li>
                <b>For Admins:</b> Organize, monitor, and review research submissions sorted by statuses and categories.
              </li>
            </ul>
          </div>
          <div className="about-image"></div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-wrapper">
        <div className="features" id="features">
          <h2>Features</h2>
          <div className="features-bar"></div>
          <div className="features-list">
            <div className="feature-card">
              <div className="feature-icon">📄</div>
              <h3>Project Submission</h3>
              <p>Students can submit research projects with supporting documents.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">✅</div>
              <h3>Approval Workflow</h3>
              <p>Admins can review, approve, or reject submission with feedback.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">📚</div>
              <h3>Research Repository</h3>
              <p>Access approved research documentation and able to get references.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Our Team Section (ADDED) */}
      <section className="team" id="team">
        <h2>Our Team</h2>
        <div className="team-bar"></div>
        <p className="team-sub">Meet the people behind ResearchHub — developers, designers, and maintainers.</p>

        <div className="team-grid">
          {teamMembers.map((m, idx) => (
            <div className="team-card" key={idx}>
              <div className="team-photo-wrapper">
                <img src={m.img} alt={m.name} className="team-photo" />
              </div>
              <div className="team-info">
                <h4 className="team-name">{m.name}</h4>
                <p className="team-role">{m.role}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="footer-links">
          <div>
            <b>Quick Links</b>
            <ul>
              <li><Link to="/login">Login</Link></li>
              <li><Link to="/role-selection">Signup</Link></li>
            </ul>
          </div>
        </div>
        <div className="footer-copy">
          Copyright © {new Date().getFullYear()} ResearchHub. All rights reserved.
        </div>
      </footer>
    </div>
  );
};

export default Home;
