import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

/**
 * Global keyboard shortcuts for the application.
 * - Ctrl+N: New event
 * - Ctrl+K: Focus search (opens search in header)
 * - Ctrl+D: Go to Dashboard
 * - Ctrl+E: Go to Events list
 * - Escape: Close active modal/drawer
 */
export default function useKeyboardShortcuts() {
  const navigate = useNavigate();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  useEffect(() => {
    if (!isAuthenticated) return;

    const handleKeyDown = (e) => {
      // Only trigger with Ctrl key held
      if (!e.ctrlKey && !e.metaKey) return;

      const key = e.key.toLowerCase();

      switch (key) {
        case 'n':
          e.preventDefault();
          navigate('/events/create');
          break;
        case 'k':
          e.preventDefault();
          // Focus the search input in the header
          const searchInput = document.querySelector('header input[type="text"]');
          if (searchInput) searchInput.focus();
          break;
        case 'd':
          e.preventDefault();
          navigate('/');
          break;
        case 'e':
          e.preventDefault();
          navigate('/events');
          break;
        default:
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [navigate, isAuthenticated]);
}
