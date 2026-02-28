import { LDContext } from "@launchdarkly/node-server-sdk";
import { getLaunchDarklyClients } from "../config/launchdarkly";
import { getOpenAI } from "../config/openAI";
import { formatProductForCompletion, getProducts } from "../data/products";
import { LDFeedbackKind } from "@launchdarkly/server-sdk-ai";

export const completeShoppingAssistant = async (userName: string, userMessage: string, userPreferences: string[]) => {
  const openaiClient = getOpenAI();

  const { productsAvailable } = await getProducts();

  const { aiClient } = await getLaunchDarklyClients();
  // Create the user context for this request
  const ctx: LDContext = {
    // The context key should be unique to this end user
    // You can use any generated value
    key: "example-user-key",
    kind: "user",
    name: userName,
  };

  // Retrieve the AI Configuration for this context
  const aiConfig = await aiClient.completionConfig(
    // The AI Config key, which you can copy from the sidebar in the LaunchDarkly UI
    "chat-helper-v1",
    // The context for this request
    ctx,
    // A fallback configuration
    // For this example, skip execution if the AI Config is disabled
    {},
    // The parameters for this AI Config
    // These will replace the {{}} placeholders in the LaunchDarkly UI
    {
        preferences: userPreferences,
        // Fetch our mock product data and format it for the completion matching the format we provided to the model
        productsAvailable: productsAvailable.map(product => formatProductForCompletion(product)),
    }
  );

  // If the AI Config is disabled, make sure to handle that appropriately
  if (!aiConfig.enabled) {
    // Application path to take when the aiConfig is disabled
    // For example, you could show a message that the shopping assistant
    // is not available and customers should try again later
    console.log("AI Config is disabled");
  }

  // Track the completion and return the result
  const completion = await aiConfig.tracker.trackOpenAIMetrics(async () => await openaiClient.chat.completions.create({
      model: aiConfig.model!.name as string,
      messages: [
        // Add the system and assistant messages from the AI Config, as well as the user message
        ...aiConfig.messages!,
        { role: "user", content: userMessage }
      ],
    }))

    return `<pre>${completion.choices[0].message.content}</pre>`;
};
