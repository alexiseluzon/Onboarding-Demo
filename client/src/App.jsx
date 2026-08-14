import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import LoginPage from './pages/LoginPage.jsx';
import QuizPage from './pages/QuizPage.jsx';
import PaymentPage from './pages/PaymentPage.jsx';
import './App.css';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        {/* Skip link — WCAG 2.1 AA keyboard nav requirement */}
        <a href="#main-content" className="skip-link">Skip to main content</a>
        <main id="main-content">
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route
              path="/quiz"
              element={
                <ProtectedRoute>
                  <QuizPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/payment"
              element={
                <ProtectedRoute>
                  <PaymentPage />
                </ProtectedRoute>
              }
            />
            <Route path="/" element={<LoginPage />} />
          </Routes>
        </main>
      </BrowserRouter>
    </AuthProvider>
  );
}