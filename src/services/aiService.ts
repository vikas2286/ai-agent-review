import * as vscode from 'vscode';
const { GoogleGenAI }  = require("@google/genai");

export class AIService {
    private context: vscode.ExtensionContext;

    constructor(context: vscode.ExtensionContext) {
        this.context = context;
    }

    async analyze(
        prompt: string,
        systemInstruction: string,
        token?: vscode.CancellationToken
    ): Promise<string> {
        const apiKey = await this.context.secrets.get('gemini_api_key');
        if (!apiKey) {
            throw new Error('API key not configured');
        }

        const config = vscode.workspace.getConfiguration('aiCodeReviewer');
        const model = config.get<string>('model') || 'gemini-2.5-pro';
        const temperature = config.get<number>('temperature') || 0.3;

        const ai = new GoogleGenAI({ 
            apiKey,
            apiVersion:'v1'
        });

        try {
           const response = await ai.models.generateContent({
  model,
  contents: [
    {
      role: 'user',
      parts: [
        { text: `SYSTEM:\n${systemInstruction}\n\nUSER:\n${prompt}` }
      ]
    }
  ],
  generationConfig: {
    temperature
  }
});


            return response.text || 'No response generated';
        } catch (error: any) {
            if (error.message.includes('API_KEY_INVALID')) {
                throw new Error('Invalid API key. Please check your Gemini API key.');
            } else if (error.message.includes('RATE_LIMIT')) {
                throw new Error('Rate limit exceeded. Please try again later.');
            } else {
                throw new Error(`API Error: ${error.message}`);
            }
        }
    }

    async chat(
  messages: Array<{ role: string; content: string }>,
  systemInstruction: string,
  token?: vscode.CancellationToken
): Promise<string> {

  const apiKey = await this.context.secrets.get('gemini_api_key');
  if (!apiKey) throw new Error('API key not configured');

  const config = vscode.workspace.getConfiguration('aiCodeReviewer');
  const model = config.get<string>('model') || 'gemini-2.5-pro';
  const temperature = config.get<number>('temperature') || 0.3;

  const ai = new GoogleGenAI({
    apiKey,
    apiVersion: 'v1'
  });

  try {
    const contents = [
      {
        role: 'user',
        parts: [
          { text: `SYSTEM:\n${systemInstruction}` }
        ]
      },
      ...messages.map(msg => ({
        role: msg.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: msg.content }]
      }))
    ];

    const response = await ai.models.generateContent({
      model,
      contents,
      generationConfig: {
        temperature
      }
    });

    return response.text || 'No response generated';

  } catch (error: any) {
    throw new Error(`Chat Error: ${error.message}`);
  }
}

}