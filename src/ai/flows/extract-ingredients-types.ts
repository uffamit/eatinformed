import { z } from 'zod';

export const ExtractIngredientsInputSchema = z.object({
  image: z.string().describe("The image as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."),
});

export type ExtractIngredientsInput = z.infer<typeof ExtractIngredientsInputSchema>;

export const ExtractIngredientsOutputSchema = z.object({
  ingredients: z.array(z.string()).describe('A list of ingredients found in the image.'),
  nutritionInformation: z.string().describe('The full text from the nutritional facts panel.'),
  status: z.enum(['success', 'no_data', 'unreadable']).describe("The status of the extraction: 'success' if data was found, 'no_data' if the label was clear but empty, 'unreadable' if the image was not usable."),
});

export type ExtractIngredientsOutput = z.infer<typeof ExtractIngredientsOutputSchema>;
