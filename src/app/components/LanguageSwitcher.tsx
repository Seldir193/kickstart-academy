"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import i18n from "@/lib/i18n/i18n";
import {
  defaultLanguage,
  languageLabels,
  supportedLanguages,
  type SupportedLanguage,
} from "@/lib/i18n/settings";

function isSupportedLanguage(value: string): value is SupportedLanguage {
  return supportedLanguages.includes(value as SupportedLanguage);
}

export default function LanguageSwitcher() {
  const [isOpen, setIsOpen] = useState(false);
  const [language, setLanguage] = useState<SupportedLanguage>(defaultLanguage);
  const rootRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const current = String(i18n.resolvedLanguage || i18n.language || "");
    if (isSupportedLanguage(current)) setLanguage(current);
  }, []);

  useEffect(() => {
    function syncLanguage(nextLanguage: string) {
      if (isSupportedLanguage(nextLanguage)) setLanguage(nextLanguage);
    }

    i18n.on("languageChanged", syncLanguage);
    return () => {
      i18n.off("languageChanged", syncLanguage);
    };
  }, []);

  useEffect(() => {
    if (!isOpen) return;

    function handlePointer(event: MouseEvent | TouchEvent) {
      const node = rootRef.current;
      const target = event.target as Node | null;
      if (!node || !target) return;
      if (!node.contains(target)) setIsOpen(false);
    }

    function handleKey(event: KeyboardEvent) {
      if (event.key === "Escape") setIsOpen(false);
    }

    document.addEventListener("mousedown", handlePointer, { passive: true });
    document.addEventListener("touchstart", handlePointer, { passive: true });
    document.addEventListener("keydown", handleKey);

    return () => {
      document.removeEventListener("mousedown", handlePointer);
      document.removeEventListener("touchstart", handlePointer);
      document.removeEventListener("keydown", handleKey);
    };
  }, [isOpen]);

  const currentLabel = useMemo(() => {
    return languageLabels[language];
  }, [language]);

  async function handleLanguageChange(nextLanguage: SupportedLanguage) {
    await i18n.changeLanguage(nextLanguage);
    localStorage.setItem("i18nextLng", nextLanguage);
    setLanguage(nextLanguage);
    setIsOpen(false);
  }

  return (
    <div className="language-switcher" ref={rootRef}>
      <button
        type="button"
        className="language-switcher__trigger"
        aria-haspopup="menu"
        aria-expanded={isOpen}
        aria-label="Change language"
        onClick={() => setIsOpen((value) => !value)}
      >
        <span className="language-switcher__label">{currentLabel}</span>
        <span className="ks-selectbox__chevron" aria-hidden="true">
          ▾
        </span>
      </button>

      {isOpen ? (
        <div className="language-switcher__menu" role="menu">
          {supportedLanguages.map((item) => {
            const isActive = item === language;

            return (
              <button
                key={item}
                type="button"
                role="menuitemradio"
                aria-checked={isActive}
                className={`language-switcher__item ${
                  isActive ? "is-active" : ""
                }`}
                onClick={() => handleLanguageChange(item)}
              >
                {languageLabels[item]}
              </button>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
