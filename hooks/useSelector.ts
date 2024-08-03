import { useCallback, useState } from "react";

type IDable = { id: string };

export type Selectable = { selected?: boolean };

export function useSelectorState<T extends IDable>() {
  const [all, setAll] = useState<(T & Selectable)[]>([]);

  const toggleSelected = useCallback((...ids: string[]) => {
    setAll((prev) =>
      prev.map((item) => ({
        ...item,
        selected: ids.includes(item.id) ? !item.selected : !!item.selected,
      }))
    );
  }, []);

  const toggleAll = useCallback(() => {
    const value = !all.every((item) => item.selected);
    setAll((prev) => prev.map((item) => ({ ...item, selected: value })));
  }, [all]);

  const clear = useCallback(() => {
    setAll((prev) => prev.map((item) => ({ ...item, selected: undefined })));
  }, []);

  return [all, setAll, { toggleSelected, toggleAll, clear }] as const;
}