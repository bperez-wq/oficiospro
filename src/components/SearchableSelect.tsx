"use client";

import { useEffect, useMemo, useRef, useState } from "react";
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
  const containerRef = useRef<HTMLLabelElement>(null);
  const filtered = useMemo(() => {
    const normalizedQuery = normalizeSearch(query);
    if (!normalizedQuery) return options.slice(0, 80);
    return options
      .filter((option) => normalizeSearch(`${option.label} ${option.meta ?? ""}`).includes(normalizedQuery))
      .slice(0, 80);
  }, [options, query]);

  // Cerrar al hacer clic afuera o presionar Escape.
  useEffect(() => {
    if (!open) return;

    function handlePointerDown(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
        setQuery("");
      }
    }

    function handleKey(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
        setQuery("");
      }
    }

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKey);
    };
  }, [open]);

  function select(option: SelectOption) {
    onChange(option.value);
    setQuery("");
    setOpen(false);
  }

  return (
    <label ref={containerRef} className="field relative">
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
        placeholder={selected?.label ?? placeholder}
        required={required && !value}
        autoComplete="off"
        role="combobox"
        aria-expanded={open}
      />
      {open ? (
        <div className="absolute left-0 top-full z-40 mt-2 max-h-72 w-full min-w-full max-w-[calc(100vw-2rem)] overflow-y-auto overflow-x-hidden overscroll-contain rounded-2xl border border-line bg-white p-2 shadow-card sm:min-w-[320px]">
          {filtered.length ? (
            filtered.map((option) => (
              <button
                key={`${option.value}-${option.label}`}
                className={`block w-full rounded-xl px-3 py-2 text-left text-sm font-bold transition hover:bg-brand-soft hover:text-brand-dark ${
                  option.value === value ? "bg-brand-soft text-brand-dark" : "text-ink"
                }`}
                type="button"
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => select(option)}
              >
                <span className="block whitespace-normal break-words leading-snug">{option.label}</span>
                {option.meta ? (
                  <span className="mt-0.5 block whitespace-normal break-words text-xs font-semibold leading-snug text-muted">
                    {option.meta}
                  </span>
                ) : null}
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
