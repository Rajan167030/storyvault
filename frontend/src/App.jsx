import { useCallback, useEffect, useState } from 'react'
import { BrowserRouter, Routes, Route, Link, useLocation } from 'react-router-dom'
import { LayoutGrid, Bookmark, RotateCw, LogOut, Terminal, Sparkles, User, Mail, ShieldCheck } from 'lucide-react'
import './App.css'

const API_BASE = (import.meta.env.VITE_API_URL || 'http://localhost:3000').replace(/\/$/, '')

const emptyAuthForm = {
  username: '',
  email: '',
  password: '',
}

async function apiRequest(path, options = {}) {
  const { headers, ...rest } = options
  const response = await fetch(`${API_BASE}${path}`, {
    credentials: 'include',
    ...rest,
    headers: {
      'Content-Type': 'application/json',
      ...(headers || {}),
    },
  })

  let data
  try {
    data = await response.json()
  } catch {
    data = null
  }

  if (!response.ok) {
    const error = new Error(data?.message || `Request failed with status ${response.status}`)
    error.status = response.status
    throw error
  }

  return data
}

function getStoryId(story) {
  return String(story?._id ?? story?.id ?? '')
}

function getStoryHref(url) {
  if (!url) return '#'

  try {
    return new URL(url, 'https://news.ycombinator.com').href
  } catch {
    return url
  }
}

function getStoryHost(url) {
  if (!url) return 'story'

  try {
    return new URL(url, 'https://news.ycombinator.com').hostname.replace(/^www\./, '')
  } catch {
    return 'story'
  }
}

function NoticeBanner({ notice }) {
  if (!notice) return null

  return (
    <div className={`notice notice--${notice.tone}`} role="status">
      {notice.message}
    </div>
  )
}

function StoryCard({ story, index, saved, loading, onToggleBookmark, variant = 'feed' }) {
  const storyId = getStoryId(story)
  const href = getStoryHref(story.URL)
  const host = getStoryHost(story.URL)

  return (
    <article className={`story-card ${saved ? 'story-card--saved' : ''} story-card--${variant}`}>
      <div className="story-card__index">
        {variant === 'saved' ? '★' : String(index + 1).padStart(2, '0')}
      </div>

      <div className="story-card__body">
        <div className="story-card__topline">
          <span className="story-card__host">{host}</span>
          <span className="story-card__points">{Number(story.points) || 0} points</span>
        </div>

        <a className="story-card__title" href={href} target="_blank" rel="noreferrer">
          {story.title}
        </a>

        <div className="story-card__meta">
          <span>{story.author || 'unknown author'}</span>
          <span>{story.postedAt || 'recently'}</span>
        </div>
      </div>

      <button
        type="button"
        className={`bookmark-button ${saved ? 'bookmark-button--active' : ''}`}
        onClick={() => onToggleBookmark(storyId)}
        disabled={loading}
      >
        {loading ? 'Working...' : saved ? 'Remove' : 'Bookmark'}
      </button>
    </article>
  )
}

function AuthPanel({
  mode,
  form,
  loading,
  error,
  onChange,
  onSubmit,
  onModeChange,
  checkingSession,
}) {
  return (
    <section className="auth-panel">
      <div className="auth-panel__header">
        <div>
          <p className="section-kicker">Account</p>
          <h3>{mode === 'login' ? 'Sign in to save stories' : 'Create a reader account'}</h3>
        </div>
        {checkingSession ? <span className="pill pill--muted">Checking session</span> : null}
      </div>

      <div className="auth-tabs" role="tablist" aria-label="Authentication mode">
        <button
          type="button"
          className={mode === 'login' ? 'auth-tabs__button is-active' : 'auth-tabs__button'}
          onClick={() => onModeChange('login')}
        >
          Login
        </button>
        <button
          type="button"
          className={mode === 'register' ? 'auth-tabs__button is-active' : 'auth-tabs__button'}
          onClick={() => onModeChange('register')}
        >
          Register
        </button>
      </div>

      <form className="auth-form" onSubmit={onSubmit}>
        {mode === 'register' ? (
          <label className="field">
            <span>Username</span>
            <input
              name="username"
              type="text"
              placeholder="Jane Reader"
              value={form.username}
              onChange={onChange}
              autoComplete="username"
            />
          </label>
        ) : null}

        <label className="field">
          <span>Email</span>
          <input
            name="email"
            type="email"
            placeholder="you@example.com"
            value={form.email}
            onChange={onChange}
            autoComplete="email"
          />
        </label>

        <label className="field">
          <span>Password</span>
          <input
            name="password"
            type="password"
            placeholder="••••••••"
            value={form.password}
            onChange={onChange}
            autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
          />
        </label>

        {error ? <p className="auth-error">{error}</p> : null}

        <button type="submit" className="primary-button" disabled={loading}>
          {loading ? 'Please wait...' : mode === 'login' ? 'Log in' : 'Register and log in'}
        </button>
      </form>
    </section>
  )
}

function SessionPanel({ user, savedStories, onLogout }) {
  return (
    <section className="session-panel">
      <div className="session-panel__top">
        <div className="icon-badge">
          <User size={20} />
        </div>
        <div>
          <p className="section-kicker">Signed in</p>
          <h3>{user?.username || 'Reader'}</h3>
        </div>

        <button type="button" className="ghost-button icon-button" onClick={onLogout} title="Logout">
          <LogOut size={18} />
        </button>
      </div>

      <div className="session-panel__details">
        <div className="session-stat">
          <div className="session-stat__icon"><Bookmark size={14} /></div>
          <div>
            <span>Saved</span>
            <strong>{savedStories.length}</strong>
          </div>
        </div>
        <div className="session-stat">
          <div className="session-stat__icon"><Mail size={14} /></div>
          <div>
            <span>Email</span>
            <strong>{user?.email || 'n/a'}</strong>
          </div>
        </div>
      </div>

      <p className="session-panel__note">
        Bookmark any story from the feed. It will stay in your saved section until you remove it.
      </p>
    </section>
  )
}

function Navigation() {
  const location = useLocation()
  
  return (
    <nav className="main-nav">
      <Link 
        to="/" 
        className={`nav-link ${location.pathname === '/' ? 'is-active' : ''}`}
      >
        <LayoutGrid size={18} />
        <span>Dashboard</span>
      </Link>
      <Link 
        to="/stories" 
        className={`nav-link ${location.pathname === '/stories' ? 'is-active' : ''}`}
      >
        <RotateCw size={18} />
        <span>Stories</span>
      </Link>
      <Link 
        to="/saved" 
        className={`nav-link ${location.pathname === '/saved' ? 'is-active' : ''}`}
      >
        <Bookmark size={18} />
        <span>Bookmarks</span>
      </Link>
    </nav>
  )
}

function App() {
  const [stories, setStories] = useState([])
  const [savedStories, setSavedStories] = useState([])
  const [user, setUser] = useState(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [loadingStories, setLoadingStories] = useState(true)
  const [checkingSession, setCheckingSession] = useState(true)
  const [authLoading, setAuthLoading] = useState(false)
  const [bookmarkingId, setBookmarkingId] = useState('')
  const [scrapingStories, setScrapingStories] = useState(false)
  const [authMode, setAuthMode] = useState('login')
  const [authForm, setAuthForm] = useState(emptyAuthForm)
  const [authError, setAuthError] = useState('')
  const [storiesError, setStoriesError] = useState('')
  const [notice, setNotice] = useState(null)

  const savedStoryIds = new Set(savedStories.map((story) => getStoryId(story)))

  const loadStories = useCallback(async () => {
    setLoadingStories(true)
    setStoriesError('')

    try {
      const data = await apiRequest('/api/stories')
      setStories(Array.isArray(data?.stories) ? data.stories : [])
    } catch (error) {
      const message = error.message || 'Unable to load stories'
      setStories([])
      setStoriesError(message)
      setNotice({ tone: 'error', message })
    } finally {
      setLoadingStories(false)
    }
  }, [])

  const loadSession = useCallback(async ({ quiet = false } = {}) => {
    if (!quiet) {
      setCheckingSession(true)
    }

    try {
      const data = await apiRequest('/api/auth/test')
      const sessionUser = data?.user || null
      const bookmarks = Array.isArray(sessionUser?.bookmarkedStories) ? sessionUser.bookmarkedStories : []

      setUser(sessionUser)
      setSavedStories(bookmarks)
      setIsAuthenticated(Boolean(sessionUser))
      return sessionUser
    } catch (error) {
      if (error.status !== 401) {
        const message = error.message || 'Unable to load session'
        setNotice({ tone: 'error', message })
      }

      setUser(null)
      setSavedStories([])
      setIsAuthenticated(false)
      return null
    } finally {
      if (!quiet) {
        setCheckingSession(false)
      }
    }
  }, [])

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadStories()
      void loadSession()
    }, 0)

    return () => window.clearTimeout(timer)
  }, [loadStories, loadSession])

  const handleAuthChange = (event) => {
    const { name, value } = event.target
    setAuthForm((current) => ({
      ...current,
      [name]: value,
    }))
  }

  const handleAuthModeChange = (nextMode) => {
    setAuthMode(nextMode)
    setAuthError('')
  }

  const handleAuthSubmit = async (event) => {
    event.preventDefault()
    setAuthError('')

    const email = authForm.email.trim()
    const password = authForm.password
    const username = authForm.username.trim()

    if (authMode === 'register' && !username) {
      setAuthError('Username is required')
      return
    }

    if (!email || !password) {
      setAuthError('Email and password are required')
      return
    }

    setAuthLoading(true)

    try {
      if (authMode === 'register') {
        await apiRequest('/api/auth/register', {
          method: 'POST',
          body: JSON.stringify({
            username,
            email,
            password,
          }),
        })
      }

      await apiRequest('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({
          email,
          password,
        }),
      })

      const sessionUser = await loadSession({ quiet: true })
      if (!sessionUser) {
        throw new Error('Signed in, but the session cookie was not established.')
      }

      setAuthMode('login')
      setAuthForm((current) => ({
        ...emptyAuthForm,
        email: current.email,
      }))
      setNotice({
        tone: 'success',
        message: authMode === 'register' ? 'Account created and signed in.' : 'Signed in successfully.',
      })
    } catch (error) {
      setAuthError(error.message || 'Authentication failed')
    } finally {
      setAuthLoading(false)
    }
  }

  const handleScrapeStories = async () => {
    setScrapingStories(true)
    setStoriesError('')

    try {
      const data = await apiRequest('/api/stories/scrape', {
        method: 'POST',
      })

      setStories(Array.isArray(data?.stories) ? data.stories : [])
      setNotice({
        tone: 'success',
        message: data?.message || 'Stories refreshed successfully.',
      })
    } catch (error) {
      const message = error.message || 'Unable to refresh stories'
      setNotice({ tone: 'error', message })
    } finally {
      setScrapingStories(false)
    }
  }

  const handleBookmarkToggle = async (storyId) => {
    if (!isAuthenticated) {
      setNotice({
        tone: 'error',
        message: 'Sign in first to bookmark stories.',
      })
      return
    }

    setBookmarkingId(storyId)

    try {
      const data = await apiRequest(`/api/auth/bookmark/${storyId}`, {
        method: 'POST',
      })

      setNotice({
        tone: 'success',
        message: data?.message || 'Bookmark updated.',
      })
      await loadSession({ quiet: true })
    } catch (error) {
      if (error.status === 401) {
        setIsAuthenticated(false)
        setUser(null)
        setSavedStories([])
      }

      setNotice({
        tone: 'error',
        message: error.message || 'Unable to update bookmark',
      })
    } finally {
      setBookmarkingId('')
    }
  }

  const handleLogout = async () => {
    try {
      await apiRequest('/api/auth/logout', {
        method: 'POST',
      })
    } catch {
      // Clear local state even if the cookie-clearing request fails.
    } finally {
      setUser(null)
      setSavedStories([])
      setIsAuthenticated(false)
      setAuthError('')
      setAuthForm(emptyAuthForm)
      setAuthMode('login')
      setNotice({
        tone: 'info',
        message: 'Signed out.',
      })
    }
  }

  return (
    <BrowserRouter>
      <div className="app-shell">
        <div className="ambient ambient--one" />
        <div className="ambient ambient--two" />

        <header className="topbar">
          <div className="brand">
            <div className="brand__mark"><Terminal size={24} /></div>
            <div>
              <p className="section-kicker">Scraped story desk</p>
              <h1>StoryVault</h1>
            </div>
          </div>

          <Navigation />

          <div className="topbar__actions">
            <button
              type="button"
              className="ghost-button"
              onClick={handleScrapeStories}
              disabled={scrapingStories || loadingStories}
            >
              {scrapingStories ? (
                <>
                  <RotateCw size={14} className="spin" />
                  <span>Syncing...</span>
                </>
              ) : (
                <>
                  <RotateCw size={14} />
                  <span>Refresh stories</span>
                </>
              )}
            </button>
            {isAuthenticated ? (
              <button type="button" className="ghost-button ghost-button--danger icon-button" onClick={handleLogout}>
                <LogOut size={16} />
              </button>
            ) : null}
          </div>
        </header>

        <main>
          <Routes>
            <Route path="/" element={
              <section className="hero-panel hero-panel--full">
                <div className="hero-panel__copy">
                  <p className="section-kicker">Hacker News mirror</p>
                  <h2>Welcome to StoryVault</h2>
                  <p className="hero-panel__text">
                    The ultimate destination for your curated reading list. We scrape Hacker News 
                    and store it in MongoDB, giving you a lightning-fast experience with bookmarking capabilities.
                  </p>

                  <div className="hero-panel__chips">
                    <span className="chip"><ShieldCheck size={14} /> Cookie auth</span>
                    <span className="chip"><Terminal size={14} /> Scraped feed</span>
                    <span className="chip"><Sparkles size={14} /> Bookmark shelf</span>
                  </div>

                  <div className="hero-panel__stats">
                    <div className="stat-card">
                      <span>Stories</span>
                      <strong>{stories.length}</strong>
                    </div>
                    <div className="stat-card">
                      <span>Saved</span>
                      <strong>{savedStories.length}</strong>
                    </div>
                    <div className="stat-card">
                      <span>Session</span>
                      <strong>{isAuthenticated ? 'Active' : 'Guest'}</strong>
                    </div>
                  </div>

                  <div className="hero-panel__actions">
                    <Link to="/stories" className="primary-button">Browse Stories</Link>
                    {!isAuthenticated && <button onClick={() => setAuthMode('register')} className="ghost-button">Create Account</button>}
                  </div>
                </div>

                <div className="hero-panel__side">
                  <NoticeBanner notice={notice} />

                  {isAuthenticated ? (
                    <SessionPanel user={user} savedStories={savedStories} onLogout={handleLogout} />
                  ) : (
                    <AuthPanel
                      mode={authMode}
                      form={authForm}
                      loading={authLoading}
                      error={authError}
                      onChange={handleAuthChange}
                      onSubmit={handleAuthSubmit}
                      onModeChange={handleAuthModeChange}
                      checkingSession={checkingSession}
                    />
                  )}
                </div>
              </section>
            } />

            <Route path="/stories" element={
              <section className="workspace-solo">
                <div className="panel">
                  <div className="panel__header">
                    <div>
                      <p className="section-kicker">Live feed</p>
                      <h3>Scraped stories</h3>
                    </div>

                    <div className="panel__actions">
                      <button
                        type="button"
                        className="ghost-button ghost-button--small"
                        onClick={handleScrapeStories}
                        disabled={scrapingStories || loadingStories}
                      >
                        {scrapingStories ? (
                          <>
                            <RotateCw size={12} className="spin" />
                            <span>Syncing...</span>
                          </>
                        ) : (
                          <>
                            <RotateCw size={12} />
                            <span>Sync Now</span>
                          </>
                        )}
                      </button>
                      <span className="pill">{loadingStories ? 'Loading...' : `${stories.length} items`}</span>
                    </div>
                  </div>

                  {storiesError ? (
                    <div className="empty-state empty-state--error">
                      <p>{storiesError}</p>
                      <button type="button" className="primary-button primary-button--inline" onClick={loadStories}>
                        Retry
                      </button>
                    </div>
                  ) : null}

                  {!storiesError && loadingStories ? (
                    <div className="story-list">
                      {Array.from({ length: 6 }).map((_, index) => (
                        <article className="story-card story-card--skeleton" key={`skeleton-${index}`}>
                          <div className="story-card__index" />
                          <div className="story-card__body">
                            <div className="skeleton skeleton--line skeleton--short" />
                            <div className="skeleton skeleton--line skeleton--title" />
                            <div className="skeleton skeleton--line skeleton--meta" />
                          </div>
                          <div className="skeleton skeleton--button" />
                        </article>
                      ))}
                    </div>
                  ) : null}

                  {!storiesError && !loadingStories && stories.length === 0 ? (
                    <div className="empty-state">
                      <p>No stories are available yet. Use refresh to scrape the latest Hacker News items.</p>
                      <button type="button" className="primary-button primary-button--inline" onClick={handleScrapeStories}>
                        Sync now
                      </button>
                    </div>
                  ) : null}

                  {!storiesError && !loadingStories && stories.length > 0 ? (
                    <div className="story-list story-list--grid">
                      {stories.map((story, index) => {
                        const storyId = getStoryId(story)
                        const saved = savedStoryIds.has(storyId)

                        return (
                          <StoryCard
                            key={storyId || `${story.title}-${index}`}
                            story={story}
                            index={index}
                            saved={saved}
                            loading={bookmarkingId === storyId}
                            onToggleBookmark={handleBookmarkToggle}
                          />
                        )
                      })}
                    </div>
                  ) : null}
                </div>
              </section>
            } />

            <Route path="/saved" element={
              <section className="workspace-solo">
                <div className="panel">
                  <div className="panel__header">
                    <div>
                      <p className="section-kicker">Saved</p>
                      <h3>Your Bookmarks</h3>
                    </div>

                    <span className="pill">{savedStories.length} items</span>
                  </div>

                  {!isAuthenticated ? (
                    <div className="empty-state">
                      <p>Sign in to view your saved section.</p>
                    </div>
                  ) : savedStories.length === 0 ? (
                    <div className="empty-state">
                      <p>Your bookmarks will appear here after you save a story from the feed.</p>
                      <Link to="/stories" className="primary-button primary-button--inline">Browse Stories</Link>
                    </div>
                  ) : (
                    <div className="story-list story-list--grid">
                      {savedStories.map((story, index) => {
                        const storyId = getStoryId(story)

                        return (
                          <StoryCard
                            key={storyId || `${story.title}-saved-${index}`}
                            story={story}
                            index={index}
                            saved
                            variant="saved"
                            loading={bookmarkingId === storyId}
                            onToggleBookmark={handleBookmarkToggle}
                          />
                        )
                      })}
                    </div>
                  )}
                </div>
              </section>
            } />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  )
}

export default App
