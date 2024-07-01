require('dotenv').config();
const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3002;

app.use(cors());
app.use(express.json());

async function fetchOpenAIResponse(openaiApiKey, query, additionalContext = '') {
    const prompt = {
        model: "gpt-3.5-turbo",
        messages: [
            { role: "system", content: "You are a survival guide bot. Provide creative tips for surviving an alien invasion." },
            { role: "user", content: `${query}${additionalContext}` },
        ],
    };

    try {
        const response = await axios.post('https://api.openai.com/v1/chat/completions', prompt, {
            headers: {
                'Authorization': `Bearer ${openaiApiKey}`,
                'Content-Type': 'application/json',
            },
        });
        return response.data.choices && response.data.choices.length > 0
               ? response.data.choices[0].message.content.trim()
               : "No suggestions could be found.";
    } catch (error) {
        console.error('OpenAI API error:', error.message);
        return "I encountered an error while processing your request.";
    }
}

app.post('/api/getSuggestions', async (req, res) => {
    const { query } = req.body;
    const openaiApiKey = process.env.OPENAI_API_KEY;
    let additionalContext = '';

    try {
        const suggestion = await fetchOpenAIResponse(openaiApiKey, query, additionalContext);
        res.json({ suggestion });
    } catch (error) {
        console.error('Error fetching suggestion:', error);
        res.status(500).json({ error: 'Error processing your query', details: error.message });
    }
});

app.get('/', (req, res) => {
    res.send('Backend is running');
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
