import OpenAI from "openai";
import { env, isOpenAIConfigured } from "@/lib/env";

let openaiClient: OpenAI | null = null;

export function getOpenAIClient() {
  if (!isOpenAIConfigured()) {
    return null;
  }

  if (!openaiClient) {
    openaiClient = new OpenAI({ apiKey: env.openAiApiKey });
  }

  return openaiClient;
}

export function getOpenAIModel() {
  return env.openAiModel;
}
