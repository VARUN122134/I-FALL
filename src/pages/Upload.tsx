import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { Link } from 'react-router-dom'
import JSZip from 'jszip'
import { analyzeInstagramData } from '../utils/instagramParser'
import './Upload.css'

function Upload() {
  const navigate = useNavigate()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [dragActive, setDragActive] = useState(false)
  const [file, setFile] = useState<File | null>(null)
  const [error, setError] = useState('')
  const [processing, setProcessing] = useState(false)
  const [progress, setProgress] = useState('')

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0])
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault()
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0])
    }
  }

  const handleFile = (selectedFile: File) => {
    setError('')
    setFile(selectedFile)
  }

  const onButtonClick = () => {
    fileInputRef.current?.click()
  }

  const processFile = async () => {
    if (!file) {
      setError('Please select a file first.')
      return
    }

    if (!file.name.toLowerCase().endsWith('.zip')) {
      setError("That doesn't look like an Instagram data export. Please choose the ZIP file you downloaded from Instagram.")
      return
    }

    setProcessing(true)
    setProgress('Reading ZIP file...')
    setError('')

    try {
      const zip = new JSZip()
      const zipContent = await zip.loadAsync(file)
      
      setProgress('Looking for follower and following data...')
      
      // Try to find files
      const result = await analyzeInstagramData(zipContent)
      
      if (!result.followers || result.followers.length === 0) {
        if (!result.following || result.following.length === 0) {
          setError("We couldn't find your followers and following information. Check that your export includes these details, or follow our download guide.")
          setProcessing(false)
          return
        }
      }
      
      if (!result.following || result.following.length === 0) {
        setError("We couldn't find your following information. Check that your export includes these details, or follow our download guide.")
        setProcessing(false)
        return
      }
      
      setProgress('Analyzing...')
      
      // Store results in sessionStorage
      sessionStorage.setItem('ifall_results', JSON.stringify(result))
      
      setProgress('Done!')
      setTimeout(() => {
        navigate('/results')
      }, 500)
    } catch (err) {
      console.error(err)
      setError("Something went wrong while reading the file. Your original file hasn't been uploaded to our server. You can try again or follow the troubleshooting guide.")
      setProcessing(false)
    }
  }

  return (
    <div className="upload">
      <header className="header">
        <div className="container">
          <Link to="/" className="logo-link">
            <h1 className="logo">I FALL</h1>
          </Link>
          <nav className="nav">
            <Link to="/how-it-works" className="nav-link">How It Works</Link>
            <Link to="/" className="nav-link">Home</Link>
          </nav>
        </div>
      </header>

      <main>
        <section className="upload-header">
          <div className="container">
            <h1 className="upload-title">Got your Instagram file? Let's find your results.</h1>
            <p className="upload-subtitle">Upload the ZIP file you downloaded from Instagram. We'll find the relevant information automatically.</p>
          </div>
        </section>

        <section className="upload-content">
          <div className="container">
            <div className="privacy-banner">
              <span className="privacy-icon">🔒</span>
              <div>
                <strong>Your data stays on your device.</strong> I FALL analyzes your selected Instagram export directly in your browser. Your archive and extracted usernames are not uploaded to our servers.
              </div>
            </div>

            <div
              className={`dropzone ${dragActive ? 'active' : ''} ${file ? 'has-file' : ''}`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".zip,application/zip"
                onChange={handleChange}
                style={{ display: 'none' }}
              />
              <div className="dropzone-content">
                <div className="dropzone-icon">📁</div>
                {!file ? (
                  <>
                    <h3>Drop your Instagram ZIP file here</h3>
                    <p>or choose a file from your device</p>
                    <button type="button" className="btn btn-primary" onClick={onButtonClick}>
                      Choose ZIP File
                    </button>
                    <p className="dropzone-note">You don't need to extract the ZIP file.</p>
                  </>
                ) : (
                  <>
                    <h3>✓ {file.name}</h3>
                    <p>{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                    <button type="button" className="btn btn-secondary" onClick={onButtonClick}>
                      Choose Different File
                    </button>
                  </>
                )}
              </div>
            </div>

            {error && (
              <div className="error-box">
                <div className="error-icon">⚠️</div>
                <div>
                  <p>{error}</p>
                  <div className="error-actions">
                    <button onClick={() => { setError(''); setFile(null); }} className="btn-link">Try Again</button>
                    <Link to="/how-it-works" className="btn-link">View Download Instructions</Link>
                    <button onClick={onButtonClick} className="btn-link">Choose Another File</button>
                  </div>
                </div>
              </div>
            )}

            {processing && (
              <div className="processing-box">
                <div className="spinner"></div>
                <p>{progress}</p>
              </div>
            )}

            {file && !processing && !error && (
              <div className="process-section">
                <button className="btn btn-primary btn-large" onClick={processFile}>
                  Analyze My Followers
                </button>
              </div>
            )}
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

export default Upload
