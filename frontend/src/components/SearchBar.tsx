import { SearchBox } from "@fluentui/react-components";
import { useEffect, useState } from "react";

interface SearchBarProps {
  value: string;
  onChange: (val: string) => void;
}

export default function SearchBar({ value, onChange }: SearchBarProps) {
  const [local, setLocal] = useState(value);

  useEffect(() => {
    const t = setTimeout(() => onChange(local), 250);
    return () => clearTimeout(t);
  }, [local, onChange]);

  return (
    <SearchBox
      value={local}
      onChange={(_, d) => setLocal(d.value)}
      placeholder="Search demos by name, tag, or description…"
      style={{ width: "100%", maxWidth: 480 }}
      size="large"
    />
  );
}
