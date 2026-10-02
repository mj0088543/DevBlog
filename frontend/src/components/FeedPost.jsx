import { useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../api/axios'
import { useAuth } from '../context/AuthContext'

const AVATAR_COLORS = ['#1d9bf0', '#7856ff', '#f91880', '#00ba7c', '#ff7a00', '#8b5cf6']

function avatarColor(username) {
  let hash = 0
  for (let i = 0; i < username.length; i++) hash = username.charCodeAt(i) + ((hash << 5) - hash)
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length]
}

function excerpt(text, len = 220) {
  if (text.length <= len) return text
  return text.slice(0, len).trim() + '...'
}

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

export default function FeedPost({ post }) {
  const { user } = useAuth()
  const initial = post.authorUsername.charAt(0).toUpperCase()

  const [liked, setLiked] = useState(post.likedByMe)
  const [likeCount, setLikeCount] = useState(post.likeCount)
  const [likeBusy, setLikeBusy] = useState(false)

  const toggleLike = async (e) => {
    e.preventDefault() // don't navigate to the post when the heart is clicked
    if (!user || likeBusy) return
    setLikeBusy(true)
    // Optimistic update so the heart feels instant; revert on failure.
    const wasLiked = liked
    setLiked(!wasLiked)
    setLikeCount((c) => c + (wasLiked ? -1 : 1))
    try {
      if (wasLiked) await api.delete(`/posts/${post.id}/like`)
      else await api.post(`/posts/${post.id}/like`)
    } catch (err) {
      setLiked(wasLiked)
      setLikeCount((c) => c + (wasLiked ? 1 : -1))
    } finally {
      setLikeBusy(false)
    }
  }

  return (
    <article className="feed-post">
      <Link to={`/profile/${post.authorUsername}`} className="feed-avatar" style={{ background: avatarColor(post.authorUsername) }}>
        {initial}
      </Link>
      <div className="feed-post-body">
        <div className="feed-post-header">
          <Link to={`/profile/${post.authorUsername}`} className="feed-post-author">{post.authorUsername}</Link>
          <span className="feed-dot">·</span>
          <span className="feed-time">{relativeTime(post.createdAt)}</span>
        </div>
        <Link to={`/posts/${post.id}`} className="feed-post-title">{post.title}</Link>
        <p className="feed-post-excerpt">{excerpt(post.content)}</p>
        {post.imageUrl && (
          <img
            src={post.imageUrl}
            alt={post.title}
            className="feed-post-image"
            onError={(e) => { e.target.style.display = 'none' }}
          />
        )}
        <div className="feed-post-actions">
          <Link to={`/posts/${post.id}`} className="feed-action">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M1.751 10c0-4.42 3.584-8 8.005-8h4.366c4.49 0 8.129 3.64 8.129 8.13 0 2.96-1.607 5.68-4.196 7.11l-8.054 4.46v-3.69h-.067c-4.49.1-8.183-3.51-8.183-8.01z"/></svg>
            {post.commentCount}
          </Link>
          <button
            className={`feed-action feed-action-like ${liked ? 'feed-action-liked' : ''}`}
            onClick={toggleLike}
            disabled={!user || likeBusy}
            title={user ? (liked ? 'Unlike' : 'Like') : 'Log in to like posts'}
          >
            <svg viewBox="0 0 24 24" width="18" height="18" fill={liked ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2">
              <path d="M12 21s-6.716-4.35-9.5-8.05C.5 10.2 1 6.5 4.2 5.1 6.6 4.05 9 5 12 8c3-3 5.4-3.95 7.8-2.9C23 6.5 23.5 10.2 21.5 12.95 18.716 16.65 12 21 12 21z" />
            </svg>
            {likeCount}
          </button>
        </div>
      </div>
    </article>
  )
}
