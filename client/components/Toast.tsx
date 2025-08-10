import { useState, useEffect } from 'react';
import { CheckCircle, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ToastProps {
  message: string;
  duration?: number;
  onClose: () => void;
}

export function Toast({ message, duration = 3000, onClose }: ToastProps) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onClose, 300); // Wait for animation to complete
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  return (
    <div
      className={cn(
        "fixed top-4 right-4 z-50 flex items-center gap-3 bg-green-600 text-white px-4 py-3 rounded-lg shadow-lg transition-all duration-300 max-w-md",
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-2"
      )}
      role="alert"
      aria-live="polite"
    >
      <CheckCircle className="h-5 w-5 text-green-200" />
      <span className="flex-1 text-sm font-medium">{message}</span>
      <button
        onClick={() => {
          setIsVisible(false);
          setTimeout(onClose, 300);
        }}
        className="text-green-200 hover:text-white transition-colors"
        aria-label="Close notification"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}

// Global toast manager
let toastCounter = 0;
let setToasts: ((toasts: ToastItem[]) => void) | null = null;

interface ToastItem {
  id: number;
  message: string;
  duration?: number;
}

export function showToast(message: string, duration = 3000) {
  if (!setToasts) return;
  
  const id = ++toastCounter;
  const toast = { id, message, duration };
  
  setToasts(prev => [...prev, toast]);
}

export function ToastContainer() {
  const [toasts, setToastsState] = useState<ToastItem[]>([]);

  useEffect(() => {
    setToasts = setToastsState;
    return () => {
      setToasts = null;
    };
  }, []);

  const removeToast = (id: number) => {
    setToastsState(prev => prev.filter(toast => toast.id !== id));
  };

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {toasts.map(toast => (
        <Toast
          key={toast.id}
          message={toast.message}
          duration={toast.duration}
          onClose={() => removeToast(toast.id)}
        />
      ))}
    </div>
  );
}
