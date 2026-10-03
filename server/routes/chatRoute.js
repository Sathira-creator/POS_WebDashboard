import express from 'express';
import { GoogleGenAI } from '@google/genai';

const router = express.Router();

// Initialize the Google Gen AI SDK using environment variables
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// Chat POST route
router.post('/', async (req, res) => {
    try {
        const { prompt } = req.body;
        if (!prompt) {
            return res.status(400).json({ error: 'Prompt is required' });
        }

        // Call Gemini model
        const response = await ai.models.generateContent({
            model: 'gemini-3.8-flash',
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

// Models GET route (fixed: moved outside the POST route)
router.get('/models', async (req, res) => {
    try {
        const response = await ai.models.list();
        console.log("Available Models:", response);
        res.json({ success: true, models: response });
    } catch (error) {
        console.error("Error listing models:", error);
        res.status(500).json({ error: error.message });
    }
});

export default router;