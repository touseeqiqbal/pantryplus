import { generateObject } from 'ai';
import { google } from '@ai-sdk/google';
import { z } from 'zod';

export const maxDuration = 30;

export async function POST(req: Request) {
  try {
    const { imageBase64 } = await req.json();

    if (!imageBase64) {
      return new Response(JSON.stringify({ error: 'No image provided' }), { status: 400 });
    }

    // Strip the data:image/jpeg;base64, prefix if present
    const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, '');

    const result = await generateObject({
      model: google('gemini-1.5-flash'),
      schema: z.object({
        items: z.array(z.object({
          name: z.string().describe("The specific name of the food item"),
          quantity: z.number().describe("The estimated numerical quantity or weight"),
          unit: z.string().describe("e.g. 'pcs', 'grams', 'lbs'"),
          category: z.string().describe("Standard grocery aisle category")
        }))
      }),
      messages: [
        {
          role: 'user',
          content: [
            { type: 'text', text: 'You are PantryPlus Vision. Analyze this image of a fridge or pantry. Extract every visible food item, estimate the quantity, and output exactly according to the JSON format. Ignore non-food items.' },
            {
              type: 'image',
              image: base64Data
            }
          ]
        }
      ]
    });

    return new Response(JSON.stringify(result.object), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Vision AI Error:', error);
    return new Response(JSON.stringify({ error: 'Failed to process image' }), { status: 500 });
  }
}
