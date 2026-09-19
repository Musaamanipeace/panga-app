import { liveQuery } from "dexie";
import { useEffect, useState, type DependencyList } from "react";

export function useLiveQuery<T>(
  query: () => Promise<T>,
  initialValue: T,
  dependencies: DependencyList = [],
): T {
  const [value, setValue] = useState(initialValue);

  useEffect(() => {
    const subscription = liveQuery(query).subscribe({
      next: setValue,
      error: () => undefined,
    });

    return () => subscription.unsubscribe();
  }, dependencies);

  return value;
}
