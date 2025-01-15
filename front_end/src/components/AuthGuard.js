import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const AuthGuard = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const isLoggedIn = localStorage.getItem('token') || sessionStorage.getItem('token');

  useEffect(() => {
    // If user is logged in and tries to access auth pages, redirect to dashboard
    if (isLoggedIn && ['/signin', '/signup', '/'].includes(location.pathname)) {
      navigate('/dashboard');
    }
    // If user is not logged in and tries to access protected pages, redirect to signin
    else if (!isLoggedIn && !['/signin', '/signup', '/'].includes(location.pathname)) {
      navigate('/signin');
    }
  }, [isLoggedIn, navigate, location]);

  // For auth pages (signin/signup), only show if not logged in
  if (['/signin', '/signup'].includes(location.pathname)) {
    return !isLoggedIn ? children : null;
  }

  // For landing page, show if not logged in
  if (location.pathname === '/') {
    return !isLoggedIn ? children : null;
  }

  // For protected pages, show if logged in
  return isLoggedIn ? children : null;
};

export default AuthGuard;
