import { useState } from 'react';
import DashboardHeader from '@/components/DashboardHeader';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { TrashIcon } from '@heroicons/react/24/outline';

export default function AdminPage() {
  const [settings, setSettings] = useLocalStorage('admin_settings', {
    systemPrompt: `你是一個專業的信用卡帳單解析助手。請協助解析信用卡帳單圖片，並提取以下資訊：
- 銀行名稱和卡片類型
- 帳單月份
- 所有交易明細，包含日期、描述、金額

請將每筆交易分類為以下類別之一：
- 食物：餐廳、超市、便利商店、外送平台等食品相關消費
- 交通：加油、停車費、計程車、大眾運輸、高鐵、機票等交通相關支出
- 購物：衣服、電子產品、日用品、網購平台等一般消費
- 娛樂：電影、遊戲、運動、健身房、旅遊等休閒活動
- 醫療：醫院、診所、藥局、保健食品等醫療保健支出
- 其他：無法明確分類的項目，如保險、繳費、轉帳等

請確保所有金額都是數字格式，日期都是標準格式。`,
    categories: [
      {
        name: "食物",
        description: "餐廳、超市、便利商店、外送平台等食品相關消費"
      },
      {
        name: "交通",
        description: "加油、停車費、計程車、大眾運輸、高鐵、機票等交通相關支出"
      },
      {
        name: "購物",
        description: "衣服、電子產品、日用品、網購平台等一般消費"
      },
      {
        name: "娛樂",
        description: "電影、遊戲、運動、健身房、旅遊等休閒活動"
      },
      {
        name: "醫療",
        description: "醫院、診所、藥局、保健食品等醫療保健支出"
      },
      {
        name: "其他",
        description: "無法明確分類的項目，如保險、繳費、轉帳等"
      }
    ],
    dateFormat: 'YYYY-MM-DD'
  });

  const [isEditing, setIsEditing] = useState(false);
  const [tempSettings, setTempSettings] = useState(settings);

  const handleEdit = () => {
    setTempSettings(settings);
    setIsEditing(true);
  };

  const handleCancel = () => {
    setTempSettings(settings);
    setIsEditing(false);
  };

  const handleSave = () => {
    setSettings(tempSettings);
    setIsEditing(false);
  };

  const handleAddCategory = () => {
    setTempSettings({
      ...tempSettings,
      categories: [
        ...tempSettings.categories,
        { name: '', description: '' }
      ]
    });
  };

  const handleRemoveCategory = (index) => {
    setTempSettings({
      ...tempSettings,
      categories: tempSettings.categories.filter((_, i) => i !== index)
    });
  };

  const handleCategoryChange = (index, field, value) => {
    const newCategories = [...tempSettings.categories];
    newCategories[index] = {
      ...newCategories[index],
      [field]: value
    };
    setTempSettings({
      ...tempSettings,
      categories: newCategories
    });
  };

  const debugStorage = () => {
    console.log('Current settings:', settings);
    console.log('LocalStorage:', localStorage.getItem('admin_settings'));
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      <DashboardHeader 
        title="系統設定"
        subtitle="設定系統的基本參數和提示詞"
        onDebug={debugStorage}
      />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg">
          <div className="px-4 py-5 border-b border-gray-200 dark:border-gray-700 sm:px-6">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                設定內容
              </h3>
              <div className="flex space-x-3">
                {isEditing ? (
                  <>
                    <button
                      onClick={handleSave}
                      className="bg-blue-600 dark:bg-blue-500 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 dark:hover:bg-blue-600"
                    >
                      儲存
                    </button>
                    <button
                      onClick={handleCancel}
                      className="bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-200 dark:hover:bg-gray-600"
                    >
                      取消
                    </button>
                  </>
                ) : (
                  <button
                    onClick={handleEdit}
                    className="bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-200 dark:hover:bg-gray-600"
                  >
                    編輯
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="px-4 py-5 sm:p-6">
            <div className="space-y-6">
              {/* System Prompt */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  System Prompt
                </label>
                <div className="mt-1">
                  <textarea
                    rows={10}
                    className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                    value={isEditing ? tempSettings.systemPrompt : settings.systemPrompt}
                    onChange={(e) => setTempSettings({
                      ...tempSettings,
                      systemPrompt: e.target.value
                    })}
                    disabled={!isEditing}
                  />
                </div>
              </div>

              {/* Categories */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    交易類別
                  </label>
                  {isEditing && (
                    <button
                      onClick={handleAddCategory}
                      className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
                    >
                      + 新增類別
                    </button>
                  )}
                </div>
                <div className="space-y-2">
                  {(isEditing ? tempSettings : settings).categories.map((category, index) => (
                    <div key={index} className="flex gap-2">
                      <input
                        type="text"
                        placeholder="類別名稱"
                        className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-1/4 sm:text-sm border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                        value={category.name}
                        onChange={(e) => handleCategoryChange(index, 'name', e.target.value)}
                        disabled={!isEditing}
                      />
                      <input
                        type="text"
                        placeholder="類別描述"
                        className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-3/4 sm:text-sm border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                        value={category.description}
                        onChange={(e) => handleCategoryChange(index, 'description', e.target.value)}
                        disabled={!isEditing}
                      />
                      {isEditing && (
                        <button
                          onClick={() => handleRemoveCategory(index)}
                          className="p-2 text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md"
                          title="刪除類別"
                        >
                          <TrashIcon className="h-5 w-5" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Date Format */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  日期格式
                </label>
                <div className="mt-1">
                  <input
                    type="text"
                    className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                    value={isEditing ? tempSettings.dateFormat : settings.dateFormat}
                    onChange={(e) => setTempSettings({
                      ...tempSettings,
                      dateFormat: e.target.value
                    })}
                    disabled={!isEditing}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
