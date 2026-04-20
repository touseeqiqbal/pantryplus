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
        expenses: z.array(z.object({
          amount: z.number().describe("The total numerical monetary amount for this category"),
          currency: z.string().describe("The currency code e.g. USD, EUR, GBP"),
          category: z.string().describe("Generic category: Groceries, Household, Utilities, etc."),
          description: z.string().describe("Simplified vendor name or trip summary")
        })),
        items: z.array(z.object({
          name: z.string().describe("Cleaned product name, excluding branding if possible. E.g., 'Whole Milk' instead of 'Lucerne Organic Whole Milk'"),
          quantity: z.number(),
          unit: z.string().describe("e.g. pieces, liters, kg, oz"),
          category: z.enum([
            'Fruits & Vegetables',
            'Dairy',
            'Meat & Seafood',
            'Grains & Bread',
            'Beverages',
            'Snacks',
            'Condiments & Sauces',
            'Frozen Foods',
            'Canned Goods',
            'Other'
          ]),
          price: z.number().optional().describe("Individual item price if visible"),
          estimatedExpiryDays: z.number().describe("Predict the typical shelf life in days from purchase for this food category")
        })).optional()
      }),
      messages: [
        {
          role: 'user',
          content: [
            { 
              type: 'text', 
              text: `Analyze this receipt image. 
              1. Extract total expense categories for budgeting.
              2. Extract individual line items for inventory management.
              3. For each food item, predict the typical shelf life (expiry) in days.
              4. standard unit is 'pcs' for counted items.
              Return strictly valid JSON.` 
            },
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
    console.error('Vision Receipt AI Error:', error);
    return new Response(JSON.stringify({ error: 'Failed to process receipt image' }), { status: 500 });
  }
}
