// pages/index.js
import { signIn, useSession } from 'next-auth/react';
import { useEffect } from 'react';
import { useRouter } from 'next/router';

export default function Home() {
  const { data: session } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (session) {
      router.push('/dashboard');
    }
  }, [session, router]);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 sm:text-5xl">
            自動信用卡帳單下載服務
          </h1>
          <p className="mt-3 max-w-2xl mx-auto text-xl text-gray-500 sm:mt-4">
            自動檢查您的 Gmail 信箱，下載各家銀行的信用卡帳單 PDF 檔案
          </p>
          
          <div className="mt-10">
            {!session && (
              <button
                onClick={() => signIn('google')}
                className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
              >
                <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                  {/* Google icon SVG */}
                </svg>
                使用 Google 帳號登入
              </button>
            )}
          </div>

          {/* 服務特點 */}
          <div className="mt-20 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            <div className="pt-6">
              <div className="flow-root bg-white rounded-lg px-6 pb-8">
                <div className="-mt-6">
                  <div className="inline-flex items-center justify-center p-3 bg-indigo-500 rounded-md shadow-lg">
                    {/* Icon */}
                  </div>
                  <h3 className="mt-8 text-lg font-medium text-gray-900">自動化處理</h3>
                  <p className="mt-5 text-base text-gray-500">
                    定期自動檢查您的信箱，無需手動下載帳單
                  </p>
                </div>
              </div>
            </div>
            {/* 可以添加更多特點 */}
          </div>
        </div>
      </div>
    </div>
  );
}
