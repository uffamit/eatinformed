import { z } from 'zod';

export const AssessHealthSafetyInputSchema = z.object({
  ingredients: z.string().describe('A comma-separated string of ingredients from a food product.'),
});
export type AssessHealthSafetyInput = z.infer<typeof AssessHealthSafetyInputSchema>;

export const AssessHealthSafetyOutputSchema = z.object({
  rating: z.number().min(0).max(5).describe('A health rating from 1 (poor) to 5 (excellent). A rating of 0 indicates analysis was not possible.'),
  pros: z.array(z.string()).describe('A list of positive aspects of the ingredients.'),
  cons: z.array(z.string()).describe('A list of negative aspects or unhealthy ingredients.'),
  warnings: z.array(z.string()).describe('A list of warnings about potentially harmful, controversial, or banned ingredients.'),
  dietaryInfo: z.object({
    allergens: z.array(z.string()).describe('A list of common allergens found, e.g., "Gluten", "Dairy", "Soy", "Peanuts".'),
    isVegetarian: z.boolean().describe('True if the product is suitable for vegetarians.'),
    isVegan: z.boolean().describe('True if the product is suitable for vegans.'),
    isGlutenFree: z.boolean().describe('True if the product is gluten-free.'),
    summary: z.string().describe('A concise, human-readable summary of the key dietary points, including allergens and suitability.'),
  }).describe('An analysis of dietary concerns like allergens and suitability for diets like vegan or gluten-free.'),
});
export type AssessHealthSafetyOutput = z.infer<typeof AssessHealthSafetyOutputSchema>;
