
'use server';

/**
 * @fileOverview An AI agent that assesses the health and safety of food ingredients.
 *
 * - assessHealthSafety - A function that handles the health and safety assessment process.
 * - AssessHealthSafetyInput - The input type for the assessHealthSafety function.
 * - AssessHealthSafetyOutput - The return type for the assessHealthSafety function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AssessHealthSafetyInputSchema = z.object({
  ingredients: z
    .string()
    .describe('A comma-separated list of ingredients extracted from the food label.'),
});
export type AssessHealthSafetyInput = z.infer<typeof AssessHealthSafetyInputSchema>;

const AssessHealthSafetyOutputSchema = z.object({
  rating: z
    .number()
    .min(1)
    .max(5)
    .describe('A health and safety rating from 1 to 5, with 5 being the healthiest.'),
  pros: z.array(z.string()).describe('A list of pros associated with the product.'),
  cons: z.array(z.string()).describe('A list of cons associated with the product.'),
  warnings: z
    .array(z.string())
    .describe('A list of warnings about potentially harmful ingredients, including any country-specific bans.'),
});
export type AssessHealthSafetyOutput = z.infer<typeof AssessHealthSafetyOutputSchema>;

let prompt: any = null;
let assessHealthSafetyFlow: any = null;

if (ai) {
  prompt = ai.definePrompt({
    name: 'assessHealthSafetyPrompt',
    input: {schema: AssessHealthSafetyInputSchema},
    output: {schema: AssessHealthSafetyOutputSchema},
    prompt: `You are an AI assistant that specializes in assessing the health and safety of food products.

You will be provided with a list of ingredients and your task is to:

1.  Provide an overall health and safety rating from 1 to 5, with 5 being the healthiest.
2.  Identify the pros and cons of the product based on its ingredients.
3.  Provide warnings about any potentially harmful ingredients, including information about bans in specific countries.

Ingredients: {{{ingredients}}}

Your response should be structured as a JSON object with the following keys:

*   rating (number): A health and safety rating from 1 to 5.
*   pros (array): A list of pros associated with the product.
*   cons (array): A list of cons associated with the product.
*   warnings (array): A list of warnings about potentially harmful ingredients.

Ensure that the rating is an integer between 1 and 5, and that pros, cons, and warnings are arrays of strings.`,
  });

  assessHealthSafetyFlow = ai.defineFlow(
    {
      name: 'assessHealthSafetyFlow',
      inputSchema: AssessHealthSafetyInputSchema,
      outputSchema: AssessHealthSafetyOutputSchema,
    },
    async input => {
      const {output} = await prompt(input);
      return output!;
    }
  );
}

export async function assessHealthSafety(input: AssessHealthSafetyInput): Promise<AssessHealthSafetyOutput> {
  if (!assessHealthSafetyFlow) {
    throw new Error('AI functionality is disabled. Please configure the GOOGLE_API_KEY in your .env file.');
  }
  return assessHealthSafetyFlow(input);
}
