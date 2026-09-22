import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const roles = [
  {
    label: "Customer portal",
    text: "Track your AMC, visits, payments, and service history.",
    to: "/login",
  },
  {
    label: "Technician workspace",
    text: "Manage today's jobs, complaints, parts, and completion notes.",
    to: "/login",
  },
  {
    label: "Admin control room",
    text: "See contracts, revenue, alerts, teams, and operations in one view.",
    to: "/login",
  },
];

export default function Landing() {
  const { user } = useAuth();

  return (
    <main className="landing-page">
      <nav className="landing-nav">
        <Link to="/" className="landing-brand">
          <span className="landing-mark">DC</span>
          <span>
            <strong>Dynamic Cooling</strong>
            <small>AMC Management</small>
          </span>
        </Link>
        <div className="landing-nav-actions">
          <a href="#services">Services</a>
          <a href="#portals">Portals</a>
          <Link className="landing-login" to={user ? "/admin" : "/login"}>
            {user ? "Open dashboard" : "Sign in"} <span>↗</span>
          </Link>
        </div>
      </nav>

      <section className="landing-hero">
        <div className="landing-hero-copy">
          <p className="landing-kicker">
            <span /> Vapi's appliance care team
          </p>
          <h1>
            Comfort that stays <em>on schedule.</em>
          </h1>
          <p className="landing-lede">
            Annual maintenance for the machines your business and home depend
            on. Clear plans, faster visits, and a team that remembers the
            details.
          </p>
          <div className="landing-actions">
            <Link className="landing-primary" to="/register">
              Start your AMC <span>↗</span>
            </Link>
            <Link className="landing-secondary" to="/login">
              View your service portal
            </Link>
          </div>
          <div className="landing-proof">
            <strong>12+</strong>
            <span>active plans in demo</span>
            <i /> <strong>4.3/5</strong>
            <span>customer rating</span>
          </div>
        </div>
        <div
          className="landing-visual"
          aria-label="Cooling service dashboard preview"
        >
          <div className="visual-glow" />
          <div className="visual-topline">
            <span>LIVE SERVICE DESK</span>
            <span className="live-dot">● Online</span>
          </div>
          <div className="cooling-unit">
            <div className="unit-vents">
              <i />
              <i />
              <i />
              <i />
              <i />
            </div>
            <div className="unit-display">
              22° <small>COOL</small>
            </div>
            <div className="unit-logo">DC</div>
          </div>
          <div className="visual-ticket visual-ticket-one">
            <span className="ticket-icon">✓</span>
            <span>
              <b>Routine service complete</b>
              <small>Today · Technician verified</small>
            </span>
          </div>
          <div className="visual-ticket visual-ticket-two">
            <span className="ticket-icon orange">↗</span>
            <span>
              <b>Next visit scheduled</b>
              <small>Thursday · 10:30 AM</small>
            </span>
          </div>
          <div className="visual-orbit orbit-one" />
          <div className="visual-orbit orbit-two" />
        </div>
      </section>

      <section className="landing-services" id="services">
        <div className="landing-section-heading">
          <p className="landing-kicker">
            <span /> One calm system
          </p>
          <h2>From first call to final check.</h2>
        </div>
        <div className="service-grid">
          <article>
            <b>01</b>
            <h3>Preventive care</h3>
            <p>
              Scheduled maintenance that catches small issues before they become
              expensive downtime.
            </p>
          </article>
          <article>
            <b>02</b>
            <h3>Fast response</h3>
            <p>
              Zone-based technician assignment gets the right person to the
              right appliance sooner.
            </p>
          </article>
          <article>
            <b>03</b>
            <h3>Proof in every visit</h3>
            <p>
              Photos, notes, signatures, parts, and invoices stay together in
              one service record.
            </p>
          </article>
        </div>
      </section>

      <section className="landing-portals" id="portals">
        <div>
          <p className="landing-kicker">
            <span /> Built for every handoff
          </p>
          <h2>
            One service story.
            <br />
            <em>Three clear views.</em>
          </h2>
        </div>
        <div className="portal-list">
          {roles.map((role) => (
            <Link to={role.to} key={role.label}>
              <span>
                <b>{role.label}</b>
                <small>{role.text}</small>
              </span>
              <strong>↗</strong>
            </Link>
          ))}
        </div>
      </section>
      <footer className="landing-footer">
        <span>Dynamic Cooling System</span>
        <span>Vapi, Gujarat · Reliable care for every season</span>
      </footer>
    </main>
  );
}
