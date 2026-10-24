import { useState } from 'react'
import { Link } from 'react-router-dom'
import Footer from '../components/Footer'
import './HowItWorks.css'

type Device = 'mobile' | 'computer'

interface Step {
  title: string
  description: string
}

const MOBILE_STEPS: Step[] = [
  {
    title: 'Open Instagram and go to your profile',
    description:
      'Open the Instagram app, sign in, and tap your profile picture in the bottom navigation.',
  },
  {
    title: 'Open the menu and Settings',
    description: 'Tap the menu in the top corner of your profile, then choose Settings.',
  },
  {
    title: 'Open Accounts Center',
    description:
      'In Settings, select Accounts Center. Instagram moves this around occasionally, so look for Accounts Center if the wording differs.',
  },
  {
    title: 'Open Your information and permissions',
    description:
      'Select "Your information and permissions", then tap "Export your information" (sometimes shown as "Download your information").',
  },
  {
    title: 'Create the export',
    description:
      'Tap "Create export" and pick the Instagram profile you want to analyse if you manage more than one.',
  },
  {
    title: 'Choose Export to device',
    description: 'Select "Export to device" rather than exporting to another service.',
  },
  {
    title: 'Select Followers and following',
    description:
      'Choose "Some of your information", then tick only Followers and following. That keeps the archive small and private.',
  },
  {
    title: 'Use All time and JSON',
    description:
      'Set the date range to All time and the format to JSON. If a media quality option appears, choose Low.',
  },
  {
    title: 'Start the export',
    description:
      'Confirm the request. Instagram prepares the archive in its own time, which can take hours or up to a couple of days.',
  },
  {
    title: 'Download the ZIP',
    description:
      'When Instagram notifies you, return to Accounts Center, open the export, and tap Download. Verify your identity if asked, then save the ZIP to your phone.',
  },
  {
    title: 'Come back to I FALL',
    description:
      'Upload the ZIP as-is. Do not extract it; the site finds the followers and following files itself.',
  },
]

const COMPUTER_STEPS: Step[] = [
  {
    title: 'Open Instagram in Chrome and log in',
    description:
      'Go to instagram.com in Chrome and sign in to the account you want to analyse.',
  },
  {
    title: 'Go to your profile',
    description: 'Click your profile picture or avatar to open your profile page.',
  },
  {
    title: 'Open More, then Settings',
    description:
      'Click "More" (the ☰ button in the bottom-left corner), then click Settings.',
  },
  {
    title: 'Open Accounts Center',
    description: 'Select Accounts Center from the Settings menu.',
  },
  {
    title: 'Your information and permissions',
    description:
      'Choose "Your information and permissions", then click "Export your information" (also labelled "Download your information").',
  },
  {
    title: 'Create the export',
    description:
      'Click "Create export" and select your Instagram profile if more than one is listed.',
  },
  {
    title: 'Choose Export to device',
    description: 'Pick "Export to device" so the archive is delivered to you as a download.',
  },
  {
    title: 'Select Followers and following',
    description:
      'Choose "Some of your information", then tick Followers and following only. Nothing else is needed.',
  },
  {
    title: 'Set the options',
    description:
      'Date range: All time. Format: JSON. Media quality: Low, if the option is shown. These settings are what I FALL expects.',
  },
  {
    title: 'Start the export',
    description:
      'Click "Start export". Instagram prepares the archive in the background and notifies you when it is ready.',
  },
  {
    title: 'Download the ZIP',
    description:
      'Return to Accounts Center, open the export, and click Download. Verify your identity if Instagram asks, then save the ZIP to your Downloads folder.',
  },
  {
    title: 'Come back to I FALL',
    description:
      'Choose the ZIP on the upload screen. Do not extract it; the app locates the follower and following files automatically.',
  },
]

const OPTIONS = [
  ['Information', 'Followers and following'],
  ['Date range', 'All time'],
  ['Format', 'JSON'],
  ['Media quality', 'Low, if requested'],
]

function HowItWorks() {
  const [device, setDevice] = useState<Device>('computer')
  const [currentStep, setCurrentStep] = useState(0)

  const steps = device === 'mobile' ? MOBILE_STEPS : COMPUTER_STEPS
  const stepIndex = Math.min(currentStep, steps.length - 1)
  const activeStep = steps[stepIndex]
  const progress = ((stepIndex + 1) / steps.length) * 100

  const changeDevice = (next: Device) => {
    const nextSteps = next === 'mobile' ? MOBILE_STEPS : COMPUTER_STEPS
    setDevice(next)
    setCurrentStep((index) => Math.min(index, nextSteps.length - 1))
  }

  return (
    <div className="howitworks">
      <header className="header">
        <div className="container header-inner">
          <Link to="/" className="logo-link">
            <span className="logo">I FALL</span>
          </Link>
          <nav className="nav" aria-label="Main">
            <Link to="/" className="nav-link">
              Home
            </Link>
            <Link to="/upload" className="nav-button">
              Get started
            </Link>
          </nav>
        </div>
      </header>

      <main>
        <section className="tutorial-header">
          <div className="container">
            <h1 className="tutorial-title">How to download your Instagram data</h1>
            <p className="tutorial-subtitle">
              Follow the steps for your device. When you finish you will have a ZIP file to bring
              back here. I FALL never asks for your Instagram password.
            </p>
          </div>
        </section>

        <section className="tutorial-content">
          <div className="container">
            <div className="device-toggle" role="group" aria-label="Choose your device">
              <button
                type="button"
                className={`toggle-btn ${device === 'computer' ? 'is-active' : ''}`}
                aria-pressed={device === 'computer'}
                onClick={() => changeDevice('computer')}
              >
                <span aria-hidden="true">💻</span> Computer
              </button>
              <button
                type="button"
                className={`toggle-btn ${device === 'mobile' ? 'is-active' : ''}`}
                aria-pressed={device === 'mobile'}
                onClick={() => changeDevice('mobile')}
              >
                <span aria-hidden="true">📱</span> Mobile app
              </button>
            </div>

            <div className="progress-wrap">
              <div className="progress-indicator">
                <span>
                  Step {stepIndex + 1} of {steps.length}
                </span>
                <span className="progress-percent">{Math.round(progress)}%</span>
              </div>
              <div
                className="progress-track"
                role="progressbar"
                aria-valuemin={1}
                aria-valuemax={steps.length}
                aria-valuenow={stepIndex + 1}
                aria-label="Tutorial progress"
              >
                <div className="progress-fill" style={{ width: `${progress}%` }} />
              </div>
            </div>

            <ol className="steps-list">
              {steps.map((step, index) => {
                const isActive = index === stepIndex
                return (
                  <li key={step.title}>
                    <button
                      type="button"
                      className={`tutorial-step ${isActive ? 'is-active' : ''}`}
                      aria-expanded={isActive}
                      aria-current={isActive ? 'step' : undefined}
                      onClick={() => setCurrentStep(index)}
                    >
                      <span className="step-header">
                        <span className="step-number-badge">{index + 1}</span>
                        <span className="step-title">{step.title}</span>
                      </span>
                      {isActive && <span className="step-description">{step.description}</span>}
                    </button>
                  </li>
                )
              })}
            </ol>

            <div className="tutorial-actions">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setCurrentStep(Math.max(0, stepIndex - 1))}
                disabled={stepIndex === 0}
              >
                <span aria-hidden="true">←</span> Previous
              </button>
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => setCurrentStep(Math.min(steps.length - 1, stepIndex + 1))}
                disabled={stepIndex === steps.length - 1}
              >
                Next <span aria-hidden="true">→</span>
              </button>
            </div>

            <p className="step-announcement" aria-live="polite">
              {activeStep.title}
            </p>

            <div className="options-card">
              <h2>Use exactly these options</h2>
              <table>
                <tbody>
                  {OPTIONS.map(([setting, value]) => (
                    <tr key={setting}>
                      <th scope="row">{setting}</th>
                      <td>{value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="tips-grid">
              <div className="info-card">
                <h2>📱 Finding the download</h2>
                <ul>
                  <li>Check Downloads, Recent files, or wherever your browser saves files.</li>
                  <li>The file is usually named <code>instagram-username-YYYY-MM-DD.zip</code>.</li>
                  <li>Android and iPhone file screens differ, so use the generic folders above.</li>
                </ul>
              </div>

              <div className="info-card">
                <h2>✅ Ready to upload?</h2>
                <ul>
                  <li>The file ends in <strong>.zip</strong></li>
                  <li>It was exported as JSON, not HTML</li>
                  <li>It contains both followers and following</li>
                  <li>You have not extracted it</li>
                </ul>
              </div>

              <div className="info-card">
                <h2>🔒 Keep it private</h2>
                <ul>
                  <li>Export only followers and following, not your whole account history.</li>
                  <li>An export can contain personal information; keep it off shared machines.</li>
                  <li>I FALL reads the file locally and never uploads it.</li>
                </ul>
              </div>
            </div>

            <div className="continue-section">
              <Link to="/upload" className="btn btn-primary btn-large">
                Continue to upload
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}

export default HowItWorks
