import { Link } from 'react-router-dom'
import './Home.css'

function Home() {
  return (
    <div className="home">
      <header className="header">
        <div className="container">
          <Link to="/" className="logo-link">
            <h1 className="logo">I FALL</h1>
          </Link>
          <nav className="nav">
            <Link to="/how-it-works" className="nav-link">How It Works</Link>
            <Link to="/upload" className="nav-button">Find My Non-Followers</Link>
          </nav>
        </div>
      </header>

      <main>
        <section className="hero">
          <div className="container">
            <h1 className="hero-title">Your follows. Your clarity.</h1>
            <h2 className="hero-subtitle">Find out who doesn't follow you back.</h2>
            <p className="hero-description">
              Discover your Instagram follow relationships in minutes. No password required.
              Just your Instagram data export.
            </p>
            <div className="hero-actions">
              <Link to="/upload" className="btn btn-primary">Find My Non-Followers</Link>
              <Link to="/how-it-works" className="btn btn-secondary">How It Works</Link>
            </div>
          </div>
        </section>

        <section className="steps">
          <div className="container">
            <h2 className="section-title">Three simple steps</h2>
            <div className="steps-grid">
              <div className="step-card">
                <div className="step-number">1</div>
                <div className="step-icon">📥</div>
                <h3>Get your Instagram data</h3>
                <p>Request and download your data from Instagram. We'll guide you through it.</p>
              </div>
              <div className="step-card">
                <div className="step-number">2</div>
                <div className="step-icon">📁</div>
                <h3>Upload your file</h3>
                <p>Select the ZIP file you downloaded. You don't need to extract it.</p>
              </div>
              <div className="step-card">
                <div className="step-number">3</div>
                <div className="step-icon">🔍</div>
                <h3>Discover your results</h3>
                <p>We'll automatically compare and show you who doesn't follow you back.</p>
              </div>
            </div>
          </div>
        </section>

        <section className="privacy-note">
          <div className="container">
            <div className="privacy-card">
              <div className="privacy-icon">🔒</div>
              <div>
                <h3>Your data stays on your device.</h3>
                <p>I FALL analyzes your selected Instagram export directly in your browser. Your archive and extracted usernames are not uploaded to our servers.</p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="footer">
        <div className="container">
          <p className="footer-text">I FALL is not affiliated with or endorsed by Instagram or Meta.</p>
        </div>
      </footer>
    </div>
  )
}

export default Home
