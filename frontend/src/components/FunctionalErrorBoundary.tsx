import React, { useState, ReactNode } from 'react';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: (error: Error, retry: () => void) => ReactNode;
}

export function FunctionalErrorBoundary({ 
  children, 
  fallback 
}: ErrorBoundaryProps) {
  const [hasError, setHasError] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const handleRetry = () => {
    setHasError(false);
    setError(null);
  };

  if (hasError && error) {
    return fallback ? fallback(error, handleRetry) : (
      <div className="min-h-screen flex items-center justify-center bg-red-50">
        <div className="max-w-md w-full bg-white rounded-3xl shadow-elevated p-8">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Something went wrong</h1>
          <p className="text-gray-600 mb-6">{error.message}</p>
          <button
            onClick={handleRetry}
            className="w-full py-2 px-4 bg-primary text-white rounded-xl hover:bg-opacity-90 transition"
          >
            Try again
          </button>
          <p className="text-xs text-gray-500 mt-4">
            If the problem persists, please refresh the page or contact support.
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
