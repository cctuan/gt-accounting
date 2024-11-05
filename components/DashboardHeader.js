import Link from 'next/link';
import { signOut } from 'next-auth/react';

export default function DashboardHeader({ title, subtitle, onDebug }) {
  const handleSignOut = () => {
    signOut({ callbackUrl: '/' });
  };

  return (
    <header className="bg-white shadow">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">{title}</h1>
            {subtitle && (
              <p className="mt-1 text-sm text-gray-500">{subtitle}</p>
            )}
          </div>
          
          <div className="flex items-center space-x-4">
            <nav className="flex space-x-4">
              <Link
                href="/dashboard"
                className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
              >
                帳單模組管理
              </Link>
              <Link
                href="/admin"
                className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
              >
                系統設定
              </Link>
            </nav>
            
            {process.env.NODE_ENV === 'development' && onDebug && (
              <button
                onClick={onDebug}
                className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
              >
                Debug Storage
              </button>
            )}
            
            <button
              onClick={handleSignOut}
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              登出
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
