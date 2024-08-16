import { cleanTags } from "@/lib/utils";
import { readAsStringAsync } from "expo-file-system";
import { useCallback, useState } from "react";
import { lookup } from "react-native-mime-types";
import EventSource from 'react-native-sse';
import { useSettingsContext } from "./useSettingsContext";

const build_prompt = (base64Data: string) => (
  {
    model: "gpt-4o",
    messages: [
      {
        role: "system", content: "You are a highly advanced image recognition model. Given the following image from a database, generate a string of comma-delimited tags. These tags should be informative, so it can be added as metadata to facilitate indexing and searching by users. If present, key features such as dominant colors, subjects, and references to pop culture or internet memes must be included. If text is present, proper nouns and other keywords/phrases should be included.",
      },
      {
        role: "user",
        content: [
          {
            type: "text", text: "Tag this image:",
          },
          {
            type: "image_url",
            image_url: {
              url: base64Data,
            }
          },
        ]
      }
    ],
    max_tokens: 128,
    stream: true as const,
  }
)

export function useAITagging() {
  const [es, setES] = useState<EventSource | null>(null);
  const [settings] = useSettingsContext();
  const [aiTags, setAITags] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const generateTagsFromFile = useCallback(async (uri: string) => {
    setError(null);
    if (aiTags.length > 0) {
      setError(new Error("Tags generated, please clear them first"));
      return;
    }
    if (!settings.AI.taggingEnabled || !settings.AI.key) {
      setError(new Error("AI is disabled or API key is not set"));
      return;
    }
    const mime = lookup(uri);
    if (!mime || !mime.startsWith("image/")) {
      setError(new Error("Invalid file type for tagging"));
      return;
    }
    setIsLoading(true);
    const text = await readAsStringAsync(uri, { encoding: 'base64' });
    const base64Data = `data:${mime};base64,${text}`;
    if (es) {
      es.close();
    }
    const newEs = new EventSource('https://api.openai.com/v1/chat/completions', {
      headers: {
        Authorization: `Bearer ${settings.AI.key}`,
        'Content-Type': 'application/json',
      },
      method: 'POST',
      // debug: true,
      body: JSON.stringify(build_prompt(base64Data)),
    });
    setES(newEs);
    // newEs.addEventListener('open', () => { console.debug("SSE opened") });
    newEs.addEventListener('error', (e) => {
      setIsLoading(false);
      setError(new Error(`SSE error: ${e.type}`));
      // console.error("SSE error", e)
    });
    setAITags([]);
    let buffer = "";
    newEs.addEventListener('close', () => {
      // console.log(buffer);
      if (buffer) {
        setAITags(tags => cleanTags(tags.concat(buffer)));
      }
      setIsLoading(false);
      newEs.removeAllEventListeners();
      // console.log("SSE closed");
    });
    const listener = (event: any) => {
      // console.log("SSE event", event);
      if (event.type === 'message') {
        if (event.data !== '[DONE]') {
          const data = JSON.parse(event.data)
          const finishReason = data.choices[0].finish_reason;
          if (finishReason !== 'stop') {
            const content = data.choices[0].delta?.content;
            if (content) {
              // console.log(content);
              buffer += content;
              const newTags = buffer.split(",");
              if (newTags.length < 2) {
                return;
              }
              setAITags(tags => cleanTags(tags.concat(newTags.slice(0, -1))));
              buffer = newTags[newTags.length - 1];
            }
          } else {
            newEs.close()
          }
        } else {
          // console.log('[DONE] SSE connection closed.')
          newEs.close()
        }
      }
    };
    newEs.addEventListener('message', listener);
  }, [settings.AI.taggingEnabled, settings.AI.key, aiTags, es]);

  const taggingEnabled = settings.AI.taggingEnabled && settings.AI.key;
  return [taggingEnabled, generateTagsFromFile, { aiTags, setAITags, isLoading, error }] as const;
}