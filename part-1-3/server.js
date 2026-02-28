import express from "express";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();

const app = express();
app.use(express.json());

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Serve the frontend
app.use(express.static(path.join(__dirname, "public")));

/**
 * Returns config needed by the browser app.
 * This keeps secrets out of the frontend (only exposes client-side ID).
 */
app.get("/api/config", (req, res) => {
  const clientSideId = process.env.LD_CLIENT_SIDE_ID;
  if (!clientSideId) {
    return res.status(500).json({
      error:
        "Missing LD_CLIENT_SIDE_ID. Set it in your .env (see .env.example)."
    });
  }

  res.json({
    clientSideId,
    flagKey: process.env.LD_FLAG_KEY || "new-pricing-banner"
  });
});

/**
 * This PATCHes the flag in LaunchDarkly to OFF in a given environment.
 *
 * You can call this from the browser button or curl:
 *   curl -X POST http://localhost:3000/api/kill-switch
 *
 * Requires LD_API_TOKEN, LD_PROJECT_KEY, LD_ENV_KEY, LD_FLAG_KEY.
 */
app.post("/api/kill-switch", async (req, res) => {
  const token = process.env.LD_API_TOKEN;
  const projectKey = process.env.LD_PROJECT_KEY;
  const envKey = process.env.LD_ENV_KEY;
  const flagKey = process.env.LD_FLAG_KEY || "new-pricing-banner";

  if (!token || !projectKey || !envKey) {
    return res.status(400).json({
      error:
        "Kill switch not configured. Set LD_API_TOKEN, LD_PROJECT_KEY, and LD_ENV_KEY in .env."
    });
  }

  // LaunchDarkly API v2 endpoint for a single feature flag
  const url = `https://app.launchdarkly.com/api/v2/flags/${encodeURIComponent(
    projectKey
  )}/${encodeURIComponent(flagKey)}`;

  // Patch payload: set the flag OFF for this environment
  const patch = [
    {
      op: "replace",
      path: `/environments/${envKey}/on`,
      value: false
    }
  ];

  try {
    const resp = await fetch(url, {
      method: "PATCH",
      headers: {
        Authorization: token,
        "Content-Type": "application/json",
        // Required by LD API for JSON Patch
        "LD-API-Version": "20240415"
      },
      body: JSON.stringify(patch)
    });

    const text = await resp.text();
    if (!resp.ok) {
      return res.status(resp.status).json({
        error: "LaunchDarkly API error",
        status: resp.status,
        details: text
      });
    }

    return res.json({ ok: true, message: "Flag turned OFF", details: text });
  } catch (err) {
    return res.status(500).json({
      error: "Failed to call LaunchDarkly API",
      details: String(err)
    });
  }
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`✅ App running: http://localhost:${port}`);
});