
'use server';
/**
 * @fileOverview An AI agent that assesses the health and safety of food ingredients.
 */

import {ai} from '@/ai/genkit';
import {
  AssessHealthSafetyInput,
  AssessHealthSafetyInputSchema,
  AssessHealthSafetyOutput,
  AssessHealthSafetyOutputSchema,
} from './assess-health-safety-types';

export async function assessHealthSafety(input: AssessHealthSafetyInput): Promise<AssessHealthSafetyOutput> {
   if (!ai) {
    console.error("AI system not initialized. Check GOOGLE_API_KEY.");
    // Return a specific error structure if AI is offline
    return {
      rating: 0,
      pros: [],
      cons: [],
      warnings: ["AI functionality is currently offline. The server administrator needs to configure the GOOGLE_API_KEY."],
      dietaryInfo: {
        allergens: [],
        isVegetarian: false,
        isVegan: false,
        isGlutenFree: false,
        summary: "AI system is offline; dietary analysis is not available.",
      },
    };
  }

  // Handle case where no ingredients were extracted
  if (!input.ingredients || input.ingredients.trim() === '') {
    return {
      rating: 0,
      pros: ["None (no data to analyze)."],
      cons: ["None (no data to analyze)."],
      warnings: ["Unable to evaluate due to missing or unreadable label. Please upload a clear image."],
      dietaryInfo: {
        allergens: [],
        isVegetarian: false,
        isVegan: false,
        isGlutenFree: false,
        summary: "Could not perform dietary analysis because no ingredients were found.",
      },
    };
  }

  try {
    return await assessHealthSafetyFlow(input);
  } catch (error: any) {
    console.error("Error in assessHealthSafetyFlow:", error);
    // Construct a user-friendly error response that fits the schema
    let warningMessage = "The AI model failed to provide an assessment due to an unexpected error.";
    if (error.message && (error.message.includes('503') || error.message.includes('Service Unavailable'))) {
      warningMessage = "The AI analysis service is temporarily overloaded. Please wait a moment and try again.";
    } else if (error.message && error.message.includes('Deadline exceeded')) {
      warningMessage = "The analysis took too long to complete. Please try again.";
    }
    
    return {
      rating: 0,
      pros: ["None (analysis failed)."],
      cons: ["None (analysis failed)."],
      warnings: [warningMessage],
      dietaryInfo: {
        allergens: [],
        isVegetarian: false,
       isVegan: false,
       isGlutenFree: false,
        summary: "Could not perform dietary analysis because the AI service is unavailable.",
      },
    };
  }
}

const prompt = ai.definePrompt({
  name: 'assessHealthSafetyPrompt',
  input: {schema: AssessHealthSafetyInputSchema},
  output: {schema: AssessHealthSafetyOutputSchema},
  prompt: `You are a world-class nutritionist and food safety expert. Your task is to analyze the following list of food ingredients and provide a concise, objective, and non-overlapping health and safety assessment.

Ingredients list:
"{{ingredients}}"

Based on the ingredients, perform the following actions and return the result in the specified JSON format:

1.  **Health Rating (1-5):** Provide an overall health score from 1 (very unhealthy) to 5 (very healthy). Consider factors like processing level, presence of whole foods, additives, sugar content, etc.
2.  **Pros:** List 2-3 distinct positive aspects. Focus on healthy, natural, or beneficial ingredients. Do not simply state the absence of a negative as a positive (e.g., instead of "Low in sugar", focus on "Made with whole grains").
3.  **Cons:** List 2-3 distinct negative aspects that are separate from the 'Pros'. Focus on artificial additives, high sugar/sodium indicators, unhealthy fats, or heavily processed components. Ensure these are genuine drawbacks.
4.  **Warnings:** This section is for CRITICAL alerts only. List only ingredients that are banned in major regions (e.g., certain food dyes in the EU), are part of a major scientific controversy regarding health dangers, or pose a significant, non-obvious risk. Do not use this section for common allergens or generally unhealthy items; those belong in 'Cons' or dietary information. If there are no such critical warnings, return an empty array.
5.  **Dietary Information:** Based on the ingredients, analyze for common dietary concerns. If the label explicitly states a status (e.g., "Certified Gluten-Free"), trust it. Otherwise, infer based on the ingredients.
    - **allergens:** Identify and list common allergens such as Gluten, Dairy, Soy, Peanuts, Tree Nuts, Fish, Shellfish. Do not list an allergen if a "-free" version is specified (e.g. "soy lecithin" is an allergen, but if the label also says "soy-free", do not list it).
    - **isVegetarian:** Determine if the product is vegetarian (contains no meat, poultry, or fish).
    - **isVegan:** Determine if the product is vegan (contains no animal products, including dairy, eggs, or honey).
    - **isGlutenFree:** Determine if the product is gluten-free (contains no wheat, barley, rye, or their derivatives).
    - **summary:** Provide a brief, human-readable summary of the key dietary points. For example: "Contains Dairy and Soy. Suitable for vegetarians but not vegans." If no specific concerns are found, state that.

Your analysis must be objective and based on general nutritional science. Be concise, clear, and ensure the 'Pros' and 'Cons' provide a balanced view without contradicting each other.`,
   config: {
    safetySettings: [
      {
        category: 'HARM_CATEGORY_HARASSMENT',
        threshold: 'BLOCK_NONE',
      },
       {
        category: 'HARM_CATEGORY_HATE_SPEECH',
        threshold: 'BLOCK_NONE',
      },
       {
        category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
        threshold: 'BLOCK_NONE',
      },
       {
        category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
        threshold: 'BLOCK_NONE',
      },
    ],
  },
});

const assessHealthSafetyFlow = ai.defineFlow(
  {
    name: 'assessHealthSafetyFlow',
    inputSchema: AssessHealthSafetyInputSchema,
    outputSchema: AssessHealthSafetyOutputSchema,
  },
  async (input) => {
    const {output} = await prompt(input);
    if (!output) {
      throw new Error('The AI model failed to provide an assessment.');
    }
    return output;
  }
);
