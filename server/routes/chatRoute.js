import express from 'express';
import { GoogleGenAI } from '@google/genai';

const router = express.Router();

// Initialize the Google Gen AI SDK using environment variables
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

router.post('/', async (req, res) => {
    try {
        const { prompt } = req.body;
        if (!prompt) {
            return res.status(400).json({ error: 'Prompt is required' });
        }

        // Call Gemini model
        const response = await ai.models.generateContent({
            model: 'gemini-3.6-flash',
            contents: prompt,
            config: {
                systemInstruction: "You are an intelligent, helpful assistant built into MerchGrid POS System. Help store owners manage inventory, understand sales data, and handle retail workflow questions clearly and concisely."
            }
        });

        res.json({ reply: response.text });
    } catch (error) {
        console.error('Gemini API Error:', error);
        res.status(500).json({ error: 'Failed to generate response from AI' });
    }
});

export default router;