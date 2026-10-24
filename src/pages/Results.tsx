import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import type { AnalysisResult } from '../utils/instagramParser'
import { clearResult, loadResult } from '../utils/resultStore'
import Footer from '../components/Footer'
import './Results.css'

type TabKey = 'notFollowingBack' | 'youDontFollowBack' | 'mutual' | 'followers' | 'following'

const TABS: { key: TabKey; label: string; empty: string }[] = [
  {
    key: 'notFollowingBack',
    label: "Doesn't follow back",
    empty: 'Everyone you follow follows you back.',
  },
  {
    key: 'youDontFollowBack',
    label: 'Fans',
    empty: 'You follow back everyone who follows you, so there are no fans.',
  },
  { key: 'mutual', label: 'Mutuals', empty: 'No mutuals to show.' },
  { key: 'followers', label: 'Followers', empty: 'No followers in this export.' },
  { key: 'following', label: 'Following', empty: 'You do not follow anyone in this export.' },
]

function csvCell(value: string): string {
  return `"${value.replace(/"/g, '""')}"`
}

function buildCsv(usernames: string[]): string {
  const rows = usernames.map((name) => csvCell(name))
  // BOM so Excel opens the file as UTF-8.
  return `\uFEFF${['Username', ...rows].join('\r\n')}`
}

function Results() {
  const navigate = useNavigate()
  // Read once during initialisation; no effect needed to hydrate.
  const [results] = useState<AnalysisResult | null>(() => loadResult())
  const [activeTab, setActiveTab] = useState<TabKey>('notFollowingBack')
  const [search, setSearch] = useState('')
  const [sortDescending, setSortDescending] = useState(false)
  const [hideInactive, setHideInactive] = useState(false)
  const [copied, setCopied] = useState<string | null>(null)
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([])

  useEffect(() => {
    if (!results) navigate('/upload', { replace: true })
  }, [results, navigate])

  useEffect(() => {
    if (!copied) return
    const timer = window.setTimeout(() => setCopied(null), 1600)
    return () => window.clearTimeout(timer)
  }, [copied])

  const inactiveSet = useMemo(() => {
    if (!results) return new Set<string>()

    let source: string[]
    switch (activeTab) {
      case 'mutual':
        source = [...results.inactive.followers, ...results.inactive.following]
        break
      case 'following':
        source = results.inactive.following
        break
      case 'notFollowingBack':
        source = results.inactive.notFollowingBack
        break
      default:
        // Fans and Followers are both drawn from the follower list.
        source = results.inactive.followers
    }

    return new Set(source.map((name) => name.toLowerCase()))
  }, [results, activeTab])

  const visible = useMemo(() => {
    if (!results) return []
    const base = results[activeTab]
    const term = search.trim().toLowerCase()

    const filtered = base.filter((name) => {
      if (term && !name.toLowerCase().includes(term)) return false
      if (hideInactive && inactiveSet.has(name.toLowerCase())) return false
      return true
    })

    const sorted = [...filtered].sort((a, b) =>
      a.localeCompare(b, 'en', { sensitivity: 'base' }),
    )
    return sortDescending ? sorted.reverse() : sorted
  }, [results, activeTab, search, sortDescending, hideInactive, inactiveSet])

  const copyUsername = async (name: string) => {
    try {
      await navigator.clipboard.writeText(name)
      setCopied(name)
    } catch {
      setCopied(null)
    }
  }

  const downloadCsv = () => {
    const blob = new Blob([buildCsv(visible)], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = `ifall-${activeTab}.csv`
    anchor.click()
    URL.revokeObjectURL(url)
  }

  const reset = () => {
    clearResult()
    navigate('/', { replace: true })
  }

  if (!results) {
    return (
      <div className="results-loading" role="status" aria-live="polite">
        Loading your results…
      </div>
    )
  }

  const inactiveInView = visible.filter((name) => inactiveSet.has(name.toLowerCase())).length
  const activeLabel = TABS.find((tab) => tab.key === activeTab)?.label ?? ''

  return (
    <div className="results">
      <header className="header">
        <div className="container header-inner">
          <Link to="/" className="logo-link">
            <span className="logo">I FALL</span>
          </Link>
          <nav className="nav" aria-label="Main">
            <Link to="/" className="nav-link">
              Home
            </Link>
            <button type="button" onClick={reset} className="nav-button">
              New analysis
            </button>
          </nav>
        </div>
      </header>

      <main>
        <section className="results-header">
          <div className="container">
            <h1 className="results-title">Your results</h1>
            <p className="results-subtitle">
              Followers, following, mutuals and fans from your own export
              <span className="results-stamp">
                {' '}
                · export analysed{' '}
                {new Date(results.analyzedAt).toLocaleString(undefined, {
                  dateStyle: 'medium',
                  timeStyle: 'short',
                })}
              </span>
            </p>
          </div>
        </section>

        <section className="summary">
          <div className="container">
            <div className="summary-grid">
              <div className="summary-card">
                <div className="summary-number">{results.followers.length.toLocaleString()}</div>
                <div className="summary-label">Followers</div>
              </div>
              <div className="summary-card">
                <div className="summary-number">{results.following.length.toLocaleString()}</div>
                <div className="summary-label">Following</div>
              </div>
              <div className="summary-card summary-card-accent">
                <div className="summary-number">
                  {results.notFollowingBack.length.toLocaleString()}
                </div>
                <div className="summary-label">Doesn&rsquo;t follow back</div>
              </div>
              <div className="summary-card">
                <div className="summary-number">{results.mutual.length.toLocaleString()}</div>
                <div className="summary-label">Mutuals</div>
              </div>
              <div className="summary-card">
                <div className="summary-number">
                  {results.youDontFollowBack.length.toLocaleString()}
                </div>
                <div className="summary-label">Fans</div>
              </div>
            </div>
            <p className="summary-note">
              Based on the export Instagram generated. Follow relationships may have changed since
              then.
            </p>
          </div>
        </section>

        <section className="results-content">
          <div className="container">
            <div className="tabs" role="tablist" aria-label="Result categories">
              {TABS.map((tab, index) => (
                <button
                  key={tab.key}
                  ref={(node) => {
                    tabRefs.current[index] = node
                  }}
                  type="button"
                  role="tab"
                  id={`tab-${tab.key}`}
                  aria-selected={activeTab === tab.key}
                  aria-controls="results-panel"
                  tabIndex={activeTab === tab.key ? 0 : -1}
                  className={`tab ${activeTab === tab.key ? 'is-active' : ''}`}
                  onClick={() => setActiveTab(tab.key)}
                  onKeyDown={(event) => {
                    if (event.key !== 'ArrowRight' && event.key !== 'ArrowLeft') return
                    event.preventDefault()
                    const offset = event.key === 'ArrowRight' ? 1 : -1
                    const next = (index + offset + TABS.length) % TABS.length
                    setActiveTab(TABS[next].key)
                    tabRefs.current[next]?.focus()
                  }}
                >
                  {tab.label}
                  <span className="tab-count">{results[tab.key].length.toLocaleString()}</span>
                </button>
              ))}
            </div>

            <div
              className="results-controls"
              id="results-panel"
              role="tabpanel"
              aria-labelledby={`tab-${activeTab}`}
            >
              <label className="search-field">
                <span className="visually-hidden">Search usernames</span>
                <input
                  type="search"
                  placeholder="Search usernames…"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  className="search-input"
                />
              </label>

              <div className="control-group">
                <label className="select-field">
                  <span className="visually-hidden">Sort order</span>
                  <select
                    value={sortDescending ? 'desc' : 'asc'}
                    onChange={(event) => setSortDescending(event.target.value === 'desc')}
                    className="select-input"
                  >
                    <option value="asc">A → Z</option>
                    <option value="desc">Z → A</option>
                  </select>
                </label>

                <button type="button" onClick={downloadCsv} className="btn btn-secondary">
                  Download CSV
                </button>
              </div>
            </div>

            {inactiveInView > 0 && (
              <label className="inactive-toggle">
                <input
                  type="checkbox"
                  checked={hideInactive}
                  onChange={(event) => setHideInactive(event.target.checked)}
                />
                <span>
                  {inactiveInView.toLocaleString()} in this list have no profile link &mdash; likely
                  deactivated, deleted or renamed. Hide them.
                </span>
              </label>
            )}

            <p className="results-meta">
              Showing {visible.length.toLocaleString()} of {results[activeTab].length.toLocaleString()}{' '}
              in &ldquo;{activeLabel}&rdquo;
            </p>

            <ul className="results-list">
              {visible.length === 0 ? (
                <li className="empty-state">
                  <p>
                    {search.trim()
                      ? 'No usernames match your search.'
                      : hideInactive
                        ? 'Nothing left once deactivated accounts are hidden.'
                        : (TABS.find((tab) => tab.key === activeTab)?.empty ?? 'Nothing here.')}
                  </p>
                </li>
              ) : (
                visible.map((username) => {
                  const inactive = inactiveSet.has(username.toLowerCase())
                  return (
                    <li key={username} className="result-item">
                      <span className="username">@{username}</span>
                      {inactive && <span className="badge">no profile link</span>}
                      <div className="result-actions">
                        <button
                          type="button"
                          className="btn-ghost"
                          onClick={() => void copyUsername(username)}
                        >
                          {copied === username ? 'Copied' : 'Copy'}
                        </button>
                        <a
                          href={`https://instagram.com/${username}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="profile-link"
                        >
                          View profile <span aria-hidden="true">→</span>
                        </a>
                      </div>
                    </li>
                  )
                })
              )}
            </ul>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}

export default Results
