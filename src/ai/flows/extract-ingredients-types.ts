import { z } from 'zod';

export const ExtractIngredientsInputSchema = z.object({
  image: z.string().describe("The image as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."),
});
export type ExtractIngredientsInput = z.infer<typeof ExtractIngredientsInputSchema>;

export const NutrientSchema = z.object({
  nutrient: z.string().describe('The name of the nutrient (e.g., "Energy", "Protein").'),
  perServing: z.string().optional().describe('The value from the "per serving" column, as a string with units (e.g., "775kJ").'),
  per100mL: z.string().optional().describe('The value from the "per 100mL/g" column, as a string with units (e.g., "310kJ").'),
});
export type Nutrient = z.infer<typeof NutrientSchema>;

export const ExtractIngredientsOutputSchema = z.object({
  ingredients: z.array(z.string()).describe('A list of ingredients found in the image.'),
  nutrition: z.object({
      rawText: z.string().optional().describe('The full, original text from the nutritional facts panel for display, as a single string.'),
      nutrients: z.array(NutrientSchema).optional().describe('A structured list of nutritional facts parsed from the label.'),
      servingSizeLabel: z.string().optional().describe("The serving size text from the label, e.g., 'Serving size: 250mL'"),
  }).optional().describe("Contains raw text and structured data for nutritional facts."),
  status: z.enum(['success', 'no_data', 'unreadable']).describe("The status of the extraction: 'success' if data was found, 'no_data' if the label was clear but empty, 'unreadable' if the image was not usable."),
});
export type ExtractIngredientsOutput = z.infer<typeof ExtractIngredientsOutputSchema>;
