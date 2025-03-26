import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const ProtectedRoutes = ({ Component }) => {
  const [loading, setLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Request to verify token and check if authenticated
        const response = await axios.get('/auth/verify-token', { withCredentials: true });
        console.log("===========>", response);
        
        if (response.status !== 401) {  // Corrected this line
          setAuthenticated(true);
        } else {
          navigate('/');  // Redirect to login if not authenticated
        }
      } catch (error) {
        console.error('Authentication error', error);
        if (error.response && error.response.status === 401) {
          // Token expired or invalid, redirect to login
          navigate('/');
        }
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [navigate]);

  // Show loading screen while checking authentication
  if (loading) return <div>Loading...</div>;

  // If authenticated, render the protected component
  return authenticated ? <Component /> : null;
};

export default ProtectedRoutes;
