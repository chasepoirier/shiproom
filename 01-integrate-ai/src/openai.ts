import OpenAI from "openai";
import { config } from "./config";

export const aiClient = new OpenAI({
  apiKey: config.openaiKey,
});
