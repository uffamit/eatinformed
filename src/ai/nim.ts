
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
/**
 * Expert utility to repair and parse malformed JSON from LLM responses.
 */
export const parseNIMResponse = (content: string | null): any => {
  if (!content) return null;
  
  let cleaned = content.trim();

  // 1. Strip markdown code fences
  const codeFenceMatch = cleaned.match(/```(?:json)?\s*\n?([\s\S]*?)\n?\s*```/);
  if (codeFenceMatch) {
    cleaned = codeFenceMatch[1].trim();
  }

  // 2. Locate the main JSON object
  const firstBrace = cleaned.indexOf('{');
  const lastBrace = cleaned.lastIndexOf('}');
  
  if (firstBrace === -1 || lastBrace === -1 || lastBrace <= firstBrace) {
    return null;
  }

  let jsonCandidate = cleaned.substring(firstBrace, lastBrace + 1);

  // 3. Attempt standard parse
  try {
    return JSON.parse(jsonCandidate);
  } catch (e) {
    // 4. Multi-stage Repair Logic
    try {
      // Repair A: Remove orphaned strings (text not part of a key-value pair)
      // We look for "string" followed by a comma or brace, but NOT preceded by a colon
      let repaired = jsonCandidate.replace(/([^{,:]+)\s*,\s*(?=[,}])/g, (match, p1) => {
        // If the match doesn't contain a colon, it's likely an orphan string
        return p1.includes(':') ? match : "";
      });

      // Fix cases like: "key": "value", "orphaned string", "nextKey":
      repaired = repaired.replace(/"[^"]+"\s*,\s*(?="[^"]+"\s*:)/g, (match) => {
          return match.includes(':') ? match : "";
      });

      // Clean up consecutive commas and stray punctuation
      repaired = repaired.replace(/,\s*,/g, ',');
      repaired = repaired.replace(/{\s*,/g, '{');
      repaired = repaired.replace(/,\s*}/g, '}');

      return JSON.parse(repaired);
    } catch (innerError) {
      console.error("Critical JSON repair failure:", innerError);
      return null;
    }
  }
};

export { nimClient };
