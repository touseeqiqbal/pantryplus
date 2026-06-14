/**
 * AI Shopping List Generation (Module 9: Smart Shopping, workflow 7.1)
 *
 * Given the week's planned meals and the current inventory, derive a
 * consolidated shopping list of ingredients the household still needs to buy.
 * Items already in stock are excluded; quantities reflect the planned servings.
 */

import { generateObject } from 'ai';
import { google } from '@ai-sdk/google';
import { z } from 'zod';

export const maxDuration = 30;

const shoppingSchema = z.object({
  items: z
    .array(
      z.object({
        name: z.string().describe('Ingredient name, singular and shopping-friendly (e.g. "Chicken breast").'),
        quantity: z.number().describe('Quantity to buy, scaled to the planned servings.'),
        unit: z.string().describe('Unit of measure (e.g. g, kg, ml, pcs, pack).'),
        category: z
          .string()
          .describe('Aisle/category such as Produce, Dairy, Meat & Seafood, Grains & Bread, Pantry, Spices.'),
        forMeals: z.array(z.string()).describe('Which planned meals require this ingredient.'),
      })
    )
    .describe('Ingredients that must be purchased (NOT already covered by inventory).'),
  notes: z.string().describe('A one-line summary of how the list was built.'),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      meals = [],
      inventoryContext = [],
      dietaryProfile = 'No specific dietary restrictions.',
    } = body;

    if (!Array.isArray(meals) || meals.length === 0) {
      return new Response(
        JSON.stringify({ items: [], notes: 'No meals were planned for this week.' }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const result = await generateObject({
      model: google('gemini-1.5-flash'),
      schema: shoppingSchema,
      prompt: `You are a kitchen assistant building a grocery shopping list from a weekly meal plan.

PLANNED MEALS (name + servings):
${JSON.stringify(meals)}

CURRENT INVENTORY (already in stock — do NOT add these unless more is clearly needed):
${JSON.stringify(inventoryContext)}

DIETARY PROFILE: ${dietaryProfile}

RULES:
1. Infer the core ingredients each planned meal needs.
2. Consolidate duplicate ingredients across meals into a single line, summing quantities.
3. Scale quantities to the total servings planned across the week.
4. EXCLUDE any ingredient already sufficiently covered by the current inventory.
5. Only include realistic, purchasable grocery items. Skip water, salt, and pepper.
6. Respect the dietary profile strictly.
7. If the inventory already covers everything, return an empty items array.`,
    });

    return new Response(JSON.stringify(result.object), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('AI Shopping List Generation Error:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to generate shopping list.' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
