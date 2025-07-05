import React from "react";
import { Link } from "react-router-dom";
import "./Home.css";

const Home = () => (
  <div className="home-root">
    <section className="hero">
      <div className="hero-content">
        <h1>Welcome to <span className="brand">ResearchHub</span></h1>
        <p className="hero-subtitle">
          Power your research,<br />Fuel your future.
        </p>
        <Link to="/register" className="hero-btn">Get Started</Link>
      </div>
      <div className="hero-image" />
    </section>

    <section className="about">
      <h2>About Us</h2>
      <div className="about-bar"></div>
      <p>
        ResearchHub is a modern platform connecting students, teachers, and admins for research proposal submission and review. Our mission is to streamline the research process, making it easy for students to submit proposals and for faculty to manage and review them efficiently.
      </p>
      <ul>
        <li><b>For Students:</b> Seamlessly submit your research proposals and track their status.</li>
        <li><b>For Teachers/Admins:</b> Effortlessly review, approve, or reject proposals and provide feedback.</li>
      </ul>
      <div className="about-contact">
        <p><b>Contact:</b> researchhub@email.com</p>
        <p><b>Location:</b> Your University, Philippines</p>
      </div>
    </section>

    <section className="features">
      <h2>Features</h2>
      <div className="features-list">
        <div className="feature-card">
          <div className="feature-icon">📄</div>
          <h3>Project Proposal Submission</h3>
          <p>Students can submit research proposals with supporting documents.</p>
        </div>
        <div className="feature-card">
          <div className="feature-icon">✅</div>
          <h3>Approval Workflow</h3>
          <p>Teachers and admins can review, approve, or reject proposals with feedback.</p>
        </div>
        <div className="feature-card">
          <div className="feature-icon">📚</div>
          <h3>Research Repository</h3>
          <p>Access approved research documentation and track proposal status.</p>
        </div>
      </div>
    </section>

    <section className="contact">
      <h2>Contact Us</h2>
      <form className="contact-form" onSubmit={e => e.preventDefault()}>
        <label>
          Email
          <input type="email" placeholder="your@email.com" required />
        </label>
        <label>
          Message
          <textarea placeholder="Your message..." required />
        </label>
        <button type="submit">Send</button>
      </form>
    </section>

    <footer className="footer">
      <div className="footer-links">
        <div>
          <b>Quick Links</b>
          <ul>
            <li><Link to="/">Home</Link></li>
            <li><Link to="/login">Login</Link></li>
            <li><Link to="/register">Signup</Link></li>
          </ul>
        </div>
        <div>
          <b>Contact</b>
          <ul>
            <li>researchhub@email.com</li>
            <li>Philippines</li>
          </ul>
        </div>
        <div>
          <b>Social</b>
          <ul>
            <li><a href="https://facebook.com" target="_blank" rel="noopener noreferrer">Facebook</a></li>
            <li><a href="https://twitter.com" target="_blank" rel="noopener noreferrer">Twitter</a></li>
          </ul>
        </div>
      </div>
      <div className="footer-copy">
        Copyright © {new Date().getFullYear()} ResearchHub. All rights reserved.
      </div>
    </footer>
  </div>
);

export default Home;