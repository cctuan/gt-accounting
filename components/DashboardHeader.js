import { useState, useEffect } from 'react';
import Link from 'next/link';
import { signOut } from 'next-auth/react';
import { SunIcon, MoonIcon } from '@heroicons/react/24/outline';

export default function DashboardHeader({ title, subtitle, onDebug }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSignOut = () => {
    signOut({ callbackUrl: '/' });
  };

  return (
    <header className="bg-white dark:bg-gray-800 shadow">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
              {title}
            </h1>
            {subtitle && (
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                {subtitle}
              </p>
            )}
          </div>
          
          <div className="flex items-center space-x-4">
            <nav className="flex space-x-4">
              <Link
                href="/dashboard"
                className="text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200"
              >
                首頁
              </Link>
              <Link
                href="/admin"
                className="text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200"
              >
                系統設定
              </Link>
            </nav>
            
            {process.env.NODE_ENV === 'development' && onDebug && (
              <button
                onClick={onDebug}
                className="inline-flex items-center px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors duration-200"
              >
                Debug Storage
              </button>
            )}
            
            <button
              onClick={handleSignOut}
              className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors duration-200"
            >
              登出
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
