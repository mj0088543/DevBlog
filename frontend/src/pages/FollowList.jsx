import { useEffect, useState } from 'react'
import { Link, useParams, useLocation } from 'react-router-dom'
import api from '../api/axios'

export default function FollowList() {
  const { username } = useParams()
  const location = useLocation()
  const mode = location.pathname.endsWith('/followers') ? 'followers' : 'following'

  const [list, setList] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    setLoading(true)
    api.get(`/users/${username}/${mode}`)
      .then(({ data }) => setList(data))
      .catch(() => setError('Could not load list'))
      .finally(() => setLoading(false))
  }, [username, mode])

  return (
    <div className="container">
      <h1>{mode === 'followers' ? `People following ${username}` : `People ${username} follows`}</h1>
      {error && <div className="alert-error">{error}</div>}
      {loading ? (
        <p className="empty-state">Loading...</p>
      ) : list.length === 0 ? (
        <p className="empty-state">Nobody here yet.</p>
      ) : (
        <ul className="follow-list">
          {list.map((u) => (
            <li key={u.id} className="follow-list-item">
              <Link to={`/profile/${u.username}`}>{u.username}</Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
