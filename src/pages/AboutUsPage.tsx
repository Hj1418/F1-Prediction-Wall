import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Target,
  Sliders,
  Brain,
  Calendar,
  ArrowRight,
  MessageCircle,
  Trophy,
} from 'lucide-react';
import './AboutUsPage.css';

export const AboutUsPage: React.FC = () => {
  useEffect(() => {
    document.title = 'About Us | THE GRDX';
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="about-page-root">
      <div className="about-container">
        
        {/* ===================================================================
            1. HERO SECTION (WIDE, LEFT-ALIGNED, TYPOGRAPHIC)
            =================================================================== */}
        <section className="about-hero" aria-label="About THE GRDX Introduction">
          <span className="about-hero__eyebrow">ABOUT THE GRDX</span>

          <h1 className="about-hero__title">
            Built for the passion. <br />
            Driven by the community.
          </h1>

          <p className="about-hero__desc">
            THE GRDX is a motorsport community built to make following racing more interactive, analytical, and collaborative. From predictions and racing knowledge to strategy challenges, the goal is to bring fans closer to the sport and to each other.
          </p>

          <div className="about-hero__actions">
            <a href="#platform-overview" className="about-btn-primary">
              <span>Explore the Platform</span>
              <ArrowRight size={15} />
            </a>

            <a href="#team" className="about-btn-secondary">
              <span>Meet the Team</span>
            </a>
          </div>
        </section>

        <hr className="about-divider" />

        {/* ===================================================================
            2. PLATFORM OVERVIEW (OPEN, RESTRAINED GRID)
            =================================================================== */}
        <section id="platform-overview" aria-label="Platform Overview">
          <h2 className="about-section-title">More than just watching the race.</h2>
          <p className="about-section-desc">
            THE GRDX brings together different ways to experience motorsport, from competing on predictions to exploring the strategy behind every decision.
          </p>

          <div className="about-feature-grid">
            {/* Feature 1: Prediction Bench */}
            <div className="about-feature-item">
              <div className="about-feature-item__icon">
                <Target size={22} />
              </div>
              <h3 className="about-feature-item__title">Prediction Bench</h3>
              <p className="about-feature-item__desc">
                Make race predictions and compete with the community. Predict podiums, pole positions, safety cars, and wildcards with official race scoring.
              </p>
              <Link to="/predictions" className="about-feature-item__link">
                <span>Explore Predictions</span>
                <ArrowRight size={13} />
              </Link>
            </div>

            {/* Feature 2: Strategy Room */}
            <div className="about-feature-item">
              <div className="about-feature-item__icon">
                <Sliders size={22} />
              </div>
              <h3 className="about-feature-item__title">Strategy Room</h3>
              <p className="about-feature-item__desc">
                Explore racing strategy through simulated scenarios and tactical decisions like pit windows, undercuts, and compound choices.
              </p>
              <Link to="/strategy" className="about-feature-item__link">
                <span>Explore Strategy</span>
                <ArrowRight size={13} />
              </Link>
            </div>

            {/* Feature 3: Racing Tag */}
            <div className="about-feature-item">
              <div className="about-feature-item__icon">
                <Brain size={22} />
              </div>
              <h3 className="about-feature-item__title">Racing Tag</h3>
              <p className="about-feature-item__desc">
                Test motorsport knowledge and challenge yourself across difficulty levels with verified regulation questions to earn dynamic racing tags.
              </p>
              <Link to="/quiz" className="about-feature-item__link">
                <span>Take Challenge</span>
                <ArrowRight size={13} />
              </Link>
            </div>

            {/* Feature 4: Racing Hub & Calendar */}
            <div className="about-feature-item">
              <div className="about-feature-item__icon">
                <Calendar size={22} />
              </div>
              <h3 className="about-feature-item__title">Racing Hub & Calendar</h3>
              <p className="about-feature-item__desc">
                Explore racing schedules, race weekends, and motorsport information across F1, Feeder series, Formula E, WEC, MotoGP, WRC, and Indian Motorsport.
              </p>
              <Link to="/calendar" className="about-feature-item__link">
                <span>View Calendar</span>
                <ArrowRight size={13} />
              </Link>
            </div>
          </div>
        </section>

        <hr className="about-divider" />

        {/* ===================================================================
            3. MEET THE TEAM (TWO PROFILES SIDE BY SIDE)
            =================================================================== */}
        <section id="team" aria-label="Meet The Team">
          <h2 className="about-section-title">Meet the team</h2>
          <p className="about-section-desc">
            Built with curiosity, improved through collaboration, and driven by a shared passion for motorsport.
          </p>

          <div className="about-team-grid">
            {/* Harsh Jalnekar */}
            <div className="about-profile">
              <div className="about-profile__header">
                <div className="about-profile__avatar">
                  HJ
                </div>
                <div>
                  <h3 className="about-profile__name">Harsh Jalnekar</h3>
                  <span className="about-profile__role">Founder & Developer</span>
                </div>
              </div>

              <div className="about-profile__bio">
                <p>
                  THE GRDX started with a simple idea: to create a space where motorsport fans could do more than just watch races. As the founder and developer behind the platform, Harsh Jalnekar works on building, maintaining, and improving its features, from interactive predictions and motorsport knowledge challenges to strategy-based experiences.
                </p>
                <p>
                  The goal is to keep learning, experimenting, and evolving THE GRDX into a better experience for the motorsport community.
                </p>
              </div>
            </div>

            {/* Purvesha Khilare */}
            <div className="about-profile">
              <div className="about-profile__header">
                <div className="about-profile__avatar">
                  PK
                </div>
                <div>
                  <h3 className="about-profile__name">Purvesha Khilare</h3>
                  <span className="about-profile__role about-profile__role--advisor">Advisor & Contributor</span>
                </div>
              </div>

              <div className="about-profile__bio">
                <p>
                  Purvesha Khilare has contributed to the evolution of THE GRDX by sharing ideas, suggestions, and feedback that help improve the overall platform experience. Her input helps refine existing features and identify opportunities to make the platform more engaging and useful for the community.
                </p>
                <p>
                  Her input helps refine existing features and identify opportunities to make the platform more engaging and useful for the community.
                </p>
              </div>
            </div>
          </div>
        </section>

        <hr className="about-divider" />

        {/* ===================================================================
            4. OUR VISION
            =================================================================== */}
        <section aria-label="Our Vision">
          <div className="about-vision-content">
            <h2 className="about-section-title">Our vision</h2>
            <p className="about-vision-text">
              The vision is to build a motorsport community where fans can learn, compete, share ideas, and experience the strategic side of racing together. THE GRDX will continue to evolve through experimentation, community feedback, and a shared passion for motorsport.
            </p>
          </div>
        </section>

        <hr className="about-divider" />

        {/* ===================================================================
            5. COMMUNITY FEEDBACK (CLOSING SECTION)
            =================================================================== */}
        <section aria-label="Community Feedback">
          <div className="about-closing-content">
            <h2 className="about-section-title">Help shape what's next.</h2>
            <p className="about-closing-text">
              THE GRDX is continuously evolving, and community feedback plays an important role in shaping what comes next. Explore the platform, try its features, share your ideas, and help make the experience better for every motorsport fan.
            </p>

            <div className="about-closing-actions">
              <a
                href="mailto:thepaddockprediction14@gmail.com?subject=The%20GRDX%20Feedback"
                className="about-btn-primary"
              >
                <MessageCircle size={15} />
                <span>Share Feedback</span>
              </a>

              <Link to="/predictions" className="about-btn-secondary">
                <Trophy size={15} />
                <span>Explore Compete</span>
              </Link>
            </div>
          </div>
        </section>

      </div>
    </div>
  );
};

export default AboutUsPage;
