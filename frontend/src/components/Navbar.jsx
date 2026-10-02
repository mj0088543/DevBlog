import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api from '../api/axios'
import { useAuth } from '../context/AuthContext'

export default function Navbar() {
  const { user, logout, isAdmin } = useAuth()
  const navigate = useNavigate()
  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    if (!user) return
    const fetchCount = () => {
      api.get('/notifications/unread-count')
        .then(({ data }) => setUnreadCount(data.count))
        .catch(() => {})
    }
    fetchCount()
    // Simple poll so the badge updates without needing websockets.
    const interval = setInterval(fetchCount, 30000)
    return () => clearInterval(interval)
  }, [user])

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-brand">DevBlog</Link>
        <div className="navbar-links">
          <Link to="/">Home</Link>
          {user ? (
            <>
              <Link to="/create">New Post</Link>
              <Link to="/notifications" className="navbar-bell" onClick={() => setUnreadCount(0)}>
                <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                  <path d="M12 2c-1.1 0-2 .9-2 2v.29C7.13 4.91 5 7.62 5 10.83V16l-1.71 1.71c-.63.63-.19 1.71.7 1.71h16.02c.89 0 1.33-1.08.7-1.71L19 16v-5.17c0-3.21-2.13-5.92-5-6.54V4c0-1.1-.9-2-2-2zm0 20c1.1 0 2-.9 2-2h-4c0 1.1.9 2 2 2z"/>
                </svg>
                {unreadCount > 0 && <span className="navbar-badge">{unreadCount > 9 ? '9+' : unreadCount}</span>}
              </Link>
              {isAdmin && <Link to="/admin">Admin</Link>}
              <span className="navbar-user">Hi, <Link to={`/profile/${user.username}`}>{user.username}</Link></span>
              <button className="btn-link" onClick={handleLogout}>Logout</button>
            </>
          ) : (
            <>
              <Link to="/login">Login</Link>
              <Link to="/register" className="btn-primary-sm">Sign up</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  )
}
