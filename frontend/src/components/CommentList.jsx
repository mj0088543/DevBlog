import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
}

export default function CommentList({ comments, onDelete }) {
  const { user, isAdmin } = useAuth()

  if (comments.length === 0) {
    return <p className="empty-state">No comments yet. Be the first to comment!</p>
  }

  return (
    <ul className="comment-list">
      {comments.map((c) => (
        <li key={c.id} className="comment-item">
          <div className="comment-header">
            <strong><Link to={`/profile/${c.authorUsername}`}>{c.authorUsername}</Link></strong>
            <span className="comment-date">{formatDate(c.createdAt)}</span>
          </div>
          <p className="comment-content">{c.content}</p>
          {user && (user.username === c.authorUsername || isAdmin) && (
            <button className="btn-link-danger" onClick={() => onDelete(c.id)}>Delete</button>
          )}
        </li>
      ))}
    </ul>
  )
}
