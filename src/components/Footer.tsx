import { Link } from 'react-router-dom'
import profilePic from '../assets/varun-profile.jpg'
import './Footer.css'

const INSTAGRAM_URL = 'https://www.instagram.com/mr_varun_c/'
const LINKEDIN_URL = 'https://www.linkedin.com/in/mrvarunc/'

function InstagramIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.2" cy="6.8" r="1.2" fill="currentColor" stroke="none" />
    </svg>
  )
}

function LinkedInIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M4.98 3.5a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5ZM3 9h4v12H3V9Zm7 0h3.8v1.7h.05c.53-1 1.83-2.05 3.76-2.05C21.3 8.65 22 11 22 14.1V21h-4v-6.1c0-1.45-.03-3.32-2.02-3.32-2.02 0-2.33 1.58-2.33 3.21V21h-4V9Z" />
    </svg>
  )
}

function Footer() {
  return (
    <footer className="site-footer">
      <div className="container footer-inner">
        <div className="footer-hero">
          <div className="footer-brand">
            <div className="footer-portrait-wrap">
              <img
                className="footer-portrait"
                src={profilePic}
                alt="Varun C"
                width={168}
                height={168}
                loading="lazy"
              />
              <span className="footer-badge" aria-hidden="true">
                ✦
              </span>
            </div>

            <div className="footer-brand-text">
              <p className="footer-kicker">
                <span aria-hidden="true">✦</span> A Varun C Creation
              </p>
              <Link to="/" className="footer-logo">
                I FALL
              </Link>
              <p className="footer-tagline">
                Making technology simple, accessible, and useful.
              </p>
              <p className="footer-byline">
                Designed &amp; developed by <strong>Varun C</strong> — developer, Electronics &amp;
                Communication Engineering student, and tech enthusiast.
              </p>
            </div>
          </div>

          <div className="footer-connect">
            <h2 className="footer-connect-title">Connect with the developer</h2>

            <a
              className="social-card"
              href={INSTAGRAM_URL}
              target="_blank"
              rel="noopener noreferrer"
            >
              <span className="social-icon social-icon-instagram">
                <InstagramIcon />
              </span>
              <span className="social-text">
                <span className="social-label">Instagram</span>
                <span className="social-handle">@mr_varun_c</span>
              </span>
              <span className="social-arrow" aria-hidden="true">
                ↗
              </span>
            </a>

            <a className="social-card" href={LINKEDIN_URL} target="_blank" rel="noopener noreferrer">
              <span className="social-icon social-icon-linkedin">
                <LinkedInIcon />
              </span>
              <span className="social-text">
                <span className="social-label">LinkedIn</span>
                <span className="social-handle">Varun C</span>
              </span>
              <span className="social-arrow" aria-hidden="true">
                ↗
              </span>
            </a>
          </div>
        </div>

        <div className="footer-bottom">
          <p className="footer-copyright">&copy; 2026 Varun C. All rights reserved.</p>
          <p className="footer-disclaimer">
            I FALL is not affiliated with or endorsed by Instagram or Meta.
          </p>
        </div>
      </div>
    </footer>
  )
}

export default Footer
