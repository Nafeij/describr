import {
  getIntent,
  ResultOptions,
  setResult as setResultBase,
} from "@/modules/intent-manager";
import {
  cacheDirectory,
  copyAsync,
  getContentUriAsync,
  getInfoAsync,
} from "expo-file-system";
import { useCallback, useState } from "react";

export function useIntentManager() {
  const [intent] = useState(getIntent);
  const setResult = useCallback(
    async ({ isOK, action, uri }: ResultOptions) => {
      if (!isOK || !uri) {
        setResultBase({ isOK: false });
        return;
      }
      const destFile = (cacheDirectory ?? "") + new URL(uri).pathname;
      if (!(await getInfoAsync(destFile)).exists) {
        await copyAsync({ from: uri, to: destFile });
      }
      const cUri = await getContentUriAsync(destFile);
      setResultBase({ isOK, action, uri: cUri });
    },
    []
  );
  return { intent, setResult };
}
