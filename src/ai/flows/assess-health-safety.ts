'use server';
/**
 * @fileOverview An AI agent that assesses the health and safety of food ingredients.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

export const AssessHealthSafetyInputSchema = z.object({
  ingredients: z.string().describe('A comma-separated string of ingredients from a food product.'),
});
export type AssessHealthSafetyInput = z.infer<typeof AssessHealthSafetyInputSchema>;

export const AssessHealthSafetyOutputSchema = z.object({
  rating: z.number().min(0).max(5).describe('A health rating from 1 (poor) to 5 (excellent). A rating of 0 indicates analysis was not possible.'),
  pros: z.array(z.string()).describe('A list of positive aspects of the ingredients.'),
  cons: z.array(z.string()).describe('A list of negative aspects or unhealthy ingredients.'),
  warnings: z.array(z.string()).describe('A list of warnings about potentially harmful, controversial, or banned ingredients.'),
});
export type AssessHealthSafetyOutput = z.infer<typeof AssessHealthSafetyOutputSchema>;

export async function assessHealthSafety(input: AssessHealthSafetyInput): Promise<AssessHealthSafetyOutput> {
   if (!ai) {
    console.error("AI system not initialized. Check GOOGLE_API_KEY.");
    // Return a specific error structure if AI is offline
    return {
      rating: 0,
      pros: [],
      cons: [],
      warnings: ["AI functionality is currently offline. The server administrator needs to configure the GOOGLE_API_KEY."],
    };
  }

  // Handle case where no ingredients were extracted
  if (!input.ingredients || input.ingredients.trim() === '') {
    return {
      rating: 0,
      pros: ["None (no data to analyze)."],
      cons: ["None (no data to analyze)."],
      warnings: ["Unable to evaluate due to missing or unreadable label. Please upload a clear image."],
    };
  }

  return assessHealthSafetyFlow(input);
}

const prompt = ai.definePrompt({
  name: 'assessHealthSafetyPrompt',
  input: {schema: AssessHealthSafetyInputSchema},
  output: {schema: AssessHealthSafetyOutputSchema},
  prompt: `You are a world-class nutritionist and food safety expert. Your task is to analyze the following list of food ingredients and provide a concise health and safety assessment.

Ingredients list:
"{{ingredients}}"

Based on the ingredients, perform the following actions and return the result in the specified JSON format:

1.  **Health Rating (1-5):** Provide an overall health score from 1 (very unhealthy) to 5 (very healthy). Consider factors like processing level, presence of whole foods, additives, sugar content, etc.
2.  **Pros:** List 2-3 key positive aspects. Focus on healthy, natural, or beneficial ingredients. If there are none, state that.
3.  **Cons:** List 2-3 key negative aspects. Focus on artificial additives, high sugar/sodium indicators, unhealthy fats, or heavily processed components.
4.  **Warnings:** Identify any ingredients that are particularly controversial, banned in some regions (e.g., certain food dyes), or known allergens not explicitly highlighted. If there are none, return an empty array.

Your analysis should be objective and based on general nutritional science. Be concise and clear.`,
   config: {
    safetySettings: [
      {
        category: 'HARM_CATEGORY_HARASSMENT',
        threshold: 'BLOCK_NONE',
      },
       {
        category: 'HARM_CATEGORY_HATE_SPEECH',
        threshold: 'BLOCK_NONE',
      },
       {
        category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
        threshold: 'BLOCK_NONE',
      },
       {
        category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
        threshold: 'BLOCK_NONE',
      },
    ],
  },
});

const assessHealthSafetyFlow = ai.defineFlow(
  {
    name: 'assessHealthSafetyFlow',
    inputSchema: AssessHealthSafetyInputSchema,
    outputSchema: AssessHealthSafetyOutputSchema,
  },
  async (input) => {
    const {output} = await prompt(input);
    if (!output) {
      throw new Error('The AI model failed to provide an assessment.');
    }
    return output;
  }
);
