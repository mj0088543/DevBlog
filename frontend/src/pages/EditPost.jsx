import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import api from '../api/axios'

export default function EditPost() {
  const { id } = useParams()
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [initialLoading, setInitialLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    api.get(`/posts/${id}`).then(({ data }) => {
      setTitle(data.title)
      setContent(data.content)
      setImageUrl(data.imageUrl || '')
      setInitialLoading(false)
    }).catch(() => {
      setError('Could not load post')
      setInitialLoading(false)
    })
  }, [id])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await api.put(`/posts/${id}`, { title, content, imageUrl: imageUrl.trim() || null })
      navigate(`/posts/${id}`)
    } catch (err) {
      setError(err.response?.data?.message || 'Could not update post')
    } finally {
      setLoading(false)
    }
  }

  if (initialLoading) return <div className="container"><p className="empty-state">Loading...</p></div>

  return (
    <div className="container">
      <form className="post-form" onSubmit={handleSubmit}>
        <h1>Edit post</h1>
        {error && <div className="alert-error">{error}</div>}
        <label>Title
          <input value={title} onChange={(e) => setTitle(e.target.value)} required />
        </label>
        <label>Cover image URL (optional)
          <input
            type="url"
            placeholder="https://images.unsplash.com/..."
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
          />
        </label>
        {imageUrl.trim() && (
          <img src={imageUrl} alt="Cover preview" className="image-preview" onError={(e) => { e.target.style.display = 'none' }} />
        )}
        <label>Content
          <textarea rows={12} value={content} onChange={(e) => setContent(e.target.value)} required />
        </label>
        <button type="submit" className="btn-primary" disabled={loading}>
          {loading ? 'Saving...' : 'Save changes'}
        </button>
      </form>
    </div>
  )
}
