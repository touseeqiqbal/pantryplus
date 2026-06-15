import { generateObject } from 'ai';
import { google } from '@ai-sdk/google';
import { z } from 'zod';

export const maxDuration = 60;

export async function POST(req: Request) {
  try {
    const { inventory, meals, expenses, household } = await req.json();

    const result = await generateObject({
      model: google('gemini-1.5-flash'),
      schema: z.object({
        observations: z.array(z.string()).describe("Key health observations based on the data provided"),
        risks: z.array(z.string()).describe("Detection of risky food habits or imbalances"),
        swaps: z.array(z.object({
          original: z.string(),
          healthier: z.string(),
          rationale: z.string(),
          inPantry: z.boolean().describe("Whether the healthier option exists in the current inventory")
        })),
        recommendedMeals: z.array(z.object({
          name: z.string(),
          benefits: z.string(),
          keyIngredients: z.array(z.string())
        })),
        weeklyImprovementPlan: z.string().describe("A short, supportive weekly plan with specific actionable steps")
      }),
      messages: [
        {
          role: 'system',
          content: `You are Pantry Plus Health Insight AI.
          Analyze the household’s food inventory, cooked meals, grocery receipts, and meal patterns to identify health-related eating habits.
          
          Goal: Help users eat better in a practical, realistic, non-judgmental way.
          
          Focus areas:
          - excessive oil/fried food use
          - high sugar/sodium intake
          - processed food patterns
          - balance of vegetables, fruit, protein, and fiber
          
          Rules:
          - Use supportive, non-judgmental tone.
          - Prioritize available pantry items.
          - Keep advice practical and affordable.
          - Prioritize small realistic changes over strict dieting.`
        },
        {
          role: 'user',
          content: `Analyze the following data for a household of ${household?.size || 1} people with dietary restrictions: ${household?.dietaryRestrictions?.join(', ') || 'None'}.
          
          INVENTORY: ${JSON.stringify(inventory)}
          MEAL HISTORY: ${JSON.stringify(meals)}
          SHOPPING PATTERNS: ${JSON.stringify(expenses)}`
        }
      ]
    });

    return new Response(JSON.stringify(result.object), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Health Insight AI Error:', error);
    return new Response(JSON.stringify({ error: 'Failed to generate health insights' }), { status: 500 });
  }
}
