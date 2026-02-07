import { useState } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import Login from './pages/Login'
import StudentDashboard from './pages/StudentDashboard'
import MentorDashboard from './pages/MentorDashboard'
import HODDashboard from './pages/HODDashboard'
import './App.css'

function App() {
  const [user, setUser] = useState(null);

  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<Navigate to="/login" />} />
          <Route path="/login" element={<Login setUser={setUser} />} />
          <Route
            path="/student-dashboard"
            element={user && user.role === 'student' ? <StudentDashboard user={user} /> : <Navigate to="/login" />}
          />
          <Route
            path="/mentor-dashboard"
            element={user && user.role === 'mentor' ? <MentorDashboard user={user} /> : <Navigate to="/login" />}
          />
          <Route
            path="/hod-dashboard"
            element={user && user.role === 'hod' ? <HODDashboard user={user} /> : <Navigate to="/login" />}
          />
        </Routes>
      </div>
    </Router>
  )
}

export default App
