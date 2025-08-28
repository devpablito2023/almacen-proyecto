"use client";

import { useEffect, useState } from "react";
import { LoadingSpinner } from "../atoms/LoadingSpinner";

interface Option {
  label: string;
  value: string | number;
}

interface AsyncSelectProps {
  label?: string;
  placeholder?: string;
  minChars?: number;
  fetchOptions?: (query: string) => Promise<Option[]>; // opcional
  onSelect: (option: Option) => void;
  value?: Option | null;

  // 🔹 nuevos props para modo controlado
  options?: Option[];
  loading?: boolean;
}

export const AsyncSelect: React.FC<AsyncSelectProps> = ({
  label,
  placeholder = "Escribe para buscar...",
  minChars = 3,
  fetchOptions,
  onSelect,
  value,
  options: externalOptions,
  loading: externalLoading,
}) => {
  const [input, setInput] = useState(value?.label || "");
  const [options, setOptions] = useState<Option[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  // Modo interno (cuando usamos fetchOptions)
  useEffect(() => {
    if (!fetchOptions) return; // si no hay fetchOptions, usamos modo controlado

    const delay = setTimeout(async () => {
      if (input.length >= minChars) {
        setLoading(true);
        try {
          const res = await fetchOptions(input);
          setOptions(res);
          setOpen(true);
        } catch (err) {
          console.error("Error en AsyncSelect:", err);
          setOptions([]);
        } finally {
          setLoading(false);
        }
      } else {
        setOptions([]);
        setOpen(false);
      }
    }, 400);

    return () => clearTimeout(delay);
  }, [input, fetchOptions, minChars]);

  // Modo controlado (si recibimos options y loading desde afuera)
  const finalOptions = externalOptions ?? options;
  const finalLoading = externalLoading ?? loading;

  return (
    <div className="flex flex-col gap-1 relative">
      {label && <label className="text-sm font-medium text-gray-700">{label}</label>}
      
      <input
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder={placeholder}
        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
      />

      {finalLoading && (
        <div className="absolute right-3 top-9">
          <LoadingSpinner size={16} color="border-blue-500" />
        </div>
      )}

      {open && finalOptions.length > 0 && (
        <ul className="absolute z-10 bg-white border border-gray-200 mt-1 rounded-lg w-full max-h-60 overflow-auto shadow-lg">
          {finalOptions.map((opt) => (
            <li
              key={opt.value}
              onClick={() => {
                onSelect(opt);
                setInput(opt.label);
                setOpen(false);
              }}
              className="px-3 py-2 hover:bg-blue-50 cursor-pointer text-sm"
            >
              {opt.label}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};
