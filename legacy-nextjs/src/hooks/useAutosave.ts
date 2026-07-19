import { useState, useEffect, useRef } from "react";

interface AutosaveOptions {
  key: string;
  delay?: number;
}

export function useAutosave<T>(initialValue: T, options: AutosaveOptions) {
  const [value, setValue] = useState<T>(initialValue);
  const [isSaved, setIsSaved] = useState(true);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Load from local storage initially
  useEffect(() => {
    try {
      const stored = localStorage.getItem(options.key);
      if (stored) {
        setValue(JSON.parse(stored));
      }
    } catch (err) {
      console.error("Failed to load autosave", err);
    }
  }, [options.key]);

  // Trigger autosave when value changes
  useEffect(() => {
    setIsSaved(false);

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      try {
        localStorage.setItem(options.key, JSON.stringify(value));
        setIsSaved(true);
        setLastSaved(new Date());
      } catch (err) {
        console.error("Failed to autosave", err);
      }
    }, options.delay || 5000);

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [value, options.key, options.delay]);

  const clearAutosave = () => {
    localStorage.removeItem(options.key);
  };

  return { value, setValue, isSaved, lastSaved, clearAutosave };
}
