"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import { normalizeSearch, type SelectOption } from "@/lib/catalog";

export function SearchableSelect({
  label,
  value,
  options,
  onChange,
  placeholder = "Buscar...",
  required = false,
  name,
  className = "",
  dropdownClassName = "",
  emptyText = "No encontramos coincidencias",
}: {
  label: string;
  value: string;
  options: SelectOption[];
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  name?: string;
  className?: string;
  dropdownClassName?: string;
  emptyText?: string;
}) {
  const id = useId();
  const selected = options.find((option) => option.value === value);
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const containerRef = useRef<HTMLLabelElement>(null);
  const filtered = useMemo(() => {
    const normalizedQuery = normalizeSearch(query);
    if (!normalizedQuery) return options.slice(0, 80);
    return options
      .filter((option) => normalizeSearch(`${option.label} ${option.meta ?? ""}`).includes(normalizedQuery))
      .slice(0, 80);
  }, [options, query]);
  const rows = useMemo(() => {
    const nextRows: Array<{ type: "group"; label: string } | { type: "option"; option: SelectOption; optionIndex: number }> = [];
    let currentGroup = "";
    filtered.forEach((option, optionIndex) => {
      if (option.group && option.group !== currentGroup) {
        currentGroup = option.group;
        nextRows.push({ type: "group", label: option.group });
      }
      nextRows.push({ type: "option", option, optionIndex });
    });
    return nextRows;
  }, [filtered]);

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

  useEffect(() => {
    setActiveIndex(0);
  }, [query, options, open]);

  function select(option: SelectOption) {
    onChange(option.value);
    setQuery("");
    setOpen(false);
  }

  return (
    <label ref={containerRef} className={`field relative min-w-0 ${className}`}>
      {label}
      {name ? <input type="hidden" name={name} value={value} /> : null}
      <input
        value={open ? query : selected?.label ?? ""}
        onChange={(event) => {
          setQuery(event.target.value);
          setOpen(true);
        }}
        onKeyDown={(event) => {
          if (event.key === "ArrowDown") {
            event.preventDefault();
            setOpen(true);
            setActiveIndex((current) => Math.min(Math.max(0, filtered.length - 1), current + 1));
          }
          if (event.key === "ArrowUp") {
            event.preventDefault();
            setActiveIndex((current) => Math.max(0, current - 1));
          }
          if (event.key === "Enter" && open && filtered[activeIndex]) {
            event.preventDefault();
            select(filtered[activeIndex]);
          }
        }}
        onFocus={() => {
          setQuery("");
          setOpen(true);
        }}
        placeholder={selected?.label ?? placeholder}
        required={required && !value}
        autoComplete="off"
        role="combobox"
        aria-controls={`${id}-listbox`}
        aria-expanded={open}
        aria-activedescendant={open && filtered[activeIndex] ? `${id}-option-${activeIndex}` : undefined}
      />
      {open ? (
        <div
          id={`${id}-listbox`}
          className={`absolute left-0 top-full z-50 mt-2 max-h-80 w-full min-w-full max-w-[calc(100vw-2rem)] overflow-y-auto overflow-x-hidden overscroll-contain rounded-2xl border border-line bg-white p-2 shadow-card sm:min-w-[360px] ${dropdownClassName}`}
          role="listbox"
        >
          {filtered.length ? (
            rows.map((row) =>
              row.type === "group" ? (
                <div key={`group-${row.label}`} className="px-3 pb-1 pt-3 text-[11px] font-black uppercase tracking-wide text-muted first:pt-1">
                  {row.label}
                </div>
              ) : (
                <button
                  key={`${row.option.value}-${row.option.label}`}
                  id={`${id}-option-${row.optionIndex}`}
                  className={`block w-full rounded-xl px-3 py-2.5 text-left text-sm font-bold transition hover:bg-brand-soft hover:text-brand-dark ${
                    row.option.value === value || row.optionIndex === activeIndex ? "bg-brand-soft text-brand-dark" : "text-ink"
                  }`}
                  type="button"
                  role="option"
                  aria-selected={row.option.value === value}
                  onMouseDown={(event) => event.preventDefault()}
                  onMouseEnter={() => setActiveIndex(row.optionIndex)}
                  onClick={() => select(row.option)}
                >
                  <span className="block whitespace-normal break-words leading-snug">{row.option.label}</span>
                  {row.option.meta ? (
                    <span className="mt-0.5 block whitespace-normal break-words text-xs font-semibold leading-snug text-muted">
                      {row.option.meta}
                    </span>
                  ) : null}
                </button>
              ),
            )
          ) : (
            <p className="p-3 text-sm font-bold text-muted">{emptyText}</p>
          )}
        </div>
      ) : null}
    </label>
  );
}
