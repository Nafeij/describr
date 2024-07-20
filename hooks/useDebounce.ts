import { debounce } from "lodash";
import { useRef, useEffect, useMemo } from "react";

export const useDebounce = ({
  callback,
  delay,
}: {
  callback: () => void;
  delay?: number;
}) => {
  const ref = useRef(callback);

  useEffect(() => {
    ref.current = callback;
  }, [callback]);

  const debouncedCallback = useMemo(() => {
    const func = () => {
      ref.current?.();
    };

    return debounce(func, delay ?? 1000);
  }, []);

  return debouncedCallback;
};
