import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api from '../api/axios'

function relativeTime(dateStr) {
  const date = new Date(dateStr)
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000)
  if (seconds < 60) return 'now'
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes}m`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h`
  const days = Math.floor(hours / 24)
  if (days < 7) return `${days}d`
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

function describe(n) {
  if (n.type === 'FOLLOW') return 'followed you'
  if (n.type === 'LIKE') return <>liked your post <strong>{n.postTitle}</strong></>
  if (n.type === 'COMMENT') return <>commented on your post <strong>{n.postTitle}</strong></>
  return 'interacted with your content'
}

export default function Notifications() {
  const navigate = useNavigate()
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    api.get('/notifications')
      .then(({ data }) => setNotifications(data))
      .catch(() => setError('Could not load notifications'))
      .finally(() => setLoading(false))

    // Opening this page is what clears the unread badge, same as most apps.
    api.post('/notifications/read').catch(() => {})
  }, [])

  return (
    <div className="container">
      <h1>Notifications</h1>
      {error && <div className="alert-error">{error}</div>}
      {loading ? (
        <p className="empty-state">Loading...</p>
      ) : notifications.length === 0 ? (
        <p className="empty-state">Nothing here yet. Likes, comments, and new followers will show up here.</p>
      ) : (
        <ul className="notification-list">
          {notifications.map((n) => {
            const target = n.type === 'FOLLOW' ? `/profile/${n.actorUsername}` : `/posts/${n.postId}`
            return (
              <li
                key={n.id}
                className={`notification-item ${n.isRead ? '' : 'notification-unread'}`}
                onClick={() => navigate(target)}
              >
                <span className="notification-text">
                  <Link
                    to={`/profile/${n.actorUsername}`}
                    className="notification-actor"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {n.actorUsername}
                  </Link>{' '}
                  {describe(n)}
                </span>
                <span className="notification-time">{relativeTime(n.createdAt)}</span>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
