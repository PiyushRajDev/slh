import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import LoginPage from './pages/LoginPage'
import SubmitPage from './pages/SubmitPage'
import NotFoundPage from './pages/NotFoundPage'
import TalentPreviewPage from './pages/TalentPreviewPage'

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { token } = useAuth()
  return token ? <>{children}</> : <Navigate to="/login" replace />
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/" element={<Navigate to="/students" replace />} />
          <Route path="/students" element={<TalentPreviewPage mode="students" />} />
          <Route path="/batches" element={<TalentPreviewPage mode="batches" />} />
          <Route path="/project-analysis" element={<ProtectedRoute><SubmitPage /></ProtectedRoute>} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App
