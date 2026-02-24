import { useState, useCallback } from 'react';
import { Check, X } from '../components/Icons';

export const useToast = () => {
  const [toast, setToast] = useState(null);

  const showToast = useCallback((message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  }, []);

  const ToastComponent = toast ? (
    <div className={`toast ${toast.type}`}>
      <span style={{ display: 'flex', flexShrink: 0 }}>{toast.type === 'success' ? <Check size={18} /> : <X size={18} />}</span>
      {toast.message}
    </div>
  ) : null;

  return { showToast, ToastComponent };
};
