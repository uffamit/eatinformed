
import { z } from 'zod';

export const ProductAnalysisOutputSchema = z.object({
  ingredients: z.array(z.string()),
  nutrition: z.object({
    rawText: z.string(),
    servingSizeLabel: z.string().optional(),
    nutrients: z.array(z.object({
      nutrient: z.string(),
      perServing: z.string().optional(),
      per100mL: z.string().optional(),
    })).optional(),
  }),
  rating: z.number(),
  pros: z.array(z.string()),
  cons: z.array(z.string()),
  warnings: z.array(z.string()),
  ingredientAnalysis: z.array(z.object({
    ingredient: z.string(),
    description: z.string(),
    purpose: z.string(),
    isAllergen: z.boolean(),
    isControversial: z.boolean(),
  })),
  dietaryInfo: z.object({
    allergens: z.array(z.string()),
    suitability: z.array(z.string()),
    isVegetarian: z.boolean(),
    isVegan: z.boolean(),
    isGlutenFree: z.boolean(),
    summary: z.string(),
  }),
  status: z.enum(['success', 'no_data', 'unreadable']),
});

export type ProductAnalysisOutput = z.infer<typeof ProductAnalysisOutputSchema>;
