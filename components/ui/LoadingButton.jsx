'use client';
import { useState } from 'react';
import { ArrowPathIcon } from '@heroicons/react/24/outline';

export default function LoadingButton({ onClick, children, className = '', loadingText = 'שולח...' }) {
  const [isLoading, setIsLoading] = useState(false);

  const handleClick = async () => {
    setIsLoading(true);
    try {
      await onClick();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={handleClick}
      disabled={isLoading}
      className={`flex items-center justify-center gap-2 px-4 py-2 rounded font-bold transition duration-300 disabled:opacity-50 ${className}`}
    >
      {isLoading ? (
        <>
          <ArrowPathIcon className="w-5 h-5 animate-spin text-white" />
          {loadingText}
        </>
      ) : (
        children
      )}
    </button>
  );
}
