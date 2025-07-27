import React, { useEffect } from "react";
import { useLocation, Link } from "react-router-dom";
import "./Home.css";

const Home = () => {
  const location = useLocation();

  // Scroll to section if state.scrollTo is set (when navigating from navbar)
  useEffect(() => {
    if (location.state && location.state.scrollTo) {
      const el = document.getElementById(location.state.scrollTo);
      if (el) {
        setTimeout(() => {
          el.scrollIntoView({ behavior: "smooth" });
        }, 100); // slight delay to ensure DOM is ready
      }
    }
  }, [location]);

  return (
    <div className="home-root">
      <section className="hero" id="hero">
        <div className="hero-content">
          <h1>Welcome to <span className="brand">ResearchHub</span></h1>
          <p className="hero-subtitle">
            Centralize your research.<br />Empower your future.
          </p>
          <Link to="/login" className="hero-btn">Get Started</Link>
        </div>
      </section>

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
              <li><b>For Students:</b> Upload your final research papers and access a growing library of studies for reference.</li>
              <li><b>For Admins:</b> Organize, monitor, and review research submissions sorted by categories.</li>
            </ul>
          </div>
          <div className="about-image"></div>
        </div>
      </section>


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


     <section className="contact" id="contact">
      <h2>Contact Us</h2>
      <div className="contact-bar"></div>

      <div className="contact-content">
        <div className="contact-text">
          <p>If you have any questions, suggestions, or issues, feel free to reach out. We're here to help!</p>
           <    div className="contacts">
            <p><b>Email:</b> researchhub@email.com</p>
            <p><b>Location:</b> Your University, Philippines</p>
           </div>
        </div>

       <form className="contact-form" onSubmit={(e) => e.preventDefault()}>
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
      </div>
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
};

export default Home;