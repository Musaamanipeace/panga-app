import type { VercelRequest, VercelResponse } from '@vercel/node';
import { GoogleGenAI } from '@google/genai';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Only allow POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { contents, systemInstruction, enableSearch, clientApiKey } = req.body;
    const apiKey = process.env.GEMINI_API_KEY || clientApiKey;

    if (!apiKey) {
      return res.status(400).json({
        error: 'No Gemini API key found. Please configure your key in Settings or environment.',
      });
    }

    const ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });

    const tools: any[] = [];
    if (enableSearch) {
      tools.push({ googleSearch: {} });
    }

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents,
      config: {
        systemInstruction,
        tools: tools.length > 0 ? tools : undefined,
      },
    });

    return res.status(200).json({
      text: response.text ?? '',
      functionCalls: response.functionCalls,
    });
  } catch (error: any) {
    console.error('Gemini API error:', error);
    return res.status(500).json({
      error: error?.message || 'Failed to generate AI response.',
    });
  }
}