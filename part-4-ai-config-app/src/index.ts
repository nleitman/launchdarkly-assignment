import * as LD from "@launchdarkly/node-server-sdk";
import OpenAI from "openai";
import "dotenv/config";
import type { ChatCompletionMessageParam } from "openai/resources/chat/completions";
import { productsAvailable } from "../data/mockProducts";

type DefaultAIConfig = {
  model: string;
  temperature?: number;
  maxTokens?: number;
  systemPrompt: string;
};

function requireEnv(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`Missing env var ${name}`);
  return v;
}

async function main() {
  const LD_SDK_KEY = requireEnv("LD_SDK_KEY");
  const FLAG_KEY = process.env.LD_AI_CONFIG_FLAG_KEY ?? "chatbot-ai-config";
  const OPENAI_API_KEY = requireEnv("OPENAI_API_KEY");

  const userQuery =
    process.argv.slice(2).join(" ") ||
    "I'm looking for a fitness tracker under $150. Battery life matters most.";

  const openai = new OpenAI({ apiKey: OPENAI_API_KEY });

  const ldClient = LD.init(LD_SDK_KEY);

  await new Promise<void>((resolve, reject) => {
    ldClient.once("ready", () => resolve());
    ldClient.once("failed", (err) => reject(err));
  });

  const context: LD.LDContext = {
    kind: "user",
    key: "demo-user-123",
    name: "Sandy",
  };

  const defaultConfig: DefaultAIConfig = {
    model: "gpt-4o-mini",
    temperature: 0.2,
    maxTokens: 200,
    systemPrompt: "You are ABC Company's shopping assistant. Be concise and helpful.",
  };

  // Pull AI Config from LaunchDarkly
  const cfg = await ldClient.variation(FLAG_KEY, context, defaultConfig);
  const cfgAny = cfg as any;

  // LD AI Config model may be: { name: "...", parameters: {} } or a string
  const modelFromFlag: string =
    typeof cfgAny?.model === "string"
      ? cfgAny.model
      : typeof cfgAny?.model?.name === "string"
        ? cfgAny.model.name
        : defaultConfig.model;

  // Optional guardrail (prevents typos / inaccessible models from breaking your demo)
  const allowedModels = new Set(["gpt-4o-mini", "gpt-4o", "gpt-4.1-mini", "gpt-4.1"]);
  const model = allowedModels.has(modelFromFlag) ? modelFromFlag : defaultConfig.model;

  const temperature: number =
    typeof cfgAny?.temperature === "number" ? cfgAny.temperature : defaultConfig.temperature ?? 0.2;

  const max_tokens: number =
    typeof cfgAny?.max_tokens === "number"
      ? cfgAny.max_tokens
      : typeof cfgAny?.maxTokens === "number"
        ? cfgAny.maxTokens
        : defaultConfig.maxTokens ?? 200;

  // Build messages from AI Config (system + assistant template)
  const allowedRoles = new Set(["system", "assistant", "developer", "user"] as const);
  type AllowedRole = "system" | "assistant" | "developer" | "user";

  const baseMessagesRaw: any[] = Array.isArray(cfgAny?.messages) ? cfgAny.messages : [];

  const messages: ChatCompletionMessageParam[] = baseMessagesRaw.length
    ? baseMessagesRaw
        .filter((m: any) => allowedRoles.has(m?.role))
        .map((m: any) => ({
          role: m.role as AllowedRole,
          content: String(m.content ?? ""),
        }))
    : [{ role: "system", content: defaultConfig.systemPrompt }];

  // Append the live user query exactly once
  messages.push({ role: "user", content: userQuery });

  // -----------------------------
  // Step 3: Inject placeholders
  // -----------------------------
  const preferences = userQuery; // MVP: treat the query as "preferences"
  const ldctxName = (context as any)?.name ?? "there";

  const hydratedMessages: ChatCompletionMessageParam[] = messages.map((m: any) => {
    if (typeof m?.content !== "string") return m;

    return {
      ...m,
      content: m.content
        .replaceAll("{{preferences}}", preferences)
        .replaceAll("{{productsAvailable}}", JSON.stringify(productsAvailable, null, 2))
        .replaceAll("{{ldctx.name}}", String(ldctxName)),
    };
  });

  // Optional: helpful debug
  console.log(
    "Payload preview:",
    JSON.stringify({ model, temperature, max_tokens, messages: hydratedMessages }, null, 2)
  );

  // -----------------------------
  // Step 4: Use hydratedMessages
  // -----------------------------
  const resp = await openai.chat.completions.create({
    model,
    temperature,
    max_tokens,
    messages: hydratedMessages,
  });

  const text = resp.choices?.[0]?.message?.content ?? "(no response)";
  console.log("\n--- LD config raw ---");
  console.dir(cfg, { depth: 10 });
  console.log("\n--- Model response ---");
  console.log(text);

  await ldClient.close();
}

main().catch((e) => {
  console.error("Error:", e);
  process.exit(1);
});