import { useState, useCallback } from 'react';

const DEFAULT_MAX_RETRIES = 3;
const DEFAULT_RETRY_DELAY = 1000; // 1 second

export function useRetry(maxRetries = DEFAULT_MAX_RETRIES, retryDelay = DEFAULT_RETRY_DELAY) {
  const [retryCount, setRetryCount] = useState(0);
  const [isRetrying, setIsRetrying] = useState(false);

  const executeWithRetry = useCallback(async (fn) => {
    let lastError;
    
    for (let i = 0; i <= maxRetries; i++) {
      try {
        setIsRetrying(i > 0);
        setRetryCount(i);
        return await fn();
      } catch (error) {
        lastError = error;
        if (i < maxRetries) {
          // Wait before retrying
          await new Promise(resolve => setTimeout(resolve, retryDelay * Math.pow(2, i))); // Exponential backoff
        }
      }
    }

    // If we've exhausted all retries, throw the last error
    throw lastError;
  }, [maxRetries, retryDelay]);

  const resetRetry = useCallback(() => {
    setRetryCount(0);
    setIsRetrying(false);
  }, []);

  return {
    executeWithRetry,
    resetRetry,
    retryCount,
    isRetrying,
  };
} 