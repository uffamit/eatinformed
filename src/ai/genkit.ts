
import {genkit, GenkitPlugin} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';

const plugins: GenkitPlugin[] = [];

// Conditionally initialize and push the Google AI plugin only if the API key exists.
// This prevents the googleAI() function from being called and throwing an error during
// startup when the key is not set in the environment.
if (process.env.GOOGLE_API_KEY) {
  plugins.push(googleAI());
} else {
  console.warn(
    '\n' +
    '**********************************************************************************\n' +
    '** WARNING: GOOGLE_API_KEY is not set in your environment.                    **\n' +
    '** The AI-powered features of this app will be disabled.                      **\n' +
    '** To enable them, get a key from Google AI Studio and add it to your .env file.**\n' +
    '**********************************************************************************\n'
  );
}

export const ai = genkit({
  plugins,
  // Only specify a default model if the plugin is loaded.
  ...(plugins.length > 0 && { model: 'googleai/gemini-2.0-flash' }),
});
