import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import { Input } from "../atoms/Input";

export const SearchBar: React.FC<{ value: string; onChange: (v: string) => void; placeholder?: string }> = ({ value, onChange, placeholder }) => (
  <Input
    value={value}
    onChange={(e) => onChange((e.target as HTMLInputElement).value)}
    placeholder={placeholder ?? "Buscar..."}
    leftIcon={<MagnifyingGlassIcon className="w-5 h-5 text-gray-400" />}
  />
);
