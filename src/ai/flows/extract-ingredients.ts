'use server';
/**
 * @fileOverview Extracts ingredient lists and nutritional information from an image of a food label using OCR.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit'; // Assuming genkit/z is used for Zod functionality
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

1.  Identify and transcribe the complete list of ingredients.
2.  Identify and transcribe the nutritional facts panel (e.g., Calories, Total Fat, Sodium, Total Carbohydrate, Protein).
3.  Based on your analysis, set the status:
    - 'success' if you found either ingredients or nutritional information.
    - 'no_data' if the image is clear but contains no discernible food label text.
    - 'unreadable' if the image is too blurry, poorly lit, or otherwise impossible to read.

Return the extracted text in the specified JSON format. If a section is not found, return an empty string for that field.

Image to analyze: {{media url=photoDataUri}}`,
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
        ingredients: '',
        nutritionInformation: '',
        status: 'unreadable',
      };
    }
    // A simple check to refine status if model returns success but no data
    if (output.status === 'success' && !output.ingredients && !output.nutritionInformation) {
        output.status = 'no_data';
    }

    return output;
  }
);
