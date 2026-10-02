import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import api from '../api/axios'
import FeedPost from '../components/FeedPost'
import { useAuth } from '../context/AuthContext'

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('en-US', { year: 'numeric', month: 'long' })
}

export default function Profile() {
  const { username } = useParams()
  const { user: currentUser } = useAuth()
  const [profile, setProfile] = useState(null)
  const [posts, setPosts] = useState([])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  const [followLoading, setFollowLoading] = useState(false)

  useEffect(() => {
    loadData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [username])

  const loadData = async () => {
    setLoading(true)
    setError('')
    try {
      const [profileRes, postsRes] = await Promise.all([
        api.get(`/users/${username}`),
        api.get(`/users/${username}/posts`),
      ])
      setProfile(profileRes.data)
      setPosts(postsRes.data.content)
    } catch (err) {
      setError('Profile not found')
    } finally {
      setLoading(false)
    }
  }

  // Re-fetches just the profile summary (not the posts list) from the server,
  // rather than hand-computing the new follow state/count on the frontend.
  // This guarantees the button and counts always match what the database
  // actually has, so there's no way for them to drift out of sync with
  // reality or with each other.
  const reloadProfile = async () => {
    const { data } = await api.get(`/users/${username}`)
    setProfile(data)
  }

  const handleFollowToggle = async () => {
    if (followLoading) return
    setFollowLoading(true)
    setError('')
    try {
      if (profile.isFollowing) {
        await api.delete(`/users/${username}/follow`)
      } else {
        await api.post(`/users/${username}/follow`)
      }
      await reloadProfile()
    } catch (err) {
      setError('Could not update follow status')
    } finally {
      setFollowLoading(false)
    }
  }

  if (loading) return <div className="container"><p className="empty-state">Loading...</p></div>
  if (error && !profile) return <div className="container"><div className="alert-error">{error}</div></div>

  return (
    <div className="container">
      <div className="profile-header">
        <div className="profile-header-top">
          <div>
            <h1 className="profile-username">{profile.username}</h1>
            <p className="profile-joined">Joined {formatDate(profile.joinedAt)}</p>
          </div>
          {currentUser && currentUser.username !== profile.username && !profile.isSelf && (
            <button
              className={profile.isFollowing ? 'btn-secondary-sm' : 'btn-primary-sm'}
              onClick={handleFollowToggle}
              disabled={followLoading}
            >
              {followLoading ? '...' : (profile.isFollowing ? 'Following' : 'Follow')}
            </button>
          )}
        </div>
        <div className="profile-stats">
          <span>{profile.postsCount} post{profile.postsCount === 1 ? '' : 's'}</span>
          <Link to={`/profile/${username}/following`}>{profile.followingCount} Following</Link>
          <Link to={`/profile/${username}/followers`}>{profile.followersCount} Follower{profile.followersCount === 1 ? '' : 's'}</Link>
        </div>
      </div>

      {error && <div className="alert-error">{error}</div>}

      <h2>Posts</h2>
      {posts.length === 0 ? (
        <p className="empty-state">No posts yet.</p>
      ) : (
        <div className="feed-list">
          {posts.map((post) => <FeedPost key={post.id} post={post} />)}
        </div>
      )}
    </div>
  )
}
