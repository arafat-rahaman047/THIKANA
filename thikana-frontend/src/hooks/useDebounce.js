import { useState, useEffect } from 'react';

/**
 * Hook to debounce value updates
 * @param {any} value - Input value
 * @param {Number} delay - Delay in milliseconds
 */
const useDebounce = (value, delay) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

export default useDebounce;
