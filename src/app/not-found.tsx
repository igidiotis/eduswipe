'use client';

import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
      <h1 className="text-6xl font-bold text-blue-600 dark:text-blue-400 mb-6">404</h1>
      <h2 className="text-2xl font-semibold text-gray-800 dark:text-white mb-4">Page Not Found</h2>
      <p className="text-gray-600 dark:text-gray-300 mb-8 text-center max-w-md">
        The page you are looking for doesn&apos;t exist or has been moved.
      </p>
      <Link 
        href="/"
        className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
      >
        Go to Home
      </Link>
    </div>
  );
} 