import { useState, useRef, useCallback, useEffect } from 'react';

interface UseEditableFieldOptions {
  /** Initial value to display and edit */
  value: number | string;
  /** Callback when value should be saved - can be async */
  onSave: (value: number | string) => void | Promise<void>;
  /** Delay before save triggers (default: 0 for immediate) */
  debounceMs?: number;
  /** Parse input string to the correct type */
  parseValue?: (input: string) => number | string;
}

interface UseEditableFieldReturn {
  /** Whether the field is currently in edit mode */
  isEditing: boolean;
  /** Current value in the input (string for editing) */
  inputValue: string;
  /** Update the input value */
  setInputValue: (value: string) => void;
  /** Start editing mode */
  startEditing: () => void;
  /** Handle blur event (save and exit editing) */
  handleBlur: () => void;
  /** Handle keyboard events (Enter to save, Escape to cancel) */
  handleKeyDown: (e: React.KeyboardEvent) => void;
  /** Ref to attach to the input element for auto-focus */
  inputRef: React.RefObject<HTMLInputElement>;
  /** Whether a save is currently pending */
  isSaving: boolean;
  /** Whether the field was just saved (for showing feedback) */
  justSaved: boolean;
  /** Whether the last save failed */
  hasError: boolean;
}

export function useEditableField({
  value,
  onSave,
  debounceMs = 0,
  parseValue = (v) => v,
}: UseEditableFieldOptions): UseEditableFieldReturn {
  const [isEditing, setIsEditing] = useState(false);
  const [inputValue, setInputValue] = useState(String(value));
  const [isSaving, setIsSaving] = useState(false);
  const [justSaved, setJustSaved] = useState(false);
  const [hasError, setHasError] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const originalValueRef = useRef(String(value));
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout>>();
  const feedbackTimeoutRef = useRef<ReturnType<typeof setTimeout>>();
  const errorTimeoutRef = useRef<ReturnType<typeof setTimeout>>();

  // Sync input value when external value changes (and not editing)
  useEffect(() => {
    if (!isEditing) {
      setInputValue(String(value));
      originalValueRef.current = String(value);
    }
  }, [value, isEditing]);

  // Auto-focus and select text when entering edit mode
  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  // Cleanup timeouts
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
      if (feedbackTimeoutRef.current) clearTimeout(feedbackTimeoutRef.current);
      if (errorTimeoutRef.current) clearTimeout(errorTimeoutRef.current);
    };
  }, []);

  const startEditing = useCallback(() => {
    setIsEditing(true);
    setJustSaved(false);
    setHasError(false);
  }, []);

  const performSave = useCallback(
    async (parsedValue: number | string) => {
      try {
        await onSave(parsedValue);
        setIsSaving(false);
        setJustSaved(true);
        originalValueRef.current = String(parsedValue);

        // Clear success feedback after 2 seconds
        feedbackTimeoutRef.current = setTimeout(() => {
          setJustSaved(false);
        }, 2000);
      } catch {
        // Save failed - show error state
        setIsSaving(false);
        setHasError(true);

        // Clear error feedback after 3 seconds
        errorTimeoutRef.current = setTimeout(() => {
          setHasError(false);
        }, 3000);
      }
    },
    [onSave]
  );

  const saveValue = useCallback(() => {
    const trimmedValue = inputValue.trim();
    const parsedValue = parseValue(trimmedValue);

    // Only save if value actually changed
    if (String(parsedValue) !== originalValueRef.current) {
      setIsSaving(true);
      setHasError(false);

      if (debounceMs > 0) {
        if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
        saveTimeoutRef.current = setTimeout(() => {
          performSave(parsedValue);
        }, debounceMs);
      } else {
        performSave(parsedValue);
      }
    }

    setIsEditing(false);
  }, [inputValue, parseValue, debounceMs, performSave]);

  const cancelEditing = useCallback(() => {
    setInputValue(originalValueRef.current);
    setIsEditing(false);
  }, []);

  const handleBlur = useCallback(() => {
    saveValue();
  }, [saveValue]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        saveValue();
      } else if (e.key === 'Escape') {
        e.preventDefault();
        cancelEditing();
      }
    },
    [saveValue, cancelEditing]
  );

  return {
    isEditing,
    inputValue,
    setInputValue,
    startEditing,
    handleBlur,
    handleKeyDown,
    inputRef,
    isSaving,
    justSaved,
    hasError,
  };
}
