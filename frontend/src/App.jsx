import { Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import Landing from './pages/Landing'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import QuizGeneratorPage from './pages/QuizGeneratorPage'
import StudyPlannerPage from './pages/StudyPlannerPage'
import InstructorAnalytics from './pages/InstructorAnalytics'
import CodingWorkspace from './pages/CodingWorkspace'
import CreateChallenge from './pages/CreateChallenge'
import CourseChallenges from './pages/CourseChallenges'
import CourseDetails from './pages/CourseDetails'
import Recommendations from './pages/Recommendations'
import CertificatesHistory from './pages/CertificatesHistory'
import CertificateVerify from './pages/CertificateVerify'
import ProtectedRoute from './routes/ProtectedRoute'
import AIChatbot from './components/AIChatbot'
import { useEffect, useState } from 'react'
import { Toaster } from 'react-hot-toast'

function App() {
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light')

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
    localStorage.setItem('theme', theme)
  }, [theme])

  const toggleTheme = () => setTheme(theme === 'light' ? 'dark' : 'light')

  return (
    <div className="flex flex-col min-h-screen">
      <Toaster position="top-right" containerStyle={{ top: 72 }} />
      <Navbar theme={theme} toggleTheme={toggleTheme} />
      <main className="flex-grow pt-20">
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/verify/:credentialId" element={<CertificateVerify />} />
          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/recommendations" element={<Recommendations />} />
            <Route path="/courses" element={<Recommendations />} />
            <Route path="/certificates" element={<CertificatesHistory />} />
            <Route path="/quiz-generator" element={<QuizGeneratorPage />} />
            <Route path="/study-planner" element={<StudyPlannerPage />} />
            <Route path="/instructor-analytics" element={<InstructorAnalytics />} />
            <Route path="/coding/:challengeId" element={<CodingWorkspace />} />
            <Route path="/instructor/create-challenge" element={<CreateChallenge />} />
            <Route path="/courses/:courseId" element={<CourseDetails />} />
            <Route path="/courses/:courseId/challenges" element={<CourseChallenges />} />
          </Route>
        </Routes>
      </main>
      <Footer />
      <AIChatbot />
    </div>
  )
}

export default App
