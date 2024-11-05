import { useState, useEffect } from 'react';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';

export default function ModuleForm({ onClose, onSubmit, onDelete, editingModule = null }) {
  const [formData, setFormData] = useState({
    name: '',
    bank: '玉山',
    keywords: [],
    schedule: 'daily',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (editingModule) {
      setFormData(editingModule);
    }
  }, [editingModule]);

  const handleSubmit = () => {
    if (!formData.name || !formData.password) {
      alert('請填寫模組名稱和密碼');
      return;
    }
    onSubmit({
      ...formData,
      id: editingModule?.id
    });
  };

  const handleDelete = () => {
    if (window.confirm('確定要刪除這個模組嗎？')) {
      onDelete(editingModule.id);
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center">
      <div className="bg-white rounded-lg p-6 max-w-md w-full">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-medium">
            {editingModule ? '編輯帳單檢查模組' : '新增帳單檢查模組'}
          </h2>
          {editingModule && (
            <button
              onClick={handleDelete}
              className="text-sm text-red-600 hover:text-red-700"
            >
              刪除模組
            </button>
          )}
        </div>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              模組名稱
            </label>
            <input
              type="text"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              placeholder="例：玉山信用卡帳單"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              銀行
            </label>
            <select
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              value={formData.bank}
              onChange={(e) => setFormData({...formData, bank: e.target.value})}
            >
              <option value="玉山">玉山銀行</option>
              <option value="國泰">國泰銀行</option>
              <option value="台新">台新銀行</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              密碼
              <span className="text-xs text-gray-500 ml-1">
                (用於解密 PDF 文件)
              </span>
            </label>
            <div className="mt-1 relative rounded-md shadow-sm">
              <input
                type={showPassword ? "text" : "password"}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 pr-10"
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
                placeholder="請輸入 PDF 密碼"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 px-3 flex items-center"
              >
                {showPassword ? (
                  <EyeSlashIcon className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                ) : (
                  <EyeIcon className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                )}
              </button>
            </div>
            <p className="mt-1 text-xs text-gray-500">
              通常為身分證後四碼或信用卡後四碼
            </p>
          </div>

          <div className="mt-5 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            >
              取消
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md hover:bg-indigo-700"
            >
              {editingModule ? '更新' : '新增'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
