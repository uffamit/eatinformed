
import OpenAI from 'openai';

let nimClient: OpenAI | null = null;

// This prevents a startup crash if the key is not configured.
if (process.env.NVIDIA_API_KEY) {
  nimClient = new OpenAI({
    apiKey: process.env.NVIDIA_API_KEY,
    baseURL: process.env.NVIDIA_BASE_URL || 'https://integrate.api.nvidia.com/v1',
  });
} else {
  // Log a clear warning to the console during server startup.
  console.warn(
    '\n' +
      '**********************************************************************************\n' +
      '** WARNING: NVIDIA_API_KEY is not set in your environment.                     **\n' +
      '** The AI-powered features of this app will be disabled.                       **\n' +
      '** To enable them, get a key from build.nvidia.com and add it to your .env file.**\n' +
      '**********************************************************************************\n'
  );
}

/**
 * Utility to safely extract and parse JSON from LLM responses.
 * Handles cases where the model wraps JSON in markdown code blocks.
 */
export const parseNIMResponse = (content: string | null): any => {
  if (!content) return null;
  // Strip markdown code fences if present (```json ... ``` or ``` ... ```)
  let cleaned = content.trim();
  const codeFenceMatch = cleaned.match(/^```(?:json)?\s*\n?([\s\S]*?)\n?\s*```$/);
  if (codeFenceMatch) {
    cleaned = codeFenceMatch[1].trim();
  }
  // Try to extract a JSON object
  const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
  if (jsonMatch) {
    return JSON.parse(jsonMatch[0]);
  }
  return JSON.parse(cleaned);
};

export { nimClient };
