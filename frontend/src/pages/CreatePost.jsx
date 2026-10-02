import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api/axios'

export default function CreatePost() {
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const { data } = await api.post('/posts', { title, content, imageUrl: imageUrl.trim() || null })
      navigate(`/posts/${data.id}`)
    } catch (err) {
      setError(err.response?.data?.message || 'Could not create post')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container">
      <form className="post-form" onSubmit={handleSubmit}>
        <h1>Create a new post</h1>
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
          {loading ? 'Publishing...' : 'Publish post'}
        </button>
      </form>
    </div>
  )
}
