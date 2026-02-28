# Part 4 – LaunchDarkly AI Config Application

This project demonstrates how to use **LaunchDarkly AI Config** to dynamically control LLM prompts, model selection, and parameters without modifying application code.

Instead of hardcoding prompts and model settings, they are retrieved from LaunchDarkly at runtime and hydrated with dynamic data before sending a request to OpenAI.

---

## What This Project Demonstrates

- AI prompt templates stored in LaunchDarkly
- Model selection controlled via LaunchDarkly
- Runtime placeholder hydration
- OpenAI integration using resolved AI Config
- Separation of AI configuration from application logic

---

## Architecture Flow

User CLI Input  
↓  
`index.ts`  
↓  
LaunchDarkly AI Config  
↓  
Hydrate placeholders (preferences, products, context)  
↓  
OpenAI API call  
↓  
Structured product response  

---

## Directory Structure

```
ld-ai-config-app/
├── src/
│   └── index.ts
├── data/
│   └── mockProducts.ts
├── .env
├── package.json
└── README.md
```

---

## How It Works

### 1. User Input

Run:

```
npm run dev "I want a fitness tracker"
```

The CLI argument becomes the user’s preference.

---

### 2. LaunchDarkly AI Config

The application retrieves from LaunchDarkly:

- System prompt
- Assistant template prompt
- Model name
- LLM parameters (temperature, max tokens)

Example configuration:

- Model: `gpt-4o-mini`
- Temperature: `0.2`
- Placeholders:
  - `{{preferences}}`
  - `{{productsAvailable}}`
  - `{{ldctx.name}}`

### AI Config in LaunchDarkly

<img src="./images/Create_AI_Configs.png" width="75%">

This screenshot shows:

- The selected OpenAI model
- Prompt templates stored in LaunchDarkly
- Dynamic placeholders (`{{preferences}}`, `{{productsAvailable}}`, `{{ldctx.name}}`)
- Variation control for prompt experimentation

---

### 3. Placeholder Hydration

Before sending to OpenAI, the application replaces placeholders with:

- User CLI input
- Product data from `mockProducts.ts`
- LaunchDarkly context values

This ensures prompts are dynamic and context-aware.

---

### 4. OpenAI Request

The hydrated messages are sent to OpenAI using the model resolved from LaunchDarkly.

The model returns matching products formatted as:

```
[ProductName, ProductID]
```

---

## Logging and Output

<img src="./images/AI_Configs_Output.png" width="75%">

---

## Environment Setup

### Requirements

- Node.js 18+
- npm
- LaunchDarkly account
- OpenAI API key

### Install Dependencies

```
npm install
```

### Configure Environment Variables

```
cp .env.example .env
```

Update `.env` with:

- SDK key
- AI Config key
- Open AI key
---

## Run the App

```
npm run dev "I want a fitness tracker"
```

---

## Why This Matters

This implementation demonstrates:

- Prompt management outside of code
- Safe experimentation with AI configurations
- Model swapping without redeployment
- Production-ready AI configuration control via LaunchDarkly