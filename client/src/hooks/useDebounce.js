import { useState, useEffect } from 'react';

/**
 * Custom hook for debouncing a value.
 * Delays updating the returned value until after the specified delay
 * has passed since the last time the input value changed.
 *
 * Performance Optimization: Prevents excessive API calls on rapid input changes.
 */
export function useDebounce(value, delay = 300) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
}

export default useDebounce;
