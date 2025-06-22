'use server';

/**
 * @fileOverview An AI agent that assesses the health and safety of food ingredients.
 * (Temporarily disabled for debugging)
 */
import { z } from 'zod';

export const AssessHealthSafetyInputSchema = z.object({
  ingredients: z.string(),
});
export type AssessHealthSafetyInput = z.infer<typeof AssessHealthSafetyInputSchema>;

export const AssessHealthSafetyOutputSchema = z.object({
  rating: z.number(),
  pros: z.array(z.string()),
  cons: z.array(z.string()),
  warnings: z.array(z.string()),
});
export type AssessHealthSafetyOutput = z.infer<typeof AssessHealthSafetyOutputSchema>;


export async function assessHealthSafety(input: AssessHealthSafetyInput): Promise<AssessHealthSafetyOutput> {
  console.warn("AI feature 'assessHealthSafety' is currently disabled for debugging.");
  // Return dummy data to prevent downstream crashes while debugging
  return {
    rating: 0,
    pros: [],
    cons: [],
    warnings: ["AI functionality is temporarily offline while we resolve a server issue."],
  };
}
