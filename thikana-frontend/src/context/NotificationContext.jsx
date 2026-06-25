import React, { createContext, useContext, useState, useCallback } from 'react';
import { X, CheckCircle, AlertTriangle, Info, AlertCircle } from 'lucide-react';

const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);

  const showNotification = useCallback((message, type = 'success', duration = 4000) => {
    const id = Math.random().toString(36).substr(2, 9);
    setNotifications((prev) => [...prev, { id, message, type }]);

    setTimeout(() => {
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    }, duration);
  }, []);

  const removeNotification = useCallback((id) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  const getIcon = (type) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-emerald-500" />;
      case 'error':
        return <AlertCircle className="w-5 h-5 text-rose-500" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-amber-500" />;
      default:
        return <Info className="w-5 h-5 text-sky-500" />;
    }
  };

  const getBorderColor = (type) => {
    switch (type) {
      case 'success': return 'border-emerald-100 bg-emerald-50/90';
      case 'error': return 'border-rose-100 bg-rose-50/90';
      case 'warning': return 'border-amber-100 bg-amber-50/90';
      default: return 'border-sky-100 bg-sky-50/90';
    }
  };

  return (
    <NotificationContext.Provider value={{ showNotification }}>
      {children}
      {/* Toast Alert List */}
      <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-sm w-full px-4 sm:px-0">
        {notifications.map(({ id, message, type }) => (
          <div
            key={id}
            className={`flex items-start gap-3 p-4 rounded-xl shadow-md border ${getBorderColor(type)} backdrop-blur-md transition-all duration-300`}
          >
            <div className="mt-0.5">{getIcon(type)}</div>
            <div className="flex-1 text-sm font-medium text-slate-700 leading-tight">{message}</div>
            <button
              onClick={() => removeNotification(id)}
              className="text-slate-400 hover:text-slate-600 transition-colors mt-0.5"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </NotificationContext.Provider>
  );
};

export const useNotification = () => useContext(NotificationContext);
export default NotificationContext;
