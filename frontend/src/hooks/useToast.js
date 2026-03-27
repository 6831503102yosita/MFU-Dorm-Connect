import { useState, useCallback } from 'react';

export function useToast() {
  const [toast, setToast] = useState(null);
  const show = useCallback((message, type = 'default') => {
    setToast({ message, type, key: Date.now() });
  }, []);
  const clear = useCallback(() => setToast(null), []);
  return { toast, showToast: show, clearToast: clear };
}
