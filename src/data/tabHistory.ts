// src/data/tabHistory.ts
// Tab navigation history tracker — back/forward navigation across tabs within a project workspace.
import { useEffect, useState } from "react";

export interface TabEntry {
  tab: string;
  timestamp: number;
}

const STORAGE_KEY = "panga-tab-history";

export function useTabHistory(projectId: string | undefined, currentTab: string, capacity = 20) {
  const key = `${STORAGE_KEY}-${projectId ?? "global"}`;
  const [history, setHistory] = useState<TabEntry[]>([]);
  const [index, setIndex] = useState(-1);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(key);
      if (stored) {
        const parsed = JSON.parse(stored) as { entries: TabEntry[]; index: number };
        setHistory(parsed.entries || []);
        setIndex(parsed.index >= 0 ? parsed.index : -1);
      }
    } catch {}
  }, [key]);

  function save(entries: TabEntry[], idx: number) {
    setHistory(entries);
    setIndex(idx);
    try {
      localStorage.setItem(key, JSON.stringify({ entries, index: idx }));
    } catch {}
  }

  function push(newTab: string) {
    if (!newTab) return;
    const newEntry: TabEntry = { tab: newTab, timestamp: Date.now() };
    const entries = [...history];
    // Truncate anything after current index (branch prediction like browser history)
    if (index >= 0) {
      entries.splice(index + 1);
    }
    // Don't duplicate if same tab
    if (entries.length > 0 && entries[entries.length - 1]?.tab === newTab) {
      return;
    }
    entries.push(newEntry);
    if (entries.length > capacity) {
      entries.shift();
    }
    save(entries, entries.length - 1);
  }

  function goBack(): string | null {
    if (index <= 0) return null;
    const newIndex = index - 1;
    return history[newIndex]?.tab ?? null;
  }

  function goForward(): string | null {
    if (index >= history.length - 1) return null;
    const newIndex = index + 1;
    return history[newIndex]?.tab ?? null;
  }

  function navigateToIndex(idx: number) {
    if (idx < 0 || idx >= history.length) return;
    save(history, idx);
  }

  // Automatically push current tab on mount / tab change
  useEffect(() => {
    push(currentTab);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId, currentTab]);

  const backTab = goBack();
  const forwardTab = goForward();
  const recentTabs = history.slice().reverse();

  return {
    history,
    index,
    backTab,
    forwardTab,
    recentTabs,
    goBack,
    goForward,
    navigateToIndex,
    push,
  };
}
