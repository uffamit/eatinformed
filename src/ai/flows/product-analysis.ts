
'use server';

import { nimClient, parseNIMResponse } from '@/ai/nim';
import { ProductAnalysisOutput, ProductAnalysisOutputSchema } from './product-analysis-types';

export async function analyzeProduct(image: string): Promise<ProductAnalysisOutput> {
  if (!nimClient) {
    throw new Error("AI system not initialized.");
  }

  const systemPrompt = `You are a world-class clinical nutritionist and food safety expert. Your task is to perform a deep, scientifically-grounded analysis of the provided food label image. Leverage your knowledge of modern nutritional science, FDA/EFSA guidelines, and established dietary protocols (like the NOVA classification system) to provide an authoritative assessment.

You MUST respond ONLY with a RAW JSON object. DO NOT include markdown, conversational text, or introductions.

JSON STRUCTURE:
{
  "ingredients": ["transcribed item 1", "transcribed item 2"],
  "nutrition": {
    "rawText": "Complete transcription of the nutrition facts panel preserving structure",
    "servingSizeLabel": "e.g., 'Serving size: 100g' or 'Per 250mL'",
    "nutrients": [
      { "nutrient": "Energy", "perServing": "775kJ", "per100mL": "310kJ" },
      { "nutrient": "Protein", "perServing": "2g", "per100mL": "0.8g" }
    ]
  },
  "rating": <number 1.0-5.0 based on rigorous health criteria>,
  "pros": ["Scientific benefit 1", "Scientific benefit 2"],
  "cons": ["Evidence-based negative 1", "Evidence-based negative 2"],
  "warnings": ["CRITICAL: banned substances, high-risk allergens, or major health controversies"] or [],
  "ingredientAnalysis": [
    {
      "ingredient": "Standard Name",
      "description": "Scientific/biochemical description",
      "purpose": "Functional purpose (e.g., emulsifier, preservative)",
      "isAllergen": true/false,
      "isControversial": true/false
    }
  ],
  "dietaryInfo": {
    "allergens": ["Gluten", "Dairy", "Soy", "Peanuts", "Tree Nuts", "Fish", "Shellfish"],
    "suitability": ["Scientifically determined suitability statements"],
    "isVegetarian": true/false,
    "isVegan": true/false,
    "isGlutenFree": true/false,
    "summary": "Concise, authoritative dietary profile summary"
  },
  "status": "success" | "no_data" | "unreadable"
}

SCIENTIFIC ANALYSIS RULES:
1. **Health Rating (1-5)**: Strictly evaluate based on processing level (NOVA 1-4), glycemic load potential, presence of synthetic additives/preservatives, unhealthy fats (trans/saturated), and added sodium/sugars.
2. **Pros/Cons**: Provide 2-4 non-overlapping, distinct points. Pros must focus on nutrient density or natural beneficial components. Cons must focus on ultra-processing, synthetic chemicals, or poor nutritional ratios.
3. **Ingredient Analysis**: Conduct a meticulous analysis for EVERY ingredient. Identify its standard name, functional role in food science, and flag any known health controversies or allergenic potential.
4. **Dietary Suitability**: Identify common allergens with 100% accuracy. Determine Vegetarian/Vegan/Gluten-Free status based on strict clinical definitions.
5. **OCR Precision**: Transcribe the ingredients list and nutritional table exactly as they appear. If the image is blurry or unreadable, set status to 'unreadable'. If no label is found, set to 'no_data'.`;

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
      max_tokens: 4096,
      temperature: 0.1,
      top_p: 0.9,
    });

    const rawContent = response.choices?.[0]?.message?.content;
    if (!rawContent) throw new Error('No AI response');

    const parsed = parseNIMResponse(rawContent);
    return ProductAnalysisOutputSchema.parse(parsed);
  } catch (error: any) {
    console.error("Analysis failed:", error);
    return {
      ingredients: [],
      nutrition: { rawText: "Error processing image." },
      rating: 0,
      pros: [],
      cons: [],
      warnings: ["Analysis failed. Please try again."],
      ingredientAnalysis: [],
      dietaryInfo: {
        allergens: [],
        suitability: [],
        isVegetarian: false,
        isVegan: false,
        isGlutenFree: false,
        summary: "Error during analysis.",
      },
      status: 'unreadable',
    };
  }
}
