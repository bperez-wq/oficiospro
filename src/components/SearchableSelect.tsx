"use client";

import { useMemo, useState } from "react";
import { normalizeSearch, type SelectOption } from "@/lib/catalog";

export function SearchableSelect({
  label,
  value,
  options,
  onChange,
  placeholder = "Buscar...",
  required = false,
  name,
}: {
  label: string;
  value: string;
  options: SelectOption[];
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  name?: string;
}) {
  const selected = options.find((option) => option.value === value);
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const filtered = useMemo(() => {
    const normalizedQuery = normalizeSearch(query);
    if (!normalizedQuery) return options.slice(0, 80);
    return options
      .filter((option) => normalizeSearch(`${option.label} ${option.meta ?? ""}`).includes(normalizedQuery))
      .slice(0, 80);
  }, [options, query]);

  function select(option: SelectOption) {
    onChange(option.value);
    setQuery("");
    setOpen(false);
  }

  return (
    <label className="field relative">
      {label}
      {name ? <input type="hidden" name={name} value={value} /> : null}
      <input
        value={open ? query : selected?.label ?? ""}
        onChange={(event) => {
          setQuery(event.target.value);
          setOpen(true);
        }}
        onFocus={() => {
          setQuery("");
          setOpen(true);
        }}
        onBlur={() =>
          window.setTimeout(() => {
            if (query && filtered[0]) {
              select(filtered[0]);
              return;
            }
            setOpen(false);
          }, 140)
        }
        placeholder={selected?.label ?? placeholder}
        required={required && !value}
        autoComplete="off"
      />
      {open ? (
        <div className="absolute left-0 right-0 top-full z-30 mt-2 max-h-72 overflow-y-auto rounded-2xl border border-line bg-white p-2 shadow-card">
          {filtered.length ? (
            filtered.map((option) => (
              <button
                key={`${option.value}-${option.label}`}
                className={`w-full rounded-xl px-3 py-2 text-left text-sm font-bold transition hover:bg-brand-soft hover:text-brand-dark ${
                  option.value === value ? "bg-brand-soft text-brand-dark" : "text-ink"
                }`}
                type="button"
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => select(option)}
              >
                <span className="block">{option.label}</span>
                {option.meta ? <span className="block text-xs font-semibold text-muted">{option.meta}</span> : null}
              </button>
            ))
          ) : (
            <p className="p-3 text-sm font-bold text-muted">No encontramos resultados.</p>
          )}
        </div>
      ) : null}
    </label>
  );
}
