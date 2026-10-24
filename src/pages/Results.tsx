import { useEffect, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { saveAs } from 'file-saver'
import './Results.css'

interface ResultsData {
  followers: string[]
  following: string[]
  notFollowingBack: string[]
  youDontFollowBack: string[]
  mutual: string[]
}

function Results() {
  const navigate = useNavigate()
  const [results, setResults] = useState<ResultsData | null>(null)
  const [activeTab, setActiveTab] = useState<'notFollowingBack' | 'youDontFollowBack' | 'mutual'>('notFollowingBack')
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    const data = sessionStorage.getItem('ifall_results')
    if (data) {
      setResults(JSON.parse(data))
    } else {
      navigate('/upload')
    }
  }, [navigate])

  if (!results) {
    return <div className="results">Loading...</div>
  }

  const getCurrentList = () => {
    switch (activeTab) {
      case 'notFollowingBack':
        return results.notFollowingBack
      case 'youDontFollowBack':
        return results.youDontFollowBack
      case 'mutual':
        return results.mutual
      default:
        return []
    }
  }

  const currentList = getCurrentList().filter(username =>
    username.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const exportCSV = () => {
    const list = getCurrentList()
    const csvContent = "Username\n" + list.map(u => u).join("\n")
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    saveAs(blob, `ifall-${activeTab}-${Date.now()}.csv`)
  }

  const reset = () => {
    sessionStorage.removeItem('ifall_results')
    navigate('/')
  }

  return (
    <div className="results">
      <header className="header">
        <div className="container">
          <Link to="/" className="logo-link">
            <h1 className="logo">I FALL</h1>
          </Link>
          <nav className="nav">
            <Link to="/" className="nav-link">Home</Link>
            <button onClick={reset} className="nav-button">New Analysis</button>
          </nav>
        </div>
      </header>

      <main>
        <section className="results-header">
          <div className="container">
            <h1 className="results-title">Your Results</h1>
            <p className="results-subtitle">Instagram follower relationship analysis</p>
          </div>
        </section>

        <section className="summary">
          <div className="container">
            <div className="summary-grid">
              <div className="summary-card">
                <div className="summary-number">{results.followers.length}</div>
                <div className="summary-label">Total Followers</div>
              </div>
              <div className="summary-card">
                <div className="summary-number">{results.following.length}</div>
                <div className="summary-label">Total Following</div>
              </div>
              <div className="summary-card">
                <div className="summary-number">{results.notFollowingBack.length}</div>
                <div className="summary-label">Don't Follow You Back</div>
              </div>
              <div className="summary-card">
                <div className="summary-number">{results.mutual.length}</div>
                <div className="summary-label">Mutual Connections</div>
              </div>
            </div>
          </div>
        </section>

        <section className="results-content">
          <div className="container">
            <div className="tabs">
              <button
                className={`tab ${activeTab === 'notFollowingBack' ? 'active' : ''}`}
                onClick={() => setActiveTab('notFollowingBack')}
              >
                Don't Follow You Back ({results.notFollowingBack.length})
              </button>
              <button
                className={`tab ${activeTab === 'youDontFollowBack' ? 'active' : ''}`}
                onClick={() => setActiveTab('youDontFollowBack')}
              >
                You Don't Follow Back ({results.youDontFollowBack.length})
              </button>
              <button
                className={`tab ${activeTab === 'mutual' ? 'active' : ''}`}
                onClick={() => setActiveTab('mutual')}
              >
                Mutual Connections ({results.mutual.length})
              </button>
            </div>

            <div className="results-controls">
              <input
                type="text"
                placeholder="Search usernames..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
              <button onClick={exportCSV} className="btn btn-secondary">
                Download CSV
              </button>
            </div>

            <div className="results-list">
              {currentList.length === 0 ? (
                <div className="empty-state">
                  <p>
                    {searchTerm
                      ? 'No usernames match your search.'
                      : activeTab === 'notFollowingBack'
                      ? 'Everyone you follow follows you back!'
                      : activeTab === 'youDontFollowBack'
                      ? 'You follow everyone who follows you!'
                      : 'No mutual connections to show.'}
                  </p>
                </div>
              ) : (
                currentList.map((username, idx) => (
                  <div key={idx} className="result-item">
                    <div className="username">@{username}</div>
                    <a
                      href={`https://instagram.com/${username}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="profile-link"
                    >
                      View Profile →
                    </a>
                  </div>
                ))
              )}
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

export default Results
