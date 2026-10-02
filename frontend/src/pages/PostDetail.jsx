import { useEffect, useState } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import api from '../api/axios'
import CommentList from '../components/CommentList'
import { useAuth } from '../context/AuthContext'

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
}

function HeartIcon({ filled }) {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" fill={filled ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2">
      <path d="M12 21s-6.716-4.35-9.5-8.05C.5 10.2 1 6.5 4.2 5.1 6.6 4.05 9 5 12 8c3-3 5.4-3.95 7.8-2.9C23 6.5 23.5 10.2 21.5 12.95 18.716 16.65 12 21 12 21z" />
    </svg>
  )
}

export default function PostDetail() {
  const { id } = useParams()
  const [post, setPost] = useState(null)
  const [comments, setComments] = useState([])
  const [commentText, setCommentText] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  const { user, isAdmin } = useAuth()
  const navigate = useNavigate()
  const [liked, setLiked] = useState(false)
  const [likeCount, setLikeCount] = useState(0)
  const [likeBusy, setLikeBusy] = useState(false)

  useEffect(() => {
    loadData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  const loadData = async () => {
    setLoading(true)
    try {
      const [postRes, commentsRes] = await Promise.all([
        api.get(`/posts/${id}`),
        api.get(`/posts/${id}/comments`),
      ])
      setPost(postRes.data)
      setComments(commentsRes.data)
      setLiked(postRes.data.likedByMe)
      setLikeCount(postRes.data.likeCount)
    } catch (err) {
      setError('Post not found')
    } finally {
      setLoading(false)
    }
  }

  const handleToggleLike = async () => {
    if (!user || likeBusy) return
    setLikeBusy(true)
    const wasLiked = liked
    setLiked(!wasLiked)
    setLikeCount((c) => c + (wasLiked ? -1 : 1))
    try {
      if (wasLiked) await api.delete(`/posts/${id}/like`)
      else await api.post(`/posts/${id}/like`)
    } catch (err) {
      setLiked(wasLiked)
      setLikeCount((c) => c + (wasLiked ? 1 : -1))
      setError('Could not update like')
    } finally {
      setLikeBusy(false)
    }
  }

  const handleAddComment = async (e) => {
    e.preventDefault()
    if (!commentText.trim()) return
    try {
      const { data } = await api.post(`/posts/${id}/comments`, { content: commentText })
      setComments([...comments, data])
      setCommentText('')
    } catch (err) {
      setError(err.response?.data?.message || 'Could not add comment')
    }
  }

  const handleDeleteComment = async (commentId) => {
    if (!confirm('Delete this comment?')) return
    try {
      await api.delete(`/comments/${commentId}`)
      setComments(comments.filter((c) => c.id !== commentId))
    } catch (err) {
      setError('Could not delete comment')
    }
  }

  const handleDeletePost = async () => {
    if (!confirm('Delete this post? This cannot be undone.')) return
    try {
      await api.delete(`/posts/${id}`)
      navigate('/')
    } catch (err) {
      setError('Could not delete post')
    }
  }

  if (loading) return <div className="container"><p className="empty-state">Loading...</p></div>
  if (error && !post) return <div className="container"><div className="alert-error">{error}</div></div>

  const canManage = user && (user.username === post.authorUsername || isAdmin)

  return (
    <div className="container">
      <article className="post-detail">
        <h1>{post.title}</h1>
        {post.imageUrl && (
          <img src={post.imageUrl} alt={post.title} className="post-detail-image" onError={(e) => { e.target.style.display = 'none' }} />
        )}
        <div className="post-detail-meta">
          <span>By <Link to={`/profile/${post.authorUsername}`}>{post.authorUsername}</Link></span>
          <span>{formatDate(post.createdAt)}</span>
        </div>
        {canManage && (
          <div className="post-detail-actions">
            <Link to={`/posts/${id}/edit`} className="btn-secondary-sm">Edit</Link>
            <button className="btn-danger-sm" onClick={handleDeletePost}>Delete</button>
          </div>
        )}
        <div className="post-detail-content">
          {post.content.split('\n').map((para, i) => <p key={i}>{para}</p>)}
        </div>
        <button
          className={`post-detail-like ${liked ? 'post-detail-liked' : ''}`}
          onClick={handleToggleLike}
          disabled={!user || likeBusy}
          title={user ? (liked ? 'Unlike' : 'Like') : 'Log in to like posts'}
        >
          <HeartIcon filled={liked} />
          {likeCount} like{likeCount === 1 ? '' : 's'}
        </button>
      </article>

      <section className="comments-section">
        <h2>Comments ({comments.length})</h2>
        {error && <div className="alert-error">{error}</div>}
        {user ? (
          <form className="comment-form" onSubmit={handleAddComment}>
            <textarea
              rows={3}
              placeholder="Write a comment..."
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              required
            />
            <button type="submit" className="btn-primary-sm">Post comment</button>
          </form>
        ) : (
          <p className="empty-state"><Link to="/login">Log in</Link> to leave a comment.</p>
        )}
        <CommentList comments={comments} onDelete={handleDeleteComment} />
      </section>
    </div>
  )
}
