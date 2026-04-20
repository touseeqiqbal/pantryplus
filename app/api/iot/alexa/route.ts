import { generateObject } from 'ai';
import { google } from '@ai-sdk/google';
import { z } from 'zod';

export const maxDuration = 30;

export async function POST(req: Request) {
  try {
    const { transcript, householdId } = await req.json();

    if (!transcript || !householdId) {
      return new Response(JSON.stringify({ error: 'Missing transcript or household authentication' }), { status: 400 });
    }

    // Pass the raw voice transcript to Gemini to extract actionable intent
    const result = await generateObject({
      model: google('gemini-1.5-flash'),
      schema: z.object({
        action: z.enum(['ADD', 'REMOVE', 'UPDATE_THRESHOLD', 'LIST_CHECK']),
        itemName: z.string().describe("The core generic name of the food (e.g. 'Eggs', 'Milk')"),
        quantityDelta: z.number().describe("The numerical amount to add or subtract"),
        unit: z.string().describe("e.g. 'pcs', 'gallons', 'boxes'"),
        alexaResponseTTS: z.string().describe("A natural voice response for Alexa to say back to the user.")
      }),
      prompt: `An IoT smart home device just sent this voice transcript regarding the user's pantry: "${transcript}".
Extract what action the user wants to take on their pantry and format a fluid response for the smart speaker.`
    });

    // In a fully deployed production environment, we would initialize firebase-admin here
    // and directly push the result.object mutations into the Firestore 'inventory' collection
    // where householdId == requested householdId.
    // 
    // Example:
    // await adminFirestore.collection('inventory').add({ ...result.object })

    return new Response(JSON.stringify({
      success: true,
      extractedIntent: result.object,
      syncStatus: "Pending Firestore Initialization"
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('IoT Webhook Error:', error);
    return new Response(JSON.stringify({ error: 'Failed to process voice intent' }), { status: 500 });
  }
}
