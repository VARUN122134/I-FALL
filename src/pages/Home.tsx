import { Link } from 'react-router-dom'
import Footer from '../components/Footer'
import './Home.css'

const CHECKS = ['No password', 'No upload', 'No tracking']

const CATEGORIES = [
  { name: 'Followers', detail: 'Everyone who follows you.' },
  { name: 'Following', detail: 'Everyone you follow.' },
  { name: 'Mutuals', detail: 'People you follow who follow you back.' },
  { name: "Doesn't follow back", detail: "People you follow who don't follow you." },
  { name: 'Fans', detail: "People who follow you, but whom you don't follow back." },
]

function Home() {
  return (
    <div className="home">
      <header className="header">
        <div className="container header-inner">
          <Link to="/" className="logo-link">
            <span className="logo">I FALL</span>
          </Link>
          <nav className="nav" aria-label="Main">
            <Link to="/how-it-works" className="nav-link">
              How it works
            </Link>
            <Link to="/upload" className="nav-button">
              Find my non-followers
            </Link>
          </nav>
        </div>
      </header>

      <main>
        <section className="hero">
          <div className="container hero-inner">
            <p className="eyebrow">Instagram follower analysis, done privately</p>
            <h1 className="hero-title">Your follows. Your clarity.</h1>
            <p className="hero-subtitle">Find out who doesn&rsquo;t follow you back.</p>
            <p className="hero-description">
              Discover your Instagram follow relationships in minutes. No password required &mdash;
              just the data export Instagram already lets you download.
            </p>
            <div className="hero-actions">
              <Link to="/upload" className="btn btn-primary btn-large">
                Find my non-followers
              </Link>
              <Link to="/how-it-works" className="btn btn-secondary btn-large">
                How it works
              </Link>
            </div>
            <ul className="hero-checks">
              {CHECKS.map((check) => (
                <li key={check}>
                  <span aria-hidden="true">✓</span> {check}
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section className="steps">
          <div className="container">
            <h2 className="section-title">Three simple steps</h2>
            <p className="section-subtitle">
              You never share a login. The comparison runs inside your browser.
            </p>
            <div className="steps-grid">
              <div className="step-card">
                <div className="step-number">1</div>
                <div className="step-icon" aria-hidden="true">
                  📥
                </div>
                <h3>Get your Instagram data</h3>
                <p>
                  Request your export from Instagram&rsquo;s Accounts Center. Our guide walks you
                  through every screen.
                </p>
              </div>
              <div className="step-card">
                <div className="step-number">2</div>
                <div className="step-icon" aria-hidden="true">
                  📁
                </div>
                <h3>Upload the ZIP</h3>
                <p>
                  Select the ZIP exactly as Instagram sent it. Nothing is extracted and nothing is
                  uploaded to a server.
                </p>
              </div>
              <div className="step-card">
                <div className="step-number">3</div>
                <div className="step-icon" aria-hidden="true">
                  🔍
                </div>
                <h3>See your results</h3>
                <p>
                  Compare followers, following, mutuals, fans and who doesn&rsquo;t follow back.
                  Search the lists and export them as CSV.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="categories">
          <div className="container">
            <h2 className="section-title">Five lists, one clear picture</h2>
            <p className="section-subtitle">
              Every category comes with a total count, profile links and search.
            </p>
            <div className="categories-grid">
              {CATEGORIES.map((category) => (
                <div className="category-card" key={category.name}>
                  <h3>{category.name}</h3>
                  <p>{category.detail}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="privacy-note">
          <div className="container">
            <div className="privacy-card">
              <span className="privacy-icon" aria-hidden="true">
                🔒
              </span>
              <div>
                <h3>Your data stays on your device.</h3>
                <p>
                  I FALL reads your archive and compares the two lists inside this browser tab. Your
                  file and the usernames inside it are never sent anywhere.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}

export default Home
