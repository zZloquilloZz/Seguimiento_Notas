import { useState, useEffect } from 'react';

interface GradeInputProps {
  value: number | null;
  onChange: (value: number | null) => void;
  disabled?: boolean;
}

export default function GradeInput({ value, onChange, disabled = false }: GradeInputProps) {
  const [inputValue, setInputValue] = useState(value?.toString() ?? '');

  useEffect(() => {
    setInputValue(value?.toString() ?? '');
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);

    if (newValue === '') {
      onChange(null);
      return;
    }

    const numValue = parseFloat(newValue);
    if (!isNaN(numValue) && numValue >= 0 && numValue <= 20) {
      onChange(numValue);
    }
  };

  const handleBlur = () => {
    if (value !== null) {
      setInputValue(value.toFixed(1));
    }
  };

  return (
    <input
      type="number"
      min="0"
      max="20"
      step="0.1"
      value={inputValue}
      onChange={handleChange}
      onBlur={handleBlur}
      disabled={disabled}
      placeholder="—"
      className="w-20 px-2 py-1 text-center border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed focus:ring-2 focus:ring-blue-500 focus:border-transparent"
    />
  );
}
