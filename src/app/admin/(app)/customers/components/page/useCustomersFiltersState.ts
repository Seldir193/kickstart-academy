import { useState } from "react";
import type { NewsletterFilter, Tab } from "../../hooks/useCustomersList";

export function useCustomersFiltersState() {
  const [q, setQ] = useState("");
  const [newsletter, setNewsletter] = useState<NewsletterFilter>("all");
  const [tab, setTab] = useState<Tab>("customers");
  const [page, setPage] = useState(1);
  return {
    q,
    tab,
    newsletter,
    page,
    setPage,
    setNewsletter,
    switchTab: switchTab(setTab, setNewsletter, setPage),
    onQueryChange: onQueryChange(setQ, setPage),
    resetSearch: resetSearch(setQ, setPage),
  };
}

function switchTab(
  setTab: (next: Tab) => void,
  setNewsletter: (next: NewsletterFilter) => void,
  setPage: (next: number) => void,
) {
  return (next: Tab) => {
    setTab(next);
    setNewsletter("all");
    setPage(1);
  };
}

function onQueryChange(
  setQ: (next: string) => void,
  setPage: (next: number) => void,
) {
  return (next: string) => {
    setPage(1);
    setQ(next);
  };
}

function resetSearch(
  setQ: (next: string) => void,
  setPage: (next: number) => void,
) {
  return () => {
    setQ("");
    setPage(1);
  };
}
