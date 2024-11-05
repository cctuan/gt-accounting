import { useSession } from 'next-auth/react';
import { useState, useEffect } from 'react';
import DashboardHeader from '../components/DashboardHeader';
import ModuleForm from '../components/ModuleForm';
import ModuleList from '../components/ModuleList';
import { useLocalStorage } from '../hooks/useLocalStorage';

export default function Dashboard() {
  const { data: session } = useSession();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const storageKey = `modules_${session?.user?.email}`;
  const [modules, setModules] = useLocalStorage(storageKey, []);
  const [editingModule, setEditingModule] = useState(null);

  useEffect(() => {
    if (session?.user?.email) {
      const savedModules = localStorage.getItem(storageKey);
      if (savedModules) {
        setModules(JSON.parse(savedModules));
      }
    }
  }, [session?.user?.email]);

  const handleSubmit = (moduleData) => {
    if (editingModule) {
      const updatedModules = modules.map(module => 
        module.id === moduleData.id ? moduleData : module
      );
      setModules(updatedModules);
    } else {
      const newModule = {
        ...moduleData,
        id: Date.now(),
        createdAt: new Date().toISOString(),
        userId: session?.user?.email
      };
      setModules([...modules, newModule]);
    }
    handleCloseForm();
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingModule(null);
  };

  const handleEdit = (module) => {
    setEditingModule(module);
    setIsFormOpen(true);
  };

  const handleDelete = (moduleId) => {
    setModules(modules.filter(m => m.id !== moduleId));
    handleCloseForm();
  };

  const debugStorage = () => {
    console.log('Current modules:', modules);
    console.log('LocalStorage:', localStorage.getItem(storageKey));
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 transition-colors duration-200">
      <DashboardHeader 
        title="帳單模組管理"
        subtitle={""}
        onDebug={debugStorage}
      />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center">
          <div>
            <p className="mt-1 text-sm text-gray-500">
              目前共有 {modules.length} 個模組
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setIsFormOpen(true)}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
            >
              新增模組
            </button>
          </div>
        </div>

        <div className="mt-8">
          <ModuleList 
            modules={modules} 
            onEdit={handleEdit}
          />
        </div>

        {isFormOpen && (
          <ModuleForm
            editingModule={editingModule}
            onClose={handleCloseForm}
            onSubmit={handleSubmit}
            onDelete={handleDelete}
          />
        )}
      </div>
    </div>
  );
}
