import { generateText } from 'ai';
import { google } from '@ai-sdk/google';

export const maxDuration = 30;

export async function POST(req: Request) {
  try {
    const { stepInstruction, recipeName, userQuery } = await req.json();

    const result = await generateText({
      model: google('gemini-1.5-flash'),
      system: `You are an expert culinary AI assisting a user in real-time while they cook.
Recipe: ${recipeName}
Current Step: ${stepInstruction}

Directly answer their substitution or technique question based on the step above. Be concise, providing ratios if substituting ingredients. Do NOT format as markdown unless necessary, keep it ultra-brief (1-3 sentences) as they are cooking right now.`,
      prompt: userQuery
    });

    return new Response(JSON.stringify({ answer: result.text }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('AI Substitution Error:', error);
    return new Response(JSON.stringify({ error: 'Failed to generate help.' }), { status: 500 });
  }
}
