import { streamObject } from 'ai';
import { google } from '@ai-sdk/google';
import { z } from 'zod';

export const runtime = 'edge';

export async function POST(req: Request) {
    const { inventory, usageLogs, isBusiness } = await req.json();

    const systemPrompt = `
You are Pantry Plus Foresight AI, a specialist in food science, shelf-life prediction, and kitchen logistics.

Analyze the given inventory and usage logs to identify:
1. PREDICTIVE DECAY: Items that are likely to spoil within 48-72 hours, even if their hard expiry date hasn't passed (based on food type and age).
2. ANOMALIES: If this is a business, detect irregular patterns (e.g., waste spikes, inventory vs sales mismatch).
3. SAVE-ME TIPS: Immediate, practical instructions to use high-risk items tonight.

Tone: Professional, proactive, and analytical.
`;

    const result = await streamObject({
        model: google('gemini-1.5-flash'),
        schema: z.object({
            alerts: z.array(z.object({
                itemName: z.string(),
                riskLevel: z.enum(['high', 'medium', 'low']),
                reason: z.string(),
                saveMeTip: z.string(),
                suggestedRecipe: z.string()
            })),
            businessAnomalies: z.array(z.object({
                category: z.string(),
                description: z.string(),
                severity: z.enum(['critical', 'warning', 'info']),
                recommendedAction: z.string()
            })).optional(),
            foresightSummary: z.string()
        }),
        system: systemPrompt,
        prompt: `
Context Mode: ${isBusiness ? 'Business Kitchen' : 'Personal Household'}
Current Inventory: ${JSON.stringify(inventory)}
Recent Usage Logs: ${JSON.stringify(usageLogs)}

Analyze for spoilage risks and operational anomalies.
`,
    });

    return result.toTextStreamResponse();
}
