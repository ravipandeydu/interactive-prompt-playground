require('dotenv').config();
const express = require('express');
const path = require('path');
const OpenAI = require('openai');

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware for parsing JSON and serving static files
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Validate that API key is set
if (!process.env.OPENAI_API_KEY) {
  console.error('ERROR: OPENAI_API_KEY environment variable is not set.');
  console.error('Please create a .env file with your OpenAI API key.');
  process.exit(1);
}

// API endpoint for OpenAI completions
app.post('/api/generate', async (req, res) => {
  try {
    const {
      systemPrompt,
      userPrompt,
      model,
      parameterSets
    } = req.body;

    if (!systemPrompt || !userPrompt || !model || !parameterSets || !Array.isArray(parameterSets)) {
      return res.status(400).json({ error: 'Missing required parameters' });
    }

    // Process all parameter combinations
    const results = [];
    
    for (const params of parameterSets) {
      try {
        const completion = await openai.chat.completions.create({
          model: model,
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt }
          ],
          temperature: params.temperature,
          max_tokens: params.max_tokens,
          presence_penalty: params.presence_penalty,
          frequency_penalty: params.frequency_penalty,
          stop: params.stop ? [params.stop] : undefined,
        });

        results.push({
          parameters: params,
          response: completion.choices[0].message.content,
          usage: completion.usage,
        });
      } catch (error) {
        // If one combination fails, add error to results but continue with others
        results.push({
          parameters: params,
          error: error.message || 'Unknown error',
        });
        console.error(`Error with parameter set:`, params, error);
      }
    }

    res.json({ results });
  } catch (error) {
    console.error('API request error:', error);
    res.status(500).json({ error: error.message || 'An error occurred during the API request' });
  }
});

// Serve the main HTML file
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log('Press Ctrl+C to stop the server');
});