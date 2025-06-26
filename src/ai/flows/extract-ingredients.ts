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

1.  **Ingredients**: Identify and transcribe the complete list of ingredients as an array of strings.
2.  **Nutritional Information**:
    - \`rawText\`: Transcribe the ENTIRE nutritional facts panel (the table with columns like "Per Serving", "Per 100g/mL", etc.) into a single, formatted string. Preserve the line breaks and original text.
    - \`servingSizeLabel\`: Extract the full serving size line from the label, for example "Serving size: 250mL".
    - \`nutrients\`: Parse the nutritional facts table into a structured array of objects. Each object must contain:
        - \`nutrient\`: The name of the nutrient (e.g., "Energy", "Protein", "Fat - Total", "- Saturated", "Carbohydrate", "- Sugars", "Sodium", "Calcium"). Retain sub-indentation markers like "-".
        - \`perServing\`: The value from the "per serving" column as a string, including its unit (e.g., "775kJ", "9.0g"). If the column doesn't exist, omit this field.
        - \`per100mL\`: The value from the "per 100mL" or "per 100g" column as a string, including its unit (e.g., "310kJ", "3.6g"). If the column doesn't exist, omit this field.
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
    if (output.status === 'success' && output.ingredients.length === 0 && !output.nutrition) {
        output.status = 'no_data';
    }

    return output;
  }
);
