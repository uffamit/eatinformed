
'use server';
/**
 * @fileOverview Extracts ingredient lists and nutritional information from an image of a food label using OCR.
 * (Temporarily disabled for debugging)
 */

import { z } from 'zod';

export const ExtractIngredientsInputSchema = z.object({
  photoDataUri: z.string(),
});
export type ExtractIngredientsInput = z.infer<typeof ExtractIngredientsInputSchema>;

export const ExtractIngredientsOutputSchema = z.object({
  ingredients: z.string(),
  nutritionInformation: z.string(),
  status: z.enum(['success', 'no_data', 'unreadable']),
});
export type ExtractIngredientsOutput = z.infer<typeof ExtractIngredientsOutputSchema>;

export async function extractIngredients(input: ExtractIngredientsInput): Promise<ExtractIngredientsOutput> {
  console.warn("AI feature 'extractIngredients' is currently disabled for debugging.");
  // Return dummy data to prevent downstream crashes while debugging
  return {
    ingredients: "AI feature is temporarily offline.",
    nutritionInformation: "AI feature is temporarily offline.",
    status: 'no_data',
  };
}
