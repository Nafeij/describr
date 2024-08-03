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
import { createContext, useCallback, useContext, useState } from "react";
import { lookup } from "react-native-mime-types";
import match from "mime-match";

export function useIntent() {
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
  const isMatchingType = useCallback(
    (uri: string) => {
      if (!intent.type) return true;
      const mimeType = lookup(uri);
      if (!mimeType) return false;
      const types = intent.extras?.["android.intent.extra.MIME_TYPES"];
      if (types) {
        return (types as string[]).some((type) => match(mimeType, type));
      }
      return match(mimeType, intent.type);
    },
    [intent.type, intent.extras]
  );
  return { intent, setResult, isMatchingType };
}

const IntentContext = createContext<ReturnType<typeof useIntent>>(
  {} as any
);

export const IntentProvider = IntentContext.Provider;

export function useIntentContext() {
  return useContext(IntentContext);
}