import { z } from 'zod';

export const AssessHealthSafetyInputSchema = z.object({
  ingredients: z.string().describe('A comma-separated string of ingredients from a food product.'),
});
export type AssessHealthSafetyInput = z.infer<typeof AssessHealthSafetyInputSchema>;

const IngredientAnalysisSchema = z.object({
  ingredient: z.string().describe('The name of the ingredient.'),
  description: z.string().describe('A simple description of what the ingredient is (e.g., "a type of vegetable oil").'),
  purpose: z.string().describe('The purpose of the ingredient in the product (e.g., "used for frying and as a preservative").'),
  isAllergen: z.boolean().describe('True if the ingredient is a common allergen (e.g., gluten, soy, nuts).'),
  isControversial: z.boolean().describe('True if the ingredient is controversial or has a negative reputation (e.g., MSG, high-fructose corn syrup, artificial dyes).'),
});

export const AssessHealthSafetyOutputSchema = z.object({
  rating: z.number().min(0).max(5).describe('A health rating from 1 (poor) to 5 (excellent). A rating of 0 indicates analysis was not possible.'),
  pros: z.array(z.string()).describe('A list of positive aspects of the ingredients.'),
  cons: z.array(z.string()).describe('A list of negative aspects or unhealthy ingredients.'),
  warnings: z.array(z.string()).describe('A list of warnings about potentially harmful, controversial, or banned ingredients.'),
  ingredientAnalysis: z.array(IngredientAnalysisSchema).describe('A detailed analysis of each ingredient, including its description, purpose, and any flags.'),
  dietaryInfo: z.object({
    allergens: z.array(z.string()).describe('A list of common allergens found, e.g., "Gluten", "Dairy", "Soy", "Peanuts".'),
    suitability: z.array(z.string()).describe('A list of reasons why this product may not be suitable for certain diets, e.g., "Not suitable for vegans", "Not suitable for lactose intolerant individuals".'),
    isVegetarian: z.boolean().describe('True if the product is suitable for vegetarians.'),
    isVegan: z.boolean().describe('True if the product is suitable for vegans.'),
    isGlutenFree: z.boolean().describe('True if the product is gluten-free.'),
    summary: z.string().describe('A concise, human-readable summary of the key dietary points, including allergens and suitability.'),
  }).describe('An analysis of dietary concerns like allergens and suitability for diets like vegan or gluten-free.'),
});
export type AssessHealthSafetyOutput = z.infer<typeof AssessHealthSafetyOutputSchema>;
