
'use server';
/**
 * @fileOverview An AI agent that assesses the health and safety of food ingredients.
 * Migrated from Genkit/Gemini to NVIDIA NIM using deepseek-ai/deepseek-v4-pro.
 */

import { nimClient, parseNIMResponse } from '@/ai/nim';
import {
  AssessHealthSafetyInput,
  AssessHealthSafetyOutput,
  AssessHealthSafetyOutputSchema,
} from './assess-health-safety-types';

export async function assessHealthSafety(input: AssessHealthSafetyInput): Promise<AssessHealthSafetyOutput> {
   if (!nimClient) {
    console.error("AI system not initialized. Check NVIDIA_API_KEY.");
    // Return a specific error structure if AI is offline
    return {
      rating: 0,
      pros: [],
      cons: [],
      warnings: ["AI functionality is currently offline. The server administrator needs to configure the NVIDIA_API_KEY."],
      ingredientAnalysis: [],
      dietaryInfo: {
        allergens: [],
        suitability: [],
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
      pros: [],
      cons: [],
      warnings: ["Unable to evaluate due to missing or unreadable label. Please upload a clear image."],
      ingredientAnalysis: [],
      dietaryInfo: {
        allergens: [],
        suitability: [],
        isVegetarian: false,
        isVegan: false,
        isGlutenFree: false,
        summary: "Could not perform dietary analysis because no ingredients were found.",
      },
    };
  }

  // Validate input length to prevent abuse (max 10,000 characters for ingredients list)
  const maxIngredientsLength = 10000;
  if (input.ingredients.length > maxIngredientsLength) {
    return {
      rating: 0,
      pros: [],
      cons: [],
      warnings: ["The ingredients list is too long to process. Please provide a shorter list."],
      ingredientAnalysis: [],
      dietaryInfo: {
        allergens: [],
        suitability: [],
        isVegetarian: false,
        isVegan: false,
        isGlutenFree: false,
        summary: "Could not perform dietary analysis due to input length limitations.",
      },
    };
  }

  const systemPrompt = `You are a clinical nutritionist. Analyze the ingredient list and return a RAW JSON assessment.
RETURN ONLY THE JSON OBJECT. NO MARKDOWN. NO TEXT.

{
  "rating": <number 1-5>,
  "pros": ["pro1", "pro2"],
  "cons": ["con1", "con2"],
  "warnings": ["warning1"] or [],
  "ingredientAnalysis": [
    {
      "ingredient": "name",
      "description": "short description",
      "purpose": "reason for use",
      "isAllergen": bool,
      "isControversial": bool
    }
  ],
  "dietaryInfo": {
    "allergens": ["Gluten", "Dairy"],
    "suitability": ["Not suitable for vegans"],
    "isVegetarian": bool,
    "isVegan": bool,
    "isGlutenFree": bool,
    "summary": "Brief summary"
  }
}

Rules:
1. rating: Based on processing, additives, sugar, and fats.
2. pros/cons: 2-4 distinct points each.
3. warnings: Only for critical health risks or banned substances.
4. dietaryInfo: Check for common allergens and determine suitability.`;

  const userPrompt = `Ingredients list:\n"${input.ingredients}"`;

  try {
    const response = await nimClient.chat.completions.create({
      model: 'meta/llama-3.1-8b-instruct',
      messages: [
        {
          role: 'system',
          content: systemPrompt,
        },
        {
          role: 'user',
          content: userPrompt,
        },
      ],
      max_tokens: 2048,
      temperature: 0.2,
      top_p: 0.9,
      response_format: { type: 'json_object' },
    });

    const rawContent = response.choices?.[0]?.message?.content;

    if (!rawContent) {
      throw new Error('The AI model failed to provide an assessment.');
    }

    const parsed = parseNIMResponse(rawContent);

    // Validate with Zod schema
    const output = AssessHealthSafetyOutputSchema.parse(parsed);

    return output;
  } catch (error: any) {
    console.error("Error in assessHealthSafety (NIM):", error);
    let warningMessage = "The AI model failed to provide an assessment due to an unexpected error.";
    if (error.message) {
      if (error.message.includes('503') || error.message.toLowerCase().includes('service unavailable')) {
        warningMessage = "The AI analysis service is temporarily overloaded. Please wait a moment and try again.";
      } else if (error.message.toLowerCase().includes('deadline exceeded') || error.message.toLowerCase().includes('timeout')) {
        warningMessage = "The analysis took too long to complete. Please try again.";
      } else if (error.message.includes('429') || error.message.toLowerCase().includes('rate limit')) {
        warningMessage = "Too many requests. Please wait a moment and try again.";
      }
    }
    
    return {
      rating: 0,
      pros: [],
      cons: [],
      warnings: [warningMessage],
      ingredientAnalysis: [],
      dietaryInfo: {
        allergens: [],
        suitability: [],
        isVegetarian: false,
       isVegan: false,
       isGlutenFree: false,
        summary: "Could not perform dietary analysis because the AI service is unavailable.",
      },
    };
  }
}
