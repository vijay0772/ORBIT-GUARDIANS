// please paste readme.txt code here.
// then locate this file in terminal and run:    node api.js


// before starting the project do not forget to install below dependencies

// 1) npm install express axios cors dotenv
// 2) npm install @mui/material @emotion/react @emotion/styled @mui/icons-material
// 3) npm install openai
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
    const openaiApiKey = process.env.OPENAI_API_KEY || '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';
    let additionalContext = '';

    try {
        const suggestion = await fetchOpenAIResponse(openaiApiKey, query, additionalContext);
        res.json({ suggestion });
    } catch (error) {
        console.error('Error fetching suggestion:', error);
        res.status(500).json({ error: 'Error processing your query', details: error.message });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

