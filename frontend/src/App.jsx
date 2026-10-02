import { Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'
import PostDetail from './pages/PostDetail'
import CreatePost from './pages/CreatePost'
import EditPost from './pages/EditPost'
import AdminDashboard from './pages/AdminDashboard'
import Profile from './pages/Profile'
import FollowList from './pages/FollowList'
import Notifications from './pages/Notifications'
import PrivateRoute from './components/PrivateRoute'

export default function App() {
  return (
    <>
      <Navbar />
      <main>
        <Routes>
          <Route path="/" element={<PrivateRoute><Home /></PrivateRoute>} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/posts/:id" element={<PostDetail />} />
          <Route path="/create" element={<PrivateRoute><CreatePost /></PrivateRoute>} />
          <Route path="/posts/:id/edit" element={<PrivateRoute><EditPost /></PrivateRoute>} />
          <Route path="/admin" element={<PrivateRoute adminOnly><AdminDashboard /></PrivateRoute>} />
          <Route path="/profile/:username" element={<Profile />} />
          <Route path="/profile/:username/followers" element={<FollowList />} />
          <Route path="/profile/:username/following" element={<FollowList />} />
          <Route path="/notifications" element={<PrivateRoute><Notifications /></PrivateRoute>} />
        </Routes>
      </main>
    </>
  )
}
