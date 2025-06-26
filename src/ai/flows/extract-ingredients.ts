'use server';
/**
 * @fileOverview Extracts ingredient lists and nutritional information from an image of a food label using OCR.
 */

import {ai} from '@/ai/genkit';
import { ExtractIngredientsInput, ExtractIngredientsInputSchema, ExtractIngredientsOutput, ExtractIngredientsOutputSchema } from './extract-ingredients-types';


export async function extractIngredients(input: ExtractIngredientsInput): Promise<ExtractIngredientsOutput> {
  if (!ai) {
    throw new Error('AI system not initialized. The server administrator needs to configure the GOOGLE_API_KEY.');
  }
  return extractIngredientsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'extractIngredientsPrompt',
  input: {schema: ExtractIngredientsInputSchema},
  output: {schema: ExtractIngredientsOutputSchema},
  prompt: `You are an expert Optical Character Recognition (OCR) system specializing in food labels. Your task is to extract the ingredients list and nutritional information from the provided image.

Analyze the image carefully.

1.  **Ingredients**: Identify and transcribe the complete list of ingredients.
2.  **Nutritional Information**: If present, transcribe the ENTIRE nutritional facts panel into a single, formatted string (\`rawText\`). Preserve line breaks.
3.  **Status**: Based on your analysis, set the status:
    - 'success' if you found either ingredients or nutritional information.
    - 'no_data' if the image is clear but contains no discernible food label text.
    - 'unreadable' if the image is too blurry, poorly lit, or otherwise impossible to read.

Return the extracted text in the specified JSON format. If a section is not found, return empty values for that field.

Image to analyze: {{media url=image}}`,
});

const extractIngredientsFlow = ai.defineFlow(
  {
    name: 'extractIngredientsFlow',
    inputSchema: ExtractIngredientsInputSchema,
    outputSchema: ExtractIngredientsOutputSchema,
  },
  async (input) => {
    const {output} = await prompt(input);
    if (!output) {
      return {
        ingredients: [],
        nutrition: undefined,
        status: 'unreadable',
      };
    }
    // A simple check to refine status if model returns success but no data
    if (output.status === 'success' && output.ingredients.length === 0 && !output.nutrition?.rawText) {
        output.status = 'no_data';
    }

    return output;
  }
);
