
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

  const systemPrompt = `You are a world-class clinical nutritionist and food safety expert. Your task is to deeply analyze the following list of food ingredients and provide a concise, highly objective, and non-overlapping health and safety assessment. 

Leverage your advanced reasoning capabilities to cross-reference these ingredients against modern nutritional science, FDA/EFSA guidelines, and established dietary safety protocols. Present your analysis with the absolute authority, precision, and trustworthiness of a professional expert. Prioritize factual accuracy and clarity.

You MUST respond ONLY with a valid JSON object. Do NOT include any explanation, markdown, or text outside the JSON.

The JSON must have this exact structure:
{
  "rating": <number 1-5>,
  "pros": ["pro1", "pro2"],
  "cons": ["con1", "con2"],
  "warnings": ["warning1"] or [],
  "ingredientAnalysis": [
    {
      "ingredient": "name",
      "description": "what it is",
      "purpose": "why it's used",
      "isAllergen": true/false,
      "isControversial": true/false
    }
  ],
  "dietaryInfo": {
    "allergens": ["Gluten", "Dairy"],
    "suitability": ["Not suitable for vegans"],
    "isVegetarian": true/false,
    "isVegan": true/false,
    "isGlutenFree": true/false,
    "summary": "Brief dietary summary"
  }
}

Analysis rules:
1. **Detailed Ingredient Analysis:** For each distinct ingredient, provide a meticulous analysis including the standard name, a clear description, its functional purpose in the food, an isAllergen flag, and an isControversial flag (for artificial colors, controversial preservatives, etc.).
2. **Health Rating (1-5):** Calculate an overall health score. Strictly evaluate the processing level (e.g., NOVA classification), whole foods presence, synthetic additives, sugar content, and unhealthy fats.
3. **Pros:** 2-4 distinct positive aspects. Focus on nutrient-dense, natural, or beneficial components. Do not state the absence of negatives as positives.
4. **Cons:** 2-4 distinct negative aspects entirely separate from Pros. Highlight artificial additives, excessive sugar/sodium, unhealthy fats, or heavily ultra-processed components.
5. **Warnings:** CRITICAL alerts ONLY. Flag ingredients banned or heavily restricted in major regulatory regions (EU, CA, Japan), major scientific controversies, or significant non-obvious health risks. Return an empty array if none exist.
6. **Dietary Information:** Conduct a strict dietary analysis. Identify common allergens (Gluten, Dairy, Soy, Peanuts, Tree Nuts, Fish, Shellfish). Provide definitive suitability statements. Determine isVegetarian, isVegan, and isGlutenFree flags. Write a highly concise summary of the dietary profile.

Be completely objective, scientifically grounded, and uncompromising in your assessment. Ensure Pros and Cons provide a balanced view without any logical contradictions.`;

  const userPrompt = `Ingredients list:\n"${input.ingredients}"`;

  try {
    const response = await nimClient.chat.completions.create({
      model: 'deepseek-ai/deepseek-v4-pro',
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
      max_tokens: 4096,
      temperature: 0.2,
      top_p: 0.9,
      response_format: { type: 'json_object' },
      // @ts-expect-error: extra_body is used to pass custom parameters to NVIDIA NIM
      extra_body: { chat_template_kwargs: { thinking: false } },
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
