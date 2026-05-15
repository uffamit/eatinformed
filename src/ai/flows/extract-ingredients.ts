
'use server';
/**
 * @fileOverview Extracts ingredient lists and nutritional information from an image of a food label using OCR.
 * Migrated from Genkit/Gemini to NVIDIA NIM using meta/llama-3.2-90b-vision-instruct.
 */

import { nimClient, parseNIMResponse } from '@/ai/nim';
import { ExtractIngredientsInput, ExtractIngredientsOutput, ExtractIngredientsOutputSchema } from './extract-ingredients-types';


export async function extractIngredients(input: ExtractIngredientsInput): Promise<ExtractIngredientsOutput> {
  if (!nimClient) {
    console.error("AI system not initialized. Check NVIDIA_API_KEY.");
    return {
      ingredients: [],
      nutrition: { rawText: "AI system is offline. The administrator needs to configure the NVIDIA_API_KEY.", nutrients: [] },
      status: 'unreadable',
    };
  }

  // Validate the image input is a proper data URI
  if (!input.image || typeof input.image !== 'string') {
    return {
      ingredients: [],
      nutrition: { rawText: "Invalid image input provided.", nutrients: [] },
      status: 'unreadable',
    };
  }

  // Check for valid data URI format
  const dataUriPattern = /^data:image\/(png|jpeg|webp|gif);base64,/i;
  if (!dataUriPattern.test(input.image)) {
    return {
      ingredients: [],
      nutrition: { rawText: "Invalid image format. Please provide a valid image.", nutrients: [] },
      status: 'unreadable',
    };
  }

  // Validate reasonable image size (max ~10MB base64 encoded)
  const maxBase64Length = 10 * 1024 * 1024 * 1.37; // ~10MB with base64 overhead
  if (input.image.length > maxBase64Length) {
    return {
      ingredients: [],
      nutrition: { rawText: "Image file is too large. Please use a smaller image.", nutrients: [] },
      status: 'unreadable',
    };
  }

  const systemPrompt = `You are a strict JSON data extraction API specializing in food nutrition labels. Your ONLY purpose is to extract the ingredients list and nutritional information from the provided image and return a raw JSON object.

CRITICAL INSTRUCTION: Return NOTHING BUT A RAW JSON OBJECT. No markdown formatting, no conversational text, no introductions. IF YOU OUTPUT ANY TEXT OUTSIDE THE JSON OBJECT, THE SYSTEM WILL CRASH.

The JSON MUST have this exact structure:
{
  "ingredients": ["ingredient1", "ingredient2"],
  "nutrition": {
    "rawText": "full nutritional facts text preserving line breaks",
    "servingSizeLabel": "Serving size: 250mL",
    "nutrients": [
      { "nutrient": "Energy", "perServing": "775kJ", "per100mL": "310kJ" }
    ]
  },
  "status": "success" | "no_data" | "unreadable"
}

Extraction Rules:
1. **ingredients**: Identify and transcribe the complete, exhaustive list of ingredients into the array. Handle nested ingredients carefully.
2. **nutrition.rawText**: Transcribe the ENTIRE nutritional facts panel into a single, formatted string, preserving line breaks and structural spacing.
3. **nutrition.servingSizeLabel**: Extract the text that defines the serving size and servings per container exactly as written.
4. **nutrition.nutrients**: Parse the nutritional table into a structured array. For each row (e.g., Energy, Protein, Fat), create a JSON object with keys "nutrient", "perServing", and "per100mL" (or per100g). Include units in string values. Omit keys if a value is missing.
5. **status**: Set to 'success' if you found either ingredients or nutritional information. Set to 'no_data' if the image is clear but contains no food label text. Set to 'unreadable' if the image is too blurry, dark, or impossible to read.
6. If any section is not found, return empty values/arrays for it. Do not hallucinate data.`;

  try {
    const response = await nimClient.chat.completions.create({
      model: 'meta/llama-3.2-11b-vision-instruct',
      messages: [
        {
          role: 'user',
          content: [
            { type: 'text', text: systemPrompt },
            {
              type: 'image_url',
              image_url: {
                url: input.image,
              },
            },
          ],
        },
      ],
      max_tokens: 4096,
      temperature: 0.1,
      top_p: 0.9,
    });

    const rawContent = response.choices?.[0]?.message?.content;
    console.log("RAW VISION AI CONTENT:", rawContent);

    if (!rawContent) {
      throw new Error('The AI model failed to provide an output.');
    }

    const parsed = parseNIMResponse(rawContent);

    // Validate with Zod schema
    const output = ExtractIngredientsOutputSchema.parse(parsed);

    // Refine status if model returns success but no actual data
    if (
      output.status === 'success' &&
      output.ingredients.length === 0 &&
      (!output.nutrition || (!output.nutrition.rawText && (!output.nutrition.nutrients || output.nutrition.nutrients.length === 0)))
    ) {
      output.status = 'no_data';
    }

    return output;
  } catch (error: any) {
    console.error("Error in extractIngredients (NIM):", error);
    let errorMessage = 'The AI model failed to process the image due to an unexpected error.';
    if (error.message) {
      if (error.message.includes('503') || error.message.toLowerCase().includes('service unavailable')) {
        errorMessage = "The AI service is temporarily overloaded. Please wait a moment and try again.";
      } else if (error.message.toLowerCase().includes('deadline exceeded') || error.message.toLowerCase().includes('timeout')) {
        errorMessage = "The analysis took too long to complete. Please try again.";
      } else if (error.message.includes('429') || error.message.toLowerCase().includes('rate limit')) {
        errorMessage = "Too many requests. Please wait a moment and try again.";
      }
    }
    return {
      ingredients: [],
      nutrition: { rawText: errorMessage, nutrients: [] },
      status: 'unreadable',
    };
  }
}
