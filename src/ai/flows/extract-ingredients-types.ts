import { z } from 'zod';

export const ExtractIngredientsInputSchema = z.object({
  image: z.string().describe('The image as a base64 encoded string.'),
});

export type ExtractIngredientsInput = z.infer<typeof ExtractIngredientsInputSchema>;

export const ExtractIngredientsOutputSchema = z.object({
  ingredients: z.array(z.string()).describe('A list of ingredients found in the image.'),
  healthAndSafetyAssessment: z.string().describe('An assessment of the health and safety aspects of the ingredients.'),
});

export type ExtractIngredientsOutput = z.infer<typeof ExtractIngredientsOutputSchema>;