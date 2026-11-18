// Toast notification system
// Astro island component

import React, { useState, useEffect, createContext, useContext, type ReactNode } from 'react';

interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
}

interface ToastContextType {
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
}

const ToastContext = createContext<ToastContextType | null>(null);

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    const id = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    setToasts((prev) => [...prev, { id, message, type }]);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </ToastContext.Provider>
  );
}

function ToastContainer({ toasts, onRemove }: { toasts: Toast[]; onRemove: (id: string) => void }) {
  useEffect(() => {
    if (toasts.length === 0) return;
    const timer = setTimeout(() => {
      onRemove(toasts[0].id);
    }, 2600);
    return () => clearTimeout(timer);
  }, [toasts, onRemove]);

  if (toasts.length === 0) return null;

  return (
    <div id="toast" className="fixed bottom-6 right-6 z-[70] flex flex-col gap-2 items-end">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onRemove={onRemove} />
      ))}
    </div>
  );
}

function ToastItem({ toast, onRemove }: { toast: Toast; onRemove: (id: string) => void }) {
  useEffect(() => {
    const timer = setTimeout(() => onRemove(toast.id), 2600);
    return () => clearTimeout(timer);
  }, [toast.id, onRemove]);

  const colorMap = {
    success: 'text-success',
    error: 'text-danger',
    info: 'text-accent',
  };

  const iconMap = {
    success: <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />,
    error: <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />,
    info: <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />,
  };

  return (
    <div
      className={`glass-card text-textMain px-4 py-3 rounded-xl text-xs font-medium flex items-center gap-2.5 max-w-xs toast-enter ${
        toast.type === 'error' ? 'border-danger/30' : toast.type === 'info' ? 'border-accent/30' : 'border-success/30'
      }`}
    >
      <svg className={`w-4 h-4 shrink-0 ${colorMap[toast.type]}`} fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
        {iconMap[toast.type]}
      </svg>
      <span>{toast.message}</span>
    </div>
  );
}

export default ToastProvider;