import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Login() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await login(username, password)
      navigate('/')
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container auth-container">
      <form className="auth-form" onSubmit={handleSubmit}>
        <h1>Log in</h1>
        {error && <div className="alert-error">{error}</div>}
        <label>Username
          <input value={username} onChange={(e) => setUsername(e.target.value)} required />
        </label>
        <label>Password
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        </label>
        <button type="submit" className="btn-primary" disabled={loading}>
          {loading ? 'Logging in...' : 'Log in'}
        </button>
        <p className="auth-switch">No account? <Link to="/register">Sign up</Link></p>
        <p className="auth-hint">Admin demo: admin / admin123</p>
      </form>
    </div>
  )
}
