import { readAsStringAsync } from "expo-file-system";
import OpenAI from "openai";
import { useCallback, useState } from "react";
import { lookup } from "react-native-mime-types";
import { useSettings } from "./useSettings";
import { cleanTags } from "@/lib/utils";

const openai = new OpenAI();

const SYS_MSG = "You are a highly advanced image recognition model. Given the following image from a database, generate a string of comma-delimited tags. These tags should be informative, so it can be added as metadata to facilitate indexing and searching by users. If present, key features such as dominant colors, subjects, and references to pop culture or internet memes must be included. If text is present, proper nouns and other keywords/phrases should be included."

export function useAITagging() {
  const [settings] = useSettings();
  const [tags, setTags] = useState<string[]>([]);

  const generateTagsFromFile = useCallback(async (uri: string) => {
    if (!settings.AI.taggingEnabled || !settings.AI.key) {
      console.error("AI tagging is disabled or API key is not set");
      return;
    }
    const mime = lookup(uri);
    if (!mime || !mime.startsWith("image/")) {
      console.error("Invalid file type for tagging");
      return;
    }
    const text = await readAsStringAsync(uri, { encoding: 'base64' });
    const base64Data = `data:${mime};base64,${text}`;

    openai.apiKey = settings.AI.key;
    const stream = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system", content: SYS_MSG,
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
    });
    let buffer = "";
    setTags([]);
    for await (const response of stream) {
      if (response.choices) {
        const delta = response.choices[0]?.delta.content;
        if (!delta) {
          break;
        }
        buffer += delta;
        const newTags = buffer.split(",");
        if (newTags.length < 1) {
          continue;
        }
        setTags(tags.concat(cleanTags(newTags.slice(0, -1))));
        buffer = tags[tags.length - 1];
      }
    }
    if (buffer) {
      setTags(tags.concat(cleanTags([buffer])));
    }
  }, [settings.AI.taggingEnabled, settings.AI.key]);

  return [ tags, setTags, generateTagsFromFile ] as const;
}