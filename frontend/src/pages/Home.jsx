import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../api/axios'
import FeedPost from '../components/FeedPost'

const PAGE_SIZE = 6

export default function Home() {
  // One seed per page load. The backend shuffles the whole post table with this
  // seed, so paging stays stable while you scroll but the order changes on refresh.
  const seedRef = useRef(Math.floor(Math.random() * 1000000))

  const [posts, setPosts] = useState([])
  const [page, setPage] = useState(0)
  const [hasMore, setHasMore] = useState(false)
  const [search, setSearch] = useState('')
  const [activeSearch, setActiveSearch] = useState('')
  const [showSearch, setShowSearch] = useState(false)
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    loadPage(0, '', true)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const loadPage = async (pageNum, searchTerm, replace) => {
    replace ? setLoading(true) : setLoadingMore(true)
    setError('')
    try {
      const params = { page: pageNum, size: PAGE_SIZE }
      // Shuffle only the normal feed; search results stay in a stable order.
      if (searchTerm) params.search = searchTerm
      else params.seed = seedRef.current

      const { data } = await api.get('/posts', { params })
      setPosts((prev) => (replace ? data.content : [...prev, ...data.content]))
      setPage(pageNum)
      setHasMore(pageNum + 1 < data.totalPages)
    } catch (err) {
      setError('Could not load posts. Is the backend running?')
    } finally {
      replace ? setLoading(false) : setLoadingMore(false)
    }
  }

  const handleSearch = (e) => {
    e.preventDefault()
    setActiveSearch(search)
    loadPage(0, search, true)
  }

  const clearSearch = () => {
    setSearch('')
    setActiveSearch('')
    setShowSearch(false)
    loadPage(0, '', true)
  }

  return (
    <div className="feed-page">
      <div className="feed-header">
        <h1>Home</h1>
        <button className="feed-search-toggle" onClick={() => setShowSearch(!showSearch)} aria-label="Search">
          <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M10.25 3.75c-3.59 0-6.5 2.91-6.5 6.5s2.91 6.5 6.5 6.5c1.795 0 3.419-.726 4.596-1.904 1.178-1.177 1.904-2.801 1.904-4.596 0-3.59-2.91-6.5-6.5-6.5zm-8.5 6.5c0-4.694 3.806-8.5 8.5-8.5s8.5 3.806 8.5 8.5c0 1.986-.682 3.815-1.829 5.267l4.907 4.907-1.414 1.414-4.907-4.907c-1.452 1.147-3.281 1.829-5.267 1.829-4.694 0-8.5-3.806-8.5-8.5z"/></svg>
        </button>
      </div>

      {showSearch && (
        <form className="feed-search-bar" onSubmit={handleSearch}>
          <input
            type="text"
            placeholder="Search posts..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            autoFocus
          />
          <button type="submit">Search</button>
        </form>
      )}

      {activeSearch && (
        <div className="feed-search-note">
          <span>Showing results for &ldquo;{activeSearch}&rdquo;</span>
          <button className="btn-link" onClick={clearSearch}>Clear</button>
        </div>
      )}

      <Link to="/create" className="feed-compose">
        <span className="feed-compose-avatar">+</span>
        <span>What's on your mind?</span>
      </Link>

      {error && <div className="alert-error">{error}</div>}

      {loading ? (
        <p className="empty-state">Loading posts...</p>
      ) : posts.length === 0 ? (
        <p className="empty-state">No posts found.</p>
      ) : (
        <>
          <div className="feed-list">
            {posts.map((post) => <FeedPost key={post.id} post={post} />)}
          </div>

          {hasMore && (
            <button
              className="feed-show-more"
              onClick={() => loadPage(page + 1, activeSearch, false)}
              disabled={loadingMore}
            >
              {loadingMore ? 'Loading...' : 'Show more'}
            </button>
          )}
        </>
      )}
    </div>
  )
}
