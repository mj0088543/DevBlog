import { useEffect, useState } from 'react'
import api from '../api/axios'

export default function AdminDashboard() {
  const [stats, setStats] = useState(null)
  const [users, setUsers] = useState([])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setLoading(true)
    try {
      const [statsRes, usersRes] = await Promise.all([
        api.get('/admin/stats'),
        api.get('/admin/users'),
      ])
      setStats(statsRes.data)
      setUsers(usersRes.data)
    } catch (err) {
      setError('Could not load admin data')
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteUser = async (id, username) => {
    if (!confirm(`Delete user "${username}"? Their posts and comments will also be removed.`)) return
    try {
      await api.delete(`/admin/users/${id}`)
      setUsers(users.filter((u) => u.id !== id))
    } catch (err) {
      setError('Could not delete user')
    }
  }

  if (loading) return <div className="container"><p className="empty-state">Loading...</p></div>

  return (
    <div className="container">
      <h1>Admin Dashboard</h1>
      {error && <div className="alert-error">{error}</div>}

      {stats && (
        <div className="stats-grid">
          <div className="stat-card">
            <span className="stat-value">{stats.totalUsers}</span>
            <span className="stat-label">Total users</span>
          </div>
          <div className="stat-card">
            <span className="stat-value">{stats.totalPosts}</span>
            <span className="stat-label">Total posts</span>
          </div>
        </div>
      )}

      <h2>Manage users</h2>
      <div className="table-wrapper">
        <table>
          <thead>
            <tr><th>Username</th><th>Email</th><th>Role</th><th>Joined</th><th></th></tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id}>
                <td>{u.username}</td>
                <td>{u.email}</td>
                <td><span className={`badge ${u.role === 'ADMIN' ? 'badge-admin' : ''}`}>{u.role}</span></td>
                <td>{new Date(u.createdAt).toLocaleDateString()}</td>
                <td>
                  {u.role !== 'ADMIN' && (
                    <button className="btn-link-danger" onClick={() => handleDeleteUser(u.id, u.username)}>Delete</button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
