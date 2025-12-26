"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.AIService = void 0;
const vscode = __importStar(require("vscode"));
const { GoogleGenAI } = require("@google/genai");
class AIService {
    constructor(context) {
        this.context = context;
    }
    async analyze(prompt, systemInstruction, token) {
        const apiKey = await this.context.secrets.get('gemini_api_key');
        if (!apiKey) {
            throw new Error('API key not configured');
        }
        const config = vscode.workspace.getConfiguration('aiCodeReviewer');
        const model = config.get('model') || 'gemini-2.5-pro';
        const temperature = config.get('temperature') || 0.3;
        const ai = new GoogleGenAI({
            apiKey,
            apiVersion: 'v1'
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
        }
        catch (error) {
            if (error.message.includes('API_KEY_INVALID')) {
                throw new Error('Invalid API key. Please check your Gemini API key.');
            }
            else if (error.message.includes('RATE_LIMIT')) {
                throw new Error('Rate limit exceeded. Please try again later.');
            }
            else {
                throw new Error(`API Error: ${error.message}`);
            }
        }
    }
    async chat(messages, systemInstruction, token) {
        const apiKey = await this.context.secrets.get('gemini_api_key');
        if (!apiKey)
            throw new Error('API key not configured');
        const config = vscode.workspace.getConfiguration('aiCodeReviewer');
        const model = config.get('model') || 'gemini-2.5-pro';
        const temperature = config.get('temperature') || 0.3;
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
        }
        catch (error) {
            throw new Error(`Chat Error: ${error.message}`);
        }
    }
}
exports.AIService = AIService;
//# sourceMappingURL=aiService.js.map