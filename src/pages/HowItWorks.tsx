import { Link } from 'react-router-dom'
import { useState } from 'react'
import './HowItWorks.css'

function HowItWorks() {
  const [device, setDevice] = useState<'mobile' | 'computer'>('mobile')
  const [currentStep, setCurrentStep] = useState(1)

  const mobileSteps = [
    { number: 1, title: 'Open Instagram', description: 'Open the official Instagram app and sign in normally.' },
    { number: 2, title: 'Open your profile', description: 'Tap your profile picture in the bottom navigation.' },
    { number: 3, title: 'Open the Accounts Center', description: 'Open the menu on your profile and select Accounts Center. Instagram\'s interface may change, so look for Accounts Center if the menu differs.' },
    { number: 4, title: 'Find information download', description: 'In Accounts Center, look for "Your information and permissions" then select the option for downloading or exporting your information.' },
    { number: 5, title: 'Request a download', description: 'Select to download or export information. If asked which profile, choose the one you want to analyze. Choose download option if asked between downloading and transferring.' },
    { number: 6, title: 'Select information', description: 'If you can choose specific info, select followers and following. If not, download the broader account information. Choose all available time or widest range.' },
    { number: 7, title: 'Choose format', description: 'If format can be selected, choose JSON. If JSON not offered, HTML may work - the site supports it where possible.' },
    { number: 8, title: 'Submit request', description: 'Confirm the request and wait. Preparation may take some time - you may need to return later.' },
    { number: 9, title: 'Download the archive', description: 'When notified it\'s ready, go back to download area in Accounts Center and download the archive. It will usually be a ZIP file.' },
    { number: 10, title: 'Return to I FALL', description: 'Open I FALL again and select the downloaded ZIP file. Don\'t extract it - the site will locate files automatically.' },
  ]

  const computerSteps = [
    { number: 1, title: 'Open Instagram in browser', description: 'Open Instagram in a browser and sign in.' },
    { number: 2, title: 'Open Accounts Center', description: 'Open the profile menu and navigate to Accounts Center.' },
    { number: 3, title: 'Find download option', description: 'Find "Your information and permissions" and select the download/export information option.' },
    { number: 4, title: 'Choose profile', description: 'Choose the relevant Instagram profile.' },
    { number: 5, title: 'Select information', description: 'Select followers and following if selective export is available.' },
    { number: 6, title: 'Choose format', description: 'Choose JSON if offered.' },
    { number: 7, title: 'Request archive', description: 'Request the archive.' },
    { number: 8, title: 'Wait for preparation', description: 'Wait for Instagram to prepare it.' },
    { number: 9, title: 'Download ZIP', description: 'Download the resulting ZIP file to your computer.' },
    { number: 10, title: 'Return to I FALL', description: 'Return to I FALL, click the upload area and select the downloaded ZIP file.' },
  ]

  const steps = device === 'mobile' ? mobileSteps : computerSteps

  return (
    <div className="howitworks">
      <header className="header">
        <div className="container">
          <Link to="/" className="logo-link">
            <h1 className="logo">I FALL</h1>
          </Link>
          <nav className="nav">
            <Link to="/" className="nav-link">Home</Link>
            <Link to="/upload" className="nav-button">Get Started</Link>
          </nav>
        </div>
      </header>

      <main>
        <section className="tutorial-header">
          <div className="container">
            <h1 className="tutorial-title">How to Download Your Instagram Data</h1>
            <p className="tutorial-subtitle">Follow these steps to get your export file, then upload it to I FALL</p>
          </div>
        </section>

        <section className="tutorial-content">
          <div className="container">
            <div className="device-toggle">
              <button
                className={`toggle-btn ${device === 'mobile' ? 'active' : ''}`}
                onClick={() => { setDevice('mobile'); setCurrentStep(1) }}
              >
                📱 Mobile App
              </button>
              <button
                className={`toggle-btn ${device === 'computer' ? 'active' : ''}`}
                onClick={() => { setDevice('computer'); setCurrentStep(1) }}
              >
                💻 Computer
              </button>
            </div>

            <div className="progress-indicator">
              Step {currentStep} of {steps.length}
            </div>

            <div className="steps-list">
              {steps.map((step) => (
                <div
                  key={step.number}
                  className={`tutorial-step ${currentStep === step.number ? 'active' : ''}`}
                  onClick={() => setCurrentStep(step.number)}
                >
                  <div className="step-header">
                    <div className="step-number-badge">{step.number}</div>
                    <h3>{step.title}</h3>
                  </div>
                  {currentStep === step.number && (
                    <p className="step-description">{step.description}</p>
                  )}
                </div>
              ))}
            </div>

            <div className="tutorial-actions">
              <button
                className="btn btn-secondary"
                onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
                disabled={currentStep === 1}
              >
                ← Previous
              </button>
              <button
                className="btn btn-secondary"
                onClick={() => setCurrentStep(Math.min(steps.length, currentStep + 1))}
                disabled={currentStep === steps.length}
              >
                Next →
              </button>
            </div>

            <div className="mobile-tips">
              <h3>📱 Mobile Tips</h3>
              <ul>
                <li>When the file picker opens, look in Downloads, Recent files, or where your browser saves files</li>
                <li>File management screens vary by Android/iPhone - look for generic options</li>
                <li>The downloaded file will usually be a ZIP file</li>
              </ul>
            </div>

            <div className="checklist">
              <h3>✅ Final Checklist</h3>
              <p>Before uploading to I FALL, make sure you have:</p>
              <ul>
                <li>Downloaded the ZIP file from Instagram</li>
                <li>Don't need to extract it - upload as-is</li>
                <li>It's ready to upload from your device</li>
              </ul>
            </div>

            <div className="continue-section">
              <Link to="/upload" className="btn btn-primary btn-large">Continue to Upload</Link>
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

export default HowItWorks
