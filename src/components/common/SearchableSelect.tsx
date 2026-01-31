"use client";

import { useState, useRef, useEffect } from "react";
import styles from "@/styles/common/searchableSelect.module.css";

interface Option {
  id: string;
  name: string;
}

interface SearchableSelectProps {
  options: Option[];
  value: string;
  onChange: (id: string, name: string) => void;
  placeholder: string;
  disabled?: boolean;
  hasError?: boolean;
}

export const SearchableSelect = ({
  options,
  value,
  onChange,
  placeholder,
  disabled = false,
  hasError = false,
}: SearchableSelectProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const selectedOption = options.find((o) => o.id === value);

  const filtered = search
    ? options.filter((o) =>
        o.name.toLowerCase().includes(search.toLowerCase())
      )
    : options;

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
        setSearch("");
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleOpen = () => {
    if (disabled) return;
    setIsOpen(true);
    setSearch("");
    setTimeout(() => inputRef.current?.focus(), 0);
  };

  const handleSelect = (option: Option) => {
    onChange(option.id, option.name);
    setIsOpen(false);
    setSearch("");
  };

  return (
    <div className={styles.container} ref={containerRef}>
      {/* Display selected value or placeholder */}
      <div
        className={`${styles.trigger} ${hasError ? styles.triggerError : ""} ${disabled ? styles.triggerDisabled : ""}`}
        onClick={handleOpen}
      >
        <span className={selectedOption ? styles.triggerText : styles.triggerPlaceholder}>
          {selectedOption ? selectedOption.name : placeholder}
        </span>
        <svg
          className={`${styles.arrow} ${isOpen ? styles.arrowOpen : ""}`}
          width="16"
          height="16"
          viewBox="0 0 20 20"
          fill="none"
        >
          <path
            d="M5 7.5L10 12.5L15 7.5"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>

      {/* Dropdown */}
      {isOpen && (
        <div className={styles.dropdown}>
          <div className={styles.searchBox}>
            <input
              ref={inputRef}
              type="text"
              className={styles.searchInput}
              placeholder={placeholder}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className={styles.optionsList}>
            {filtered.length > 0 ? (
              filtered.map((option) => (
                <div
                  key={option.id}
                  className={`${styles.option} ${option.id === value ? styles.optionSelected : ""}`}
                  onClick={() => handleSelect(option)}
                >
                  {option.name}
                </div>
              ))
            ) : (
              <div className={styles.noResults}>---</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
