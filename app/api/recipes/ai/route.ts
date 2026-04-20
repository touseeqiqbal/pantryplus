import { generateObject } from 'ai';
import { google } from '@ai-sdk/google';
import { z } from 'zod';

export const maxDuration = 30;

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { 
        query, 
        inventoryContext, 
        dietaryProfile,
        region = 'Global',
        spiceTolerance = 'Medium',
        mode = 'STANDARD'
    } = body;

    // Mode-specific prompt injections
    let modeInjection = '';
    if (mode === 'EXPIRING') {
        modeInjection = "PRIORITY: You must aggressively prioritize items in the inventory that are near expiry. Do not let them go to waste. If they clash, find a creative fusion approach.";
    } else if (mode === 'BUDGET') {
        modeInjection = "PRIORITY: You are operating in Extreme Budget mode. You must use ultra-low-cost ingredients, prioritizing high-yield pulses, beans, and grains. Minimize ANY missing ingredients.";
    } else if (mode === 'ZERO_SHOPPING') {
        modeInjection = "PRIORITY: You must NOT suggest ANY missing ingredients unless they are absolute basic pantry staples (salt, pepper, oil, water). You must construct the meal entirely from the inventoryContext.";
    }

    const result = await generateObject({
        model: google('gemini-1.5-flash'),
        schema: z.object({
            id: z.string().describe("A unique UUID for this generation"),
            recipeName: z.string(),
            mode: z.enum(['STANDARD', 'QUICK', 'BUDGET', 'HEALTHY', 'EXPIRING', 'ZERO_SHOPPING']),
            region: z.string(),
            costEstimate: z.number().describe("Provide a theoretical low cost representing local currency scaling format."),
            timeLimitMinutes: z.number(),
            reasoning: z.string().describe("Explain why this recipe was chosen based on the user's exact inventory, region, or mode constraints."),
            usedIngredients: z.array(z.string()).describe("A flat array of ingredient names pulled strictly from their real inventory."),
            missingIngredients: z.array(z.string()).describe("Ingredients they must buy to complete the recipe."),
            smartSubstitutions: z.array(
                z.object({
                    original: z.string(),
                    replacement: z.string(),
                    reason: z.string()
                })
            ).describe("If a standard recipe ingredient is missing, suggest a culturally accurate swap (e.g., Heavy Cream -> Yogurt)"),
            steps: z.array(z.string()).describe("A linear array of instructional cooking steps."),
        }),
        prompt: `The user has requested culinary assistance. 
        Their explicit query: "${query}"
        
        ---- CONTEXT SYSTEM ----
        Available Pantry Inventory: ${JSON.stringify(inventoryContext)}
        Dietary Profile: ${dietaryProfile}
        Cultural Region: ${region}
        Spice Tolerance: ${spiceTolerance}
        Mode Active: ${mode}
        
        ${modeInjection}

        CRITICAL RULES:
        1. Never violate the Dietary Profile (e.g., if Halal/Vegan, absolutely no exceptions).
        2. Culturally adapt the flavor profile to match the 'Region' using 'smartSubstitutions'.
        3. Attempt to use as much of the 'Available Pantry Inventory' as possible.
        `
    });

    return new Response(JSON.stringify(result.object), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('AI Region-Aware Recipe Error:', error);
    return new Response(JSON.stringify({ error: 'Failed to generate contextual recipe.' }), { status: 500 });
  }
}
