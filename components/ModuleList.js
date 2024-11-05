import { useState } from 'react';
import { parsePDF } from '../lib/pdfParser';
import BillChart from './BillChart';

export default function ModuleList({ modules, onEdit }) {
  const [isLoading, setIsLoading] = useState(false);
  const [checkResults, setCheckResults] = useState({ emails: [] });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentBank, setCurrentBank] = useState('');
  const [processingPdf, setProcessingPdf] = useState(false);

  const handlePdfPassword = async (attachment, module) => {
    setProcessingPdf(true);
    try {
      // 從 localStorage 獲取系統設定
      const adminSettings = JSON.parse(localStorage.getItem('admin_settings') || '{}');
      
      const base64Images = await parsePDF(attachment.data, module.password);
      const response = await fetch('/api/parse-bill', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          base64Images,
          settings: {
            systemPrompt: adminSettings.systemPrompt,
            categories: adminSettings.categories,
            dateFormat: adminSettings.dateFormat
          }
        }),
      });
      if (!response.ok) {
        throw new Error('Failed to analyze bill');
      }
      const billData = await response.json();

      // 更新附件內容
      const updatedEmails = checkResults.emails.map(email => ({
        ...email,
        attachments: email.attachments.map(att => 
          att === attachment ? { ...att, content: {...billData, bankName: module.bank} } : att
        )
      }));
      
      setCheckResults(prev => ({ ...prev, emails: updatedEmails }));
    } catch (error) {
      console.error('Error parsing PDF:', error);
      alert('無法解析 PDF：' + error.message);
    } finally {
      setProcessingPdf(false);
    }
  };
  const handleCheck = async (bank) => {
    setIsLoading(true);
    setCurrentBank(bank);
    try {
      const response = await fetch(`/api/check-email?bank=${bank}`);
      const data = await response.json();
      setCheckResults(data);
      setIsModalOpen(true);
    } catch (error) {
      console.error('Error checking emails:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <ul className="divide-y divide-gray-200">
          {modules?.map((module) => (
            <li key={module.id || module._id}>
              <div className="px-4 py-4 sm:px-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-medium text-gray-900 truncate">
                      {module.name}
                    </h3>
                    <div className="mt-2 flex items-center text-sm text-gray-500">
                      <span className="truncate">
                        {module.bank} 銀行 | 
                        檢查頻率: {module.schedule || '每日'} | 
                        上次檢查: {module.lastCheck || '從未檢查'}
                      </span>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => handleCheck(module.bank)}
                      disabled={isLoading}
                      className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400"
                    >
                      {isLoading ? '檢查中...' : '手動檢查'}
                    </button>
                    
                    <button
                      onClick={() => onEdit(module)}
                      className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                    >
                      編輯
                    </button>
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>

      {/* 檢查結果 Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex min-h-screen items-end justify-center px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            {/* 背景遮罩 */}
            <div 
              className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
              onClick={() => setIsModalOpen(false)}
            />

            {/* Modal 內容置中 */}
            <div className="inline-block w-full max-w-2xl transform overflow-hidden rounded-lg bg-white text-left align-bottom shadow-xl transition-all sm:my-8 sm:align-middle">
              {/* Modal 標題 */}
              <div className="bg-white px-6 pt-5 pb-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium text-gray-900">
                    {currentBank} 銀行檢查結果
                  </h3>
                  <button
                    onClick={() => setIsModalOpen(false)}
                    className="text-gray-400 hover:text-gray-500"
                  >
                    <span className="sr-only">關閉</span>
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Modal 內容區 - 可滾動 */}
              <div className="max-h-[calc(100vh-200px)] overflow-y-auto px-6 py-4">
                {checkResults.emails?.length > 0 ? (
                  <>
                    <p className="font-medium mb-2">找到的郵件：</p>
                    <ul className="list-disc pl-5 space-y-4">
                      {checkResults.emails.map((email, index) => (
                        <li key={index} className="text-sm">
                          <div className="text-gray-600">{email.title}</div>
                          {email.attachments?.length > 0 && (
                            <div className="mt-2 space-y-4">
                              {email.attachments.map((att, idx) => (
                                <div key={idx} className="bg-gray-50 p-4 rounded">
                                  <div className="flex items-center justify-between">
                                    <span className="text-gray-500 text-xs">
                                      附件：{att.filename}
                                    </span>
                                    {att.filename.endsWith('.pdf') && !att.content && (
                                      <button
                                        onClick={() => handlePdfPassword(att, modules.find(m => m.bank === currentBank))}
                                        disabled={processingPdf}
                                        className="px-2 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-blue-300"
                                      >
                                        {processingPdf ? '處理中...' : '解析 PDF'}
                                      </button>
                                    )}
                                  </div>
                                  {att.content && (
                                    <div className="mt-3">
                                      <BillChart billData={att.content} />
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          )}
                        </li>
                      ))}
                    </ul>
                  </>
                ) : (
                  <p className="text-sm text-gray-600">沒有找到相關郵件</p>
                )}
              </div>

              {/* Modal 底部按鈕 */}
              <div className="bg-gray-50 px-6 py-4">
                <div className="flex justify-end">
                  <button
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
                  >
                    關閉
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
