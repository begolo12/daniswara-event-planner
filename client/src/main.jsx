import React, { Suspense } from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import App from './App';
import ErrorBoundary from './components/ErrorBoundary';
import LoadingSpinner from './components/ui/LoadingSpinner';
import './index.css';
import { useAuthStore, setNavigate } from './store/authStore';
import { useNavigate } from 'react-router-dom';

function InitAuth() {
  const navigate = useNavigate();
  const initSession = useAuthStore((s) => s.initSession);

  React.useEffect(() => {
    setNavigate(navigate);
    initSession();
  }, [navigate, initSession]);

  return null;
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <ErrorBoundary>
        <InitAuth />
        <Suspense
          fallback={
            <div className="flex items-center justify-center min-h-screen bg-gray-50">
              <LoadingSpinner size="lg" />
            </div>
          }
        >
          <App />
        </Suspense>
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              borderRadius: '10px',
              background: '#111827',
              color: '#fff',
              fontSize: '14px',
            },
            success: {
              iconTheme: { primary: '#22C55E', secondary: '#fff' },
            },
            error: {
              iconTheme: { primary: '#EF4444', secondary: '#fff' },
            },
          }}
        />
      </ErrorBoundary>
    </BrowserRouter>
  </React.StrictMode>
);
