
'use server';

import { nimClient, parseNIMResponse } from '@/ai/nim';
import { ProductAnalysisOutput, ProductAnalysisOutputSchema } from './product-analysis-types';

export async function analyzeProduct(image: string): Promise<ProductAnalysisOutput> {
  if (!nimClient) {
    console.error("CRITICAL: NVIDIA_API_KEY is missing or nimClient failed to initialize.");
    return {
      ingredients: [],
      nutrition: { rawText: "AI System Offline: Please check server configuration (NVIDIA_API_KEY)." },
      rating: 0,
      pros: [],
      cons: [],
      warnings: ["System is currently unavailable."],
      ingredientAnalysis: [],
      dietaryInfo: { allergens: [], suitability: [], isVegetarian: false, isVegan: false, isGlutenFree: false, summary: "" },
      status: 'unreadable',
    };
  }

  const systemPrompt = `You are a world-class clinical nutritionist and food safety expert. Your task is to perform a meticulous analysis of the provided food label image. Use scientific standards (NOVA classification, FDA/EFSA guidelines) to provide an authoritative assessment.

CRITICAL: Return NOTHING but a RAW JSON object.

JSON STRUCTURE:
{
  "ingredients": ["Standardized Name 1", "Standardized Name 2"],
  "nutrition": {
    "rawText": "Complete OCR transcription of the nutrition panel",
    "servingSizeLabel": "e.g., 20g",
    "nutrients": [
      { "nutrient": "Energy", "perServing": "100kcal", "per100mL": "500kcal" }
    ]
  },
  "rating": 1.0 to 5.0,
  "pros": ["Scientific benefit"],
  "cons": ["Evidence-based negative"],
  "warnings": [],
  "ingredientAnalysis": [
    { "ingredient": "Name", "description": "Biochemical nature", "purpose": "Functional role", "isAllergen": false, "isControversial": false }
  ],
  "dietaryInfo": { "allergens": [], "suitability": ["Vegan"], "isVegetarian": true, "isVegan": true, "isGlutenFree": true, "summary": "Concise summary" },
  "status": "success"
}

SCIENTIFIC RULES:
1. NUTRITION DATA: Distinguish between "Per Serve", "Per 100g", and "%RDA". 
   - 'perServing' MUST be the amount in one serving.
   - 'per100mL' MUST be the standardized amount per 100g or 100mL. 
   - NEVER put percentages (like "5%") in weight/energy fields. If "Per 100g" is missing, calculate it based on the serving size.
2. HEALTH RATING: Assign a 1-5 score based on NOVA processing levels, synthetic additives, and nutritional ratios.
3. INGREDIENTS: List every ingredient exactly as written on the label.
4. STATUS: Set to "success" if text is readable. Set to "unreadable" ONLY if image is blank/black.`;

  try {
    const response = await nimClient.chat.completions.create({
      model: 'meta/llama-3.2-11b-vision-instruct',
      messages: [
        {
          role: 'user',
          content: [
            { type: 'text', text: systemPrompt },
            { type: 'image_url', image_url: { url: image } },
          ],
        },
      ],
      max_tokens: 3000,
      temperature: 0.1,
      top_p: 0.9,
    });

    const rawContent = response.choices?.[0]?.message?.content;
    if (!rawContent) {
      console.error("DEBUG: Empty response from NVIDIA NIM Vision model.");
      throw new Error('No AI response from NVIDIA NIM');
    }
    
    // Log the first 100 characters of the raw content for debugging
    console.log(`DEBUG: AI Response Start: ${rawContent.substring(0, 100)}...`);

    let parsed;
    try {
      parsed = parseNIMResponse(rawContent);
    } catch (parseError: any) {
      console.error("DEBUG: JSON Parse Error. Raw content follows:");
      console.error(rawContent);
      throw new Error(`Failed to parse JSON: ${parseError.message}`);
    }

    if (!parsed) {
      console.error("DEBUG: AI failed to return JSON. Raw content:", rawContent);
      throw new Error('The AI model failed to provide a valid data structure.');
    }

    // Soft-validation with defaults
    let output;
    try {
      output = ProductAnalysisOutputSchema.parse(parsed);
    } catch (zodError: any) {
      console.error("DEBUG: Zod Validation Issues:", JSON.stringify(zodError.issues, null, 2));
      console.error("DEBUG: Parsed object:", JSON.stringify(parsed, null, 2));
      throw zodError;
    }

    // Check if the model hallucinated 'unreadable' despite providing content
    if (output.status === 'unreadable' && (output.ingredients.length > 0 || output.nutrition.rawText.length > 20)) {
      console.warn("DEBUG: AI hallucinated 'unreadable' status despite successful OCR. Overriding to 'success'.");
      output.status = 'success';
    }

    return output;
  } catch (error: any) {
    console.error("Detailed Analysis Failure:", error);
    
    // Provide a more descriptive error status if possible
    let status: 'unreadable' | 'no_data' = 'unreadable';
    if (error.message?.includes('timeout') || error.message?.includes('deadline')) {
        status = 'no_data'; // Treat timeouts as a 'try again' rather than 'bad image'
    }

    return {
      ingredients: [],
      nutrition: { rawText: `Error: ${error.message || "Failed to process image"}` },
      rating: 0,
      pros: [],
      cons: [],
      warnings: ["We encountered an issue analyzing this image. Please try again with a clearer photo."],
      ingredientAnalysis: [],
      dietaryInfo: { allergens: [], suitability: [], isVegetarian: false, isVegan: false, isGlutenFree: false, summary: "" },
      status: status,
    };
  }
}
