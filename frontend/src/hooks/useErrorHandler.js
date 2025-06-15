import { useState, useCallback } from 'react';

export const useErrorHandler = () => {
  const [error, setError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);

  const handleError = useCallback((error) => {
    console.error('API Error:', error);
    
    // Extract error message
    let errorMessage = 'An unexpected error occurred';
    if (error.response?.data?.detail) {
      errorMessage = error.response.data.detail;
    } else if (error.message) {
      errorMessage = error.message;
    }

    // Handle specific error types
    if (error.response?.status === 404) {
      errorMessage = 'The requested resource was not found';
    } else if (error.response?.status === 403) {
      errorMessage = 'You do not have permission to access this resource';
    } else if (error.response?.status === 401) {
      errorMessage = 'Please log in to access this resource';
    } else if (error.response?.status === 429) {
      errorMessage = 'Too many requests. Please try again later';
    } else if (!error.response) {
      errorMessage = 'Network error. Please check your connection';
    }

    setError(errorMessage);
    setRetryCount(prev => prev + 1);
  }, []);

  const clearError = useCallback(() => {
    setError(null);
    setRetryCount(0);
  }, []);

  return {
    error,
    retryCount,
    handleError,
    clearError,
  };
}; 