'use client';

import React from 'react';
import { useTheme } from '../contexts/ThemeContext';

const ThemeToggle: React.FC = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="
        relative flex items-center justify-center
        w-12 h-6 bg-gray-300 dark:bg-gray-600 
        rounded-full p-1 cursor-pointer
        transition-colors duration-300 ease-in-out
        hover:bg-gray-400 dark:hover:bg-gray-500
        focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400
        focus:ring-opacity-50
      "
      aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
    >
      {/* Toggle Circle */}
      <div
        className={`
          absolute w-4 h-4 bg-white dark:bg-gray-200 rounded-full shadow-md
          transform transition-transform duration-300 ease-in-out
          ${theme === 'dark' ? 'translate-x-6' : 'translate-x-0'}
        `}
      />
      
      {/* Sun Icon */}
      <svg
        className={`
          w-3 h-3 text-yellow-500 absolute left-1
          transition-opacity duration-300 ease-in-out
          ${theme === 'dark' ? 'opacity-0' : 'opacity-100'}
        `}
        fill="currentColor"
        viewBox="0 0 20 20"
      >
        <path
          fillRule="evenodd"
          d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z"
          clipRule="evenodd"
        />
      </svg>
      
      {/* Moon Icon */}
      <svg
        className={`
          w-3 h-3 text-blue-300 absolute right-1
          transition-opacity duration-300 ease-in-out
          ${theme === 'dark' ? 'opacity-100' : 'opacity-0'}
        `}
        fill="currentColor"
        viewBox="0 0 20 20"
      >
        <path
          d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z"
        />
      </svg>
    </button>
  );
};

export default ThemeToggle;
