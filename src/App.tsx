import { Suspense, lazy, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom'
import Home from './pages/Home'
import ErrorBoundary from './components/ErrorBoundary'
import './App.css'

const HowItWorks = lazy(() => import('./pages/HowItWorks'))
const Upload = lazy(() => import('./pages/Upload'))
const Results = lazy(() => import('./pages/Results'))

const basename = import.meta.env.BASE_URL.replace(/\/$/, '')
const REDIRECT_KEY = 'ifall:redirect'

/** Restores a deep link that GitHub Pages served as 404.html. */
function RedirectFrom404() {
  const navigate = useNavigate()

  useEffect(() => {
    const target = sessionStorage.getItem(REDIRECT_KEY)
    if (!target) return

    sessionStorage.removeItem(REDIRECT_KEY)
    navigate(target, { replace: true })
  }, [navigate])

  return null
}

function RouteLoading() {
  return (
    <div className="route-loading" role="status" aria-live="polite">
      <span className="route-loading-dot" />
      Loading…
    </div>
  )
}

function App() {
  return (
    <Router basename={basename}>
      <ErrorBoundary>
        <div className="app">
          <RedirectFrom404 />
          <Suspense fallback={<RouteLoading />}>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/how-it-works" element={<HowItWorks />} />
              <Route path="/upload" element={<Upload />} />
              <Route path="/results" element={<Results />} />
              <Route path="*" element={<Home />} />
            </Routes>
          </Suspense>
        </div>
      </ErrorBoundary>
    </Router>
  )
}

export default App
