
import {genkit, GenkitPlugin} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';

let ai: any = null;

// Only initialize Genkit if the API key is present.
// This prevents a startup crash if the key is not configured.
if (process.env.GOOGLE_API_KEY) {
  ai = genkit({
    plugins: [googleAI()],
    model: 'googleai/gemini-2.0-flash',
  });
} else {
  // Log a clear warning to the console during server startup.
  console.warn(
    '\n' +
      '**********************************************************************************\n' +
      '** WARNING: GOOGLE_API_KEY is not set in your environment.                    **\n' +
      '** The AI-powered features of this app will be disabled.                      **\n' +
      '** To enable them, get a key from Google AI Studio and add it to your .env file.**\n' +
      '**********************************************************************************\n'
  );
}

export { ai };
