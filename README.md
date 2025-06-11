# Interactive Prompt Playground

An interactive tool for experimenting with OpenAI's language models and their parameters.

## Overview

This project provides a web interface to test different combinations of parameters when interacting with OpenAI's language models. It allows you to compare outputs across different settings to find the optimal configuration for your use case.

## Prerequisites

- Node.js (v14 or higher)
- npm

## Dependencies

- Express.js: Web server framework
- OpenAI Node.js SDK: For API interactions
- dotenv: For environment variable management
- Bootstrap: For UI components

## Installation

```bash
# Clone the repository
git clone [repository-url]
cd interactive-prompt-playground

# Install dependencies
npm install
```

## Configuration

Create a `.env` file in the project root with your OpenAI API key:

```
OPENAI_API_KEY=your_key_here
```

## Running the Application

```bash
# Start the server
npm start
```

Then open your browser and navigate to `http://localhost:3000`

## Features

- **Model Selection**: Choose between `gpt-3.5-turbo` and `gpt-4`
- **Parameter Controls**:
  - Temperature (0.0, 0.7, 1.2)
  - Max tokens (50, 150, 300)
  - Presence penalty (0.0, 1.5)
  - Frequency penalty (0.0, 1.5)
  - Stop sequence
- **Grid Execution**: Run your prompt with all parameter combinations at once
- **Comparative Output**: View all results in a responsive grid for easy comparison

## Output Grid

After clicking "Run", the application will generate a grid of outputs based on all parameter combinations. Each cell in the grid is labeled with its specific parameter set, making it easy to compare how different settings affect the model's response.

## Reflection

### Observations on Parameter Effects

![image](https://github.com/user-attachments/assets/3f22a64a-da50-4c82-8170-018c190f5eee)
