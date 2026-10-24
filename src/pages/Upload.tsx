import { useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  AnalysisError,
  MAX_ARCHIVE_BYTES,
  analyzeArchive,
} from '../utils/instagramParser'
import { saveResult } from '../utils/resultStore'
import Footer from '../components/Footer'
import './Upload.css'

interface Problems {
  message: string
  hint: string
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`
}

function validateFile(file: File): Problems | null {
  if (!/\.zip$/i.test(file.name)) {
    return {
      message: "That doesn't look like an Instagram data export.",
      hint: 'Choose the ZIP file Instagram gave you. It usually ends in .zip.',
    }
  }
  if (file.size === 0) {
    return {
      message: 'That file is empty.',
      hint: 'The download may have failed. Try downloading the archive from Instagram again.',
    }
  }
  if (file.size > MAX_ARCHIVE_BYTES) {
    return {
      message: `That archive is ${formatBytes(file.size)}, which is over the 100 MB limit.`,
      hint: 'When you request your export, untick photos and videos. You only need followers and following.',
    }
  }
  return null
}

function describeFailure(error: unknown): Problems {
  if (error instanceof AnalysisError) {
    switch (error.code) {
      case 'NOT_A_ZIP':
        return {
          message: 'That file is not a ZIP archive.',
          hint: 'Choose the .zip file from Instagram, not an extracted folder or a JSON file.',
        }
      case 'TOO_LARGE':
        return {
          message: 'This file is larger than the 100 MB limit.',
          hint: 'Request the export again with only "Followers and following" selected.',
        }
      case 'EMPTY_ARCHIVE':
        return {
          message: 'That file is empty.',
          hint: 'Download the archive from Instagram again and retry.',
        }
      case 'MISSING_FOLLOWERS':
        return {
          message: "We couldn't find your followers in this archive.",
          hint: 'Re-request your export and make sure connections (followers and following) are included.',
        }
      case 'MISSING_FOLLOWING':
        return {
          message: "We couldn't find the accounts you follow in this archive.",
          hint: 'Re-request your export and make sure connections (followers and following) are included.',
        }
      case 'EMPTY_FOLLOWERS':
        return {
          message: 'Your followers list is empty in this export.',
          hint: 'This usually means the export was cut short. Request a new one covering all time.',
        }
      case 'EMPTY_FOLLOWING':
        return {
          message: 'The list of accounts you follow is empty in this export.',
          hint: 'Request a new export covering all time, then upload that ZIP.',
        }
      case 'UNREADABLE':
        return {
          message: "We couldn't read this export.",
          hint: 'Make sure you chose JSON as the export format, then upload the ZIP Instagram emailed you.',
        }
    }
  }

  return {
    message: 'Something went wrong while reading the file.',
    hint: 'Your file was never uploaded anywhere. Try again, or download a fresh export.',
  }
}

function Upload() {
  const navigate = useNavigate()
  const inputRef = useRef<HTMLInputElement>(null)
  const [file, setFile] = useState<File | null>(null)
  const [dragging, setDragging] = useState(false)
  const [problems, setProblems] = useState<Problems | null>(null)
  const [working, setWorking] = useState(false)
  const [percent, setPercent] = useState(0)
  const [status, setStatus] = useState('')

  const openPicker = () => {
    if (working) return
    inputRef.current?.click()
  }

  const accept = (candidate: File | undefined) => {
    if (!candidate) return

    const problem = validateFile(candidate)
    if (problem) {
      setProblems(problem)
      setFile(null)
      return
    }

    setProblems(null)
    setFile(candidate)
  }

  const onDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    setDragging(false)
    if (working) return
    accept(event.dataTransfer.files[0])
  }

  const runAnalysis = async () => {
    if (!file || working) return

    setWorking(true)
    setProblems(null)
    setPercent(0)
    setStatus('Reading ZIP file…')

    try {
      const result = await analyzeArchive(file, (value, label) => {
        setPercent(value)
        setStatus(label)
      })
      saveResult(result)
      navigate('/results')
    } catch (error) {
      setProblems(describeFailure(error))
      setWorking(false)
    }
  }

  return (
    <div className="upload">
      <header className="header">
        <div className="container header-inner">
          <Link to="/" className="logo-link">
            <span className="logo">I FALL</span>
          </Link>
          <nav className="nav" aria-label="Main">
            <Link to="/how-it-works" className="nav-link">
              How it works
            </Link>
            <Link to="/" className="nav-link">
              Home
            </Link>
          </nav>
        </div>
      </header>

      <main>
        <section className="upload-header">
          <div className="container">
            <h1 className="upload-title">Got your Instagram file? Let&rsquo;s find your results.</h1>
            <p className="upload-subtitle">
              Upload the ZIP file you downloaded from Instagram. We&rsquo;ll find your followers,
              following, mutuals and fans automatically.
            </p>
          </div>
        </section>

        <section className="upload-content">
          <div className="container upload-grid">
            <div className="upload-main">
              <div
                className={`dropzone ${dragging ? 'is-dragging' : ''} ${file ? 'has-file' : ''}`}
                onDragEnter={(event) => {
                  event.preventDefault()
                  if (!working) setDragging(true)
                }}
                onDragOver={(event) => event.preventDefault()}
                onDragLeave={(event) => {
                  event.preventDefault()
                  setDragging(false)
                }}
                onDrop={onDrop}
                onClick={openPicker}
              >
                <input
                  ref={inputRef}
                  type="file"
                  accept=".zip,application/zip,application/x-zip-compressed"
                  className="visually-hidden"
                  onChange={(event) => accept(event.target.files?.[0])}
                  disabled={working}
                />

                {file ? (
                  <div className="file-card">
                    <div className="file-icon" aria-hidden="true">
                      🗜️
                    </div>
                    <div className="file-meta">
                      <strong title={file.name}>{file.name}</strong>
                      <span>{formatBytes(file.size)} · ready to analyze</span>
                    </div>
                    {!working && (
                      <button
                        type="button"
                        className="btn-ghost"
                        onClick={(event) => {
                          event.stopPropagation()
                          setFile(null)
                          setProblems(null)
                          setPercent(0)
                        }}
                      >
                        Remove
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="dropzone-content">
                    <div className="dropzone-icon" aria-hidden="true">
                      📁
                    </div>
                    <h2>Drop your Instagram ZIP file here</h2>
                    <p>or choose a file from your device</p>
                    <button type="button" className="btn btn-primary" disabled={working}>
                      Choose ZIP file
                    </button>
                    <p className="dropzone-note">
                      Export only <strong>Followers and following</strong> as JSON. No need to
                      extract the ZIP.
                    </p>
                  </div>
                )}
              </div>

              {working && (
                <div className="progress-box" role="status" aria-live="polite">
                  <div className="progress-head">
                    <span>{status}</span>
                    <span className="progress-value">{percent}%</span>
                  </div>
                  <div
                    className="progress-track"
                    role="progressbar"
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-valuenow={percent}
                    aria-label="Analysing your export"
                  >
                    <div className="progress-fill" style={{ width: `${percent}%` }} />
                  </div>
                </div>
              )}

              {problems && !working && (
                <div className="error-box" role="alert">
                  <div className="error-icon" aria-hidden="true">
                    ⚠️
                  </div>
                  <div className="error-body">
                    <strong>{problems.message}</strong>
                    <p>{problems.hint}</p>
                    <div className="error-actions">
                      <button type="button" className="btn-link" onClick={openPicker}>
                        Choose another file
                      </button>
                      <Link to="/how-it-works" className="btn-link">
                        View download instructions
                      </Link>
                    </div>
                  </div>
                </div>
              )}

              {file && !working && (
                <div className="process-section">
                  <button type="button" className="btn btn-primary btn-large" onClick={runAnalysis}>
                    Upload and analyze
                  </button>
                </div>
              )}
            </div>

            <aside className="upload-aside">
              <div className="privacy-banner">
                <span className="privacy-icon" aria-hidden="true">
                  🔒
                </span>
                <div>
                  <strong>Your data stays on your device.</strong>
                  <p>
                    Your archive is opened and compared inside this browser tab. It is never
                    uploaded, and no login or password is involved.
                  </p>
                </div>
              </div>

              <div className="checklist-card">
                <h2>Before you upload</h2>
                <ul>
                  <li>Your export is the <strong>JSON</strong> format, not HTML</li>
                  <li>You selected only <strong>Followers and following</strong></li>
                  <li>The ZIP is under 100 MB</li>
                  <li>It includes both followers and following</li>
                  <li>You keep the ZIP as-is &mdash; no extraction</li>
                </ul>
                <Link to="/how-it-works" className="card-link">
                  Not sure? Follow the step-by-step guide &rarr;
                </Link>
              </div>
            </aside>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}

export default Upload
