import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import fetch from 'node-fetch';

const app = express();
const port = process.env.PORT || 3001;

// Load API keys from environment variables.
// You must set these in your Vercel project settings.
const API_KEYS = Object.keys(process.env)
    .filter(key => key.startsWith('GEMINI_API_KEY_'))
    .map(key => process.env[key]);

if (API_KEYS.length === 0) {
    console.error('No Gemini API keys found in environment variables. Please set GEMINI_API_KEY_0, etc.');
    process.exit(1);
}

// Track the current key to use in the pool.
let currentKeyIndex = 0;

// Middleware
app.use(bodyParser.json());
app.use(cors({
    origin: '*', // Allow all origins for simplicity. Adjust this for production.
}));

/**
 * Endpoint to generate an image using a pooled API key.
 * The client sends a prompt, and the server handles the API call.
 */
app.post('/api/generate-image', async (req, res) => {
    const { prompt } = req.body;

    if (!prompt) {
        return res.status(400).json({ error: 'Prompt is required.' });
    }

    // Get the next API key from the pool (round-robin).
    const apiKey = API_KEYS[currentKeyIndex];
    currentKeyIndex = (currentKeyIndex + 1) % API_KEYS.length;

    console.log(`Using API key index: ${currentKeyIndex - 1 < 0 ? API_KEYS.length - 1 : currentKeyIndex - 1}`);

    // Use the gemini-2.0-flash-preview-image-generation model which does not require billing
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-preview-image-generation:generateContent?key=${apiKey}`;

    try {
        const payload = {
            contents: [{
                parts: [{ text: prompt }]
            }],
            generationConfig: {
                responseModalities: ['TEXT', 'IMAGE']
            },
        };

        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            const errorBody = await response.json();
            console.error('API error:', errorBody);
            return res.status(response.status).json({ error: errorBody.error.message || 'API error' });
        }

        const result = await response.json();
        const base64Data = result?.candidates?.[0]?.content?.parts?.find(p => p.inlineData)?.inlineData?.data;

        if (base64Data) {
            res.status(200).json({ base64Data });
        } else {
            res.status(500).json({ error: 'API response did not contain a valid image.' });
        }

    } catch (err) {
        console.error('Server error:', err);
        res.status(500).json({ error: 'An unknown server error occurred.' });
    }
});

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});

