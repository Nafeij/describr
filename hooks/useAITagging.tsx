import { cleanTags } from "@/lib/utils";
import { readAsStringAsync } from "expo-file-system";
import OpenAI from "openai";
import { useCallback, useState } from "react";
import { lookup } from "react-native-mime-types";
import { useSettings } from "./useSettings";

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
    stream: true,
  } as OpenAI.Chat.Completions.ChatCompletionCreateParamsStreaming
)

export function useAITagging() {
  const [openai, setOpenAI] = useState<OpenAI | null>(null);
  const [settings] = useSettings();
  const [aiTags, setAITags] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<unknown>();
  const [abortController, setAbortController] =
    useState<AbortController | null>(null);

  const generateTagsFromFile = useCallback(async (uri: string) => {
    if (aiTags.length > 0) {
      console.error("Tags already generated, consider clearing them first");
      return;
    }
    if (!settings.AI.taggingEnabled || !settings.AI.key) {
      console.error("AI tagging is disabled or API key is not set");
      return;
    }
    const mime = lookup(uri);
    if (!mime || !mime.startsWith("image/")) {
      console.error("Invalid file type for tagging");
      return;
    }
    setIsLoading(true);
    const text = await readAsStringAsync(uri, { encoding: 'base64' });
    const base64Data = `data:${mime};base64,${text}`;

    if (abortController) {
      abortController.abort();
    }
    let client = openai;
    if (!client) {
      client = new OpenAI({ apiKey: settings.AI.key });
      setOpenAI(client);
    }
    const stream = await client.chat.completions.create(build_prompt(base64Data));
    setAbortController(stream.controller);
    setAITags([]);
    let buffer = "";
    try {
      for await (const response of stream) {
        if (response.choices) {
          const delta = response.choices[0]?.delta.content;
          if (!delta) {
            break;
          }
          console.log(delta);
          buffer += delta;
          const newTags = buffer.split(",");
          if (newTags.length < 1) {
            continue;
          }
          setAITags(tags => tags.concat(cleanTags(newTags.slice(0, -1))));
          buffer = newTags[newTags.length - 1];
        }
      }
      if (buffer) {
        setAITags(tags => tags.concat(cleanTags(buffer.split(","))));
      }
    } catch (e) {
      if (e instanceof Error && e.name === "AbortError") {
        console.log("Tagging aborted");
        return;
      }
      setError(e);
    }
    setIsLoading(false);
    setAbortController(null);
  }, [settings.AI.taggingEnabled, settings.AI.key, abortController, openai]);

  const taggingEnabled = settings.AI.taggingEnabled && settings.AI.key;
  return [taggingEnabled, generateTagsFromFile, { aiTags, setAITags, isLoading, error }] as const;
}